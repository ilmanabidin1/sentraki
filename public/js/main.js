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
  const background = [...document.querySelector('.app-shell').children].filter(el => el !== drawer && el !== backdrop);
  let returnFocus;

  function openDrawer() {
    if (drawer && backdrop) {
      returnFocus = document.activeElement;
      drawer.inert = false;
      background.forEach(el => { el.inert = true; });
      drawer.classList.add('open');
      backdrop.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
      toggleBtn && toggleBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      closeBtn?.focus();
    }
  }

  function closeDrawer() {
    if (drawer && backdrop) {
      const wasOpen = drawer.classList.contains('open');
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
      toggleBtn && toggleBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      drawer.inert = true;
      background.forEach(el => { el.inert = false; });
      if (wasOpen) returnFocus?.focus();
    }
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && drawer?.classList.contains('open')) {
      const controls = [...drawer.querySelectorAll('a[href],button:not([disabled])')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
      toggleBtn?.focus();
    }
  });
  window.matchMedia('(min-width: 1361px)').addEventListener('change', event => {
    if (event.matches) closeDrawer();
  });
  // Small, event-driven dropdown; no polling or scroll listeners.
  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownBtn = dropdown?.querySelector('.nav-dropdown-btn');
  dropdownBtn?.addEventListener('click', () => {
    const open = dropdown.classList.toggle('is-open');
    dropdownBtn.setAttribute('aria-expanded', String(open));
  });
  function closeDropdown() {
    dropdown?.classList.remove('is-open');
    dropdownBtn?.setAttribute('aria-expanded', 'false');
  }
  document.addEventListener('click', event => {
    if (dropdown && !dropdown.contains(event.target)) closeDropdown();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dropdown?.classList.contains('is-open')) {
      closeDropdown();
      dropdownBtn?.focus();
    }
  });

  // Auto-collapse directory filter on mobile devices
  const dirFilters = document.getElementById('directoryFilters');
  if (dirFilters && window.matchMedia('(max-width: 900px)').matches) {
    dirFilters.open = false;
  }
  document.getElementById('formErrors')?.focus();
  initHomeSearch();
  initPremiumMotion();
});

function initHomeSearch() {
  const input = document.getElementById('atlas-search-input');
  if (!input) return;
  const form = input.form;
  const shell = form.parentElement;
  const popup = document.getElementById('atlas-suggestions');
  const results = document.getElementById('atlas-search-results');
  const status = document.getElementById('atlas-search-status');
  const all = document.getElementById('atlas-search-all');
  const kinds = { Paten:'patent', 'Hak Cipta':'copyright', Merek:'trademark', 'Desain Industri':'design', 'KI Komunal':'communal' };
  let timer, request, revision = 0, active = -1, options = [];
  let cachedQuery = '', cachedItems;
  function select(index) {
    active = index;
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === index)));
    if (index < 0) input.removeAttribute('aria-activedescendant');
    else { input.setAttribute('aria-activedescendant', options[index].id); options[index].scrollIntoView({ block:'nearest' }); }
  }
  function clear() {
    results.replaceChildren(); options = []; select(-1);
  }
  function close() {
    clearTimeout(timer); request?.abort(); revision++;
    popup.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    select(-1);
  }
  function open(q, message) {
    all.href = `/direktori?${new URLSearchParams({ q })}`;
    all.textContent = `Lihat semua hasil untuk “${q}”`;
    status.textContent = message;
    popup.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }
  function render(q, items) {
    clear();
    for (const [index, item] of items.entries()) {
      const option = document.createElement('a');
      option.id = `atlas-search-option-${index}`;
      option.className = 'atlas-search-option';
      option.href = `/direktori/${item.id}`;
      option.role = 'option'; option.tabIndex = -1;
      option.setAttribute('aria-selected', 'false');
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'sk-icon'); icon.setAttribute('viewBox', '0 0 32 32'); icon.setAttribute('aria-hidden', 'true');
      const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      use.setAttribute('href', `/icons/sentra-ki.svg?v=1a3db9681d#${kinds[item.jenis] || 'collection'}`);
      icon.append(use);
      const copy = document.createElement('span'); copy.className = 'atlas-search-copy';
      const title = document.createElement('strong'); title.textContent = item.judul;
      const meta = document.createElement('span');
      meta.textContent = [item.jenis, item.inventor, item.tahun].filter(Boolean).join(' · ');
      copy.append(title, meta); option.append(icon, copy);
      option.addEventListener('pointerenter', () => select(index));
      results.append(option); options.push(option);
    }
    open(q, items.length ? `${items.length} saran tersedia. Gunakan tombol panah untuk memilih.` : 'Belum ada KI yang cocok. Coba kata atau nama inventor lain.');
  }
  async function load(q, ticket) {
    request = new AbortController();
    try {
      const response = await fetch(`/api/ki/suggestions?${new URLSearchParams({ q })}`, { signal:request.signal });
      if (!response.ok) throw new Error('Search unavailable');
      const data = await response.json();
      if (!Array.isArray(data.items) || data.items.some(item => !Number.isSafeInteger(item.id) || typeof item.judul !== 'string')) throw new Error('Invalid search results');
      if (ticket !== revision) return;
      cachedQuery = q; cachedItems = data.items;
      render(q, data.items);
    } catch (error) {
      if (error.name === 'AbortError' || ticket !== revision) return;
      clear(); open(q, 'Saran belum dapat dimuat. Tekan Enter atau buka semua hasil untuk melanjutkan.');
    }
  }
  function search() {
    clearTimeout(timer); request?.abort();
    const ticket = ++revision, q = input.value.trim().slice(0, 200);
    clear();
    if (q.length < 2 || input.matches(':disabled')) { close(); return; }
    if (q === cachedQuery && cachedItems) { render(q, cachedItems); return; }
    open(q, 'Mencari KI…');
    timer = setTimeout(() => load(q, ticket), 220);
  }
  input.addEventListener('input', event => { if (!event.isComposing) search(); });
  input.addEventListener('compositionstart', close);
  input.addEventListener('compositionend', search);
  input.addEventListener('focus', search);
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && !popup.hidden && options.length) {
      event.preventDefault();
      select(event.key === 'ArrowDown' ? (active + 1) % options.length : active <= 0 ? options.length - 1 : active - 1);
    }
    if (event.key === 'Enter' && !popup.hidden && active >= 0) {
      event.preventDefault(); options[active].click();
    }
  });
  form.addEventListener('submit', close);
  document.addEventListener('pointerdown', event => { if (!shell.contains(event.target)) close(); });
  shell.addEventListener('focusout', () => requestAnimationFrame(() => { if (!shell.contains(document.activeElement)) close(); }));
}

// Lembar inovasi: finite choreography, no autoplay or persistent animation loop.
function initPremiumMotion() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  function animate(element, frames, options = {}) {
    if (!element || reduced.matches || !element.animate || document.hidden) return;
    const animation = element.animate(frames, { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)', ...options });
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
  }
  function stopMotion() { running.forEach(animation => animation.cancel()); running.clear(); }
  reduced.addEventListener('change', event => { if (event.matches) stopMotion(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopMotion(); });

  const title = document.querySelector('.atlas-title');
  if (title) {
    title.querySelectorAll('span').forEach((line, index) => animate(line,
      [{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(16px)' }, { clipPath: 'inset(0)', transform: 'translateY(0)' }],
      { duration: 650, delay: index * 100 }));
    animate(document.querySelector('.atlas-search'), [{ opacity: .65, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { delay: 140, duration: 550 });
  }

  const controls = document.querySelector('.portfolio-controls');
  if (controls) {
    const tabs = [...controls.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    let selected = 0;
    function select(index, focus = false) {
      if (index === selected && !focus) return;
      selected = index;
      tabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; panels[i].hidden = i !== index; });
      if (focus) tabs[index].focus();
      panels[index].getAnimations?.().forEach(animation => animation.cancel());
      animate(panels[index], [{ opacity: .5, transform: 'translateX(14px)' }, { opacity: 1, transform: 'translateX(0)' }], { duration: 350 });
    }
    tabs.forEach((tab, i) => {
      panels[i].hidden = i !== 0;
      tab.addEventListener('click', () => select(i));
      tab.addEventListener('keydown', event => {
        const next = event.key === 'ArrowRight' ? (i + 1) % tabs.length : event.key === 'ArrowLeft' ? (i + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
        if (next !== null) { event.preventDefault(); select(next, true); }
      });
    });
    controls.hidden = false;
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (!reduced.matches) animate(entry.target, [{ opacity: .65, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450 });
      }
    }, { threshold: .12 });
    document.querySelectorAll('.premium-services .premium-section-heading, .journey-list, .premium-closing h2').forEach(element => observer.observe(element));
    window.addEventListener('pagehide', () => { observer.disconnect(); stopMotion(); }, { once: true });
  }
}

// Learning Modules Accordion
function toggleModule(i) {
  const el = document.getElementById('module-' + i);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  el.classList.toggle('open');
  const btn = el.querySelector('.module-head-btn');
  if (btn) btn.setAttribute('aria-expanded', !isOpen);
  const panel = el.querySelector('.module-collapsible-body');
  if (panel) panel.hidden = isOpen;
}

// AI Assistant Chat Widget
async function chatRequest(url, payload, onData) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken() },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Permintaan belum berhasil. Silakan coba lagi.');
    const answer = url === '/api/ai-tanya' ? data.jawaban : data.reply;
    if (typeof answer !== 'string' || !answer.trim()) throw new Error('Jawaban belum tersedia. Silakan coba lagi.');
    if (onData) onData(data);
    return answer;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('Server belum memberi konfirmasi. Periksa koneksi sebelum mencoba lagi.');
    if (error instanceof TypeError) throw new Error('Koneksi terputus. Pesan tetap tersimpan di layar; coba lagi setelah tersambung.');
    throw error;
  } finally { clearTimeout(timeout); }
}

function retryControl(container, error, retry) {
  container.textContent = error.message;
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'chat-retry'; button.textContent = 'Coba lagi';
  button.addEventListener('click', retry, { once: true });
  container.appendChild(button);
}

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
    <div class="msg-avatar-mini"><svg class="sk-icon" width="20" height="20" viewBox="0 0 32 32" aria-hidden="true"><use href="/icons/sentra-ki.svg?v=1a3db9681d#assistant"/></svg></div>
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

  async function deliver() {
    loadingMsg.classList.add('ai-loading');
    loadingMsg.querySelector('.bubble').textContent = 'Sedang menyiapkan jawaban…';
    try {
      let references = [];
      const bubble = loadingMsg.querySelector('.bubble');
      bubble.textContent = await chatRequest('/api/ai-tanya', { question: q }, data => { references = data.referensi || []; });
      const valid = Array.isArray(references) ? references.filter(r => r && typeof r.id === 'string' && /^[a-z0-9-]+$/.test(r.id) && typeof r.title === 'string').slice(0, 3) : [];
      if (valid.length) {
        const sources = document.createElement('div');
        sources.className = 'ai-module-references';
        const label = document.createElement('strong'); label.textContent = 'Modul rujukan'; sources.appendChild(label);
        valid.forEach(ref => { const link = document.createElement('a'); link.href = `/pelajari-ki/${ref.id}`; link.textContent = ref.title; sources.appendChild(link); });
        bubble.appendChild(sources);
      }
    } catch (err) {
      retryControl(loadingMsg.querySelector('.bubble'), err, deliver);
    } finally {
      loadingMsg.classList.remove('ai-loading');
      log.scrollTop = log.scrollHeight;
    }
  }
  await deliver();
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
      <div class="chat-time" role="status">${time} · Mengirim…</div>
    </div>
  `;
  userRow.querySelector('.chat-bubble').textContent = msg;
  body.appendChild(userRow);
  body.scrollTop = body.scrollHeight;

  async function deliver() {
    const status = userRow.querySelector('.chat-time');
    status.textContent = `${time} · Mengirim…`;
    try {
    const reply = await chatRequest('/api/konsultasi', { message: msg });
    status.textContent = `${time} · Terkirim`;
    const replyTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const botRow = document.createElement('div');
    botRow.className = 'chat-bubble-row them';
    botRow.innerHTML = `
      <div class="bubble-content-wrap">
        <div class="chat-bubble"></div>
        <div class="chat-time">${replyTime}</div>
      </div>
    `;
    botRow.querySelector('.chat-bubble').textContent = reply;
    body.appendChild(botRow);
    body.scrollTop = body.scrollHeight;
  } catch (err) {
    retryControl(status, err, deliver);
    body.scrollTop = body.scrollHeight;
  }
  }
  await deliver();
}
