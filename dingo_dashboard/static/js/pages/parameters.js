/** parameters.js — Used parameters page, grouped by pipeline stage. */

function renderParameters(container) {
  const tools   = PIPELINE_DATA.tools;
  const stages  = PIPELINE_DATA.pipelineStages;

  const categories = [...new Set(stages.map(s => s.category))];

  const catColors = {
    'Pre-processing':  { text: 'var(--clr-cyan)',   bg: 'rgba(34,211,238,.1)',   border: 'rgba(34,211,238,.25)'   },
    'Reference':       { text: 'var(--clr-amber)',  bg: 'rgba(251,191,36,.1)',   border: 'rgba(251,191,36,.25)'   },
    'Alignment':       { text: 'var(--clr-indigo)', bg: 'rgba(129,140,248,.1)',  border: 'rgba(129,140,248,.25)'  },
    'Variant Calling': { text: 'var(--clr-red)',    bg: 'rgba(248,113,113,.1)',  border: 'rgba(248,113,113,.25)'  },
    'Filtering':       { text: 'var(--clr-green)',  bg: 'rgba(52,211,153,.1)',   border: 'rgba(52,211,153,.25)'   },
    'Annotation':      { text: 'var(--clr-purple)', bg: 'rgba(192,132,252,.1)',  border: 'rgba(192,132,252,.25)'  },
    'Post-processing': { text: 'var(--clr-amber)',  bg: 'rgba(251,191,36,.1)',   border: 'rgba(251,191,36,.25)'   },
  };

  function catBadge(cat) {
    const c = catColors[cat] || { text: 'var(--clr-text-muted)', bg: 'var(--clr-surface-2)', border: 'var(--clr-border)' };
    return `<span style="background:${c.bg};color:${c.text};border:1px solid ${c.border};padding:2px 9px;border-radius:10px;font-size:.68rem;font-weight:700;">${cat}</span>`;
  }

  function paramRows(params) {
    if (!params || params.length === 0) return '<p class="text-muted text-small">No explicit parameters listed.</p>';
    return `<table style="width:100%;"><thead><tr><th>Parameter</th><th>Value</th><th>Description</th></tr></thead><tbody>
      ${params.map(p => `<tr>
        <td><code>${p.name}</code></td>
        <td>${p.value ? `<code style="color:var(--clr-amber)">${p.value}</code>` : '<span class="text-muted">—</span>'}</td>
        <td class="text-muted" style="font-size:.78rem;">${p.description}</td>
      </tr>`).join('')}
    </tbody></table>`;
  }

  function fileList(files, label) {
    return `<div style="margin-top:10px;">
      <div style="font-size:.72rem;font-weight:700;color:var(--clr-text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;">${label}</div>
      ${files.map(f => `<div style="font-size:.78rem;padding:4px 0;border-bottom:1px solid var(--clr-border-soft);display:flex;gap:8px;">
        <span style="color:var(--clr-text-muted);">→</span>
        <code style="color:var(--clr-text-secondary);">${f}</code>
      </div>`).join('')}
    </div>`;
  }

  function stageSection(cat) {
    const stageList = stages.filter(s => s.category === cat);
    const c = catColors[cat] || {};
    return `
      <div class="section" id="cat-${cat.replace(/ /g,'-').toLowerCase()}">
        <div class="section__title" style="color:${c.text || 'inherit'};">
          <span style="width:10px;height:10px;border-radius:50%;background:${c.text};display:inline-block;margin-right:4px;"></span>
          ${cat}
        </div>
        ${stageList.map(stage => `
          <div class="accordion" id="acc-${stage.id}">
            <button class="accordion__header" onclick="toggleAccordion('acc-${stage.id}')">
              <span style="font-size:1.1rem;font-weight:800;color:${c.text};width:28px;text-align:center;">${stage.step}</span>
              <div>
                <div class="accordion__title">${stage.name}</div>
                <div class="accordion__subtitle">
                  ${catBadge(stage.category)} &nbsp;
                  <span class="badge badge--muted">${stage.tool}</span>
                  &nbsp;
                  <span class="badge badge--${stage.status === 'completed' ? 'green' : 'amber'}">${stage.status === 'completed' ? '✓ Completed' : stage.status}</span>
                </div>
              </div>
              <svg class="accordion__arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div class="accordion__body">
              <div class="grid-2" style="gap:20px;margin-bottom:16px;">
                <div>
                  <div style="font-size:.78rem;font-weight:700;color:var(--clr-text-muted);text-transform:uppercase;margin-bottom:6px;">Script</div>
                  <code style="color:var(--clr-cyan);font-size:.78rem;">${stage.script}</code>
                  <div style="margin-top:10px;font-size:.82rem;color:var(--clr-text-secondary);line-height:1.65;">${stage.purpose}</div>
                </div>
                <div>
                  <div style="margin-bottom:4px;"><span class="badge badge--${stage.status === 'completed' ? 'green' : 'amber'}">${stage.status === 'completed' ? '✓ Status: Completed' : '⚠ ' + stage.status}</span></div>
                  ${stage.result ? `<div style="margin-top:8px;background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.2);border-radius:var(--r-md);padding:10px 12px;font-size:.78rem;color:var(--clr-text-secondary);">
                    <span style="font-weight:700;color:var(--clr-green);">Result:</span> ${stage.result}
                  </div>` : ''}
                </div>
              </div>

              <div class="grid-2" style="gap:16px;margin-bottom:16px;">
                ${fileList(stage.input, 'Input files')}
                ${fileList(stage.output, 'Output files')}
              </div>

              <div style="margin-top:8px;">
                <div style="font-size:.72rem;font-weight:700;color:var(--clr-text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;">Parameters used</div>
                <div class="table-wrap">${paramRows(stage.parameters)}</div>
              </div>
            </div>
          </div>
        `).join('<br style="margin:4px;">')}
      </div>
    `;
  }

  // Tools summary table
  const toolsTable = `
    <div class="section">
      <div class="section__title">🔧 All Tools Overview</div>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Tool</th><th>Version</th><th>Category</th><th>Purpose</th></tr></thead>
            <tbody>
              ${tools.map(t => `<tr>
                <td style="font-weight:600;">${t.name}</td>
                <td><code>${t.version}</code></td>
                <td>${catBadge(t.category)}</td>
                <td class="text-muted" style="font-size:.78rem;">${t.purpose}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = toolsTable + categories.map(stageSection).join('');
}

function toggleAccordion(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}
