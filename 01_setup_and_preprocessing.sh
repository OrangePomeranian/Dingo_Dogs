#!/bin/bash

# Clean up previous results if they exist
rm -r results

# Create directories for results
mkdir -p results/SRR25817558/qc_results
mkdir -p results/SRR25817558/trimmed_reads
mkdir -p results/SRR25817557/qc_results
mkdir -p results/SRR25817557/trimmed_reads
mkdir -p results/reference
mkdir -p results/alignment
mkdir -p results/gatk
mkdir -p results/BCFtools
mkdir -p results/filtered_variants
mkdir -p results/annotation
mkdir -p results/comparison
mkdir -p results/contigs
mkdir -p results/final_annotation

# ---- Download SRR25817557 and SRR25817558 files ----
for SAMPLE in SRR25817557 SRR25817558; do
  echo "### [START] Downloading data for $SAMPLE ###"
  mkdir -p results/$SAMPLE
  cd results/$SAMPLE

  # Limit to 1,000,000 reads
  fastq-dump --split-files -X 1000000 --gzip $SAMPLE

  echo "### [DONE] Downloading data for $SAMPLE ###"
  cd ../..
done

# ---- Quality Control (FastQC) and Trimming (Trimmomatic) ----
for SAMPLE in SRR25817557 SRR25817558; do
  echo "### [START] Pre-trimming quality check with FastQC for $SAMPLE ###"
  fastqc -o results/$SAMPLE/qc_results results/$SAMPLE/${SAMPLE}_1.fastq.gz results/$SAMPLE/${SAMPLE}_2.fastq.gz

  echo "### [START] Trimming reads for $SAMPLE ###"
  trimmomatic PE -phred33 \
    results/$SAMPLE/${SAMPLE}_1.fastq.gz results/$SAMPLE/${SAMPLE}_2.fastq.gz \
    results/$SAMPLE/trimmed_reads/${SAMPLE}_1_paired.fq.gz results/$SAMPLE/trimmed_reads/${SAMPLE}_1_unpaired.fq.gz \
    results/$SAMPLE/trimmed_reads/${SAMPLE}_2_paired.fq.gz results/$SAMPLE/trimmed_reads/${SAMPLE}_2_unpaired.fq.gz \
    ILLUMINACLIP:/path/to/adapters.fa:2:30:10 \
    LEADING:3 TRAILING:3 SLIDINGWINDOW:4:20 MINLEN:36

  echo "### [DONE] Trimming reads for $SAMPLE ###"

  echo "### [START] Post-trimming quality check with FastQC for $SAMPLE ###"
  fastqc -o results/$SAMPLE/qc_results results/$SAMPLE/trimmed_reads/${SAMPLE}_1_paired.fq.gz results/$SAMPLE/trimmed_reads/${SAMPLE}_2_paired.fq.gz

  echo "### [DONE] Quality control for $SAMPLE ###"
done

# ---- Download and Prepare Reference Genome ----
echo "### [START] Downloading and preparing reference genome ###"
cd results/reference
wget ftp://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/003/254/725/GCF_003254725.2_ASM325472v2/GCF_003254725.2_ASM325472v2_genomic.fna.gz