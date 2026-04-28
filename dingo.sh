#!/bin/bash
set -euo pipefail

# ---- Master Pipeline Script ----
# Runs the full genomic data analysis pipeline from setup to chromosome annotation.

run_step() {
  local script="$1"
  local description="$2"

  echo ""
  echo "============================================================"
  echo "### Running $script ###"
  echo "$description"
  echo "============================================================"

  bash "$script" || {
    echo "ERROR: $script failed"
    exit 1
  }
}

run_step "01_setup_and_preprocessing.sh" \
"Sets up project folders, downloads raw reads, performs QC and trimming."

run_step "02_prepare_reference_genome.sh" \
"Prepares the reference genome by decompressing files and creating required indices."

run_step "02_2_prepare_reference_genome.sh" \
"Runs additional reference genome preparation steps."

run_step "03_align_and_process_reads.sh" \
"Aligns reads, processes SAM/BAM files, adds read groups, sorts and indexes BAM files."

run_step "04_variant_calling_with_gatk.sh" \
"Performs GATK variant calling, combines GVCFs and generates the final GATK VCF."

run_step "05_variant_calling_with_bcftools.sh" \
"Performs BCFtools variant calling and generates individual VCF files."

run_step "06_merge_bcftools_variants.sh" \
"Compresses, indexes and merges BCFtools VCF files."

run_step "07_filter_variants.sh" \
"Filters variants by missingness and proximity."

run_step "08_annotate_filtered_variants.sh" \
"Annotates filtered variants using SnpEff."

run_step "09_compare_annotations.sh" \
"Compares annotations and sample data between BCFtools and GATK outputs."

run_step "10_contigs.sh" \
"Extracts contig information and creates contig-to-chromosome mapping."

run_step "11_add_chromosome_annotation.sh" \
"Adds chromosome annotations to variant comparison files."

run_step "12_fix_annotation_chromosomes.sh" \
"Fixes missing or placeholder chromosome labels in annotation files."

echo ""
echo "============================================================"
echo "### FULL PIPELINE COMPLETED SUCCESSFULLY ###"
echo "============================================================"