const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', 'apps-script', 'filipino-practice-binding-patch.gs'), 'utf8');

test('backend patch exposes the three learner identity actions', () => {
  for (const action of ['employeeLookup', 'practiceRegister', 'practiceIdentity']) {
    assert.match(source, new RegExp("action === '" + action + "'"));
  }
});

test('registration is guarded by Apps Script lock before active-binding scan and append', () => {
  const fn = source.slice(source.indexOf('function filipinoPracticeRegister_'), source.indexOf('function filipinoPracticeIdentity_'));
  assert.match(fn, /LockService\.getScriptLock\(\)/);
  assert.match(fn, /waitLock\(10000\)/);
  assert.match(fn, /rowStatus !== FILIPINO_ACTIVE_/);
  assert.match(fn, /appendRow\(\[employeeId, deviceToken,/);
  assert.match(fn, /releaseLock\(\)/);
});

test('employee lookup accepts only ACTIVE EmployeeMaster rows', () => {
  assert.match(source, /FILIPINO_EMPLOYEE_SHEET_ = 'EmployeeMaster'/);
  assert.match(source, /status === FILIPINO_ACTIVE_/);
  assert.match(source, /englishName:/);
  assert.match(source, /chineseName:/);
});

test('learner-facing registration rejection does not reveal an existing device token', () => {
  assert.match(source, /Registration unavailable\. Please contact the training administrator\./);
  const errorFn = source.slice(source.indexOf('function filipinoPracticeError_'), source.indexOf('function filipinoNormalizeEmployeeId_'));
  assert.equal(/deviceToken|DeviceToken/.test(errorFn), false);
});

test('patch keeps the existing Apps Script deployment integration additive', () => {
  assert.equal(/function doPost\s*\(/.test(source), false);
  assert.match(source, /Do not replace the existing doPost or deployment ID/);
});
