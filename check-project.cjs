'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { matchingTheme, themeZip } = require('./theme-export.js');

const exists = file => fs.existsSync(path.join(__dirname, file));
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');
const manifest = JSON.parse(read('manifest.json'));
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.name, 'GlassyTab');
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
assert.deepEqual(manifest.host_permissions, ['https://suggestqueries.google.com/*']);

for (const htmlFile of [manifest.chrome_url_overrides.newtab, manifest.options_ui.page]) {
  assert.ok(exists(htmlFile), 'Missing manifest page: ' + htmlFile);
  const html = read(htmlFile);
  for (const [, relativeFile] of html.matchAll(/\b(?:src|href)="([^"#?]+)"/g)) {
    if (/^(?:https?:|data:|\/\/)/i.test(relativeFile)) continue;
    assert.ok(exists(relativeFile), htmlFile + ' references missing file: ' + relativeFile);
  }
}
assert.ok(exists('wallpaper.png'), 'Default wallpaper missing');
for (const screenshot of [
  '01-new-tab.png',
  '02-appearance-settings.png',
  '03-search-suggestions.png',
  '04-wallpaper-selection.png',
  '05-custom-theme.png',
]) {
  const file = 'screenshots/' + screenshot;
  assert.ok(exists(file), 'Missing screenshot: ' + file);
  assert.ok(read('README.md').includes('](' + file + ')'), 'README does not link ' + file);
}

const palette = { base: [20, 20, 24], accent: [220, 30, 80] };
const theme = matchingTheme(palette);
assert.equal(theme.manifest_version, 3);
assert.ok(theme.theme && theme.theme.colors);
for (const rgb of Object.values(theme.theme.colors)) {
  assert.ok(Array.isArray(rgb) && rgb.length === 3, 'Theme colors must have RGB triplets');
  assert.ok(rgb.every(v => Number.isInteger(v) && v >= 0 && v <= 255), 'Invalid theme RGB value');
}

const zip = Buffer.from(themeZip(theme));
const u16 = offset => zip.readUInt16LE(offset);
const u32 = offset => zip.readUInt32LE(offset);
assert.equal(u32(0), 0x04034b50, 'Missing ZIP local header');
assert.equal(u16(8), 0, 'Theme ZIP should use stored (uncompressed) entries');
const nameLength = u16(26);
const size = u32(18);
const filename = zip.subarray(30, 30 + nameLength).toString('utf8');
assert.equal(filename, 'Wallpaper-Colors/manifest.json');
const payload = zip.subarray(30 + nameLength, 30 + nameLength + size);
assert.deepEqual(JSON.parse(payload.toString('utf8')), theme);
let crc = 0xffffffff;
for (const byte of payload) {
  crc ^= byte;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
}
assert.equal((crc ^ 0xffffffff) >>> 0, u32(14), 'Theme ZIP CRC32 mismatch');
const eocd = zip.length - 22;
assert.equal(u32(eocd), 0x06054b50, 'Missing ZIP end-of-directory record');
const central = u32(eocd + 16);
assert.equal(u32(central), 0x02014b50, 'Missing ZIP central directory');
assert.equal(u32(central + 16), u32(14), 'Central/local CRC32 mismatch');
assert.equal(u32(central + 20), size, 'Central/local uncompressed size mismatch');
assert.equal(u16(eocd + 10), 1, 'Expected one ZIP entry');

const brightness = rgb => rgb.map(v => {
  const s = v / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
for (let r = 0; r <= 255; r += 51) {
  for (let g = 0; g <= 255; g += 51) {
    for (let b = 0; b <= 255; b += 51) {
      const generated = matchingTheme({ base: [0, 0, 0], accent: [r, g, b] });
      for (const key of ['frame', 'toolbar', 'omnibox_background']) {
        const contrast = 1.05 / (brightness(generated.theme.colors[key]) + 0.05);
        assert.ok(contrast >= 4.5, 'Low theme text contrast: ' + key);
      }
    }
  }
}
console.log('PASS: manifest, referenced files, screenshots, generated theme ZIP, CRC32 and color contrast.');
