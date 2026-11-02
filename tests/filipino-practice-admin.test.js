const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const admin = fs.readFileSync(path.join(__dirname,'..','leader-admin.html'),'utf8');
const backend = fs.readFileSync(path.join(__dirname,'..','apps-script','filipino-practice-binding-patch.gs'),'utf8');

test('management center has Filipino practice overview with effort metrics', () => {
  assert.match(admin,/菲律賓幹部.*習題練習管理/);
  for(const id of ['practiceRows','practiceStatus','loadPracticeOverview','releasePracticeDevice']){
    assert.match(admin,new RegExp(id));
  }
  for(const label of ['工號','英文名','中文名','練習天數','作答題數','完成輪次','答對率','最近練習']){
    assert.ok(admin.includes(label),label);
  }
});

test('admin overview backend exposes all approved fields', () => {
  assert.match(backend,/function filipinoAdminPracticeOverview_/);
  for(const field of ['employeeId','englishName','chineseName','bindingStatus','boundAt','lastSeenAt','activeDays','answeredQuestions','completedRounds','correctRate','lastPractice']){
    assert.match(backend,new RegExp(field));
  }
});

test('admin release requires explicit admin authorization and marks binding RELEASED', () => {
  assert.match(backend,/function handleFilipinoPracticeAdminAction_\(payload, adminAuthorized\)/);
  assert.match(backend,/if \(adminAuthorized !== true\)/);
  assert.match(backend,/function filipinoAdminReleasePracticeDevice_/);
  assert.match(backend,/RELEASED/);
  assert.match(backend,/ReleasedAt|setValues/);
});

test('release preserves PracticeEvents history', () => {
  const fn = backend.slice(
    backend.indexOf('function filipinoAdminReleasePracticeDevice_'),
    backend.indexOf('function filipinoBuildPracticeOverview_')
  );
  assert.ok(fn.length > 0);
  assert.equal(/deleteRow|clearContent|clear\(|FILIPINO_EVENTS_SHEET_|PracticeEvents/.test(fn),false);
});

test('management UI confirms before releasing and refreshes overview afterwards', () => {
  const fn = admin.slice(admin.indexOf('async function releasePracticeDevice'),admin.indexOf('async function clearAll'));
  assert.match(fn,/confirm\(/);
  assert.match(fn,/adminReleasePracticeDevice/);
  assert.match(fn,/loadPracticeOverview\(\)/);
});
