const test = require('node:test');
const assert = require('node:assert/strict');

function makeStorage() {
  const m = new Map();
  return {
    getItem(k){ return m.has(k) ? m.get(k) : null; },
    setItem(k,v){ m.set(k,String(v)); },
    removeItem(k){ m.delete(k); }
  };
}

test('creates one opaque device token and reuses it on reload', () => {
  const storage = makeStorage();
  const { createPracticeIdentity } = require('../filipino-practice-identity.js');
  const api = createPracticeIdentity({ storage, cryptoObj: { randomUUID: () => '11111111-2222-4333-8444-555555555555' }, fetchFn: async()=>({ok:true,json:async()=>({})}) });
  const first = api.getDeviceToken();
  const second = api.getDeviceToken();
  assert.equal(first, '11111111-2222-4333-8444-555555555555');
  assert.equal(second, first);
  assert.match(first, /^[0-9a-f-]{36}$/i);
});

test('does not derive token from browser or hardware fingerprint data', () => {
  const source = require('node:fs').readFileSync(require.resolve('../filipino-practice-identity.js'),'utf8');
  for (const forbidden of ['userAgent','navigator.platform','screen.width','screen.height','deviceMemory','hardwareConcurrency','canvas','WebGL','imei','androidId','macAddress']) {
    assert.equal(source.includes(forbidden), false, 'forbidden fingerprint source: ' + forbidden);
  }
});

test('lookupEmployee sends only employeeId, while register sends employeeId and deviceToken', async () => {
  const calls = [];
  const storage = makeStorage();
  const { createPracticeIdentity } = require('../filipino-practice-identity.js');
  const api = createPracticeIdentity({
    storage,
    cryptoObj: { randomUUID: () => 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' },
    fetchFn: async (_url, opts) => {
      calls.push(JSON.parse(opts.body));
      return { ok:true, json:async()=>({ok:true, employeeId:'3017', englishName:'JUAN', chineseName:'莊芷靜'}) };
    }
  });
  await api.lookupEmployee('3017');
  await api.register('3017');
  assert.deepEqual(calls[0], { action:'employeeLookup', employeeId:'3017' });
  assert.deepEqual(calls[1], { action:'practiceRegister', employeeId:'3017', deviceToken:'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' });
});

test('caches and clears display identity only', () => {
  const storage = makeStorage();
  const { createPracticeIdentity } = require('../filipino-practice-identity.js');
  const api = createPracticeIdentity({ storage, cryptoObj: { randomUUID: () => 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee' }, fetchFn: async()=>({ok:true,json:async()=>({})}) });
  api.setCachedIdentity({employeeId:'3017', englishName:'JUAN', chineseName:'莊芷靜'});
  assert.deepEqual(api.getCurrentIdentity(), {employeeId:'3017', englishName:'JUAN', chineseName:'莊芷靜'});
  const token = api.getDeviceToken();
  api.clearCachedIdentity();
  assert.equal(api.getCurrentIdentity(), null);
  assert.equal(api.getDeviceToken(), token);
});


test('Apps Script POST stays a simple text/plain request to avoid browser preflight', async () => {
  let options = null;
  const storage = makeStorage();
  const { createPracticeIdentity } = require('../filipino-practice-identity.js');
  const api = createPracticeIdentity({
    storage,
    cryptoObj:{randomUUID:()=> 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'},
    fetchFn:async (_url,opts)=>{ options=opts; return {ok:true,json:async()=>({ok:false})}; }
  });
  await api.lookupEmployee('3017');
  assert.equal(options.headers['Content-Type'],'text/plain;charset=utf-8');
});
