const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'leader-training.html'), 'utf8');

test('考生連線卡只顯示即時在線或短暫不穩，不保留已交卷與逾時紀錄', () => {
  assert.match(html, /x\.state!=='finished'/);
  assert.match(html, /age<=30000/);
  assert.match(html, /目前連線/);
  assert.doesNotMatch(html, /灰燈＝未連線/);
});
