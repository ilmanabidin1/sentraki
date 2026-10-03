const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ejs = require('ejs');
const root = path.join(__dirname, '..');

test('all template icons reference existing Sentra KI symbols', () => {
  const sprite = fs.readFileSync(path.join(root, 'public/icons/sentra-ki.svg'), 'utf8');
  const ids = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'symbol IDs must be unique');
  for (const file of fs.readdirSync(path.join(root, 'views'), { recursive: true }).filter(f => f.endsWith('.ejs'))) {
    const template = fs.readFileSync(path.join(root, 'views', file), 'utf8');
    ejs.compile(template, { filename: path.join(root, 'views', file) });
    for (const match of template.matchAll(/sentra-ki\.svg(?:\?v=[a-z0-9]+)?#([a-z-]+)/g)) {
      assert.ok(ids.includes(match[1]), `${file} references missing symbol ${match[1]}`);
    }
    assert.doesNotMatch(template, /[\u{1F300}-\u{1FAFF}]/u, `${file} contains an emoji`);
  }
  for (const name of ['patent', 'copyright', 'trademark', 'design', 'communal', 'assistant']) {
    assert.ok(ids.includes(name));
  }
});
