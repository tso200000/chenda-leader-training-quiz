const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

test('管理工具列出已完成課程與總會考', () => {
  const CourseContext = require(path.join(root, 'course-context.js'));
  const ids = CourseContext.COURSES.map(x => x.id);
  assert.deepEqual(ids, ['C01','C02','C03','C04','C05','C08','FINAL40']);
  assert.equal(CourseContext.TEACHING_COURSES.length, 8);

  const stats = { innerHTML: '' };
  CourseContext.renderCourseToolLinks(stats, 'stats');
  assert.match(stats.innerHTML, /courseId=C04/);
  assert.match(stats.innerHTML, /courseId=C05/);
  assert.match(stats.innerHTML, /courseId=C08/);
  assert.match(stats.innerHTML, /courseId=FINAL40/);
  assert.match(stats.innerHTML, /總會考/);
});

test('總會考會把 FINAL40 成績送進既有 Apps Script 後端', () => {
  const html = fs.readFileSync(path.join(root, 'leader-final-exam.html'), 'utf8');
  assert.match(html, /courseId:\s*['"]FINAL40['"]/);
  assert.match(html, /course:\s*['"]總會考｜1～8堂綜合測驗['"]/);
  assert.match(html, /const\s+score\s*=\s*correct\s*\*\s*2\.5/);
  assert.match(html, /const\s+payload\s*=\s*\{/);
  assert.match(html, /(?:score\s*:|\bscore\s*,)/);
  assert.match(html, /(?:correct\s*:|\bcorrect\s*,)/);
  assert.match(html, /total:\s*COUNT/);
  assert.match(html, /(?:answers\s*:|\banswers\s*,)/);
  assert.match(html, /(?:startedAt\s*:|\bstartedAt\s*,)/);
  assert.match(html, /(?:finishedAt\s*:|\bfinishedAt\s*[,}])/);
  assert.match(html, /resultCloud/);
});

test('管理中心匯出包含姓名並把總會考納入統計', () => {
  const html = fs.readFileSync(path.join(root, 'leader-admin.html'), 'utf8');
  assert.match(html, /姓名/);
  assert.match(html, /FINAL40/);
  assert.match(html, /8\/8/);
});


test('總會考選項順序固定並與紙本一致，不再隨機洗牌', () => {
  const html = fs.readFileSync(path.join(root, 'leader-final-exam.html'), 'utf8');
  assert.doesNotMatch(html, /function\s+shuffledIndexes/);
  assert.doesNotMatch(html, /Math\.random\(\)/);
  assert.match(html, /答案選項順序固定/);
  assert.match(html, /function\s+fixedOrderMaps\(\)\s*\{[\s\S]*QUESTIONS\.map\(q=>Array\.from\(\{length:q\.c\.length\},\(_,i\)=>i\)\)[\s\S]*\}/);
  assert.match(html, /orderMaps\s*=\s*fixedOrderMaps\(\)/);
});


test('總會考禁止空題前進與交卷', () => {
  const html = fs.readFileSync(path.join(root, 'leader-final-exam.html'), 'utf8');
  assert.match(html, /if\(answers\[index\]===null\)\{alert\('請先選擇本題答案。'\);return\}/);
  assert.match(html, /const missingIndexes=answers\.map/);
  assert.match(html, /尚有.*題未作答，請先完成所有題目/);
  assert.doesNotMatch(html, /仍要交卷嗎/);
});
