#!/bin/bash

# Set the working directory
WORK_DIR="./results/BCFtools"

# Input VCF files
VCF1="${WORK_DIR}/SRR25817557_variants_bcftools.vcf"
VCF2="${WORK_DIR}/SRR25817558_variants_bcftools.vcf"

# Output compressed VCF files
VCF1_GZ="${WORK_DIR}/SRR25817557_variants_bcftools_new.vcf.gz"
VCF2_GZ="${WORK_DIR}/SRR25817558_variants_bcftools_new.vcf.gz"

# Output merged VCF file
MERGED_VCF="${WORK_DIR}/combined_variants_bcftools_new.vcf"

# Compress VCF files using bgzip
echo "### [INFO] Compressing VCF files ###"
bgzip -c "${VCF1}" > "${VCF1_GZ}"
bgzip -c "${VCF2}" > "${VCF2_GZ}"

# Index the compressed VCF files using tabix
echo "### [INFO] Indexing compressed VCF files ###"
tabix -p vcf "${VCF1_GZ}"
tabix -p vcf "${VCF2_GZ}"

# Merge the compressed and indexed VCF files using bcftools
echo "### [INFO] Merging VCF files ###"
bcftools merge "${VCF1_GZ}" "${VCF2_GZ}" -Ov -o "${MERGED_VCF}"

echo "### [INFO] VCF files merged successfully. Output: ${MERGED_VCF} ###"
