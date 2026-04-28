#!/bin/bash

# Directories and files
ANNOTATION_DIR="./results/annotation"
COMPARISON_DIR="./results/comparison"
BCFTOOLS_ANNOTATED="${ANNOTATION_DIR}/combined_variants_bcftools_annotated.vcf"
GATK_ANNOTATED="${ANNOTATION_DIR}/combined_variants_gatk_annotated.vcf"

# Create comparison directory
mkdir -p $COMPARISON_DIR

# Comparison Results Files
ANNOTATION_COMPARISON="${COMPARISON_DIR}/annotation_comparison.txt"
SAMPLE_COMPARISON_BCFTOOLS="${COMPARISON_DIR}/sample_comparison_bcftools.txt"
SAMPLE_COMPARISON_GATK="${COMPARISON_DIR}/sample_comparison_gatk.txt"

echo "### [INFO] Starting annotation comparison ###"

# 1. Compare annotations between BCFtools and GATK
echo "### [INFO] Comparing annotations between BCFtools and GATK ###"
bcftools query -f '%CHROM\t%POS\t%REF\t%ALT\t%INFO\n' $BCFTOOLS_ANNOTATED > ${COMPARISON_DIR}/bcftools_info.txt
bcftools query -f '%CHROM\t%POS\t%REF\t%ALT\t%INFO\n' $GATK_ANNOTATED > ${COMPARISON_DIR}/gatk_info.txt

# Use diff to find differences
diff ${COMPARISON_DIR}/bcftools_info.txt ${COMPARISON_DIR}/gatk_info.txt > $ANNOTATION_COMPARISON

if [[ -s $ANNOTATION_COMPARISON ]]; then
  echo "### [INFO] Differences found in annotations. Saved to $ANNOTATION_COMPARISON ###"
else
  echo "### [INFO] No differences found in annotations. ###"
fi

# 2. Compare samples within each file
echo "### [INFO] Comparing samples within BCFtools annotated file ###"
bcftools query -f '%CHROM\t%POS\t%REF\t%ALT\t[%SAMPLE=%GT\t]\n' $BCFTOOLS_ANNOTATED > $SAMPLE_COMPARISON_BCFTOOLS

echo "### [INFO] Comparing samples within GATK annotated file ###"
bcftools query -f '%CHROM\t%POS\t%REF\t%ALT\t[%SAMPLE=%GT\t]\n' $GATK_ANNOTATED > $SAMPLE_COMPARISON_GATK

# Compare samples for consistency
echo "### [INFO] Comparing samples consistency in BCFtools ###"
awk '{print $5}' $SAMPLE_COMPARISON_BCFTOOLS | sort | uniq -c > ${COMPARISON_DIR}/bcftools_sample_consistency.txt

echo "### [INFO] Comparing samples consistency in GATK ###"
awk '{print $5}' $SAMPLE_COMPARISON_GATK | sort | uniq -c > ${COMPARISON_DIR}/gatk_sample_consistency.txt

echo "### [DONE] Comparison completed. Results saved in $COMPARISON_DIR ###"
