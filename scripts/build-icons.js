const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Hand-drawn source stays in sentra-ki.svg; exports and the specimen derive from it.
module.exports = function buildIcons(root) {
  const dir = path.join(root, 'public/icons');
  const sprite = fs.readFileSync(path.join(dir, 'sentra-ki.svg'), 'utf8');
  const hash = crypto.createHash('sha256').update(sprite).digest('hex').slice(0, 10);
  const symbols = [...sprite.matchAll(/<symbol id="([a-z-]+)" viewBox="0 0 32 32">([\s\S]*?)<\/symbol>/g)];
  const attrs = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  const entries = symbols.map(([, id, body]) => [`p2ki-icons/${id}.svg`, `<svg ${attrs}>${body}</svg>\n`]);
  entries.push(['p2ki-icons/sentra-ki-sprite.svg', sprite], ['p2ki-icons/README.md', fs.readFileSync(path.join(dir, 'README.md'), 'utf8')]);
  fs.writeFileSync(path.join(dir, 'p2ki-icon-pack.zip'), zip(entries));

  const groups = {
    'Kekayaan intelektual': ['patent', 'copyright', 'trademark', 'design', 'communal', 'shield', 'certificate', 'award'],
    'Layanan P2KI': ['book', 'assistant', 'collaborate', 'industry', 'register', 'consult', 'portfolio', 'royalty'],
    'Direktori & status': ['search', 'filter', 'collection', 'analytics', 'clock', 'calendar', 'check', 'rejected', 'search-empty'],
    'Identitas & informasi': ['home', 'user', 'people', 'people-verified', 'document', 'mail', 'phone', 'info', 'help', 'alert', 'lock', 'share'],
    'Navigasi & tindakan': ['menu', 'close', 'plus', 'edit', 'download', 'send', 'external', 'logout', 'reset', 'left', 'right', 'chevron-left', 'chevron-right', 'up', 'down']
  };
  const labels = {
    patent:'Paten', copyright:'Hak cipta', trademark:'Merek', design:'Desain industri', communal:'KI komunal', shield:'Perlindungan', certificate:'Sertifikat', award:'Penghargaan',
    book:'Akademi KI', assistant:'Asisten KI', collaborate:'Kemitraan', industry:'Industri', register:'Pengajuan KI', consult:'Konsultasi', portfolio:'Portofolio', royalty:'Royalti',
    search:'Pencarian', filter:'Filter', collection:'Direktori', analytics:'Analitik', clock:'Dalam proses', calendar:'Tahun', check:'Selesai', rejected:'Ditolak', 'search-empty':'Tanpa hasil',
    home:'Beranda', user:'Inventor', people:'Tim', 'people-verified':'Tim terverifikasi', document:'Dokumen', mail:'Email', phone:'Telepon', info:'Informasi', help:'Bantuan', alert:'Perhatian', lock:'Akses admin', share:'Bagikan',
    menu:'Menu', close:'Tutup', plus:'Tambah', edit:'Edit', download:'Unduh', send:'Kirim', external:'Buka tautan', logout:'Keluar', reset:'Reset', left:'Sebelumnya', right:'Berikutnya', 'chevron-left':'Geser kiri', 'chevron-right':'Geser kanan', up:'Ke atas', down:'Perluas'
  };
  const icon = (id, size) => `<svg width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true"><use href="/icons/sentra-ki.svg?v=${hash}#${id}"/></svg>`;
  const sections = Object.entries(groups).map(([name, ids]) => `<section><h2>${name}</h2><ul>${ids.map(id => `<li><div class="specimen">${icon(id, 40)}</div><span>${labels[id]}</span><div class="sizes">${icon(id, 16)}${icon(id, 24)}</div></li>`).join('')}</ul></section>`).join('');
  fs.writeFileSync(path.join(dir, 'preview.html'), `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>P2KI UNISBA — Icon Pack</title>
<style>
@font-face{font-family:Manrope;src:url('/fonts/manrope-latin.woff2') format('woff2');font-weight:400 800;font-display:swap}
*{box-sizing:border-box}body{margin:0;font:15px/1.6 Manrope,system-ui,sans-serif;color:#101e30;background:#f6f7f9}header{background:#080f1a;color:#fff;padding:48px max(24px,calc((100vw - 1200px)/2))}header h1{font-size:clamp(28px,4vw,48px);line-height:1.15;letter-spacing:-.03em;margin:0 0 20px}header p{max-width:65ch;color:#d4dce7;margin:0 0 24px}header a{display:inline-flex;align-items:center;gap:12px;min-height:44px;background:#e7d6a8;color:#080f1a;padding:10px 18px;border-radius:8px;font-weight:700;text-decoration:none}a:focus-visible{outline:3px solid #c39642;outline-offset:4px}main{max-width:1248px;margin:auto;padding:16px 24px 56px}section{padding-top:32px}h2{font-size:21px;letter-spacing:-.02em;margin:0 0 20px}ul{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));list-style:none;padding:0;margin:0;border-top:1px solid #d8dee7}li{display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 8px;border-bottom:1px solid #d8dee7;min-width:0;text-align:center}li span{font-size:12px;font-weight:650;min-height:38px;display:flex;align-items:center}.specimen{color:#101e30}.sizes{color:#5a6b80;display:flex;align-items:center;gap:14px}svg{fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}footer{padding:24px;color:#d4dce7;background:#080f1a;text-align:center}::selection{background:#e7d6a8;color:#080f1a}@media(max-width:900px){ul{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:480px){ul{grid-template-columns:repeat(3,minmax(0,1fr))}li{padding:20px 4px}.sizes{gap:10px}}
</style></head><body><header><h1>Icon Pack P2KI UNISBA</h1><p>${symbols.length} ikon SVG khusus Sentra KI. Garis tegas, sudut lembut, dan bentuk yang mudah dikenali untuk layanan kekayaan intelektual. Setiap ikon ditampilkan pada ukuran 40, 16, dan 24 piksel.</p><a href="/icons/p2ki-icon-pack.zip" download>Unduh semua ikon ${icon('download', 20)}</a></header><main>${sections}</main><footer>Idea · Protect · Impact — P2KI UNISBA</footer></body></html>\n`);

  // Update sprite URLs before main.js gets its own content hash.
  for (const base of ['views', 'public/js']) {
    for (const relative of fs.readdirSync(path.join(root, base), { recursive:true })) {
      if (!/\.(ejs|js)$/.test(relative)) continue;
      const file = path.join(root, base, relative);
      const before = fs.readFileSync(file, 'utf8');
      const after = before.replace(/\/icons\/sentra-ki\.svg(?:\?v=[a-f0-9]+)?#/g, `/icons/sentra-ki.svg?v=${hash}#`);
      if (before !== after) fs.writeFileSync(file, after);
    }
  }
  console.log(`P2KI icons: ${symbols.length} symbols, ${Buffer.byteLength(sprite)} bytes, SVG exports packaged`);
};

// Small deterministic ZIP writer: stored UTF-8 files, fixed date, no system tools.
function zip(entries) {
  const local = [], central = [];
  let offset = 0;
  for (const [name, source] of entries) {
    const filename = Buffer.from(name), data = Buffer.from(source);
    let crc = 0xffffffff;
    for (const byte of data) { crc ^= byte; for (let bit=0; bit<8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
    crc = (crc ^ 0xffffffff) >>> 0;
    const head = Buffer.alloc(30);
    head.writeUInt32LE(0x04034b50); head.writeUInt16LE(20,4); head.writeUInt16LE(0x0800,6); head.writeUInt16LE(33,12);
    head.writeUInt32LE(crc,14); head.writeUInt32LE(data.length,18); head.writeUInt32LE(data.length,22); head.writeUInt16LE(filename.length,26);
    local.push(head, filename, data);
    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50); record.writeUInt16LE(20,4); record.writeUInt16LE(20,6); record.writeUInt16LE(0x0800,8); record.writeUInt16LE(33,14);
    record.writeUInt32LE(crc,16); record.writeUInt32LE(data.length,20); record.writeUInt32LE(data.length,24); record.writeUInt16LE(filename.length,28); record.writeUInt32LE(offset,42);
    central.push(record, filename); offset += head.length + filename.length + data.length;
  }
  const directory = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length,8); end.writeUInt16LE(entries.length,10); end.writeUInt32LE(directory.length,12); end.writeUInt32LE(offset,16);
  return Buffer.concat([...local, directory, end]);
}
