(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PracticeIdentityFactory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  const DEVICE_KEY = 'filipino_practice_device_token_v1';
  const IDENTITY_KEY = 'filipino_practice_identity_v1';
  const DEFAULT_API = 'https://script.google.com/macros/s/AKfycbxlvoVmUVJCmrrG6_gFWc5Nl3N_sBG0Wjnu1xnn4CtLnBt0kQI_mq5LPuKepMSSCE0E/exec';

  function fallbackToken(){
    let s = '';
    for (let i=0;i<32;i++) s += Math.floor(Math.random()*16).toString(16);
    return s.slice(0,8) + '-' + s.slice(8,12) + '-4' + s.slice(13,16) + '-8' + s.slice(17,20) + '-' + s.slice(20,32);
  }

  function createPracticeIdentity(options={}){
    const storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    const cryptoObj = options.cryptoObj || (typeof crypto !== 'undefined' ? crypto : null);
    const fetchFn = options.fetchFn || (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null);
    const apiUrl = options.apiUrl || DEFAULT_API;
    if (!storage) throw new Error('Storage unavailable');
    if (!fetchFn) throw new Error('Fetch unavailable');

    function getDeviceToken(){
      let token = storage.getItem(DEVICE_KEY);
      if (!token) {
        token = cryptoObj && typeof cryptoObj.randomUUID === 'function' ? cryptoObj.randomUUID() : fallbackToken();
        storage.setItem(DEVICE_KEY, token);
      }
      return token;
    }

    async function post(payload){
      const response = await fetchFn(apiUrl, {
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify(payload)
      });
      return response.json();
    }

    function normalizeEmployeeId(value){ return String(value || '').trim(); }

    async function lookupEmployee(employeeId){
      return post({action:'employeeLookup', employeeId:normalizeEmployeeId(employeeId)});
    }

    async function register(employeeId){
      const result = await post({action:'practiceRegister', employeeId:normalizeEmployeeId(employeeId), deviceToken:getDeviceToken()});
      if (result && result.ok) setCachedIdentity(result);
      return result;
    }

    function setCachedIdentity(identity){
      const clean = {
        employeeId:String(identity.employeeId || ''),
        englishName:String(identity.englishName || ''),
        chineseName:String(identity.chineseName || '')
      };
      storage.setItem(IDENTITY_KEY, JSON.stringify(clean));
      return clean;
    }

    function getCurrentIdentity(){
      try {
        const raw = storage.getItem(IDENTITY_KEY);
        if (!raw) return null;
        const x = JSON.parse(raw);
        if (!x || !x.employeeId) return null;
        return {employeeId:String(x.employeeId), englishName:String(x.englishName||''), chineseName:String(x.chineseName||'')};
      } catch (_) { return null; }
    }

    function clearCachedIdentity(){ storage.removeItem(IDENTITY_KEY); }

    return {getDeviceToken, lookupEmployee, register, setCachedIdentity, getCurrentIdentity, clearCachedIdentity};
  }

  return {createPracticeIdentity};
});
