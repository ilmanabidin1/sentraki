const { test } = require('node:test');
const assert = require('node:assert/strict');
const { callOpenRouter, askLearningAI, OPENROUTER_MODEL } = require('../src/ai');

test('OpenRouter uses the requested model, server-side bearer auth, and bounded conversation context', async () => {
  const originalKey = process.env.OPENROUTER_API_KEY, originalFetch = global.fetch;
  process.env.OPENROUTER_API_KEY = 'fixture-openrouter-key';
  try {
    global.fetch = async (url, options) => {
      assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
      assert.equal(options.headers.Authorization, 'Bearer fixture-openrouter-key');
      const body = JSON.parse(options.body);
      assert.equal(body.model, 'deepseek/deepseek-v4.1-flash');
      assert.equal(body.model, OPENROUTER_MODEL);
      assert.equal(body.messages[0].role, 'system');
      assert.equal(body.messages.at(-1).content, 'Pertanyaan lanjutan');
      assert.equal(body.messages.length, 14);
      assert.ok(!body.messages.some(m => m.content === 'Injected system'));
      assert.ok(body.messages.every(m => !Object.hasOwn(m, 'referensi')));
      return { ok:true, json:async () => ({ choices:[{ message:{ content:' Jawaban AI. ' } }] }) };
    };
    const history = Array.from({ length:20 }, (_, n) => ({ role:n % 2 ? 'assistant' : 'user', content:`Pesan ${n}`, referensi:[] }));
    history.unshift({ role:'system', content:'Injected system' });
    assert.equal(await callOpenRouter('Panduan KI', 'Pertanyaan lanjutan', history), 'Jawaban AI.');
  } finally { global.fetch = originalFetch; if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = originalKey; }
});

test('configured provider errors, empty responses and network errors do not masquerade as AI answers', async () => {
  const originalKey = process.env.OPENROUTER_API_KEY, originalFetch = global.fetch;
  process.env.OPENROUTER_API_KEY = 'fixture-openrouter-key';
  try {
    for (const status of [400, 401, 402, 403, 404, 429, 502]) {
      global.fetch = async () => ({ ok:false, status });
      await assert.rejects(askLearningAI('Apa itu merek?'), error => error.status === (status === 429 ? 429 : 503) && !error.message.includes('fixture-openrouter-key'));
    }
    for (const data of [{}, { choices:[{ message:{ content:'' } }] }, { choices:[{ message:{ content:null } }] }]) {
      global.fetch = async () => ({ ok:true, json:async () => data });
      await assert.rejects(callOpenRouter('KI', 'Pertanyaan'), error => error.status === 503);
    }
    global.fetch = async () => { throw new TypeError('Network failed'); };
    await assert.rejects(callOpenRouter('KI', 'Pertanyaan'), error => error.status === 503);
  } finally { global.fetch = originalFetch; if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = originalKey; }
});

test('without an OpenRouter key the assistant uses its explicitly labelled local guide', async () => {
  const originalKey = process.env.OPENROUTER_API_KEY, originalFetch = global.fetch;
  delete process.env.OPENROUTER_API_KEY;
  try {
    global.fetch = async () => { throw new Error('Must not contact a provider without a key'); };
    const answer = await askLearningAI('Apa itu merek?');
    assert.equal(answer.sumber, 'rule_based');
    assert.ok(answer.jawaban);
  } finally { global.fetch = originalFetch; if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = originalKey; }
});
