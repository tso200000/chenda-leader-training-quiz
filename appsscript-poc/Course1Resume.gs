// W601 Course 1 resume candidate. Read-only; not deployed.
function filipinoCourse1ResumeBridge(employeeId, deviceToken) {
  const id = normalizeEmployeeId(employeeId);
  const token = String(deviceToken || '').trim();
  if (!id || !token || !findActiveEmployee(id) || !validatePracticeDevice(id, token)) {
    return {ok:false,code:'INVALID_PRACTICE_DEVICE'};
  }
  const values = practiceEventSheet().getDataRange().getValues();
  const headers = values[0] || [];
  const required = ['EventId','EmployeeID','CourseId','EventType','QuestionNo','IsCorrect','PracticeRoundId'];
  const pos = {};
  required.forEach(name => { pos[name] = headers.indexOf(name); });
  if (required.some(name => pos[name] < 0)) return {ok:false,code:'EVENT_SCHEMA_MISMATCH'};
  const events = values.slice(1).filter(row =>
    String(row[pos.EmployeeID]).trim() === id &&
    String(row[pos.CourseId]).trim() === 'FILIPINO_C01' &&
    String(row[pos.EventType]).trim().toUpperCase() === 'ANSWER' &&
    String(row[pos.PracticeRoundId]).trim()
  );
  if (!events.length) return {ok:true,hasProgress:false,nextQuestion:1,correctCount:0};
  // Use the latest recorded round, without mixing earlier rounds.
  const roundId = String(events[events.length - 1][pos.PracticeRoundId]).trim();
  const round = events.filter(row => String(row[pos.PracticeRoundId]).trim() === roundId);
  const byQuestion = new Map();
  for (const row of round) {
    const q = Number(row[pos.QuestionNo]);
    if (!Number.isInteger(q) || q < 1 || q > 60) continue;
    if (!byQuestion.has(q)) byQuestion.set(q,row);
  }
  // Never skip an unanswered gap, even if later events exist.
  let completed = 0;
  while (completed < 60 && byQuestion.has(completed + 1)) completed++;
  let correctCount = 0;
  for (let q=1; q<=completed; q++) {
    const value = byQuestion.get(q)[pos.IsCorrect];
    if (value === true || String(value).trim().toLowerCase() === 'true') correctCount++;
  }
  return {ok:true,hasProgress:true,practiceRoundId:roundId,nextQuestion:Math.min(completed+1,60),completed:completed,correctCount:correctCount,finished:completed===60};
}
