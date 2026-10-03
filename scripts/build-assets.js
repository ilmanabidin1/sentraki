const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const CleanCSS = require('clean-css');
const root = path.join(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'public/css/style.css'), 'utf8');
const result = new CleanCSS({ level: 1 }).minify(css);
if (result.errors.length) throw new Error(result.errors.join('\n'));
fs.writeFileSync(path.join(root, 'public/css/style.min.css'), result.styles);
for (const [asset, template] of [
  ['css/style.min.css', 'head.ejs'], ['js/main.js', 'footer.ejs']
]) {
  const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'public', asset))).digest('hex').slice(0, 10);
  const file = path.join(root, 'views/partials', template);
  const source = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, source.replace(new RegExp(`/${asset.replaceAll('.', '\\.') }\\?v=[a-f0-9]+`, 'g'), `/${asset}?v=${hash}`));
}
console.log(`CSS: ${Buffer.byteLength(css)} → ${Buffer.byteLength(result.styles)} bytes (before HTTP compression)`);
