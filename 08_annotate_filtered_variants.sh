#!/bin/bash

# Paths
FILTERED_DIR="./results/filtered_variants"
ANNOTATION_DIR="./results/annotation"
SNPEFF_JAR="./snpEff/snpEff.jar"
SNPEFF_DATABASE="ASM325472v1.99"

# Create the annotation directory if it doesn't exist
mkdir -p $ANNOTATION_DIR

echo "### [INFO] Starting annotation of filtered variants ###"

# Annotate the final filtered variants for both BCFtools and GATK
for TOOL in bcftools gatk; do
  INPUT_VCF="${FILTERED_DIR}/combined_variants_${TOOL}_final_filtered.vcf"
  OUTPUT_VCF="${ANNOTATION_DIR}/combined_variants_${TOOL}_annotated.vcf"

  # Check if input file exists
  if [[ -f "$INPUT_VCF" ]]; then
    echo "### [INFO] Annotating $INPUT_VCF ###"
    
    # Run SnpEff for annotation
    java -Xmx4g -jar $SNPEFF_JAR $SNPEFF_DATABASE $INPUT_VCF > $OUTPUT_VCF
    
    # Check if the annotation was successful
    if [[ $? -eq 0 ]]; then
      echo "### [INFO] Annotation completed successfully for $INPUT_VCF ###"
    else
      echo "### [ERROR] Annotation failed for $INPUT_VCF ###"
      exit 1
    fi
  else
    echo "### [ERROR] Input VCF file $INPUT_VCF does not exist. Skipping... ###"
  fi
done

echo "### [INFO] SNP Filtering and Annotation Completed ###"
echo "### [DONE] Pipeline completed successfully ###"

