function csrfToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.content : '';
}

function toggleModule(i){
  const el = document.getElementById('module-' + i);
  if (el) el.classList.toggle('open');
}

async function sendAIQuestion(){
  const input = document.getElementById('aiInput');
  const q = input.value.trim();
  if(!q) return;
  input.value = '';
  await askAI(q);
}

async function askAI(question){
  const q = (question || '').trim();
  if(!q) return;
  const log = document.getElementById('aiLog');
  log.innerHTML += `<div class="ai-msg user"><div class="who">Anda</div><div class="bubble"></div></div>`;
  log.lastElementChild.querySelector('.bubble').textContent = q;
  log.scrollTop = log.scrollHeight;

  const loadingId = 'loading-' + Date.now();
  log.innerHTML += `<div class="ai-msg bot ai-loading" id="${loadingId}"><div class="who">AI P2KI</div><div class="bubble">Sedang berpikir...</div></div>`;
  log.scrollTop = log.scrollHeight;

  try{
    const res = await fetch('/api/ai-tanya', {
      method: 'POST',
      headers: {'Content-Type':'application/json','x-csrf-token': csrfToken()},
      body: JSON.stringify({ question: q })
    });
    const data = await res.json();
    const loadingEl = document.getElementById(loadingId);
    loadingEl.classList.remove('ai-loading');
    loadingEl.querySelector('.bubble').textContent = data.jawaban;
  }catch(err){
    const loadingEl = document.getElementById(loadingId);
    loadingEl.classList.remove('ai-loading');
    loadingEl.querySelector('.bubble').textContent = 'Maaf, terjadi kendala saat menghubungi asisten AI. Silakan coba lagi.';
  }
  log.scrollTop = log.scrollHeight;
}

async function sendConsultFromInput(){
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if(!msg) return;
  input.value = '';
  await sendConsult(msg);
}

async function sendConsult(message){
  const msg = (message || '').trim();
  if(!msg) return;
  const body = document.getElementById('chatBody');
  const now = new Date();
  const time = now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});

  body.innerHTML += `<div class="chat-bubble-row me"><div><div class="chat-bubble"></div><div class="chat-time">${time}</div></div></div>`;
  body.lastElementChild.querySelector('.chat-bubble').textContent = msg;
  body.scrollTop = body.scrollHeight;

  try{
    const res = await fetch('/api/konsultasi', {
      method: 'POST',
      headers: {'Content-Type':'application/json','x-csrf-token': csrfToken()},
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    const replyTime = new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
    body.innerHTML += `<div class="chat-bubble-row them"><div><div class="chat-bubble"></div><div class="chat-time">${replyTime}</div></div></div>`;
    body.lastElementChild.querySelector('.chat-bubble').textContent = data.reply;
    body.scrollTop = body.scrollHeight;
  }catch(err){
    body.innerHTML += `<div class="chat-bubble-row them"><div><div class="chat-bubble">Maaf, pesan gagal terkirim. Silakan coba lagi.</div></div></div>`;
    body.scrollTop = body.scrollHeight;
  }
}

// Keep the overview reachable on smaller screens; filters remain available in one tap.
const directoryFilters = document.getElementById('directoryFilters');
if (directoryFilters && window.matchMedia('(max-width: 900px)').matches) {
  directoryFilters.open = false;
}
