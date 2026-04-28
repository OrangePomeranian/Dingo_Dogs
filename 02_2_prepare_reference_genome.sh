#!/bin/bash

# ---- Finishing preparing the reference ----
cd ./results/reference/

echo "### [INFO] Preparing reference genome ###"
# GATK CreateSequenceDictionary
gatk CreateSequenceDictionary \
    -R GCF_003254725.2_ASM325472v2_genomic.fna \
    -O GCF_003254725.2_ASM325472v2_genomic.dict

echo "### [INFO] Indexing reference genome ###"
# Index for samtools and BWA
samtools faidx GCF_003254725.2_ASM325472v2_genomic.fna
bwa index GCF_003254725.2_ASM325472v2_genomic.fna

# Index for samtools and BWA
samtools faidx GCF_003254725.2_ASM325472v2_genomic.fna
bwa index GCF_003254725.2_ASM325472v2_genomic.fna