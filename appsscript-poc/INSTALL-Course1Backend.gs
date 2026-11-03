// W601 isolated candidate. Not deployed.
function filipinoCourse1EventBridge(p) {
  p = p || {};
  const id = normalizeEmployeeId(p.employeeId);
  const token = String(p.deviceToken || '').trim();
  if (!id || !token || !findActiveEmployee(id) || !validatePracticeDevice(id, token)) {
    return {ok:false,code:'INVALID_PRACTICE_DEVICE'};
  }
  const eventId = String(p.eventId || '').trim();
  const roundId = String(p.practiceRoundId || '').trim();
  const questionNo = Number(p.questionNo);
  if (!eventId || !roundId || !Number.isInteger(questionNo) || questionNo < 1 || questionNo > 60) {
    return {ok:false,code:'INVALID_PRACTICE_EVENT'};
  }
  // Do not accept client supplied isCorrect as authoritative.
  const answerKey = [1,3,0,2,1,0,3,2,0,3,2,1,2,0,3,1,0,2,3,1,2,3,0,1,3,2,1,0,2,0,3,1,0,3,1,2,1,3,0,2,3,1,2,0,1,2,0,3,2,1,3,0,1,3,2,0,3,2,0,1];
  const selected = Number(p.selectedIndex);
  if (!Number.isInteger(selected) || selected < 0 || selected > 3) return {ok:false,code:'INVALID_CHOICE'};
  const correct = selected === answerKey[questionNo-1];
  return filipinoCourse1PersistAnswer_(p, id, token, eventId, roundId, questionNo, correct);
}

// Isolated POC. Not deployed. Uses existing practiceEvent validation and storage.
function filipinoCourse1PersistAnswer_(p, id, token, eventId, roundId, questionNo, correct) {
  const response = practiceEvent({
    employeeId:id,
    deviceToken:token,
    eventId:eventId,
    practiceRoundId:roundId,
    questionNo:questionNo,
    courseId:'FILIPINO_C01',
    eventType:'ANSWER',
    isCorrect:correct,
    occurredAt:new Date().toISOString()
  });
  const result = JSON.parse(response.getContent());
  if (!result.ok) return result;
  return {ok:true,eventId:eventId,correct:correct};
}


// Isolated Course 1 access gate. Install only with reviewed Course1Combined.gs.
function filipinoCourse1VerifyBridge(employeeId, deviceToken) {
  const id = normalizeEmployeeId(employeeId);
  const token = String(deviceToken || '').trim();
  if (!id || !token || !findActiveEmployee(id) || !validatePracticeDevice(id, token)) {
    return {ok:false,code:'INVALID_PRACTICE_DEVICE'};
  }
  return {ok:true,employeeId:id};
}
