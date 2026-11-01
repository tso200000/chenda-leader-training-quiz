const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const pagePath = path.join(__dirname,'..','filipino-practice01.html');
const identityPath = path.join(__dirname,'..','filipino-practice-identity.js');

function makeStorage(seed={}) {
  const m = new Map(Object.entries(seed));
  return {
    getItem(k){ return m.has(k) ? m.get(k) : null; },
    setItem(k,v){ m.set(k,String(v)); },
    removeItem(k){ m.delete(k); }
  };
}

test('shared identity validates the current device with backend and refreshes cached identity', async () => {
  const calls = [];
  const storage = makeStorage({
    filipino_practice_device_token_v1:'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    filipino_practice_identity_v1:JSON.stringify({employeeId:'OLD',englishName:'OLD',chineseName:'舊'})
  });
  const { createPracticeIdentity } = require(identityPath);
  const api = createPracticeIdentity({
    storage,
    cryptoObj:{randomUUID:()=>{throw new Error('should not create a new token')}},
    fetchFn:async (_url,opts)=>{
      calls.push(JSON.parse(opts.body));
      return {ok:true,json:async()=>({ok:true,employeeId:'3017',englishName:'JUAN',chineseName:'莊芷靜'})};
    }
  });
  const result = await api.validateCurrentIdentity();
  assert.deepEqual(calls,[{action:'practiceIdentity',deviceToken:'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'}]);
  assert.deepEqual(result,{ok:true,employeeId:'3017',englishName:'JUAN',chineseName:'莊芷靜'});
  assert.deepEqual(api.getCurrentIdentity(),{employeeId:'3017',englishName:'JUAN',chineseName:'莊芷靜'});
});

test('failed backend validation clears cached identity', async () => {
  const storage = makeStorage({
    filipino_practice_device_token_v1:'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    filipino_practice_identity_v1:JSON.stringify({employeeId:'3017',englishName:'JUAN',chineseName:'莊芷靜'})
  });
  const { createPracticeIdentity } = require(identityPath);
  const api = createPracticeIdentity({
    storage,
    fetchFn:async()=>({ok:true,json:async()=>({ok:false,code:'REGISTRATION_UNAVAILABLE'})})
  });
  const result = await api.validateCurrentIdentity();
  assert.equal(result.ok,false);
  assert.equal(api.getCurrentIdentity(),null);
});

test('Course 1 loads shared identity module and shows read-only learner identity fields', () => {
  const html = fs.readFileSync(pagePath,'utf8');
  assert.match(html,/filipino-practice-identity\.js/);
  for(const id of ['learnerEmployeeId','learnerEnglishName','learnerChineseName']){
    const tag = html.match(new RegExp('<input[^>]*id="'+id+'"[^>]*>'))?.[0] || '';
    assert.ok(tag,'missing '+id);
    assert.match(tag,/readonly/);
  }
});

test('Course 1 redirects an unregistered or invalid device to registration before showing practice', () => {
  const html = fs.readFileSync(pagePath,'utf8');
  assert.match(html,/validateCurrentIdentity\(\)/);
  assert.match(html,/filipino-practice-register\.html\?return=filipino-practice01\.html/);
  assert.match(html,/id="practiceShell"[^>]*hidden/);
});

test('Course 1 learner-facing page does not expose device or unbind controls', () => {
  const html = fs.readFileSync(pagePath,'utf8');
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi,'');
  for(const forbidden of ['DeviceToken','Device ID','裝置 ID','解除綁定','解除裝置','一人一機']){
    assert.equal(visible.includes(forbidden),false,forbidden);
  }
});
