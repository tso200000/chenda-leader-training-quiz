const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const modulePath = path.join(root, 'course-context.js');

function loadCourseContext() {
  assert.ok(fs.existsSync(modulePath), '尚未建立多課程管理導覽功能');
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

test('管理工具分別產生第1至第3堂的統計與成績入口', () => {
  const { renderCourseToolLinks } = loadCourseContext();
  const stats = { innerHTML: '' };
  const leaderboard = { innerHTML: '' };

  renderCourseToolLinks(stats, 'stats');
  renderCourseToolLinks(leaderboard, 'leaderboard');

  assert.equal((stats.innerHTML.match(/<a /g) || []).length, 3);
  assert.match(stats.innerHTML, /stats\.html\?courseId=C01[^>]*>第1堂/);
  assert.match(stats.innerHTML, /stats\.html\?courseId=C02[^>]*>第2堂/);
  assert.match(stats.innerHTML, /stats\.html\?courseId=C03[^>]*>第3堂/);

  assert.equal((leaderboard.innerHTML.match(/<a /g) || []).length, 3);
  assert.match(leaderboard.innerHTML, /leaderboard\.html\?courseId=C01[^>]*>第1堂/);
  assert.match(leaderboard.innerHTML, /leaderboard\.html\?courseId=C02[^>]*>第2堂/);
  assert.match(leaderboard.innerHTML, /leaderboard\.html\?courseId=C03[^>]*>第3堂/);
});

test('統計與成績頁依所選課程顯示名稱並返回正確測驗', () => {
  const { applyCoursePageContext } = loadCourseContext();
  const makeDocument = () => ({
    title: '',
    elements: {
      coursePageTitle: { textContent: '' },
      coursePageSubtitle: { textContent: '' },
      courseQuizLink: { href: '' },
    },
    getElementById(id) { return this.elements[id] || null; },
  });

  const statsDocument = makeDocument();
  applyCoursePageContext(statsDocument, 'C02', 'stats');
  assert.equal(statsDocument.elements.coursePageTitle.textContent, '第二堂｜工作安排與進度掌握｜統計分析');
  assert.equal(statsDocument.elements.courseQuizLink.href, 'course02.html');
  assert.equal(statsDocument.title, '統計分析｜第二堂｜工作安排與進度掌握');

  const leaderboardDocument = makeDocument();
  applyCoursePageContext(leaderboardDocument, 'C03', 'leaderboard');
  assert.equal(leaderboardDocument.elements.coursePageTitle.textContent, '第三堂｜品質意識與自主檢查｜成績列表');
  assert.equal(leaderboardDocument.elements.courseQuizLink.href, 'course03.html');
  assert.equal(leaderboardDocument.title, '成績列表｜第三堂｜品質意識與自主檢查');
});
