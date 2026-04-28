"""
Dingo Genomic Analysis Dashboard — Flask server
Serves the frontend and provides endpoints for the LLM assistant.
"""

import os
import re
import json
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import anthropic

app = Flask(__name__, static_folder="static")
CORS(app)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
VCF_DIR = os.path.join(BASE_DIR, "results_2")
SCRIPTS_DIR = BASE_DIR

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))


# ---------------------------------------------------------------------------
# File parsers
# ---------------------------------------------------------------------------

def parse_vcf_basic(path: str) -> dict:
    """Extract variant count and contig names from a VCF file."""
    if not os.path.exists(path):
        return {"exists": False, "count": 0, "contigs": []}
    contigs, variants = [], 0
    with open(path, errors="replace") as fh:
        for line in fh:
            if line.startswith("##contig"):
                m = re.search(r"ID=([^,>]+)", line)
                if m:
                    contigs.append(m.group(1))
            elif not line.startswith("#"):
                variants += 1
    return {"exists": True, "count": variants, "contigs": contigs[:10]}


def count_vcf_variants(path: str) -> dict:
    """Count total, SNP, and indel variants in a VCF file."""
    if not os.path.exists(path):
        return {"exists": False, "total": 0, "snps": 0, "indels": 0}
    total = snps = indels = 0
    with open(path, errors="replace") as fh:
        for line in fh:
            if line.startswith("#"):
                continue
            parts = line.split("\t")
            if len(parts) < 5:
                continue
            total += 1
            ref, alt = parts[3], parts[4].split(",")[0]
            if len(ref) == 1 and len(alt) == 1:
                snps += 1
            else:
                indels += 1
    return {"exists": True, "total": total, "snps": snps, "indels": indels}


def get_chromosome_counts(path: str) -> dict:
    """Count variants per chromosome from a VCF file."""
    if not os.path.exists(path):
        return {}
    counts = {}
    with open(path, errors="replace") as fh:
        for line in fh:
            if line.startswith("#"):
                continue
            chrom = line.split("\t")[0]
            counts[chrom] = counts.get(chrom, 0) + 1
    return counts


def build_pipeline_context() -> str:
    """Build a text context from all local result files for the LLM assistant."""
    sections = []

    sections.append("""=== DINGO GENOMIC ANALYSIS PIPELINE CONTEXT ===

PROJECT: Whole-genome sequencing variant analysis of 2 dingo (Canis lupus dingo) individuals.
GOAL: Study bottleneck and founder effects by identifying shared SNPs between two dingo dogs.
SEQUENCING: Illumina HiSeq 2000, WGS strategy, paired-end reads, ~1 million reads per sample.
SAMPLES:
  - SRR25817557 (SRX21539653) — Dingo individual 1
  - SRR25817558 (SRX21539654) — Dingo individual 2
REFERENCE: GCF_003254725.2_ASM325472v2 (Dingo reference genome, 38 autosomes + X + unplaced scaffolds)
""")

    sections.append("""=== PIPELINE STAGES ===
1. Data download: fastq-dump (SRA Toolkit), 1,000,000 reads per sample, --split-files, --gzip
2. Quality control: FastQC (pre- and post-trimming)
3. Read trimming: Trimmomatic PE, ILLUMINACLIP:2:30:10, LEADING:3, TRAILING:3, SLIDINGWINDOW:4:20, MINLEN:36
4. Reference preparation: BWA index, GATK CreateSequenceDictionary, samtools faidx
5. Alignment: BWA-MEM with read group tags (ILLUMINA platform, per-sample SM/LB/PU)
6. BAM processing: samtools view, sort, addreplacerg, index
7. GATK variant calling: HaplotypeCaller (GVCF mode) → CombineGVCFs → GenotypeGVCFs
8. BCFtools variant calling: bcftools mpileup | bcftools call -mv
9. Variant merging: bcftools merge (BCFtools); GATK GenotypeGVCFs (GATK)
10. Variant filtering:
    - Keep only SNPs (bcftools view -v snps)
    - Remove loci with >10% missing genotypes (F_MISSING<=0.1)
    - LD pruning: bcftools +prune -w 1000 -n 1
11. Annotation: SnpEff with ASM325472v1.99 database
12. Contig/chromosome mapping: custom scripts mapping NC_ accessions to chr1-chr38, chrX
13. Annotation comparison: bcftools diff between GATK and BCFtools annotated VCFs
""")

    # GATK variant counts
    gatk_raw_path = os.path.join(VCF_DIR, "gatk", "combined_variants_gatk.vcf")
    gatk_filtered_path = os.path.join(VCF_DIR, "filtered_variants", "combined_variants_gatk_final_filtered.vcf")
    gatk_loci_path = os.path.join(VCF_DIR, "filtered_variants", "combined_variants_gatk_filtered_missing_loci.vcf")
    bcf_raw_path = os.path.join(VCF_DIR, "BCFtools", "combined_variants_bcftools_new.vcf")
    bcf_filtered_path = os.path.join(VCF_DIR, "filtered_variants", "combined_variants_bcftools_final_filtered.vcf")
    bcf_loci_path = os.path.join(VCF_DIR, "filtered_variants", "combined_variants_bcftools_filtered_missing_loci.vcf")

    gatk_raw = count_vcf_variants(gatk_raw_path)
    gatk_final = count_vcf_variants(gatk_filtered_path)
    gatk_loci = count_vcf_variants(gatk_loci_path)
    bcf_raw = count_vcf_variants(bcf_raw_path)
    bcf_final = count_vcf_variants(bcf_filtered_path)
    bcf_loci = count_vcf_variants(bcf_loci_path)

    sections.append(f"""=== VARIANT STATISTICS ===
GATK HaplotypeCaller:
  Raw variants (all types): {gatk_raw.get('total', 83168):,}
  After SNP-only + missing-loci filter: {gatk_loci.get('total', 9745):,}
  After LD pruning (final): {gatk_final.get('total', 133):,}
    - SNPs: {gatk_final.get('snps', 118)}
    - Indels: {gatk_final.get('indels', 15)}
    - On main chromosomes (NC_): ~40
    - On unplaced scaffolds (NW_): ~93

BCFtools mpileup/call:
  Raw variants (all types): {bcf_raw.get('total', 309355):,}
  After SNP-only + missing-loci filter: {bcf_loci.get('total', 6217):,}
  After LD pruning (final): {bcf_final.get('total', 118):,}
    - SNPs: {bcf_final.get('snps', 109)}
    - Indels: {bcf_final.get('indels', 9)}
    - On main chromosomes (NC_): ~39
    - On unplaced scaffolds (NW_): ~79

Note: BCFtools calls many more raw variants (309K vs 83K for GATK). After filtering, GATK retains
slightly more (133 vs 118). The LD pruning window of 1000bp, keeping 1 variant per window,
drastically reduces variants from thousands to ~100-130 final markers.
""")

    # Chromosome distribution
    gatk_chr_counts = get_chromosome_counts(gatk_filtered_path)
    nc_gatk = {k: v for k, v in gatk_chr_counts.items() if k.startswith("NC_")}
    sections.append(f"""=== CHROMOSOME DISTRIBUTION (GATK final filtered) ===
Main chromosomes with variants: {len(nc_gatk)}
Each main chromosome typically has exactly 1 variant after LD pruning.
NC_064243.1=chr1 (122.8 Mb), NC_064281.1=chrX (124.6 Mb) are the largest.
All 38 autosomes + X chromosome are represented in the final filtered set.
""")

    # Annotation info
    sections.append("""=== ANNOTATION (SnpEff) ===
Database used: ASM325472v1.99 (Canis lupus familiaris / dingo assembly)
Annotated VCFs: results_2/annotation/combined_variants_gatk_annotated.vcf
                results_2/annotation/combined_variants_bcftools_annotated.vcf

Known issue: Chromosome naming mismatch between the VCF (NC_064243.1 etc.) and the SnpEff
database (which uses chr1 etc.) caused many variants to receive ERROR_CHROMOSOME_NOT_FOUND.
Script 12_fix_annotation_chromosomes.sh was used to remap annotations.

Most variants are annotated as MODIFIER impact (intergenic or upstream/downstream regions).
This is typical for WGS datasets where most variants fall outside protein-coding exons.

Impact categories:
  HIGH: Stop gain, frameshift — likely to disrupt protein function
  MODERATE: Missense, in-frame indel — may affect protein function
  LOW: Synonymous, splice region — unlikely to affect protein
  MODIFIER: Intergenic, UTR, upstream, downstream — regulatory/unknown effect
""")

    # Shared variants
    sections.append("""=== BIOLOGICAL INTERPRETATION ===
Analysis goal: Identify SNPs shared between two dingo individuals to study:
  1. Bottleneck effect: Reduced genetic diversity due to small founding population
  2. Founder effect: Allele frequency changes from founding population

The two dingo samples are from NCBI SRA (2023 publication). With only 2 samples and
1 million reads each, statistical power is limited. The low read count (~1M vs typical
30M+ reads) explains the low depth (DP ~2-19) and high proportion of variants with
missing genotypes that were filtered out.

Most final variants are heterozygous (AC=2, AF=0.5) or 3/4 alleles alternate (AC=3, AF=0.75),
with high mapping quality (MQ=60) indicating confident calls.

The large difference between raw GATK (83K) and BCFtools (309K) variants is typical:
BCFtools mpileup is more sensitive and calls more variants including many low-quality ones.
After quality filtering and LD pruning, both converge to ~100-130 high-quality variants.
""")

    # File list
    result_files = []
    for root, dirs, files in os.walk(VCF_DIR):
        dirs[:] = [d for d in dirs if not d.startswith(".")]
        for f in files:
            if not f.startswith("."):
                rel = os.path.relpath(os.path.join(root, f), BASE_DIR)
                result_files.append(rel)

    sections.append(f"""=== AVAILABLE RESULT FILES ===
{chr(10).join(result_files[:60])}
""")

    return "\n".join(sections)


PIPELINE_CONTEXT = None


def get_context():
    global PIPELINE_CONTEXT
    if PIPELINE_CONTEXT is None:
        PIPELINE_CONTEXT = build_pipeline_context()
    return PIPELINE_CONTEXT


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory("static", filename)


@app.route("/api/stats")
def api_stats():
    """Return pre-computed statistics for all main VCF files."""
    paths = {
        "gatk_raw": os.path.join(VCF_DIR, "gatk", "combined_variants_gatk.vcf"),
        "gatk_loci": os.path.join(VCF_DIR, "filtered_variants", "combined_variants_gatk_filtered_missing_loci.vcf"),
        "gatk_final": os.path.join(VCF_DIR, "filtered_variants", "combined_variants_gatk_final_filtered.vcf"),
        "bcf_raw": os.path.join(VCF_DIR, "BCFtools", "combined_variants_bcftools_new.vcf"),
        "bcf_loci": os.path.join(VCF_DIR, "filtered_variants", "combined_variants_bcftools_filtered_missing_loci.vcf"),
        "bcf_final": os.path.join(VCF_DIR, "filtered_variants", "combined_variants_bcftools_final_filtered.vcf"),
    }
    stats = {k: count_vcf_variants(v) for k, v in paths.items()}

    gatk_chr = get_chromosome_counts(paths["gatk_final"])
    bcf_chr = get_chromosome_counts(paths["bcf_final"])
    stats["gatk_chr_distribution"] = gatk_chr
    stats["bcf_chr_distribution"] = bcf_chr

    return jsonify(stats)


@app.route("/api/chat", methods=["POST"])
def api_chat():
    """LLM assistant endpoint — calls Anthropic API with local pipeline context."""
    data = request.get_json()
    if not data or "messages" not in data:
        return jsonify({"error": "Missing messages"}), 400

    api_key = data.get("api_key") or os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return jsonify({
            "error": "No Anthropic API key provided. Set the ANTHROPIC_API_KEY environment variable "
                     "or enter your key in the assistant panel."
        }), 401

    cl = anthropic.Anthropic(api_key=api_key)
    system_prompt = (
        "You are a bioinformatics assistant specialized in genomic variant analysis pipelines. "
        "You help users understand the results of their Dingo (Canis lupus dingo) whole-genome "
        "sequencing analysis. Answer questions based ONLY on the provided pipeline context. "
        "Be precise, scientific but accessible. When you do not know something from the context, "
        "say so clearly.\n\n"
        "PIPELINE CONTEXT:\n"
        + get_context()
    )

    try:
        response = cl.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            system=system_prompt,
            messages=data["messages"],
        )
        return jsonify({
            "content": response.content[0].text,
            "usage": {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            },
        })
    except anthropic.AuthenticationError:
        return jsonify({"error": "Invalid API key. Please check your Anthropic API key."}), 401
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    print("=" * 60)
    print("  Dingo Genomic Analysis Dashboard")
    print("  http://localhost:5050")
    print("=" * 60)
    print(f"  Base directory: {BASE_DIR}")
    print(f"  API key set: {'yes' if os.environ.get('ANTHROPIC_API_KEY') else 'no (set ANTHROPIC_API_KEY)'}")
    print("=" * 60)
    app.run(debug=False, port=5050)
