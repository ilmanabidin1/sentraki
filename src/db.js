const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, '..', 'data', 'p2ki.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
db.exec(schema);

// Menerjemahkan query bergaya `pg` ($1, ANY($n), ILIKE, ::int) ke sintaks SQLite,
// supaya kode route yang sudah ada (ditulis untuk driver `pg`) tetap jalan tanpa diubah.
function translate(sql, params) {
  let text = sql.replace(/::\w+/g, '').replace(/ILIKE/gi, 'LIKE');
  // "col = ANY($n)" -> "col IN ($n)", reusing the existing parens so we don't
  // double-wrap when the $n placeholder below expands into a comma list.
  text = text.replace(/=\s*ANY\s*\(\$(\d+)\)/gi, (_, n) => `IN ($${n})`);
  const flatParams = [];
  text = text.replace(/\$(\d+)/g, (_, n) => {
    const value = params[parseInt(n, 10) - 1];
    if (Array.isArray(value)) {
      flatParams.push(...value.map(normalize));
      return value.map(() => '?').join(',') || 'NULL';
    }
    flatParams.push(normalize(value));
    return '?';
  });
  return { text, flatParams };
}

function normalize(value) {
  if (value === undefined) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value;
}

const SELECT_RE = /^\s*(SELECT|PRAGMA)\b/i;

function query(sql, params = []) {
  const { text, flatParams } = translate(sql, params);
  if (process.env.DEBUG_SQL) console.log('SQL:', text, flatParams);
  const stmt = db.prepare(text);
  if (SELECT_RE.test(text)) {
    const rows = stmt.all(...flatParams);
    return Promise.resolve({ rows, rowCount: rows.length });
  }
  const info = stmt.run(...flatParams);
  return Promise.resolve({ rows: [], rowCount: info.changes, insertId: info.lastInsertRowid });
}

module.exports = { query, raw: db };
