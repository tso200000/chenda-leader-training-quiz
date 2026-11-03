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
