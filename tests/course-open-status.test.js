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

test('管理頁將8堂課全部標示完成並加入總會考', async () => {
  const summary = {
    ok: true,
    overview: {
      openCourses: 8,
      totalCourses: 8,
      totalAttempts: 11,
      avgScore: 90,
      pass80: 91,
    },
    courses: [
      { id: 'C01', name: '現場幹部的角色與責任', status: 'open', count: 6, avgScore: 95, pass80: 100 },
      { id: 'C02', name: '工作安排與進度掌握', status: 'open', count: 5, avgScore: 84, pass80: 80 },
      { id: 'C03', name: '品質意識與自主檢查', status: 'open', count: 4, avgScore: 88, pass80: 75 },
      { id: 'C04', name: '異常處理與問題判斷', status: 'open', count: 3, avgScore: 86, pass80: 67 },
      { id: 'C05', name: '新人帶教與工作教導', status: 'open', count: 3, avgScore: 90, pass80: 100 },
      { id: 'C08', name: '基礎改善與數據管理', status: 'open', count: 2, avgScore: 92, pass80: 100 },
    ],
  };
  const { context, rows } = dashboardContext(summary);

  await context.loadSummary();

  assert.equal(context.mOpen.textContent, '8/8');
  assert.equal(rows.length, 9);
  assert.match(rows[0].innerHTML, /1｜現場幹部的角色與責任/);
  assert.match(rows[3].innerHTML, /4｜異常處理與問題判斷/);
  assert.match(rows[3].innerHTML, /已完成/);
  assert.match(rows[3].innerHTML, /stats\.html\?courseId=C04/);
  assert.match(rows[4].innerHTML, /5｜新人帶教與工作教導/);
  assert.match(rows[5].innerHTML, /6｜溝通、回報與工作交接/);
  assert.match(rows[6].innerHTML, /7｜現場紀律、5S與安全管理/);
  assert.match(rows[7].innerHTML, /8｜基礎改善與數據管理/);
  assert.match(rows[7].innerHTML, /stats\.html\?courseId=C08/);
  assert.match(rows[8].innerHTML, /總會考｜1～8堂綜合測驗/);
  assert.match(rows[8].innerHTML, /stats\.html\?courseId=FINAL40/);
});
