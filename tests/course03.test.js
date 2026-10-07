const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');

function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}

function questionBank(html) {
  const match = html.match(/const Q=(\[[\s\S]*?\]);window\.QUESTION_BANK=Q/);
  assert.ok(match, '找不到可供統計頁讀取的第三堂題庫');
  return vm.runInNewContext(match[1]);
}

test('第三堂正式測驗包含已確認的 25 題與 C03 成績識別', () => {
  const html = read('course03.html');
  const questions = questionBank(html);

  assert.equal(questions.length, 25);
  assert.ok(questions.every(q => q.length === 4 && q[2].length === 4));
  assert.match(html, /第三堂｜課後測驗/);
  assert.doesNotMatch(html, /OWNER UAT|測試版|候選/);
  assert.match(html, /courseId:'C03'/);
  assert.match(html, /course:'第三堂｜品質意識與自主檢查'/);
  assert.deepEqual(Array.from(questions.map(q => q[3])), [0,2,1,0,0,3,1,0,0,3,2,3,1,0,1,3,2,1,1,3,3,2,3,2,2]);
});

test('培訓首頁正式開放第三堂並顯示目前開放 3 堂', () => {
  const html = read('leader-training.html');
  assert.match(html, /目前開放 <strong>3 堂<\/strong>/);
  assert.match(html, /<a class="go" href="course03\.html">開始測驗<\/a>/);
});

test('統計頁依 C03 載入第三堂題庫', () => {
  const html = read('stats.html');
  assert.match(html, /C03.*course03\.html/);
});
