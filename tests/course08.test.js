const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');

test('第八堂入口已開放並連到正式測驗頁', () => {
  const home = read('leader-training.html');
  assert.match(home, /目前開放 <strong>8 堂<\/strong>/);
  assert.match(home, /<a class="go" href="course08\.html">開始測驗<\/a>/);
});

test('第八堂題庫完整且使用 C08 寫入成績', () => {
  const html = read('course08.html');
  const match = html.match(/const Q=(\[[\s\S]*?\]);;?let cur=/);
  assert.ok(match, '找不到第八堂題庫');
  const bank = vm.runInNewContext(match[1]);

  assert.equal(bank.length, 25);
  assert.ok(bank.every(q => q.length === 4 && q[2].length === 4));
  assert.ok(bank.every(q => Number.isInteger(q[3]) && q[3] >= 0 && q[3] <= 3));
  assert.deepEqual(Array.from(bank, q => q[3]).reduce((n, answer) => {
    n[answer] += 1;
    return n;
  }, [0, 0, 0, 0]), [6, 7, 6, 6]);
  assert.match(html, /courseId:'C08'/);
  assert.match(html, /course:'第八堂｜基礎改善與數據管理'/);
  assert.match(html, /onclick="startQuiz\(\)">開始測驗<\/button>/);
});
