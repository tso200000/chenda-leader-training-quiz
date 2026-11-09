// W601 Course 2 isolated V2 candidate. Not deployed.
// Uses existing EmployeeMaster, PracticeDeviceBindings and PracticeEvents.
const C2_KEY_ = [0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3,0,1,2,3];
const C2_COURSE_ = 'FILIPINO_C02';
function c2Identity_(id, token) {
  id = normalizeEmployeeId(id);
  token = String(token || '').trim();
  if (!id || !token || !findActiveEmployee(id) || !validatePracticeDevice(id, token))
    throw new Error('INVALID_PRACTICE_DEVICE');
  return id;
}
function c2Rows_() {
  const sheet = practiceEventSheet();
  const rows = sheet.getDataRange().getValues();
  const header = rows[0].map(String);
  const fields = ['EventId','EmployeeID','CourseId','EventType','QuestionNo','IsCorrect','OccurredAt','PracticeRoundId'];
  if (fields.some((f,i)=>header[i]!==f)) throw new Error('EVENT_SCHEMA_MISMATCH');
  return {sheet,rows:rows.slice(1)};
}
function c2History_(rows,id) {
  return rows.filter(r=>String(r[1]).trim()===id && String(r[2]).trim()===C2_COURSE_);
}
function c2State_(rows,id) {
  const events = c2History_(rows,id);
  const starts = events.filter(r=>String(r[3])==='ROUND_START');
  if (!starts.length) return {ok:true,hasProgress:false,completed:0,correctCount:0,finished:false};
  const roundId=String(starts[starts.length-1][7]);
  const round=events.filter(r=>String(r[7])===roundId);
  const answered=new Map();
  for (const r of round) {
    const n=Number(r[4]);
    if (String(r[3])==='ANSWER' && Number.isInteger(n) && n>=1 && n<=60 && !answered.has(n)) answered.set(n,r);
  }
  let completed=0,correctCount=0;
  while (answered.has(completed+1) && completed<60) {
    completed++;
    const v=answered.get(completed)[5];
    if(v===true || String(v).toLowerCase()==='true') correctCount++;
  }
  const finished=round.some(r=>String(r[3])==='ROUND_COMPLETE') && completed===60;
  return {ok:true,hasProgress:true,practiceRoundId:roundId,completed,correctCount,nextQuestion:Math.min(completed+1,60),finished};
}
function c2Append_(sheet,eventId,id,type,n,correct,roundId) {
  sheet.appendRow([eventId,id,C2_COURSE_,type,n,correct,new Date(),roundId]);
}
function filipinoCourse2ResumeBridge(employeeId,deviceToken) {
  try {
    const id=c2Identity_(employeeId,deviceToken);
    return c2State_(c2Rows_().rows,id);
  } catch(e) {return {ok:false,code:String(e.message)};}
}
function filipinoCourse2StartBridge(employeeId,deviceToken,restart) {
  const lock=LockService.getScriptLock();
  if (!lock.tryLock(10000)) return {ok:false,code:'BUSY_RETRY'};
  try {
    const id=c2Identity_(employeeId,deviceToken);
    const data=c2Rows_(),state=c2State_(data.rows,id);
    if(state.hasProgress && !restart) return state;
    if(restart && state.hasProgress && !state.finished) return {ok:false,code:'ROUND_NOT_FINISHED'};
    const roundId=Utilities.getUuid();
    c2Append_(data.sheet,'start-'+roundId,id,'ROUND_START','',false,roundId);
    SpreadsheetApp.flush();
    return {ok:true,hasProgress:true,practiceRoundId:roundId,completed:0,correctCount:0,nextQuestion:1,finished:false};
  } catch(e) {return {ok:false,code:String(e.message)};}
  finally {lock.releaseLock();}
}
function filipinoCourse2EventBridge(p) {
  p=p||{};
  const lock=LockService.getScriptLock();
  if (!lock.tryLock(10000)) return {ok:false,code:'BUSY_RETRY'};
  try {
    const id=c2Identity_(p.employeeId,p.deviceToken);
    const eventId=String(p.eventId||'').trim(),roundId=String(p.practiceRoundId||'').trim();
    const n=Number(p.questionNo),choice=Number(p.selectedIndex);
    if(!/^[a-zA-Z0-9-]{12,100}$/.test(eventId) || !roundId || !Number.isInteger(n) || n<1 || n>60 || !Number.isInteger(choice) || choice<0 || choice>3) return {ok:false,code:'INVALID_EVENT'};
    const data=c2Rows_();
    const same=data.rows.find(r=>String(r[0])===eventId);
    if(same) {
      if(String(same[1])!==id || String(same[7])!==roundId || Number(same[4])!==n || String(same[3])!=='ANSWER') return {ok:false,code:'EVENT_ID_CONFLICT'};
      return {ok:true,duplicate:true,correct:String(same[5]).toLowerCase()==='true'};
    }
    const state=c2State_(data.rows,id);
    if(!state.hasProgress || state.finished || state.practiceRoundId!==roundId || n!==state.completed+1) return {ok:false,code:'OUT_OF_SEQUENCE'};
    const correct=choice===C2_KEY_[n-1];
    c2Append_(data.sheet,eventId,id,'ANSWER',n,correct,roundId);
    SpreadsheetApp.flush();
    return {ok:true,duplicate:false,correct};
  } catch(e) {return {ok:false,code:String(e.message)};}
  finally {lock.releaseLock();}
}
function filipinoCourse2CompleteBridge(employeeId,deviceToken,roundId) {
  const lock=LockService.getScriptLock();
  if (!lock.tryLock(10000)) return {ok:false,code:'BUSY_RETRY'};
  try {
    const id=c2Identity_(employeeId,deviceToken),data=c2Rows_(),state=c2State_(data.rows,id);
    if(!state.hasProgress || state.practiceRoundId!==roundId || state.completed!==60) return {ok:false,code:'ROUND_INCOMPLETE'};
    if(state.finished) return {ok:true,duplicate:true};
    c2Append_(data.sheet,'complete-'+roundId,id,'ROUND_COMPLETE','',false,roundId);
    SpreadsheetApp.flush();
    return {ok:true,duplicate:false};
  } catch(e) {return {ok:false,code:String(e.message)};}
  finally {lock.releaseLock();}
}
