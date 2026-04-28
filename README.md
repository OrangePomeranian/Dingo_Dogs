# Genomic-Analysis-of-Founder-Effects-and-Bottleneck-Events-in-Dingo-Dogs
Production-grade web dashboard for inspecting and validating an end-to-end WGS variant calling pipeline.

The application provides a structured visualization layer over the full workflow — from raw data acquisition to final variant annotation — exposing pipeline state, intermediate outputs, and key metrics at each stage. It includes detailed step-by-step execution traces, tool configurations, and output artifacts, enabling reproducibility and auditability of the analysis.

Core features:

Aggregated pipeline metrics (reads, variants, filtering impact)
Full pipeline trace with stage-level outputs and parameters
Side-by-side comparison of GATK HaplotypeCaller vs BCFtools (counts, overlap, distribution)
Variant filtering funnel and chromosome-level distributions
Annotation summary with SnpEff integration
Centralized view of all tools, versions, and configurations used
Embedded LLM assistant for contextual querying over pipeline results

___
Designed as a thin visualization and interpretation layer on top of bioinformatics workflows, with emphasis on transparency, comparability, and debugging of variant calling pipelines.

Main dashboard view of a Dingo WGS analysis pipeline, showing high-level pipeline metrics, sample and reference metadata, and a visual summary of variant processing stages.

Includes variant counts (GATK vs BCFtools), filtering funnel, pipeline stage progression, and quick access to detailed results and analyses.
<img width="1856" height="1133" alt="image" src="https://github.com/user-attachments/assets/518da887-cde1-49f5-83b8-7fc23609c193" />

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
