const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname,'..','filipino-practice01.html'),'utf8');

test('Course 1 progress is keyed by course and Employee ID', () => {
  assert.match(html, /FILIPINO_C01/);
  assert.match(html, /learnerIdentity\.employeeId/);
  assert.match(html, /localStorage\.getItem\(progressKey\)/);
  assert.match(html, /localStorage\.setItem\(progressKey/);
});

test('answer saves the next unanswered question and current correct count', () => {
  assert.match(html, /nextIndex\s*:\s*index\s*\+\s*1/);
  assert.match(html, /correct\s*:\s*correct/);
  assert.match(html, /savePracticeProgress/);
  const answerFn = html.slice(html.indexOf('function answer('), html.indexOf('function next('));
  assert.match(answerFn, /savePracticeProgress/);
});

test('page resumes at the next unanswered question and restores completed result', () => {
  assert.match(html, /loadPracticeProgress/);
  assert.match(html, /index\s*=\s*Math\.min\(questions\.length\s*-\s*1,\s*progress\.nextIndex/);
  assert.match(html, /progress\.completed/);
  assert.match(html, /showCompletedRound/);
});

test('starting Practice Again creates a new round instead of overwriting the completed round', () => {
  assert.match(html, /newPracticeRound/);
  assert.match(html, /practiceRoundId/);
  const restart = html.slice(html.indexOf("restartButton.addEventListener"), html.indexOf("render();", html.indexOf("restartButton.addEventListener")) + 20);
  assert.match(restart, /newPracticeRound/);
});
