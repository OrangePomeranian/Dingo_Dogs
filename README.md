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

Designed as a thin visualization and interpretation layer on top of bioinformatics workflows, with emphasis on transparency, comparability, and debugging of variant calling pipelines.

<img width="1856" height="1133" alt="image" src="https://github.com/user-attachments/assets/518da887-cde1-49f5-83b8-7fc23609c193" />
___
<img width="1856" height="2282" alt="image" src="https://github.com/user-attachments/assets/b88c58bb-b852-49cf-9ff8-2e03a892af2d" />
___
<img width="1856" height="3164" alt="image" src="https://github.com/user-attachments/assets/c721094e-5210-4c07-9fe4-f0b39d61af75" />
___
<img width="1856" height="1952" alt="image" src="https://github.com/user-attachments/assets/446f20c7-9705-4ef6-925e-b2cffa7adf6c" />
___
<img width="1856" height="2054" alt="image" src="https://github.com/user-attachments/assets/1f83984b-cfe0-40ba-8c86-52607040eb19" />
___
<img width="1862" height="981" alt="image" src="https://github.com/user-attachments/assets/970f20ef-28c3-4bd9-88a0-680c7294d98d" />
