/** assistant.js — LLM Result Assistant chat page. */

const ASSISTANT_STATE = {
  messages: [],
  apiKey: '',
  loading: false,
};

const SUGGESTIONS = [
  'What does the bottleneck effect mean for dingoes?',
  'Why does BCFtools call so many more variants than GATK?',
  'What do MODIFIER annotations mean for my results?',
  'How does LD pruning affect the number of final variants?',
  'What is a GVCF and why is it used in GATK?',
  'Are the low read depths (DP 2-5) a concern?',
  'What does allele frequency 0.75 mean with 2 samples?',
  'Why were chromosome names a problem for SnpEff?',
];

function renderAssistant(container) {
  container.innerHTML = `
    <div class="chat-container">
      <!-- Intro header -->
      <div style="padding:16px 20px;border-bottom:1px solid var(--clr-border);background:var(--clr-surface);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,rgba(34,211,238,.2),rgba(129,140,248,.2));border:1px solid rgba(34,211,238,.3);display:flex;align-items:center;justify-content:center;font-size:20px;">🤖</div>
          <div>
            <div style="font-weight:700;font-size:.95rem;">Dingo Genomics Assistant</div>
            <div style="font-size:.75rem;color:var(--clr-text-muted);">Powered by Claude Sonnet &bull; Uses local pipeline results as context</div>
          </div>
          <div style="margin-left:auto;"><span class="badge badge--green">● Online</span></div>
        </div>
      </div>

      <!-- Messages -->
      <div class="chat-messages" id="chat-messages">
        <div class="chat-msg chat-msg--assistant">
          <div class="chat-msg__avatar">🤖</div>
          <div class="chat-msg__bubble">
            <p>Hello! I'm your Dingo Genomic Analysis assistant. I have full context of your pipeline results, including:</p>
            <ul style="margin:8px 0 0 16px;line-height:1.8;">
              <li>GATK: <strong>${PIPELINE_DATA.variantStats.gatk.raw.toLocaleString()}</strong> raw → <strong>${PIPELINE_DATA.variantStats.gatk.afterFinalFilter}</strong> final variants</li>
              <li>BCFtools: <strong>${PIPELINE_DATA.variantStats.bcftools.raw.toLocaleString()}</strong> raw → <strong>${PIPELINE_DATA.variantStats.bcftools.afterFinalFilter}</strong> final variants</li>
              <li>Samples: <strong>SRR25817557</strong> and <strong>SRR25817558</strong> (dingo WGS, Illumina HiSeq 2000)</li>
              <li>Annotation: SnpEff with ASM325472v1.99 database</li>
            </ul>
            <p style="margin-top:8px;">Ask me anything about your pipeline, results, or the biology! 🧬</p>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div class="chat-suggestions" id="chat-suggestions">
        ${SUGGESTIONS.map(s => `<button class="chat-suggestion" onclick="useSuggestion(this)">${s}</button>`).join('')}
      </div>

      <!-- Input bar -->
      <div class="chat-input-bar">
        <div class="chat-api-key">
          <label style="white-space:nowrap;">🔑 API Key:</label>
          <input type="password" id="api-key-input" placeholder="sk-ant-api03-... (or set ANTHROPIC_API_KEY env var on server)"
            value="${ASSISTANT_STATE.apiKey}"
            oninput="ASSISTANT_STATE.apiKey = this.value">
          <span class="has-tooltip" style="cursor:help;">
            ❓
            <div class="tooltip">Your Anthropic API key. It is sent only to your local server and never stored persistently. You can also set ANTHROPIC_API_KEY environment variable before starting the server.</div>
          </span>
        </div>
        <div class="chat-input-row">
          <textarea class="chat-input" id="chat-input-text"
            placeholder="Ask a question about your pipeline or results…"
            rows="2"
            onkeydown="handleChatKey(event)"></textarea>
          <button class="chat-send-btn" id="chat-send-btn" onclick="sendChatMessage()">
            Send ↑
          </button>
        </div>
      </div>
    </div>
  `;
}

function useSuggestion(btn) {
  const input = document.getElementById('chat-input-text');
  if (input) { input.value = btn.textContent; input.focus(); }
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
}

async function sendChatMessage() {
  const input  = document.getElementById('chat-input-text');
  const msgBox = document.getElementById('chat-messages');
  const btn    = document.getElementById('chat-send-btn');
  if (!input || !msgBox || ASSISTANT_STATE.loading) return;

  const text = input.value.trim();
  if (!text) return;

  // Append user message
  appendMessage(msgBox, 'user', text);
  input.value = '';
  ASSISTANT_STATE.messages.push({ role: 'user', content: text });

  // Show loading
  ASSISTANT_STATE.loading = true;
  btn.disabled = true;
  const loadingId = appendTyping(msgBox);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: ASSISTANT_STATE.messages,
        api_key: ASSISTANT_STATE.apiKey || document.getElementById('api-key-input')?.value,
      }),
    });

    const data = await res.json();

    removeTyping(msgBox, loadingId);

    if (!res.ok || data.error) {
      appendMessage(msgBox, 'assistant', `❌ Error: ${data.error || 'Unknown error occurred'}`, true);
    } else {
      const reply = data.content;
      ASSISTANT_STATE.messages.push({ role: 'assistant', content: reply });
      appendMessage(msgBox, 'assistant', formatMarkdown(reply));
    }
  } catch (err) {
    removeTyping(msgBox, loadingId);
    appendMessage(msgBox, 'assistant',
      '❌ Could not connect to the server. Make sure <code>server.py</code> is running on <code>http://localhost:5050</code>.', true);
  } finally {
    ASSISTANT_STATE.loading = false;
    btn.disabled = false;
    msgBox.scrollTop = msgBox.scrollHeight;
  }
}

function appendMessage(container, role, html, isError) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg--${role}`;
  div.innerHTML = `
    <div class="chat-msg__avatar">${role === 'user' ? '👤' : '🤖'}</div>
    <div class="chat-msg__bubble ${isError ? 'alert--error' : ''}">${html}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function appendTyping(container) {
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg--assistant';
  div.id = id;
  div.innerHTML = `
    <div class="chat-msg__avatar">🤖</div>
    <div class="chat-msg__bubble">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(container, id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/** Very simple markdown → HTML converter for assistant responses. */
function formatMarkdown(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^#{1,3}\s+(.+)$/gm, '<strong style="font-size:.9rem;color:var(--clr-cyan);">$1</strong>')
    .replace(/^[-*]\s+(.+)$/gm, '<li style="margin-left:16px;margin-bottom:4px;">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul style="margin:8px 0;">${m}</ul>`)
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>').replace(/$/, '</p>');
}
