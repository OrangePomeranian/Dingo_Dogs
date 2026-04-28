/**
 * charts.js — Chart.js rendering helpers for the Dingo dashboard.
 */

const CHART_DEFAULTS = {
  font:   { family: "'Inter', sans-serif", size: 11 },
  colors: {
    cyan:   '#22d3ee',
    indigo: '#818cf8',
    green:  '#34d399',
    amber:  '#fbbf24',
    red:    '#f87171',
    purple: '#c084fc',
    muted:  '#4b6282',
  },
};

/** Destroy an existing Chart instance on a canvas (if any). */
function destroyChart(canvasId) {
  const existing = Chart.getChart(canvasId);
  if (existing) existing.destroy();
}

/** Common dark-theme Chart.js defaults. */
function darkDefaults() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          font: CHART_DEFAULTS.font,
          boxWidth: 12,
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: '#1d2a3f',
        borderColor: '#263347',
        borderWidth: 1,
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(38,51,71,.6)' },
        ticks: { color: '#94a3b8', font: CHART_DEFAULTS.font },
      },
      y: {
        grid: { color: 'rgba(38,51,71,.6)' },
        ticks: { color: '#94a3b8', font: CHART_DEFAULTS.font },
      },
    },
  };
}

/** Variant funnel bar chart — shows filtering progression for GATK and BCFtools. */
function renderFunnelChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const d = PIPELINE_DATA.variantStats;
  const labels = ['Raw variants', 'After SNP/Missing filter', 'After LD pruning'];
  const cfg = darkDefaults();
  cfg.indexAxis = 'y';
  cfg.plugins.legend.display = true;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'GATK',
          data: [d.gatk.raw, d.gatk.afterLocusFilter, d.gatk.afterFinalFilter],
          backgroundColor: 'rgba(34,211,238,.35)',
          borderColor: '#22d3ee',
          borderWidth: 1.5,
          borderRadius: 4,
        },
        {
          label: 'BCFtools',
          data: [d.bcftools.raw, d.bcftools.afterLocusFilter, d.bcftools.afterFinalFilter],
          backgroundColor: 'rgba(129,140,248,.35)',
          borderColor: '#818cf8',
          borderWidth: 1.5,
          borderRadius: 4,
        },
      ],
    },
    options: {
      ...cfg,
      scales: {
        x: { ...cfg.scales.x, type: 'logarithmic', ticks: { ...cfg.scales.x.ticks, callback: v => v >= 1000 ? (v/1000)+'k' : v } },
        y: { ...cfg.scales.y, grid: { display: false } },
      },
    },
  });
}

/** SNP vs Indel doughnut — single tool. */
function renderSnpIndelDoughnut(canvasId, tool) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const d = PIPELINE_DATA.variantStats[tool];
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['SNPs', 'Indels'],
      datasets: [{
        data: [d.snps, d.indels],
        backgroundColor: ['rgba(34,211,238,.7)', 'rgba(251,191,36,.7)'],
        borderColor: ['#22d3ee', '#fbbf24'],
        borderWidth: 1.5,
        hoverOffset: 6,
      }],
    },
    options: {
      ...darkDefaults(),
      cutout: '65%',
      scales: { x: { display: false }, y: { display: false } },
    },
  });
}

/** GATK vs BCFtools variant count grouped bar chart. */
function renderComparisonBar(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const d = PIPELINE_DATA.variantStats;
  const cfg = darkDefaults();
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total raw', 'After locus filter', 'After LD pruning', 'SNPs (final)', 'Indels (final)'],
      datasets: [
        {
          label: 'GATK',
          data: [d.gatk.raw, d.gatk.afterLocusFilter, d.gatk.afterFinalFilter, d.gatk.snps, d.gatk.indels],
          backgroundColor: 'rgba(34,211,238,.4)',
          borderColor: '#22d3ee', borderWidth: 1.5, borderRadius: 4,
        },
        {
          label: 'BCFtools',
          data: [d.bcftools.raw, d.bcftools.afterLocusFilter, d.bcftools.afterFinalFilter, d.bcftools.snps, d.bcftools.indels],
          backgroundColor: 'rgba(129,140,248,.4)',
          borderColor: '#818cf8', borderWidth: 1.5, borderRadius: 4,
        },
      ],
    },
    options: {
      ...cfg,
      scales: {
        x: { ...cfg.scales.x, grid: { display: false } },
        y: { ...cfg.scales.y, type: 'logarithmic', ticks: { ...cfg.scales.y.ticks, callback: v => v >= 1000 ? (v/1000).toFixed(0)+'k' : v } },
      },
    },
  });
}

/** Chromosome distribution bar chart for GATK and BCFtools. */
function renderChrDistributionChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  const chrMap = PIPELINE_DATA.chromosomeMap;
  const labels = chrMap.map(c => c.chr);
  const gatkCounts = chrMap.map(c => PIPELINE_DATA.chromosomeVariants.gatk[c.chr] || 0);
  const bcfCounts  = chrMap.map(c => PIPELINE_DATA.chromosomeVariants.bcftools[c.chr] || 0);
  const cfg = darkDefaults();

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'GATK', data: gatkCounts, backgroundColor: 'rgba(34,211,238,.5)', borderColor: '#22d3ee', borderWidth: 1, borderRadius: 3 },
        { label: 'BCFtools', data: bcfCounts, backgroundColor: 'rgba(129,140,248,.5)', borderColor: '#818cf8', borderWidth: 1, borderRadius: 3 },
      ],
    },
    options: {
      ...cfg,
      scales: {
        x: { ...cfg.scales.x, grid: { display: false }, ticks: { ...cfg.scales.x.ticks, maxRotation: 60 } },
        y: { ...cfg.scales.y, max: 3, ticks: { ...cfg.scales.y.ticks, stepSize: 1 } },
      },
    },
  });
}

/** Annotation impact donut chart. */
function renderImpactChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const imp = PIPELINE_DATA.annotations.impacts;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(imp),
      datasets: [{
        data: Object.values(imp),
        backgroundColor: ['rgba(248,113,113,.7)', 'rgba(251,191,36,.7)', 'rgba(52,211,153,.7)', 'rgba(129,140,248,.7)'],
        borderColor: ['#f87171', '#fbbf24', '#34d399', '#818cf8'],
        borderWidth: 1.5, hoverOffset: 6,
      }],
    },
    options: {
      ...darkDefaults(),
      cutout: '60%',
      scales: { x: { display: false }, y: { display: false } },
    },
  });
}

/** Annotation consequence horizontal bar chart. */
function renderConsequenceChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const cons = PIPELINE_DATA.annotations.consequences;
  const sorted = Object.entries(cons).sort((a, b) => b[1] - a[1]);
  const cfg = darkDefaults();
  cfg.indexAxis = 'y';
  cfg.plugins.legend = { display: false };

  const colors = ['rgba(129,140,248,.6)', 'rgba(34,211,238,.6)', 'rgba(52,211,153,.6)', 'rgba(251,191,36,.6)', 'rgba(192,132,252,.6)', 'rgba(34,211,238,.4)', 'rgba(248,113,113,.5)', 'rgba(251,191,36,.4)', 'rgba(129,140,248,.4)'];

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(([k]) => k.replace(/_/g, ' ')),
      datasets: [{
        data: sorted.map(([, v]) => v),
        backgroundColor: colors.slice(0, sorted.length),
        borderColor: colors.map(c => c.replace('.', '1.').replace('0.6', '1').replace('0.5', '1').replace('0.4', '1')),
        borderWidth: 1, borderRadius: 4,
      }],
    },
    options: {
      ...cfg,
      scales: {
        x: { ...cfg.scales.x, max: 50 },
        y: { ...cfg.scales.y, grid: { display: false } },
      },
    },
  });
}

/** Chromosome length bar for reference visualization. */
function renderChromosomeLengthChart(canvasId) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const chrMap = PIPELINE_DATA.chromosomeMap;
  const cfg = darkDefaults();
  cfg.indexAxis = 'y';
  cfg.plugins.legend = { display: false };

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chrMap.map(c => c.chr),
      datasets: [{
        data: chrMap.map(c => Math.round(c.length / 1e6)),
        backgroundColor: chrMap.map((_, i) => `hsla(${190 + i * 4}, 70%, 60%, 0.45)`),
        borderWidth: 0, borderRadius: 3,
      }],
    },
    options: {
      ...cfg,
      scales: {
        x: { ...cfg.scales.x, title: { display: true, text: 'Length (Mb)', color: '#94a3b8' } },
        y: { ...cfg.scales.y, grid: { display: false } },
      },
    },
  });
}
