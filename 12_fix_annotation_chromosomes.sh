#bin/env bash

MAPPING_FILE="./results/contigs/final_file.txt"
ANNOTATION_INPUT="./results/comparison/annotation_comparison.txt"
ANNOTATION_OUTPUT="./results/final_annotation/annotation_comparison_fixed.txt"

awk '
NR==FNR {
    # Read the mapping file (final_file.txt)
    # Format: contig_id chrX
    map[$1] = $2
    next
}
{
    # Now $1 is "<" and $2 is "NC_064243.1"
    # We must check $2 in the map instead of $1
    if ($2 in map) {
        gsub("ERROR_CHROMOSOME_NOT_FOUND", map[$2])
    }
    print
}
' "$MAPPING_FILE" "$ANNOTATION_INPUT" > "$ANNOTATION_OUTPUT"

echo "Replacement completed! Results saved in $ANNOTATION_OUTPUT"
