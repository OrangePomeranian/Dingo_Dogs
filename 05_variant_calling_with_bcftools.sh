#!/bin/bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

REF="${PROJECT_DIR}/results_2/reference/GCF_003254725.2_ASM325472v2_genomic.fna"
ALIGN_DIR="${PROJECT_DIR}/results/alignment"
OUT_DIR="${PROJECT_DIR}/results/BCFtools"

mkdir -p "$OUT_DIR"

if [[ ! -f "$REF" ]]; then
  echo "ERROR: Reference FASTA does not exist:"
  echo "$REF"
  exit 1
fi

if [[ ! -f "${REF}.fai" ]]; then
  echo "### [INFO] Creating FASTA index ###"
  samtools faidx "$REF"
fi

cd "$ALIGN_DIR"

for SAMPLE in SRR25817557 SRR25817558; do
  echo "### [START] BCFtools Variant Calling for $SAMPLE ###"

  if [[ ! -f "${SAMPLE}_aligned_reads.bam" ]]; then
    samtools view -Sb "${SAMPLE}_aligned_reads.sam" \
      -o "${SAMPLE}_aligned_reads.bam"
  fi

  if [[ ! -f "${SAMPLE}_aligned_reads.sorted.bam" ]]; then
    samtools sort "${SAMPLE}_aligned_reads.bam" \
      -o "${SAMPLE}_aligned_reads.sorted.bam"
  fi

  samtools index "${SAMPLE}_aligned_reads.sorted.bam"

  bcftools mpileup \
    -f "$REF" \
    "${SAMPLE}_aligned_reads.sorted.bam" | \
  bcftools call \
    -mv \
    -Ov \
    -o "${OUT_DIR}/${SAMPLE}_variants_bcftools.vcf"
done

echo "### [INFO] BCFtools Variant Calling Complete ###"