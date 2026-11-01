const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname,'..','filipino-leader-training.html'),'utf8');

test('training home has one first-time registration QR entry', () => {
  assert.equal((html.match(/FIRST-TIME PRACTICE REGISTRATION/g)||[]).length, 1);
  assert.match(html, /filipino-practice-register\.html\?openExternalBrowser=1/);
  assert.match(html, /<canvas[^>]*id="registrationQr"/);
  assert.match(html, /REGISTRATION_QR_MATRIX/);
});

test('registration entry explains one-time use in English and Chinese', () => {
  assert.match(html, /Scan once before your first class/i);
  assert.match(html, /第一次上課前/);
});

test('registration entry tells LINE users to use external browser with fallback', () => {
  assert.match(html, /LINE/i);
  assert.match(html, /Chrome|Safari/);
  assert.match(html, /openExternalBrowser=1/);
});
