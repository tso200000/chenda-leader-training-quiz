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
  // TODO: add server-owned answer key before enabling writes.
  return {ok:false,code:'ANSWER_KEY_NOT_CONNECTED'};
}
