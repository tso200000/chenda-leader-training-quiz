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
  assert.match(html, /score:/);
  assert.match(html, /correct:/);
  assert.match(html, /total:\s*COUNT/);
  assert.match(html, /answers:/);
  assert.match(html, /startedAt:/);
  assert.match(html, /finishedAt:/);
  assert.match(html, /resultCloud/);
});

test('管理中心匯出包含姓名並把總會考納入統計', () => {
  const html = fs.readFileSync(path.join(root, 'leader-admin.html'), 'utf8');
  assert.match(html, /姓名/);
  assert.match(html, /FINAL40/);
  assert.match(html, /8\/8/);
});
