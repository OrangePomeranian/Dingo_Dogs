#!/bin/bash
set -euo pipefail

BCFTOOLS_VCF="./results/BCFtools/combined_variants_bcftools_new.vcf"
GATK_VCF="./results/gatk/combined_variants_gatk.vcf"

FILTERED_DIR="./results/filtered_variants"
mkdir -p "$FILTERED_DIR"

filter_variants() {
  local INPUT_VCF="$1"
  local OUTPUT_PREFIX="$2"

  echo "### [INFO] Starting SNP filtering for $INPUT_VCF ###"

  if [[ ! -f "$INPUT_VCF" ]]; then
    echo "### [WARN] Input VCF does not exist, skipping: $INPUT_VCF ###"
    return
  fi

  # Step 1: Keep only SNPs and remove loci with >10% missing genotypes
  echo "### [INFO] Removing loci with >10% missing SNPs ###"

  bcftools view \
    -v snps \
    -i 'F_MISSING<=0.1' \
    -Ov \
    -o "${OUTPUT_PREFIX}_filtered_missing_loci.vcf" \
    "$INPUT_VCF"

  LOCI_COUNT=$(bcftools view -H "${OUTPUT_PREFIX}_filtered_missing_loci.vcf" | wc -l | tr -d ' ')

  if [[ "$LOCI_COUNT" -eq 0 ]]; then
    echo "### [WARN] No loci remain after missing-loci filtering for $INPUT_VCF. Skipping. ###"
    return
  fi

  # Step 2: Keep all samples for now
  echo "### [INFO] Creating sample keep list ###"

  bcftools query -l "${OUTPUT_PREFIX}_filtered_missing_loci.vcf" \
    > "${OUTPUT_PREFIX}_keep_samples.txt"

  SAMPLE_COUNT=$(wc -l < "${OUTPUT_PREFIX}_keep_samples.txt" | tr -d ' ')

  if [[ "$SAMPLE_COUNT" -eq 0 ]]; then
    echo "### [WARN] No samples found in $INPUT_VCF. Skipping. ###"
    return
  fi

  echo "### [INFO] Keeping $SAMPLE_COUNT samples ###"

  bcftools view \
    -S "${OUTPUT_PREFIX}_keep_samples.txt" \
    -Ov \
    -o "${OUTPUT_PREFIX}_filtered_missing_samples.vcf" \
    "${OUTPUT_PREFIX}_filtered_missing_loci.vcf"

  # Step 3: Remove loci in close proximity
  echo "### [INFO] Removing loci in close proximity ###"

  bcftools +prune \
    -w 1000 \
    -n 1 \
    -Ov \
    -o "${OUTPUT_PREFIX}_final_filtered.vcf" \
    "${OUTPUT_PREFIX}_filtered_missing_samples.vcf"

  echo "### [INFO] Finished filtering for $INPUT_VCF ###"
}

filter_variants "$BCFTOOLS_VCF" "$FILTERED_DIR/combined_variants_bcftools"
filter_variants "$GATK_VCF" "$FILTERED_DIR/combined_variants_gatk"