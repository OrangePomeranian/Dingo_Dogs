#!/bin/bash
set -euo pipefail

# Paths
VCF_FILE="./results/BCFtools/SRR25817557_variants_bcftools.vcf"
REFERENCE="./results_2/reference/GCF_003254725.2_ASM325472v2_genomic.fna"
OUTPUT_DIR="./results/contigs"

mkdir -p "$OUTPUT_DIR"

# Output files
VCF_CONTIGS="$OUTPUT_DIR/vcf_contigs.txt"
REFERENCE_CONTIGS="$OUTPUT_DIR/reference_contigs.txt"
CLEANED_REFERENCE_CONTIGS="$OUTPUT_DIR/cleaned_reference_contigs.txt"
FINAL_OUTPUT="$OUTPUT_DIR/final_file.txt"

# Checks
if [[ ! -f "$VCF_FILE" ]]; then
  echo "ERROR: VCF file does not exist:"
  echo "$VCF_FILE"
  exit 1
fi

if [[ ! -f "$REFERENCE" ]]; then
  echo "ERROR: Reference file does not exist:"
  echo "$REFERENCE"
  exit 1
fi

echo "Extracting contigs from VCF file..."
bcftools view -h "$VCF_FILE" \
  | grep "^##contig" \
  | awk -F'[=,]' '{print $3}' \
  > "$VCF_CONTIGS"

echo "Extracting contigs from reference genome..."
grep "^>" "$REFERENCE" > "$REFERENCE_CONTIGS"

sed 's/^>//' "$REFERENCE_CONTIGS" > "$CLEANED_REFERENCE_CONTIGS"

echo "Extracting chromosome infos..."
awk '
{
  acc = $1
  for (i=1; i<=NF; i++) {
    if ($i == "chromosome") {
      chrom = $(i+1)
      gsub(",", "", chrom)
      print acc, "chr"chrom
      break
    }
  }
}
' "$CLEANED_REFERENCE_CONTIGS" > "$FINAL_OUTPUT"

echo "Process completed!"
echo "Formatted chromosome information saved in $FINAL_OUTPUT"


