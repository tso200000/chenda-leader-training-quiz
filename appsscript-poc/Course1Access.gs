// Isolated Course 1 access gate. Install only with reviewed Course1Combined.gs.
function filipinoCourse1VerifyBridge(employeeId, deviceToken) {
  const id = normalizeEmployeeId(employeeId);
  const token = String(deviceToken || '').trim();
  if (!id || !token || !findActiveEmployee(id) || !validatePracticeDevice(id, token)) {
    return {ok:false,code:'INVALID_PRACTICE_DEVICE'};
  }
  return {ok:true,employeeId:id};
}
