const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const page = fs.readFileSync(path.join(__dirname,'..','filipino-practice01.html'),'utf8');
const backend = fs.readFileSync(path.join(__dirname,'..','apps-script','filipino-practice-binding-patch.gs'),'utf8');

test('Course 1 emits idempotent ANSWER events with the approved practice payload', () => {
  assert.match(page, /eventType:\s*'ANSWER'/);
  for(const field of ['eventId','employeeId','courseId','questionNo','isCorrect','occurredAt','practiceRoundId']){
    assert.match(page, new RegExp(field));
  }
  assert.match(page, /practiceRoundId\s*\+\s*':ANSWER:'\s*\+\s*q\[0\]/);
});

test('Course 1 emits one deterministic ROUND_COMPLETE event per round', () => {
  assert.match(page, /eventType:\s*'ROUND_COMPLETE'/);
  assert.match(page, /practiceRoundId\s*\+\s*':ROUND_COMPLETE'/);
});

test('backend accepts practiceEvent and stores it in PracticeEvents', () => {
  assert.match(backend, /action === 'practiceEvent'/);
  assert.match(backend, /FILIPINO_EVENTS_SHEET_ = 'PracticeEvents'/);
  assert.match(backend, /function filipinoPracticeEvent_/);
  assert.match(backend, /sheet\.appendRow/);
});

test('backend de-duplicates by EventId before append', () => {
  const fn = backend.slice(backend.indexOf('function filipinoPracticeEvent_'), backend.indexOf('function filipinoEmployeeLookup_'));
  assert.match(fn, /LockService\.getScriptLock\(\)/);
  assert.match(fn, /eventId/);
  assert.match(fn, /duplicate:\s*true/);
  assert.ok(fn.indexOf('duplicate: true') < fn.indexOf('appendRow'), 'duplicate check must happen before append');
});


test('practice events carry device token and backend requires matching ACTIVE binding', () => {
  assert.match(page, /deviceToken:\s*practiceIdentity\.getDeviceToken\(\)/);
  const fn = backend.slice(backend.indexOf('function filipinoPracticeEvent_'), backend.indexOf('function filipinoEmployeeLookup_'));
  assert.match(fn, /deviceToken/);
  assert.match(fn, /FILIPINO_BINDING_SHEET_/);
  assert.match(fn, /rowDeviceToken\s*!==\s*deviceToken/);
  assert.match(fn, /rowStatus\s*!==\s*FILIPINO_ACTIVE_/);
  assert.match(fn, /INVALID_PRACTICE_DEVICE/);
});

test('practice event transport uses a local outbox and retries pending events', () => {
  assert.match(page, /pendingEventsKey/);
  assert.match(page, /enqueuePracticeEvent/);
  assert.match(page, /flushPendingEvents/);
  assert.match(page, /window\.addEventListener\('online'/);
  assert.match(page, /text\/plain;charset=utf-8/);
});
