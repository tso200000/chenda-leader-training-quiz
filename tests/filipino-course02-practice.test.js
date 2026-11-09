const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const data = fs.readFileSync('filipino-practice02-data.js','utf8');
const ctx = {window:{}};
vm.runInNewContext(data,ctx);
const q = ctx.window.COURSE2_PRACTICE;
assert.equal(q.length,60);
assert.equal(new Set(q.map(row=>row[1])).size,60);
assert.deepEqual(q.map(row=>row[0]),Array.from({length:60},(_,i)=>i+1));
for (const row of q) {
  assert.equal(row.length,7);
  assert.equal(row[3].length,4);
  assert.ok(Number.isInteger(row[4]) && row[4]>=0 && row[4]<4);
  assert.ok(row[1] && row[2] && row[5] && row[6]);
  for (const option of row[3]) assert.ok(option.length===2 && option[0] && option[1]);
}
const page=fs.readFileSync('filipino-practice02.html','utf8');
assert.match(page,/filipino-practice02-data\.js/);
assert.match(page,/COURSE2_PRACTICE/);
for(const file of ['filipino-leader-training.html','filipino-leader-training-preview.html']) {
  assert.match(fs.readFileSync(file,'utf8'),/href="filipino-practice02\.html"/);
}
console.log('Course 2: 60 bilingual questions and both homepage entries PASS');
