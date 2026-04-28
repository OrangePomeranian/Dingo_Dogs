/**
 * app.js — Main application: routing, navigation, initialization.
 *
 * Loaded at the bottom of <body> so the DOM is already ready — no
 * DOMContentLoaded wrapper or setTimeout needed.
 */

/* ---- SVG icons (defined first so PAGES array can call them) ---- */
function svgIcon(d, size = 18) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
}
function iconHome()     { return svgIcon('<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'); }
function iconSettings() { return svgIcon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>'); }
function iconList()     { return svgIcon('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'); }
function iconCompare()  { return svgIcon('<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>'); }
function iconTag()      { return svgIcon('<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'); }
function iconFlow()     { return svgIcon('<rect x="2" y="3" width="6" height="4"/><rect x="16" y="3" width="6" height="4"/><rect x="9" y="10" width="6" height="4"/><line x1="5" y1="7" x2="5" y2="12"/><line x1="19" y1="7" x2="19" y2="12"/><line x1="5" y1="12" x2="12" y2="12"/><line x1="19" y1="12" x2="12" y2="12"/><line x1="12" y1="12" x2="12" y2="10"/>'); }
function iconBot()      { return svgIcon('<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>'); }

/* ---- Page registry ---- */
const PAGES = [
  { id: 'dashboard',  label: 'Dashboard',            icon: iconHome(),     render: renderDashboard  },
  { id: 'parameters', label: 'Used Parameters',      icon: iconSettings(), render: renderParameters },
  { id: 'steps',      label: 'Step-by-Step Results', icon: iconList(),     render: renderSteps      },
  { id: 'comparison', label: 'GATK vs BCFtools',     icon: iconCompare(),  render: renderComparison },
  { id: 'annotation', label: 'Annotation Summary',   icon: iconTag(),      render: renderAnnotation },
  { id: 'pipeline',   label: 'Full Pipeline View',   icon: iconFlow(),     render: renderPipeline   },
  { id: 'assistant',  label: 'LLM Assistant',        icon: iconBot(),      render: renderAssistant  },
];

let currentPage = 'dashboard';

/* ---- Build sidebar nav ---- */
function buildNav() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  nav.innerHTML = `
    <div class="sidebar__section-label">Analysis</div>
    ${PAGES.map(p => `
      <button class="nav-item ${p.id === currentPage ? 'active' : ''}" id="nav-${p.id}" onclick="navigateTo('${p.id}')">
        <span class="nav-icon">${p.icon}</span>
        <span>${p.label}</span>
        ${p.id === 'assistant' ? '<span class="nav-badge">AI</span>' : ''}
      </button>
    `).join('')}
  `;
}

/* ---- Navigate to a page ---- */
function navigateTo(pageId) {
  const page = PAGES.find(p => p.id === pageId);
  if (!page) return;

  currentPage = pageId;

  // Update nav highlight
  PAGES.forEach(p => {
    const btn = document.getElementById('nav-' + p.id);
    if (btn) btn.classList.toggle('active', p.id === pageId);
  });

  // Update page header
  const titleEl = document.getElementById('page-title');
  const subEl   = document.getElementById('page-subtitle');
  if (titleEl) titleEl.textContent = page.label;
  if (subEl)   subEl.textContent   = pageSubtitle(pageId);

  // Render immediately — no setTimeout needed
  const content = document.getElementById('page-content');
  if (!content) return;

  try {
    page.render(content);
  } catch (err) {
    content.innerHTML = `
      <div class="alert alert--error" style="margin:24px;">
        <span class="alert__icon">❌</span>
        <div>
          <strong>Error rendering page "${pageId}"</strong><br>
          <code style="font-size:.76rem;">${err.message}</code>
        </div>
      </div>`;
    console.error('Page render error:', err);
  }

  history.pushState({ page: pageId }, '', '#' + pageId);
}

function pageSubtitle(id) {
  return {
    dashboard:  'Dingo WGS • 2 samples • SRR25817557 & SRR25817558',
    parameters: 'All tools and their key parameters grouped by pipeline stage',
    steps:      'Outputs and statistics for each analysis step',
    comparison: 'Side-by-side GATK HaplotypeCaller vs BCFtools mpileup/call',
    annotation: 'SnpEff functional annotation results and interpretation',
    pipeline:   'Complete workflow from raw reads to annotated variants',
    assistant:  'Ask questions about your pipeline using Claude AI',
  }[id] || '';
}

/* ---- Expose helpers called from inline onclick attributes ---- */
window.navigateTo       = navigateTo;
window.toggleAccordion  = toggleAccordion;
window.togglePipelineStep = togglePipelineStep;
window.toggleStepCard   = toggleStepCard;
window.useSuggestion    = useSuggestion;
window.handleChatKey    = handleChatKey;
window.sendChatMessage  = sendChatMessage;
window.ASSISTANT_STATE  = ASSISTANT_STATE;

/* ---- Bootstrap — runs immediately since we're at end of <body> ---- */
buildNav();

const _hash = location.hash.replace('#', '');
const _initPage = PAGES.find(p => p.id === _hash) ? _hash : 'dashboard';
navigateTo(_initPage);

window.addEventListener('popstate', e => {
  if (e.state && e.state.page) navigateTo(e.state.page);
});
