const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const CourseContext = require(path.join(root, 'course-context.js'));

function dashboardContext(summary) {
  const html = fs.readFileSync(path.join(root, 'leader-admin.html'), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(script, '找不到管理頁程式');

  const rows = [];
  const element = () => ({
    textContent: '',
    innerHTML: '',
    classList: { add() {}, remove() {} },
    appendChild(child) { rows.push(child); },
  });

  const elements = {
    statsCourseLinks: element(),
    leaderboardCourseLinks: element(),
  };
  const context = {
    CourseContext,
    sessionStorage: {
      getItem() { return ''; },
      setItem() {},
      removeItem() {},
    },
    document: {
      createElement: element,
      getElementById(id) { return elements[id] || null; },
    },
    fetch: async () => ({ json: async () => summary }),
    alert() {},
    location: { reload() {} },
    login: element(),
    dashboard: element(),
    loginMsg: element(),
    pin: { value: '' },
    mOpen: element(),
    mAttempts: element(),
    mAvg: element(),
    mPass: element(),
    courseRows: element(),
  };

  vm.createContext(context);
  vm.runInContext(script[1], context);
  return { context, rows };
}

test('管理頁將已有正式入口的前3堂顯示為開放並提供查看功能', async () => {
  const summary = {
    ok: true,
    overview: {
      openCourses: 1,
      totalCourses: 8,
      totalAttempts: 11,
      avgScore: 90,
      pass80: 91,
    },
    courses: [
      { id: 'C01', name: '現場幹部的角色與責任', status: 'open', count: 6, avgScore: 95, pass80: 100 },
      { id: 'C02', name: '工作安排與進度掌握', status: 'coming', count: 5, avgScore: 84, pass80: 80 },
      { id: 'C03', name: '品質意識與自主檢查', status: 'coming', count: 0, avgScore: null, pass80: null },
      { id: 'C04', name: '異常處理與問題判斷', status: 'coming', count: 0, avgScore: null, pass80: null },
    ],
  };
  const { context, rows } = dashboardContext(summary);

  await context.loadSummary();

  assert.equal(context.mOpen.textContent, '3/8');
  assert.match(rows[1].innerHTML, /status open[^>]*>開放/);
  assert.match(rows[1].innerHTML, /stats\.html\?courseId=C02/);
  assert.match(rows[2].innerHTML, /status open[^>]*>開放/);
  assert.match(rows[2].innerHTML, /stats\.html\?courseId=C03/);
  assert.match(rows[3].innerHTML, /status coming[^>]*>準備中/);
});
