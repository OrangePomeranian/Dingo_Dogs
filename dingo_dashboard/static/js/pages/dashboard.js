/** dashboard.js — Main project dashboard page. */

function renderDashboard(container) {
  const d = PIPELINE_DATA;
  const vs = d.variantStats;

  container.innerHTML = `
    <!-- Hero banner -->
    <div class="card" style="background:linear-gradient(135deg,rgba(8,145,178,.12),rgba(79,70,229,.12));border-color:rgba(34,211,238,.2);margin-bottom:24px;">
      <div style="display:flex;align-items:flex-start;gap:20px;flex-wrap:wrap;">
        <div style="font-size:56px;">🐕</div>
        <div style="flex:1;min-width:220px;">
          <h2 style="font-size:1.5rem;font-weight:800;margin-bottom:6px;">${d.project.title}</h2>
          <p style="color:var(--clr-text-secondary);font-size:.88rem;line-height:1.7;margin-bottom:14px;">${d.project.description}</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            <span class="badge badge--cyan">🧬 WGS</span>
            <span class="badge badge--muted">🔬 Illumina HiSeq 2000</span>
            <span class="badge badge--green">✓ Pipeline Complete</span>
            <span class="badge badge--muted">📅 ${d.project.date}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- High-level stats -->
    <div class="section">
      <div class="section__title">📊 Pipeline Summary</div>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-card__label">Samples</div>
          <div class="stat-card__value stat-card__value--cyan">2</div>
          <div class="stat-card__sub">Dingo individuals (WGS)</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Reads per sample</div>
          <div class="stat-card__value">1M</div>
          <div class="stat-card__sub">Illumina paired-end</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">GATK raw variants</div>
          <div class="stat-card__value stat-card__value--cyan">${vs.gatk.raw.toLocaleString()}</div>
          <div class="stat-card__sub stat-card__trend stat-card__trend--down">↓ ${vs.gatk.afterFinalFilter} after filtering</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">BCFtools raw variants</div>
          <div class="stat-card__value stat-card__value--indigo">${vs.bcftools.raw.toLocaleString()}</div>
          <div class="stat-card__sub stat-card__trend stat-card__trend--down">↓ ${vs.bcftools.afterFinalFilter} after filtering</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">GATK final SNPs</div>
          <div class="stat-card__value stat-card__value--green">${vs.gatk.snps}</div>
          <div class="stat-card__sub">High-quality filtered</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">BCFtools final SNPs</div>
          <div class="stat-card__value stat-card__value--green">${vs.bcftools.snps}</div>
          <div class="stat-card__sub">High-quality filtered</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Chromosomes covered</div>
          <div class="stat-card__value stat-card__value--amber">39</div>
          <div class="stat-card__sub">chr1–chr38 + chrX</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__label">Pipeline stages</div>
          <div class="stat-card__value">${d.pipelineStages.length}</div>
          <div class="stat-card__sub">From download to annotation</div>
        </div>
      </div>
    </div>

    <!-- Input data & samples -->
    <div class="section">
      <div class="section__title">🧫 Input Data</div>
      <div class="grid-2">
        <div class="card">
          <div class="card__title"><span class="card__title-icon">🐕</span>Samples</div>
          ${d.samples.map(s => `
            <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--clr-border-soft);">
              <div style="font-size:28px;">🧬</div>
              <div>
                <div style="font-weight:700;font-size:.9rem;">${s.id}</div>
                <div style="font-size:.75rem;color:var(--clr-text-muted);margin:2px 0;">Accession: <code>${s.accession}</code></div>
                <div style="font-size:.75rem;color:var(--clr-text-secondary);">${s.species} &bull; ${s.reads.toLocaleString()} reads &bull; Insert: ${s.insertSizeMean} bp (σ ${s.insertSizeStd})</div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <div class="card__title"><span class="card__title-icon">📚</span>Reference Genome</div>
          <table style="font-size:.82rem;">
            <tr><td class="text-muted" style="padding:8px 0;border-bottom:1px solid var(--clr-border-soft);width:140px;">Accession</td><td><code>${d.reference.accession}</code></td></tr>
            <tr><td class="text-muted" style="padding:8px 0;border-bottom:1px solid var(--clr-border-soft);">Assembly</td><td>${d.reference.name}</td></tr>
            <tr><td class="text-muted" style="padding:8px 0;border-bottom:1px solid var(--clr-border-soft);">Species</td><td><em>${d.reference.species}</em></td></tr>
            <tr><td class="text-muted" style="padding:8px 0;border-bottom:1px solid var(--clr-border-soft);">Chromosomes</td><td>${d.reference.chromosomes} autosomes + X</td></tr>
            <tr><td class="text-muted" style="padding:8px 0;border-bottom:1px solid var(--clr-border-soft);">Total length</td><td>${d.reference.totalLength}</td></tr>
            <tr><td class="text-muted" style="padding:8px 0;">SnpEff DB</td><td><code>${d.reference.snpEffDb}</code></td></tr>
          </table>
        </div>
      </div>
    </div>

    <!-- Workflow overview -->
    <div class="section">
      <div class="section__title">🔄 Workflow Overview</div>
      <div class="grid-2">
        <div class="card">
          <div class="card__title"><span class="card__title-icon">⚡</span>Variant Filtering Funnel</div>
          <div style="height:220px;position:relative;"><canvas id="dash-funnel-chart"></canvas></div>
        </div>
        <div class="card">
          <div class="card__title"><span class="card__title-icon">🧩</span>Pipeline Stages</div>
          ${['Pre-processing','Reference','Alignment','Variant Calling','Filtering','Annotation','Post-processing'].map(cat => {
            const count = d.pipelineStages.filter(s => s.category.toLowerCase() === cat.toLowerCase()).length;
            const color = {
              'Pre-processing':'cyan','Reference':'amber','Alignment':'indigo',
              'Variant Calling':'red','Filtering':'green','Annotation':'purple','Post-processing':'amber'
            }[cat] || 'muted';
            return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--clr-border-soft);">
              <span class="cat-pill cat-${cat.toLowerCase()}">${cat}</span>
              <div class="progress-bar" style="flex:1;"><div class="progress-bar__fill progress-bar__fill--${color}" style="width:${count*18}%"></div></div>
              <span style="font-size:.76rem;color:var(--clr-text-muted);width:20px;text-align:right;">${count}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Navigation cards -->
    <div class="section">
      <div class="section__title">🗂 Explore Results</div>
      <div class="summary-grid">
        ${[
          { page:'parameters', icon:'⚙️', bg:'rgba(34,211,238,.12)',  name:'Used Parameters',      desc:'Parameters for all tools grouped by pipeline stage — FastQC, Trimmomatic, BWA, SAMtools, GATK, BCFtools, SnpEff.' },
          { page:'steps',      icon:'📋', bg:'rgba(129,140,248,.12)', name:'Step-by-Step Results',  desc:'Outputs, statistics, and explanations for each analysis step from raw data to final annotated variants.' },
          { page:'comparison', icon:'⚖️', bg:'rgba(251,191,36,.12)',  name:'GATK vs BCFtools',      desc:'Side-by-side comparison of variant counts, SNP/Indel ratios, chromosome distribution, and key differences.' },
          { page:'annotation', icon:'🔖', bg:'rgba(192,132,252,.12)', name:'Annotation Summary',    desc:'SnpEff annotation results: impact categories, functional consequences, affected genes, and interpretation.' },
          { page:'pipeline',   icon:'🗺', bg:'rgba(52,211,153,.12)',  name:'Full Pipeline View',    desc:'Complete workflow flowchart from raw reads to annotated variants with tool, inputs, outputs, and status.' },
          { page:'assistant',  icon:'🤖', bg:'rgba(248,113,113,.12)', name:'LLM Result Assistant',  desc:'Chat with an AI assistant trained on your local pipeline results to answer biological and technical questions.' },
        ].map(c => `
          <div class="summary-card" onclick="window.navigateTo('${c.page}')">
            <div class="summary-card__header">
              <div class="summary-card__icon" style="background:${c.bg};">${c.icon}</div>
              <div class="summary-card__name">${c.name}</div>
            </div>
            <div class="summary-card__desc">${c.desc}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Scientific context -->
    <div class="card" style="margin-bottom:24px;">
      <div class="card__title"><span class="card__title-icon">🔬</span>Scientific Context</div>
      <div class="grid-2" style="gap:16px;font-size:.84rem;color:var(--clr-text-secondary);line-height:1.7;">
        <div>
          <p><strong style="color:var(--clr-text-primary);">Goal:</strong> ${d.project.goal}</p>
          <p style="margin-top:10px;"><strong style="color:var(--clr-text-primary);">Bottleneck effect</strong> occurs when a population passes through a drastic reduction in size, reducing genetic diversity. Dingoes, introduced to Australia thousands of years ago from a small founding population, are an ideal model for studying these effects.</p>
        </div>
        <div>
          <p><strong style="color:var(--clr-text-primary);">Founder effect</strong> is a special case of the bottleneck — allele frequencies in the new population differ from the original due to chance sampling of the founding individuals.</p>
          <p style="margin-top:10px;">By identifying shared high-quality SNPs between two dingo individuals, we can characterize the genomic diversity present in the analysed population sample.</p>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => renderFunnelChart('dash-funnel-chart'), 100);
}
