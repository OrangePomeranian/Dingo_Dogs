#!/bin/bash

# Paths
MAPPING_FILE="./results/contigs/final_file.txt"
GATK_INPUT="./results/comparison/sample_comparison_gatk.txt"
BCFTOOLS_INPUT="./results/comparison/sample_comparison_bcftools.txt"
OUTPUT_DIR="./results/final_annotation"

mkdir -p "$OUTPUT_DIR"

# Output files
GATK_OUTPUT="$OUTPUT_DIR/sample_comparison_gatk_with_chr.txt"
BCFTOOLS_OUTPUT="$OUTPUT_DIR/sample_comparison_bcftools_with_chr.txt"

# Add chromosome column to GATK file
awk '
NR==FNR {
  # Read the mapping file (final_file.txt)
  # Format: contig chrX
  # Example: NC_064243.1 chr1
  map[$1]=$2
  next
}
{
  # For each line in the input VCF comparison file:
  # $1 is the contig
  # Check if we have a mapping; if yes, print all columns plus the chromosome
  # If no mapping is found, print "chrUnknown" (or choose any placeholder)
  chr = ($1 in map) ? map[$1] : "chrUnknown"
  print $0, chr
}' "$MAPPING_FILE" "$GATK_INPUT" > "$GATK_OUTPUT"


# Add chromosome column to BCFTOOLS file
awk '
NR==FNR {
  map[$1]=$2
  next
}
{
  chr = ($1 in map) ? map[$1] : "chrUnknown"
  print $0, chr
}' "$MAPPING_FILE" "$BCFTOOLS_INPUT" > "$BCFTOOLS_OUTPUT"

echo "Chromosome information added successfully!"
echo "GATK output: $GATK_OUTPUT"
echo "BCFTOOLS output: $BCFTOOLS_OUTPUT"
