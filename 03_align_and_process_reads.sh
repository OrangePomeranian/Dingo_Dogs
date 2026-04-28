#!/bin/bash

# ---- Align Reads and Add Read Groups ----
cd ./results/alignment

# Define directories and reference file
REFERENCE_DIR="/Users/daria/Desktop/Instrukcja_kody/results/reference"
REFERENCE_FILE="GCF_003254725.2_ASM325472v2_genomic.fna"
ALIGNMENT_DIR="/Users/daria/Desktop/Instrukcja_kody/results/alignment"

# Ensure the reference genome is indexed
if [ ! -f "${REFERENCE_DIR}/${REFERENCE_FILE}.bwt" ]; then
  echo "### [INFO] Indexing reference genome ###"
  bwa index "${REFERENCE_DIR}/${REFERENCE_FILE}"
  if [ $? -ne 0 ]; then
    echo "### [ERROR] Failed to index reference genome. Exiting. ###"
    exit 1
  fi
fi

# Process each sample
for SAMPLE in SRR25817557 SRR25817558; do
  echo "### [START] Processing $SAMPLE ###"

  TRIMMED_READS_DIR="/Users/daria/Desktop/Instrukcja_kody/results/${SAMPLE}/trimmed_reads"
  READ1="${TRIMMED_READS_DIR}/${SAMPLE}_1_paired.fq.gz"
  READ2="${TRIMMED_READS_DIR}/${SAMPLE}_2_paired.fq.gz"

  # Check if trimmed reads exist
  if [ ! -f "${READ1}" ] || [ ! -f "${READ2}" ]; then
    echo "### [ERROR] Trimmed reads for $SAMPLE not found. Skipping this sample. ###"
    continue
  fi

  # Align reads
  echo "### [INFO] Aligning reads for $SAMPLE ###"
  bwa mem -R "@RG\tID:$SAMPLE\tSM:$SAMPLE\tPL:ILLUMINA\tLB:lib_$SAMPLE\tPU:unit_$SAMPLE" \
    "${REFERENCE_DIR}/${REFERENCE_FILE}" \
    "${READ1}" "${READ2}" > "${ALIGNMENT_DIR}/${SAMPLE}_aligned_reads.sam"
  if [ $? -ne 0 ]; then
    echo "### [ERROR] BWA alignment failed for $SAMPLE. Skipping this sample. ###"
    continue
  fi

  # Convert SAM to BAM
  echo "### [INFO] Converting SAM to BAM for $SAMPLE ###"
  samtools view -b "${ALIGNMENT_DIR}/${SAMPLE}_aligned_reads.sam" -o "${ALIGNMENT_DIR}/${SAMPLE}_aligned_reads.bam"
  if [ $? -ne 0 ]; then
    echo "### [ERROR] SAM to BAM conversion failed for $SAMPLE. Skipping this sample. ###"
    continue
  fi

  # Sort BAM
  echo "### [INFO] Sorting BAM for $SAMPLE ###"
  samtools sort "${ALIGNMENT_DIR}/${SAMPLE}_aligned_reads.bam" -o "${ALIGNMENT_DIR}/${SAMPLE}_aligned_reads.sorted.bam"
  if [ $? -ne 0 ]; then
    echo "### [ERROR] Sorting BAM failed for $SAMPLE. Skipping this sample. ###"
    continue
  fi

  # Remove existing read groups
  echo "### [INFO] Removing existing read groups for $SAMPLE ###"
  samtools view -h "${ALIGNMENT_DIR}/${SAMPLE}_aligned_reads.sorted.bam" | \
  grep -v '^@RG' | \
  samtools view -b -o "${ALIGNMENT_DIR}/${SAMPLE}_no_RG.bam"

  # Add Read Groups
  echo "### [INFO] Adding Read Groups for $SAMPLE ###"
  samtools addreplacerg \
    -r "@RG\tID:${SAMPLE}\tLB:lib_${SAMPLE}\tPL:illumina\tPU:unit_${SAMPLE}\tSM:${SAMPLE}" \
    -o "${ALIGNMENT_DIR}/${SAMPLE}_with_RG.bam" \
    "${ALIGNMENT_DIR}/${SAMPLE}_no_RG.bam"
  if [ $? -ne 0 ]; then
    echo "### [ERROR] Adding Read Groups failed for $SAMPLE. Skipping this sample. ###"
    continue
  fi

  # Index the BAM file
  echo "### [INFO] Indexing BAM for $SAMPLE ###"
  samtools index "${ALIGNMENT_DIR}/${SAMPLE}_with_RG.bam"
  if [ $? -ne 0 ]; then
    echo "### [ERROR] Indexing BAM failed for $SAMPLE. Skipping this sample. ###"
    continue
  fi

done

cd ../..

echo "### [INFO] All samples processed successfully ###"

