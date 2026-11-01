const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'filipino-practice-register.html');

test('registration page only lets learner type Employee ID', () => {
  const html = fs.readFileSync(file, 'utf8');
  const employeeTag = html.match(/<input[^>]*id="employeeId"[^>]*>/)[0];
  const englishTag = html.match(/<input[^>]*id="englishName"[^>]*>/)[0];
  const chineseTag = html.match(/<input[^>]*id="chineseName"[^>]*>/)[0];
  assert.equal(employeeTag.includes('readonly'), false);
  assert.equal(englishTag.includes('readonly'), true);
  assert.equal(chineseTag.includes('readonly'), true);
});

test('registration page uses shared identity lookup and registration', () => {
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /filipino-practice-identity\.js/);
  assert.match(html, /lookupEmployee\(employeeId\)/);
  assert.match(html, /register\(employeeId\)/);
  assert.match(html, /englishName\.value\s*=\s*result\.englishName/);
  assert.match(html, /chineseName\.value\s*=\s*result\.chineseName/);
});

test('registration page hides device binding internals from learner copy', () => {
  const html = fs.readFileSync(file, 'utf8');
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  for (const forbidden of ['DeviceToken','Device ID','裝置 ID','綁定裝置','解除綁定','一人一機']) {
    assert.equal(visible.includes(forbidden), false, forbidden);
  }
});

test('successful registration returns to Filipino training center', () => {
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /window\.location\.(?:href|replace)\s*=\s*['"]filipino-leader-training\.html['"]/);
});
