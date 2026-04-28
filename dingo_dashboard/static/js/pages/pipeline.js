/** pipeline.js — Full pipeline flowchart/node view. */

function renderPipeline(container) {
  const stages = PIPELINE_DATA.pipelineStages;

  const catColors = {
    'Pre-processing':  'preprocessing',
    'Reference':       'reference',
    'Alignment':       'alignment',
    'Variant Calling': 'variant calling',
    'Filtering':       'filtering',
    'Annotation':      'annotation',
    'Post-processing': 'post-processing',
  };

  const statusBadge = s => s === 'completed'
    ? '<span class="badge badge--green">✓ Done</span>'
    : '<span class="badge badge--amber">⚠ ' + s + '</span>';

  function formatIOList(items) {
    return items.map(f => `<div style="font-size:.76rem;color:var(--clr-text-secondary);padding:3px 0;border-bottom:1px solid var(--clr-border-soft);display:flex;gap:8px;">
      <span style="color:var(--clr-text-muted);">›</span>
      <code style="color:var(--clr-cyan);word-break:break-all;">${f}</code>
    </div>`).join('');
  }

  // Group stages by category to draw connectors
  const grouped = {};
  stages.forEach(s => {
    const cat = catColors[s.category] || 'preprocessing';
    if (!grouped[s.category]) grouped[s.category] = [];
    grouped[s.category].push(s);
  });

  container.innerHTML = `
    <!-- Legend -->
    <div class="card" style="margin-bottom:20px;">
      <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
        <span style="font-size:.78rem;color:var(--clr-text-muted);">Stage categories:</span>
        ${Object.keys(catColors).map(cat => `<span class="cat-pill cat-${catColors[cat]}">${cat}</span>`).join('')}
        <span style="margin-left:auto;font-size:.76rem;color:var(--clr-text-muted);">Click any step to expand details</span>
      </div>
    </div>

    <!-- Flow -->
    <div class="pipeline-flow">
      ${stages.map((stage, i) => {
        const catClass = catColors[stage.category] || 'preprocessing';
        return `
          <div class="pipeline-step ${stage._open ? 'open' : ''}" id="pstep-${stage.id}">
            <div class="pipeline-step__num pipeline-step__num--${catClass}">${stage.step}</div>
            <div class="pipeline-step__body" onclick="togglePipelineStep('pstep-${stage.id}')">
              <div class="pipeline-step__header">
                <div>
                  <div class="pipeline-step__title">${stage.name}</div>
                  <div class="pipeline-step__tool">🔧 ${stage.tool}</div>
                  <div class="pipeline-step__cat">
                    <span class="cat-pill cat-${catClass}">${stage.category}</span>
                    &nbsp; Script: <code style="font-size:.7rem;color:var(--clr-text-muted);">${stage.script}</code>
                  </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
                  ${statusBadge(stage.status)}
                  <svg class="accordion__arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>

              <div class="pipeline-step__detail">
                <!-- Purpose -->
                <div style="font-size:.82rem;color:var(--clr-text-secondary);line-height:1.65;margin-bottom:14px;padding:10px 12px;background:rgba(34,211,238,.04);border-left:2px solid var(--clr-cyan);border-radius:0 var(--r-sm) var(--r-sm) 0;">
                  ${stage.purpose}
                </div>

                <div class="grid-2" style="gap:16px;margin-bottom:14px;">
                  <div>
                    <div style="font-size:.7rem;font-weight:700;color:var(--clr-text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;">📥 Input files</div>
                    ${formatIOList(stage.input)}
                  </div>
                  <div>
                    <div style="font-size:.7rem;font-weight:700;color:var(--clr-text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;">📤 Output files</div>
                    ${formatIOList(stage.output)}
                  </div>
                </div>

                ${stage.parameters && stage.parameters.length > 0 ? `
                  <div style="margin-bottom:12px;">
                    <div style="font-size:.7rem;font-weight:700;color:var(--clr-text-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px;">⚙ Key parameters</div>
                    <div class="table-wrap">
                      <table style="font-size:.78rem;">
                        <thead><tr><th>Parameter</th><th>Value</th><th>Purpose</th></tr></thead>
                        <tbody>
                          ${stage.parameters.map(p => `<tr>
                            <td><code>${p.name}</code></td>
                            <td>${p.value ? `<code style="color:var(--clr-amber);">${p.value}</code>` : '—'}</td>
                            <td style="color:var(--clr-text-muted);">${p.description}</td>
                          </tr>`).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ` : ''}

                ${stage.result ? `
                  <div style="padding:10px 14px;background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.2);border-radius:var(--r-md);font-size:.8rem;">
                    <strong style="color:var(--clr-green);">📊 Result:</strong>
                    <span style="color:var(--clr-text-secondary);margin-left:6px;">${stage.result}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          ${i < stages.length - 1 ? `
            <div style="display:flex;justify-content:flex-start;padding-left:27px;color:var(--clr-cyan-dim);font-size:20px;margin:-4px 0;z-index:1;position:relative;">↓</div>
          ` : ''}
        `;
      }).join('')}
    </div>

    <!-- Summary footer -->
    <div class="card" style="margin-top:24px;">
      <div class="card__title">🏁 Pipeline Summary</div>
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-card__label">Total steps</div><div class="stat-card__value stat-card__value--cyan">${stages.length}</div></div>
        <div class="stat-card"><div class="stat-card__label">Completed</div><div class="stat-card__value stat-card__value--green">${stages.filter(s => s.status === 'completed').length}</div></div>
        <div class="stat-card"><div class="stat-card__label">Tools used</div><div class="stat-card__value">${PIPELINE_DATA.tools.length}</div></div>
        <div class="stat-card"><div class="stat-card__label">Stage categories</div><div class="stat-card__value">${Object.keys(grouped).length}</div></div>
      </div>
    </div>
  `;
}

function togglePipelineStep(id) {
  const el = document.getElementById(id);
  if (el) el.classList.toggle('open');
}
