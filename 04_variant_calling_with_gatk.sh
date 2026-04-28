#!/bin/bash
set -euo pipefail

# ---- Variant Calling with GATK HaplotypeCaller ----

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

REF="${PROJECT_DIR}/results_2/reference/GCF_003254725.2_ASM325472v2_genomic.fna"
ALIGN_DIR="${PROJECT_DIR}/results/alignment"
OUT_DIR="${PROJECT_DIR}/results/gatk"

mkdir -p "$OUT_DIR"

# ---- Check input files ----
echo "### [CHECK] Checking reference and BAM files ###"

if [[ ! -f "$REF" ]]; then
  echo "ERROR: Reference FASTA does not exist:"
  echo "$REF"
  exit 1
fi

if [[ ! -f "${REF}.fai" ]]; then
  echo "### [INFO] Creating FASTA index ###"
  samtools faidx "$REF"
fi

DICT="${REF%.fna}.dict"

if [[ ! -f "$DICT" ]] || [[ ! -s "$DICT" ]]; then
  echo "### [INFO] Creating sequence dictionary ###"
  rm -f "$DICT"
  gatk CreateSequenceDictionary \
    -R "$REF" \
    -O "$DICT"
fi

for SAMPLE in SRR25817557 SRR25817558; do
  BAM="${ALIGN_DIR}/${SAMPLE}_with_RG.bam"

  if [[ ! -f "$BAM" ]]; then
    echo "ERROR: BAM file does not exist:"
    echo "$BAM"
    exit 1
  fi

  if [[ ! -f "${BAM}.bai" ]]; then
    echo "### [INFO] Indexing BAM for $SAMPLE ###"
    samtools index "$BAM"
  fi
done

cd "$OUT_DIR"

# ---- HaplotypeCaller per sample ----
for SAMPLE in SRR25817557 SRR25817558; do
  echo "### [START] GATK Variant Calling for $SAMPLE ###"

  gatk HaplotypeCaller \
    -R "$REF" \
    -I "${ALIGN_DIR}/${SAMPLE}_with_RG.bam" \
    -O "${SAMPLE}_variants_gatk.g.vcf" \
    --emit-ref-confidence GVCF
done

# ---- Combine GVCFs ----
echo "### [INFO] Combining GATK GVCFs ###"

gatk CombineGVCFs \
  -R "$REF" \
  -V SRR25817557_variants_gatk.g.vcf \
  -V SRR25817558_variants_gatk.g.vcf \
  -O combined_variants_gatk.g.vcf

# ---- Genotype combined GVCF ----
echo "### [INFO] Running GenotypeGVCFs for combined GVCF ###"

gatk GenotypeGVCFs \
  -R "$REF" \
  -V combined_variants_gatk.g.vcf \
  -O combined_variants_gatk.vcf

echo "### [DONE] GATK variant calling completed ###"