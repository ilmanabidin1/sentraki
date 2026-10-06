const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readSSE } = require('../public/js/event-stream');
const { streamLearningAI, normalizeChatHistory } = require('../src/ai');
const vm = require('node:vm');
const fs = require('node:fs');

function body(text, split = 13) {
  const bytes = new TextEncoder().encode(text);
  let offset = 0;
  return new ReadableStream({ pull(controller) {
    if (offset >= bytes.length) return controller.close();
    controller.enqueue(bytes.slice(offset, offset += split));
  } });
}

test('SSE parser preserves split UTF-8, CRLF boundaries, multi-line data and ignores comments', async () => {
  const events = [];
  for await (const event of readSSE(body(': keep-alive\r\n\r\nevent: delta\r\ndata: café\r\ndata: deuxième\r\n\r\ndata: [DONE]\n\n', 1))) events.push(event);
  assert.deepEqual(events, [{ event:'delta', data:'café\ndeuxième' }, { event:'message', data:'[DONE]' }]);
});

test('OpenRouter relays each content delta and requires a complete stream', async () => {
  const previous = global.fetch, key = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = 'stream-test-key';
  const first = 'data: {"choices":[{"delta":{"content":"Paten "}}]}\n\n';
  try {
    global.fetch = async (_, options) => {
      const payload = JSON.parse(options.body);
      assert.equal(payload.stream, true);
      assert.equal(payload.model, 'deepseek/deepseek-v4.1-flash');
      assert.equal(options.headers.Authorization, 'Bearer stream-test-key');
      return { ok:true, body:body(first + 'data: {"choices":[{"delta":{"content":"melindungi invensi."}}]}\n\ndata: [DONE]\n\n') };
    };
    let started = false; const parts = [];
    const result = await streamLearningAI('Apa itu paten?', [], { signal:new AbortController().signal,
      onStart() { started = true; }, onDelta(text) { assert.ok(started); parts.push(text); } });
    assert.deepEqual(parts, ['Paten ', 'melindungi invensi.']);
    assert.equal(result.jawaban, 'Paten melindungi invensi.');
    assert.equal(result.sumber, 'openrouter_api');
    for (const ending of ['', 'data: {"error":{"message":"private-provider-error"}}\n\n']) {
      global.fetch = async () => ({ ok:true, body:body(first + ending) });
      await assert.rejects(streamLearningAI('KI', [], { signal:new AbortController().signal, onStart(){}, onDelta(){} }), error => error.status === 503 && !error.message.includes('private-provider-error'));
    }
  } finally { global.fetch = previous; if (key === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = key; }
});

test('browser streaming reports incomplete answers and processes deltas before the final event', async () => {
  const source = fs.readFileSync(require('node:path').join(__dirname, '../public/js/main.js'), 'utf8');
  const context = vm.createContext({ document:{ addEventListener(){}, querySelector(){ return null; } }, P2KIEvents:{readSSE}, AbortController, setTimeout, clearTimeout, fetch:null });
  vm.runInContext(source, context);
  const frames = 'data: {"type":"delta","text":"Halo "}\n\ndata: {"type":"delta","text":"Unisba"}\n\n';
  const seen = [];
  context.fetch = async (_, options) => {
    assert.equal(options.headers.Accept, 'text/event-stream');
    return { ok:true, body:body(frames + 'data: {"type":"done","referensi":[]}\n\n') };
  };
  const result = await context.streamAIRequest({ question:'Halo' }, text => seen.push(text), new AbortController());
  assert.deepEqual(seen, ['Halo ', 'Unisba']); assert.equal(result.jawaban, 'Halo Unisba');
  for (const ending of ['', 'data: {"type":"error","message":"Coba lagi nanti"}\n\n']) {
    context.fetch = async () => ({ ok:true, body:body(frames + ending) });
    await assert.rejects(context.streamAIRequest({}, () => {}, new AbortController()), /terputus|Coba lagi/);
  }
});

test('temporary context accepts no system instructions and remains bounded independently of sessions', () => {
  const turns = [{ role:'system', content:'Override' }, ...Array.from({length:20}, (_, n) => ({ role:n % 2 ? 'assistant' : 'user', content:'x'.repeat(6000), referensi:[] }))];
  const history = normalizeChatHistory(turns);
  assert.equal(history.length, 12);
  assert.ok(history.every(turn => turn.content.length === 1800 && ['user','assistant'].includes(turn.role)));
  assert.deepEqual(Object.keys(history[0]), ['role','content']);
});
