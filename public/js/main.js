// Sentra KI UNISBA - Interactive UI Engine
function csrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : '';
}

// Mobile Navigation Drawer Toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const closeBtn = document.getElementById('drawerClose');
  const backdrop = document.getElementById('mobileBackdrop');
  const drawer = document.getElementById('mobileDrawer');

  function openDrawer() {
    if (drawer && backdrop) {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      toggleBtn && toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeDrawer() {
    if (drawer && backdrop) {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn && toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Auto-collapse directory filter on mobile devices
  const dirFilters = document.getElementById('directoryFilters');
  if (dirFilters && window.matchMedia('(max-width: 900px)').matches) {
    dirFilters.open = false;
  }
});

// Learning Modules Accordion
function toggleModule(i) {
  const el = document.getElementById('module-' + i);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  el.classList.toggle('open');
  const btn = el.querySelector('.module-head-btn');
  if (btn) btn.setAttribute('aria-expanded', !isOpen);
}

// AI Assistant Chat Widget
async function sendAIQuestion() {
  const input = document.getElementById('aiInput');
  if (!input) return;
  const q = input.value.trim();
  if (!q) return;
  input.value = '';
  await askAI(q);
}

async function askAI(question) {
  const q = (question || '').trim();
  if (!q) return;
  const log = document.getElementById('aiLog');
  if (!log) return;

  // Append user bubble
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-msg user';
  userMsg.innerHTML = `
    <div class="msg-avatar-mini user">Anda</div>
    <div class="msg-bubble-wrap">
      <div class="msg-author">Anda</div>
      <div class="bubble"></div>
    </div>
  `;
  userMsg.querySelector('.bubble').textContent = q;
  log.appendChild(userMsg);
  log.scrollTop = log.scrollHeight;

  // Append typing indicator
  const loadingId = 'loading-' + Date.now();
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'ai-msg bot ai-loading';
  loadingMsg.id = loadingId;
  loadingMsg.innerHTML = `
    <div class="msg-avatar-mini">AI</div>
    <div class="msg-bubble-wrap">
      <div class="msg-author">Asisten AI Sentra KI</div>
      <div class="bubble">
        <span class="typing-dots">
          <span></span><span></span><span></span>
        </span>
      </div>
    </div>
  `;
  log.appendChild(loadingMsg);
  log.scrollTop = log.scrollHeight;

  try {
    const res = await fetch('/api/ai-tanya', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken()
      },
      body: JSON.stringify({ question: q })
    });
    const data = await res.json();
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.classList.remove('ai-loading');
      loadingEl.querySelector('.bubble').textContent = data.jawaban;
    }
  } catch (err) {
    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) {
      loadingEl.classList.remove('ai-loading');
      loadingEl.querySelector('.bubble').textContent = 'Maaf, terjadi kendala saat memproses pertanyaan ke server. Silakan coba kembali sesaat lagi.';
    }
  }
  log.scrollTop = log.scrollHeight;
}

// Online Consultation Messenger
async function sendConsultFromInput() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  await sendConsult(msg);
}

async function sendConsult(message) {
  const msg = (message || '').trim();
  if (!msg) return;
  const body = document.getElementById('chatBody');
  if (!body) return;

  const now = new Date();
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // Remove empty greeting if present
  const greeting = body.querySelector('.chat-system-greeting');
  if (greeting) greeting.remove();

  // Append user bubble
  const userRow = document.createElement('div');
  userRow.className = 'chat-bubble-row me';
  userRow.innerHTML = `
    <div class="bubble-content-wrap">
      <div class="chat-bubble"></div>
      <div class="chat-time">${time} · Terkirim</div>
    </div>
  `;
  userRow.querySelector('.chat-bubble').textContent = msg;
  body.appendChild(userRow);
  body.scrollTop = body.scrollHeight;

  try {
    const res = await fetch('/api/konsultasi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken()
      },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const botRow = document.createElement('div');
    botRow.className = 'chat-bubble-row them';
    botRow.innerHTML = `
      <div class="bubble-content-wrap">
        <div class="chat-bubble"></div>
        <div class="chat-time">${replyTime}</div>
      </div>
    `;
    botRow.querySelector('.chat-bubble').textContent = data.reply;
    body.appendChild(botRow);
    body.scrollTop = body.scrollHeight;
  } catch (err) {
    const botRow = document.createElement('div');
    botRow.className = 'chat-bubble-row them';
    botRow.innerHTML = `
      <div class="bubble-content-wrap">
        <div class="chat-bubble alert-text">Maaf, pesan Anda gagal terkirim karena kendala jaringan. Silakan segarkan halaman dan coba kembali.</div>
      </div>
    `;
    body.appendChild(botRow);
    body.scrollTop = body.scrollHeight;
  }
}
