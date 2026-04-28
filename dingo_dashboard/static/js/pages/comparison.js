/** comparison.js — GATK vs BCFtools comparison page. */

function renderComparison(container) {
  const vs  = PIPELINE_DATA.variantStats;
  const cmp = PIPELINE_DATA.comparison;
  const chrV = PIPELINE_DATA.chromosomeVariants;

  function statRow(label, gatkVal, bcfVal, highlight) {
    const better = gatkVal > bcfVal ? 'gatk' : gatkVal < bcfVal ? 'bcf' : 'tie';
    return `<tr>
      <td style="font-weight:500;">${label}</td>
      <td style="text-align:center;font-weight:700;${better==='gatk'?'color:var(--clr-cyan);':''}">${typeof gatkVal === 'number' ? gatkVal.toLocaleString() : gatkVal}</td>
      <td style="text-align:center;font-weight:700;${better==='bcf'?'color:var(--clr-indigo);':''}">${typeof bcfVal === 'number' ? bcfVal.toLocaleString() : bcfVal}</td>
    </tr>`;
  }

  // Chromosome bar rows (only main chromosomes)
  const chrBars = PIPELINE_DATA.chromosomeMap.slice(0, 20).map(c => {
    const gv = chrV.gatk[c.chr] || 0;
    const bv = chrV.bcftools[c.chr] || 0;
    const max = 3;
    return `<div class="chr-bar-row">
      <div class="chr-bar-label">${c.chr}</div>
      <div>
        <div class="chr-bar-track" style="margin-bottom:3px;">
          <div class="chr-bar-fill chr-bar-fill--gatk" style="width:${(gv/max)*100}%;"></div>
        </div>
        <div class="chr-bar-track">
          <div class="chr-bar-fill chr-bar-fill--bcf" style="width:${(bv/max)*100}%;"></div>
        </div>
      </div>
      <div class="chr-bar-count"><span style="color:var(--clr-cyan);">${gv}</span> / <span style="color:var(--clr-indigo);">${bv}</span></div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <!-- Overview header -->
    <div class="grid-2" style="margin-bottom:24px;">
      <div class="card" style="border-color:rgba(34,211,238,.3);text-align:center;">
        <div style="font-size:2.4rem;font-weight:800;color:var(--clr-cyan);">${vs.gatk.afterFinalFilter}</div>
        <div style="font-size:.82rem;color:var(--clr-text-secondary);margin-top:4px;">GATK final variants</div>
        <div style="display:flex;justify-content:center;gap:8px;margin-top:10px;">
          <span class="badge badge--green">SNPs: ${vs.gatk.snps}</span>
          <span class="badge badge--amber">Indels: ${vs.gatk.indels}</span>
        </div>
      </div>
      <div class="card" style="border-color:rgba(129,140,248,.3);text-align:center;">
        <div style="font-size:2.4rem;font-weight:800;color:var(--clr-indigo);">${vs.bcftools.afterFinalFilter}</div>
        <div style="font-size:.82rem;color:var(--clr-text-secondary);margin-top:4px;">BCFtools final variants</div>
        <div style="display:flex;justify-content:center;gap:8px;margin-top:10px;">
          <span class="badge badge--green">SNPs: ${vs.bcftools.snps}</span>
          <span class="badge badge--amber">Indels: ${vs.bcftools.indels}</span>
        </div>
      </div>
    </div>

    <!-- Venn diagram + shared info -->
    <div class="section">
      <div class="section__title">🔵 Variant Overlap</div>
      <div class="card">
        <div class="grid-2">
          <div>
            <div class="venn">
              <div class="venn-circle venn-circle--gatk">
                <div>
                  <div style="font-size:1.6rem;font-weight:800;">${cmp.gatkOnly}</div>
                  <div style="font-size:.72rem;">GATK only</div>
                </div>
              </div>
              <div style="z-index:2;text-align:center;min-width:80px;">
                <span class="venn-overlap__num">${cmp.sharedPositions}</span>
                <div style="font-size:.7rem;color:var(--clr-text-muted);">shared</div>
              </div>
              <div class="venn-circle venn-circle--bcf">
                <div>
                  <div style="font-size:1.6rem;font-weight:800;">${cmp.bcftoolsOnly}</div>
                  <div style="font-size:.72rem;">BCF only</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="card__title">📋 Overlap Summary</div>
            <table style="font-size:.82rem;">
              <tbody>
                ${statRow('Shared positions (both callers)', cmp.sharedPositions, cmp.sharedPositions)}
                ${statRow('GATK-only variants', cmp.gatkOnly, '—')}
                ${statRow('BCFtools-only variants', '—', cmp.bcftoolsOnly)}
                ${statRow('Total final variants', cmp.totalGatk, cmp.totalBcftools)}
              </tbody>
            </table>
            <div class="alert alert--info" style="margin-top:12px;">
              <span class="alert__icon">ℹ</span>
              ${cmp.note}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Side-by-side comparison table -->
    <div class="section">
      <div class="section__title">📊 Detailed Comparison</div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th style="text-align:center;color:var(--clr-cyan);">GATK HaplotypeCaller</th>
                <th style="text-align:center;color:var(--clr-indigo);">BCFtools mpileup</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colspan="3" style="font-weight:700;font-size:.75rem;color:var(--clr-text-muted);padding-top:14px;text-transform:uppercase;letter-spacing:.05em;">Raw Variant Calling</td></tr>
              ${statRow('Raw variants (all types)', vs.gatk.raw, vs.bcftools.raw)}
              ${statRow('Algorithm', 'Haplotype assembly', 'Pileup-based counting')}
              ${statRow('Mode', 'GVCF joint genotyping', 'Per-sample + merge')}

              <tr><td colspan="3" style="font-weight:700;font-size:.75rem;color:var(--clr-text-muted);padding-top:14px;text-transform:uppercase;letter-spacing:.05em;">After Filtering</td></tr>
              ${statRow('After SNP + missing filter', vs.gatk.afterLocusFilter, vs.bcftools.afterLocusFilter)}
              ${statRow('After LD pruning (final)', vs.gatk.afterFinalFilter, vs.bcftools.afterFinalFilter)}
              ${statRow('Final SNPs', vs.gatk.snps, vs.bcftools.snps)}
              ${statRow('Final Indels', vs.gatk.indels, vs.bcftools.indels)}
              ${statRow('SNP fraction', (vs.gatk.snps/vs.gatk.afterFinalFilter*100).toFixed(1)+'%', (vs.bcftools.snps/vs.bcftools.afterFinalFilter*100).toFixed(1)+'%')}

              <tr><td colspan="3" style="font-weight:700;font-size:.75rem;color:var(--clr-text-muted);padding-top:14px;text-transform:uppercase;letter-spacing:.05em;">Chromosome Distribution</td></tr>
              ${statRow('Variants on main chr (NC_)', vs.gatk.mainChromosomes, vs.bcftools.mainChromosomes)}
              ${statRow('Variants on scaffolds (NW_)', vs.gatk.scaffolds, vs.bcftools.scaffolds)}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Chart comparison -->
    <div class="section">
      <div class="section__title">📈 Visual Comparison</div>
      <div class="grid-2">
        <div class="card">
          <div class="card__title">All Filtering Stages</div>
          <div style="height:250px;position:relative;"><canvas id="cmp-bar-chart"></canvas></div>
        </div>
        <div class="card">
          <div class="card__title">SNP vs Indel Breakdown</div>
          <div class="grid-2">
            <div>
              <div style="text-align:center;font-size:.75rem;color:var(--clr-cyan);margin-bottom:6px;">GATK</div>
              <div style="height:160px;position:relative;"><canvas id="snp-indel-gatk"></canvas></div>
            </div>
            <div>
              <div style="text-align:center;font-size:.75rem;color:var(--clr-indigo);margin-bottom:6px;">BCFtools</div>
              <div style="height:160px;position:relative;"><canvas id="snp-indel-bcf"></canvas></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Per-chromosome distribution -->
    <div class="section">
      <div class="section__title">🧬 Chromosome-Level Distribution (main chromosomes)</div>
      <div class="grid-2">
        <div class="card">
          <div class="card__title">Bar chart (chr1–chr20)</div>
          <div style="height:300px;position:relative;"><canvas id="chr-dist-chart"></canvas></div>
          <div style="display:flex;gap:16px;margin-top:10px;font-size:.75rem;">
            <span style="display:flex;align-items:center;gap:6px;"><span style="width:12px;height:12px;border-radius:2px;background:rgba(34,211,238,.5);display:inline-block;"></span>GATK</span>
            <span style="display:flex;align-items:center;gap:6px;"><span style="width:12px;height:12px;border-radius:2px;background:rgba(129,140,248,.5);display:inline-block;"></span>BCFtools</span>
          </div>
        </div>
        <div class="card">
          <div class="card__title">Per-chromosome count</div>
          <div class="chr-bar-container" style="max-height:340px;overflow-y:auto;">
            <div style="display:flex;gap:16px;font-size:.72rem;color:var(--clr-text-muted);margin-bottom:8px;padding-left:56px;">
              <span style="color:var(--clr-cyan);">■ GATK</span>
              <span style="color:var(--clr-indigo);">■ BCFtools</span>
            </div>
            ${chrBars}
          </div>
        </div>
      </div>
    </div>

    <!-- Key differences explanation -->
    <div class="section">
      <div class="section__title">💡 Key Differences Explained</div>
      <div class="grid-2">
        <div class="card">
          <div class="card__title"><span style="color:var(--clr-cyan);">■</span> Why GATK calls fewer raw variants</div>
          <ul style="font-size:.82rem;color:var(--clr-text-secondary);line-height:1.8;padding-left:18px;">
            <li>Uses local de-novo haplotype assembly — more conservative</li>
            <li>Requires minimum mapping quality (≥20) for reads</li>
            <li>Minimum genotype quality threshold (GQ≥30)</li>
            <li>Haplotype model naturally filters low-confidence sites</li>
            <li>GVCF workflow allows better multi-sample joint calling</li>
          </ul>
        </div>
        <div class="card">
          <div class="card__title"><span style="color:var(--clr-indigo);">■</span> Why BCFtools calls more raw variants</div>
          <ul style="font-size:.82rem;color:var(--clr-text-secondary);line-height:1.8;padding-left:18px;">
            <li>Pileup approach counts reads per base — more inclusive</li>
            <li>Default depth limit 250× accepts more reads per site</li>
            <li>No internal haplotype model — includes noisier sites</li>
            <li>More sensitive at low coverage positions</li>
            <li>After quality filtering, converges to similar set as GATK</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Genotype differences -->
    <div class="section">
      <div class="section__title">🧬 Genotype Patterns</div>
      <div class="card">
        <div class="grid-2">
          <div>
            <div class="card__title">Allele Frequency Distribution</div>
            <table style="font-size:.82rem;">
              <thead><tr><th>AF pattern</th><th>Meaning</th><th>Interpretation</th></tr></thead>
              <tbody>
                <tr><td><code>AF=0.25</code></td><td>1/4 alleles alt</td><td>One sample heterozygous, one homozygous ref</td></tr>
                <tr><td><code>AF=0.50</code></td><td>2/4 alleles alt</td><td>Both samples heterozygous, or one homozygous alt</td></tr>
                <tr><td><code>AF=0.75</code></td><td>3/4 alleles alt</td><td>One sample heterozygous + one homozygous alt</td></tr>
                <tr><td><code>AF=1.0</code></td><td>4/4 alleles alt</td><td>Both samples homozygous alt (fixed variant)</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <div class="card__title">Observed Patterns in GATK final VCF</div>
            <div class="stat-grid" style="grid-template-columns:repeat(2,1fr);">
              <div class="stat-card"><div class="stat-card__label">AF=0.50</div><div class="stat-card__value" style="font-size:1.3rem;">~45%</div><div class="stat-card__sub">Heterozygous in 1 or both</div></div>
              <div class="stat-card"><div class="stat-card__label">AF=0.75</div><div class="stat-card__value" style="font-size:1.3rem;">~48%</div><div class="stat-card__sub">Het + hom alt</div></div>
              <div class="stat-card"><div class="stat-card__label">AF=1.0</div><div class="stat-card__value" style="font-size:1.3rem;">~7%</div><div class="stat-card__sub">Fixed alt allele</div></div>
              <div class="stat-card"><div class="stat-card__label">MQ=60</div><div class="stat-card__value" style="font-size:1.3rem;">~70%</div><div class="stat-card__sub">Perfect mapping quality</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    renderComparisonBar('cmp-bar-chart');
    renderSnpIndelDoughnut('snp-indel-gatk', 'gatk');
    renderSnpIndelDoughnut('snp-indel-bcf', 'bcftools');
    renderChrDistributionChart('chr-dist-chart');
  }, 100);
}
