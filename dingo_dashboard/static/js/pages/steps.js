/** steps.js — Step-by-step results page. */

function renderSteps(container) {
  const vs = PIPELINE_DATA.variantStats;

  const steps = [
    {
      id: 'qc',
      title: 'Step 1 — Raw Data & Quality Control',
      icon: '🔬',
      color: 'cyan',
      content: `
        <div class="grid-2">
          <div>
            <div class="card__title">📥 Data Download</div>
            ${PIPELINE_DATA.samples.map(s => `
              <div style="padding:10px 0;border-bottom:1px solid var(--clr-border-soft);">
                <div style="font-weight:700;font-size:.9rem;">${s.id} <span class="badge badge--muted">${s.accession}</span></div>
                <div style="font-size:.78rem;color:var(--clr-text-muted);margin-top:4px;">
                  Files: <code>${s.r1}</code>, <code>${s.r2}</code><br>
                  Reads downloaded: <strong>1,000,000</strong> &bull; Format: gzip FASTQ paired-end
                </div>
              </div>
            `).join('')}
          </div>
          <div>
            <div class="card__title">📊 FastQC Summary (Pre-trim)</div>
            <div class="alert alert--info">
              <span class="alert__icon">ℹ</span>
              FastQC HTML reports are in <code>results/SRR*/qc_results/</code>. Open them in a browser for the full interactive report.
            </div>
            <table style="font-size:.8rem;width:100%;margin-top:8px;">
              <thead><tr><th>Metric</th><th>SRR25817557</th><th>SRR25817558</th></tr></thead>
              <tbody>
                <tr><td>Basic statistics</td><td><span class="badge badge--green">PASS</span></td><td><span class="badge badge--green">PASS</span></td></tr>
                <tr><td>Per-base quality</td><td><span class="badge badge--green">PASS</span></td><td><span class="badge badge--green">PASS</span></td></tr>
                <tr><td>GC content</td><td><span class="badge badge--amber">NOTE</span></td><td><span class="badge badge--amber">NOTE</span></td></tr>
                <tr><td>Adapter content</td><td><span class="badge badge--amber">WARN</span></td><td><span class="badge badge--amber">WARN</span></td></tr>
                <tr><td>Sequence duplication</td><td><span class="badge badge--green">PASS</span></td><td><span class="badge badge--green">PASS</span></td></tr>
              </tbody>
            </table>
            <div class="alert alert--info" style="margin-top:10px;">
              <span class="alert__icon">ℹ</span>
              <span>GC content warnings are <strong>expected for dingo samples</strong> — FastQC uses a human reference distribution. Dingo GC content (~41%) is slightly different from human (~38%), causing FastQC to flag this, but it is biologically normal for this species.</span>
            </div>
          </div>
        </div>
      `,
    },
    {
      id: 'trim',
      title: 'Step 2 — Read Trimming',
      icon: '✂️',
      color: 'indigo',
      content: `
        <div class="grid-2">
          <div>
            <div class="card__title">⚙️ Trimmomatic Settings</div>
            <table style="font-size:.8rem;">
              <thead><tr><th>Parameter</th><th>Value</th><th>Effect</th></tr></thead>
              <tbody>
                <tr><td><code>ILLUMINACLIP</code></td><td><code>2:30:10</code></td><td>Remove Illumina adapters</td></tr>
                <tr><td><code>LEADING</code></td><td><code>3</code></td><td>Trim leading low-quality bases</td></tr>
                <tr><td><code>TRAILING</code></td><td><code>3</code></td><td>Trim trailing low-quality bases</td></tr>
                <tr><td><code>SLIDINGWINDOW</code></td><td><code>4:20</code></td><td>Trim when 4-bp window quality &lt; 20</td></tr>
                <tr><td><code>MINLEN</code></td><td><code>36</code></td><td>Discard reads shorter than 36 bp</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <div class="card__title">📦 Output Files</div>
            ${PIPELINE_DATA.samples.map(s => `
              <div style="padding:8px 0;border-bottom:1px solid var(--clr-border-soft);">
                <div style="font-weight:600;font-size:.84rem;">${s.id}</div>
                <div style="font-size:.75rem;color:var(--clr-text-muted);margin-top:3px;">
                  ✓ ${s.id}_1_paired.fq.gz &bull; ${s.id}_2_paired.fq.gz<br>
                  • ${s.id}_1_unpaired.fq.gz &bull; ${s.id}_2_unpaired.fq.gz
                </div>
              </div>
            `).join('')}
            <div class="alert alert--success" style="margin-top:10px;">
              <span class="alert__icon">✓</span>
              Post-trimming FastQC shows improved per-base quality scores and no adapter contamination. Paired reads are used for all downstream steps.
            </div>
          </div>
        </div>
      `,
    },
    {
      id: 'align',
      title: 'Step 3 — Alignment to Reference',
      icon: '🎯',
      color: 'amber',
      content: `
        <div class="grid-2">
          <div>
            <div class="card__title">🗺 BWA-MEM Alignment Statistics</div>
            <table style="font-size:.8rem;">
              <thead><tr><th>Metric</th><th>SRR25817557</th><th>SRR25817558</th></tr></thead>
              <tbody>
                <tr><td>Insert size mean</td><td>${PIPELINE_DATA.samples[0].insertSizeMean} bp</td><td>${PIPELINE_DATA.samples[1].insertSizeMean} bp</td></tr>
                <tr><td>Insert size std</td><td>± ${PIPELINE_DATA.samples[0].insertSizeStd} bp</td><td>± ${PIPELINE_DATA.samples[1].insertSizeStd} bp</td></tr>
                <tr><td>25th percentile</td><td>${PIPELINE_DATA.samples[0].insertSizeP25} bp</td><td>${PIPELINE_DATA.samples[1].insertSizeP25} bp</td></tr>
                <tr><td>75th percentile</td><td>${PIPELINE_DATA.samples[0].insertSizeP75} bp</td><td>${PIPELINE_DATA.samples[1].insertSizeP75} bp</td></tr>
                <tr><td>Pair orientation</td><td>FR</td><td>FR</td></tr>
                <tr><td>Platform</td><td>ILLUMINA</td><td>ILLUMINA</td></tr>
              </tbody>
            </table>
            <div class="alert alert--info" style="margin-top:10px;">
              <span class="alert__icon">ℹ</span>
              FR orientation (Forward-Reverse) is expected for standard Illumina paired-end libraries. Insert size ~281 bp is typical for 150 bp paired-end runs.
            </div>
          </div>
          <div>
            <div class="card__title">🛠 BAM Processing Steps</div>
            <div class="funnel">
              <div class="funnel-step"><div class="funnel-step__num">1</div><div><div class="funnel-step__label">SAM → BAM conversion</div><div class="funnel-step__sub">samtools view -b</div></div></div>
              <div class="funnel-arrow">↓</div>
              <div class="funnel-step"><div class="funnel-step__num">2</div><div><div class="funnel-step__label">Coordinate sort</div><div class="funnel-step__sub">samtools sort</div></div></div>
              <div class="funnel-arrow">↓</div>
              <div class="funnel-step"><div class="funnel-step__num">3</div><div><div class="funnel-step__label">Add read groups</div><div class="funnel-step__sub">samtools addreplacerg — ID, SM, PL, LB, PU tags</div></div></div>
              <div class="funnel-arrow">↓</div>
              <div class="funnel-step"><div class="funnel-step__num">4</div><div><div class="funnel-step__label">BAM index</div><div class="funnel-step__sub">samtools index → .bam.bai</div></div></div>
            </div>
            <div class="alert alert--success" style="margin-top:10px;">
              <span class="alert__icon">✓</span>
              Read groups are required by GATK HaplotypeCaller. Each sample has unique ID, SM, LB, and PU tags.
            </div>
          </div>
        </div>
      `,
    },
    {
      id: 'calling',
      title: 'Step 4 — Variant Calling',
      icon: '🧬',
      color: 'red',
      content: `
        <div class="grid-2">
          <div>
            <div class="card__title"><span style="color:var(--clr-cyan)">■</span> GATK HaplotypeCaller</div>
            <div class="funnel">
              <div class="funnel-step"><div class="funnel-step__num">1</div><div><div class="funnel-step__label">HaplotypeCaller per sample</div><div class="funnel-step__sub">--emit-ref-confidence GVCF</div></div><span class="badge badge--cyan">GVCF</span></div>
              <div class="funnel-arrow">↓</div>
              <div class="funnel-step"><div class="funnel-step__num">2</div><div><div class="funnel-step__label">CombineGVCFs</div><div class="funnel-step__sub">Merge SRR25817557 + SRR25817558</div></div></div>
              <div class="funnel-arrow">↓</div>
              <div class="funnel-step"><div class="funnel-step__num">3</div><div><div class="funnel-step__label">GenotypeGVCFs</div><div class="funnel-step__sub">Joint genotyping → combined_variants_gatk.vcf</div></div></div>
            </div>
            <div style="margin-top:12px;padding:12px;background:rgba(34,211,238,.06);border:1px solid rgba(34,211,238,.2);border-radius:var(--r-md);">
              <div style="font-size:.78rem;color:var(--clr-text-secondary);">
                <strong style="color:var(--clr-cyan);">Result:</strong> <strong style="color:var(--clr-text-primary);">${PIPELINE_DATA.variantStats.gatk.raw.toLocaleString()}</strong> raw variants<br>
                GATK 4.4.0.0 &bull; December 26, 2024 &bull; Min confidence: 30
              </div>
            </div>
          </div>
          <div>
            <div class="card__title"><span style="color:var(--clr-indigo)">■</span> BCFtools mpileup/call</div>
            <div class="funnel">
              <div class="funnel-step"><div class="funnel-step__num">1</div><div><div class="funnel-step__label">mpileup per sample</div><div class="funnel-step__sub">bcftools mpileup -f reference.fna</div></div></div>
              <div class="funnel-arrow">↓</div>
              <div class="funnel-step"><div class="funnel-step__num">2</div><div><div class="funnel-step__label">bcftools call -mv</div><div class="funnel-step__sub">Multiallelic caller, variant sites only</div></div></div>
              <div class="funnel-arrow">↓</div>
              <div class="funnel-step"><div class="funnel-step__num">3</div><div><div class="funnel-step__label">bcftools merge</div><div class="funnel-step__sub">Merge per-sample VCFs</div></div></div>
            </div>
            <div style="margin-top:12px;padding:12px;background:rgba(129,140,248,.06);border:1px solid rgba(129,140,248,.2);border-radius:var(--r-md);">
              <div style="font-size:.78rem;color:var(--clr-text-secondary);">
                <strong style="color:var(--clr-indigo);">Result:</strong> <strong style="color:var(--clr-text-primary);">${PIPELINE_DATA.variantStats.bcftools.raw.toLocaleString()}</strong> raw variants<br>
                BCFtools ≥1.15 &bull; 2 samples &bull; Diploid assumption
              </div>
            </div>
          </div>
        </div>
        <div class="alert alert--info" style="margin-top:14px;">
          <span class="alert__icon">ℹ</span>
          <span>BCFtools calls <strong>~3.7× more</strong> raw variants than GATK (309K vs 83K). This is typical: BCFtools mpileup uses a pileup-based approach which is more sensitive but also calls more false positives at low depths. GATK's haplotype assembly approach is generally more accurate but may miss some variants at low coverage.</span>
        </div>
      `,
    },
    {
      id: 'filter',
      title: 'Step 5 — Variant Filtering',
      icon: '🔽',
      color: 'green',
      content: `
        <div class="grid-2">
          <div>
            <div class="card__title">📉 GATK Filtering Funnel</div>
            <div class="funnel">
              <div class="funnel-step" style="border-color:rgba(34,211,238,.3);">
                <div class="funnel-step__num">1</div>
                <div style="flex:1;"><div class="funnel-step__label">Raw variants</div><div class="funnel-step__sub">All types: SNPs, Indels, MNPs</div></div>
                <strong style="color:var(--clr-cyan)">${vs.gatk.raw.toLocaleString()}</strong>
              </div>
              <div class="funnel-arrow">↓ bcftools view -v snps -i 'F_MISSING≤0.1'</div>
              <div class="funnel-step">
                <div class="funnel-step__num">2</div>
                <div style="flex:1;"><div class="funnel-step__label">After SNP + missing filter</div><div class="funnel-step__sub">SNP-only, ≤10% missing genotypes</div></div>
                <strong style="color:var(--clr-amber)">${vs.gatk.afterLocusFilter.toLocaleString()}</strong>
              </div>
              <div class="funnel-arrow">↓ bcftools +prune -w 1000 -n 1</div>
              <div class="funnel-step" style="border-color:rgba(52,211,153,.3);">
                <div class="funnel-step__num">3</div>
                <div style="flex:1;"><div class="funnel-step__label">Final filtered (LD pruned)</div><div class="funnel-step__sub">1 variant per 1000 bp window</div></div>
                <strong style="color:var(--clr-green)">${vs.gatk.afterFinalFilter}</strong>
              </div>
            </div>
          </div>
          <div>
            <div class="card__title">📉 BCFtools Filtering Funnel</div>
            <div class="funnel">
              <div class="funnel-step" style="border-color:rgba(129,140,248,.3);">
                <div class="funnel-step__num">1</div>
                <div style="flex:1;"><div class="funnel-step__label">Raw variants</div><div class="funnel-step__sub">All types: SNPs, Indels, MNPs</div></div>
                <strong style="color:var(--clr-indigo)">${vs.bcftools.raw.toLocaleString()}</strong>
              </div>
              <div class="funnel-arrow">↓ bcftools view -v snps -i 'F_MISSING≤0.1'</div>
              <div class="funnel-step">
                <div class="funnel-step__num">2</div>
                <div style="flex:1;"><div class="funnel-step__label">After SNP + missing filter</div><div class="funnel-step__sub">SNP-only, ≤10% missing genotypes</div></div>
                <strong style="color:var(--clr-amber)">${vs.bcftools.afterLocusFilter.toLocaleString()}</strong>
              </div>
              <div class="funnel-arrow">↓ bcftools +prune -w 1000 -n 1</div>
              <div class="funnel-step" style="border-color:rgba(52,211,153,.3);">
                <div class="funnel-step__num">3</div>
                <div style="flex:1;"><div class="funnel-step__label">Final filtered (LD pruned)</div><div class="funnel-step__sub">1 variant per 1000 bp window</div></div>
                <strong style="color:var(--clr-green)">${vs.bcftools.afterFinalFilter}</strong>
              </div>
            </div>
          </div>
        </div>
        <div class="alert alert--warning" style="margin-top:14px;">
          <span class="alert__icon">⚠</span>
          <span>The LD pruning step (<code>bcftools +prune -w 1000 -n 1</code>) is very aggressive with only 2 samples. It reduces 9,745 GATK variants to just 133 final markers, keeping one independent variant per 1 kb window. This is designed to select unlinked, independent markers for population genetics analysis.</span>
        </div>
        <div class="section__title" style="margin-top:20px;font-size:.9rem;">Notable GATK Final Variants</div>
        <div class="table-wrap card">
          <table>
            <thead><tr><th>Chromosome</th><th>Position</th><th>REF→ALT</th><th>Type</th><th>AF</th><th>Depth</th><th>MQ</th><th>Filter</th></tr></thead>
            <tbody>
              ${PIPELINE_DATA.notableVariants.map(v => `<tr>
                <td><span class="badge badge--cyan">${v.chr}</span></td>
                <td class="text-mono">${v.pos.toLocaleString()}</td>
                <td><code>${v.ref} → ${v.alt}</code></td>
                <td><span class="badge ${v.type==='SNP'?'badge--green':'badge--amber'}">${v.type}</span></td>
                <td>${v.af}</td>
                <td>${v.dp}</td>
                <td>${v.mq}</td>
                <td><span class="badge badge--pass">${v.filter}</span></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      `,
    },
    {
      id: 'annotation',
      title: 'Step 6 — Variant Annotation',
      icon: '🔖',
      color: 'purple',
      content: `
        <div class="grid-2">
          <div>
            <div class="card__title">🏷 SnpEff Annotation</div>
            <table style="font-size:.8rem;">
              <thead><tr><th>Item</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Tool</td><td>SnpEff 5.x</td></tr>
                <tr><td>Database</td><td><code>ASM325472v1.99</code></td></tr>
                <tr><td>Memory</td><td>4 GB (<code>-Xmx4g</code>)</td></tr>
                <tr><td>Input (GATK)</td><td><code>combined_variants_gatk_final_filtered.vcf</code></td></tr>
                <tr><td>Input (BCF)</td><td><code>combined_variants_bcftools_final_filtered.vcf</code></td></tr>
                <tr><td>Output</td><td><code>combined_variants_*_annotated.vcf</code></td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <div class="card__title">⚠ Known Issue: Chromosome Naming</div>
            <div class="alert alert--warning">
              <span class="alert__icon">⚠</span>
              <div>
                <strong>Chromosome naming mismatch:</strong><br>
                VCF uses NCBI accessions (<code>NC_064243.1</code>)<br>
                SnpEff database uses standard names (<code>chr1</code>)<br><br>
                This caused many variants to receive <code>ERROR_CHROMOSOME_NOT_FOUND</code> in the ANN field.<br><br>
                <strong>Resolution:</strong> Script <code>12_fix_annotation_chromosomes.sh</code> remapped all accessions to standard chromosome names.
              </div>
            </div>
          </div>
        </div>
        <div class="card" style="margin-top:16px;">
          <div class="card__title">📝 Annotation Field Format (ANN)</div>
          <div style="font-size:.78rem;color:var(--clr-text-secondary);line-height:1.7;">
            Each variant in the annotated VCF has an <code>ANN</code> field with pipe-separated values:<br>
            <code style="display:block;margin:8px 0;padding:8px;background:var(--clr-surface-2);border-radius:var(--r-md);">ANN=ALT|Effect|Impact|GeneName|GeneId|FeatureType|FeatureId|BioType|Rank|HGVS.c|HGVS.p|cDNA_pos|CDS_pos|AA_pos|Distance|Errors</code>
            The most important fields are: <strong style="color:var(--clr-text-primary);">Effect</strong> (e.g. missense_variant),
            <strong style="color:var(--clr-text-primary);">Impact</strong> (HIGH/MODERATE/LOW/MODIFIER), and
            <strong style="color:var(--clr-text-primary);">GeneName</strong>.
          </div>
        </div>
      `,
    },
    {
      id: 'contigs',
      title: 'Step 7 — Contig & Chromosome Mapping',
      icon: '🗺',
      color: 'amber',
      content: `
        <div class="grid-2">
          <div>
            <div class="card__title">🔀 NC → chr Mapping</div>
            <div class="alert alert--info">
              <span class="alert__icon">ℹ</span>
              NCBI uses accession-based names (e.g., NC_064243.1) while human-readable analysis uses standard chromosome names (chr1–chr38, chrX). Scripts 10–12 perform this mapping.
            </div>
            <div class="table-wrap" style="max-height:280px;overflow-y:auto;margin-top:12px;">
              <table style="font-size:.75rem;">
                <thead><tr><th>NCBI Accession</th><th>Chr name</th><th>Length (Mb)</th></tr></thead>
                <tbody>
                  ${PIPELINE_DATA.chromosomeMap.slice(0, 10).map(c => `<tr>
                    <td><code>${c.ncbi}</code></td>
                    <td><span class="badge badge--cyan">${c.chr}</span></td>
                    <td>${(c.length/1e6).toFixed(1)}</td>
                  </tr>`).join('')}
                  <tr><td colspan="3" style="text-align:center;color:var(--clr-text-muted);">… and 29 more chromosomes</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div class="card__title">📊 Chromosome Lengths</div>
            <div style="height:260px;position:relative;"><canvas id="chr-length-chart"></canvas></div>
          </div>
        </div>
        <div class="card" style="margin-top:16px;">
          <div class="card__title">📄 Output Files</div>
          <table style="font-size:.8rem;">
            <thead><tr><th>File</th><th>Content</th></tr></thead>
            <tbody>
              <tr><td><code>sample_comparison_gatk_with_chr.txt</code></td><td>GATK variants with human-readable chr names</td></tr>
              <tr><td><code>sample_comparison_bcftools_with_chr.txt</code></td><td>BCFtools variants with chr names</td></tr>
              <tr><td><code>annotation_comparison_fixed.txt</code></td><td>Annotation comparison with corrected chromosome names</td></tr>
            </tbody>
          </table>
        </div>
      `,
    },
  ];

  container.innerHTML = steps.map((step, i) => `
    <div class="card" style="margin-bottom:20px;" id="step-card-${step.id}">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;cursor:pointer;" onclick="toggleStepCard('step-body-${step.id}', this)">
        <div style="width:48px;height:48px;border-radius:50%;background:rgba(34,211,238,.1);border:2px solid var(--clr-${step.color});display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${step.icon}</div>
        <div style="flex:1;">
          <div style="font-size:1rem;font-weight:700;">${step.title}</div>
        </div>
        <svg id="step-arrow-${step.id}" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--clr-text-muted);transition:transform .2s;transform:rotate(180deg)"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      <div id="step-body-${step.id}">${step.content}</div>
    </div>
  `).join('');

  setTimeout(() => {
    renderChromosomeLengthChart('chr-length-chart');
  }, 100);
}

function toggleStepCard(bodyId, headerEl) {
  const body = document.getElementById(bodyId);
  const arrowId = bodyId.replace('step-body-', 'step-arrow-');
  const arrow = document.getElementById(arrowId);
  if (!body) return;
  if (body.style.display === 'none') {
    body.style.display = 'block';
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  } else {
    body.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  }
}
