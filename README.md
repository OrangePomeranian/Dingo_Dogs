# Genomic-Analysis-of-Founder-Effects-and-Bottleneck-Events-in-Dingo-Dogs
Production-grade implementation of an end-to-end Whole Genome Sequencing (WGS) variant calling pipeline, coupled with a full-stack analytical dashboard for inspection, validation, and interpretability of results.

The backend pipeline orchestrates all stages of genomic data processing — from raw FASTQ acquisition to final annotated variants — using modular, reproducible Bash workflows coordinated via a master execution script . It includes data download and QC, read trimming, reference genome preparation, alignment, and dual variant calling using both GATK HaplotypeCaller (GVCF workflow) and BCFtools mpileup/call , followed by merging, filtering, annotation with SnpEff , and cross-tool comparison.

The pipeline is designed with explicit intermediate outputs, validation checkpoints, and structured result directories, ensuring reproducibility, traceability, and ease of debugging across all stages (QC, alignment, variant calling, filtering, annotation, and post-processing).

On top of this, the project delivers a production-grade web dashboard that acts as a visualization and validation layer over the pipeline. It exposes pipeline state, execution trace, parameters, and outputs in a structured and interactive format, enabling both technical and biological inspection.

Core capabilities:

- End-to-end automated WGS pipeline with modular Bash scripts and deterministic execution flow  
- Dual variant calling strategy (GATK vs BCFtools) with downstream harmonization and comparison  
- Variant filtering pipeline (missingness, SNP selection, LD pruning) and functional annotation (SnpEff)  
- Post-processing layer for contig normalization and chromosome mapping  
- Full observability of pipeline stages, inputs/outputs, and tool configurations  
- Interactive dashboard with:
  - Aggregated metrics (reads, variants, filtering impact)  
  - Step-by-step execution trace with artifacts and parameters  
  - Side-by-side comparison of variant callers (counts, overlap, distributions)  
  - Variant filtering funnel and chromosome-level visualizations  
  - Annotation summaries and consistency checks  
- Embedded LLM assistant enabling contextual querying over pipeline outputs and results  

This project bridges raw bioinformatics execution with a modern data engineering and analytics layer, providing a reproducible, inspectable, and explainable environment for genomic variant analysis.
___
Designed as a thin visualization and interpretation layer on top of bioinformatics workflows, with emphasis on transparency, comparability, and debugging of variant calling pipelines.

Main dashboard view of a Dingo WGS analysis pipeline, showing high-level pipeline metrics, sample and reference metadata, and a visual summary of variant processing stages.

Includes variant counts (GATK vs BCFtools), filtering funnel, pipeline stage progression, and quick access to detailed results and analyses.
<img width="1856" height="1133" alt="image" src="https://github.com/user-attachments/assets/518da887-cde1-49f5-83b8-7fc23609c193" />
___
Detailed pipeline configuration and execution view, showing all tools used (with versions and roles) and a step-by-step breakdown of the workflow.

Includes preprocessing, alignment, variant calling, filtering, and annotation stages, with parameters, scripts, and generated outputs for each step—enabling full transparency and reproducibility of the analysis.
<img width="1856" height="2282" alt="image" src="https://github.com/user-attachments/assets/b88c58bb-b852-49cf-9ff8-2e03a892af2d" />
___
Step-by-step execution view of the genomic pipeline, presenting each stage from raw data quality control through trimming, alignment, variant calling, filtering, and annotation.

Displays key metrics, parameters, intermediate outputs, and comparison between GATK and BCFtools results, enabling traceability of how raw reads are transformed into final high-confidence variants.

<img width="1856" height="3164" alt="image" src="https://github.com/user-attachments/assets/c721094e-5210-4c07-9fe4-f0b39d61af75" />
___
Comparison view between GATK HaplotypeCaller and BCFtools pipelines, highlighting differences in variant detection.

Includes overlap analysis (shared vs unique variants), detailed metrics (raw counts, filtering stages, SNP/indel breakdown), and chromosome-level distributions, supported by visualizations and concise explanations of methodological differences between callers.

<img width="1856" height="1952" alt="image" src="https://github.com/user-attachments/assets/446f20c7-9705-4ef6-925e-b2cffa7adf6c" />
___
End-to-end pipeline view visualizing the full genomic workflow from raw data ingestion to final annotated variants.

Shows each stage (QC, trimming, alignment, variant calling, filtering, annotation, post-processing) in a sequential timeline with associated inputs, outputs, and parameters, providing a complete, traceable execution overview of the pipeline.

<img width="1856" height="2054" alt="image" src="https://github.com/user-attachments/assets/1f83984b-cfe0-40ba-8c86-52607040eb19" />
___
Integrated LLM assistant interface that enables querying pipeline results using natural language.

Provides contextual answers based on processed genomic data (variants, samples, annotations), with pre-defined prompts and full pipeline awareness to support interpretation, troubleshooting, and exploratory analysis.



<img width="1862" height="981" alt="image" src="https://github.com/user-attachments/assets/970f20ef-28c3-4bd9-88a0-680c7294d98d" />
