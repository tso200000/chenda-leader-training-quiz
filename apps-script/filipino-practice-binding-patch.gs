const FILIPINO_PRACTICE_SPREADSHEET_ID_ = '1LcfHM6I1cltMhKAcXFG0Kb9nHCnYw-aw3ZCSxvmhsQs';
const FILIPINO_EMPLOYEE_SHEET_ = 'EmployeeMaster';
const FILIPINO_BINDING_SHEET_ = 'PracticeDeviceBindings';
const FILIPINO_ACTIVE_ = 'ACTIVE';
const FILIPINO_REGISTRATION_MESSAGE_ = 'Registration unavailable. Please contact the training administrator.';

function handleFilipinoPracticeAction_(payload) {
  const action = String((payload && payload.action) || '').trim();
  if (action === 'employeeLookup') return filipinoEmployeeLookup_(payload);
  if (action === 'practiceRegister') return filipinoPracticeRegister_(payload);
  if (action === 'practiceIdentity') return filipinoPracticeIdentity_(payload);
  return null;
}

function filipinoEmployeeLookup_(payload) {
  const employeeId = filipinoNormalizeEmployeeId_(payload && payload.employeeId);
  if (!employeeId) return filipinoPracticeError_('INVALID_EMPLOYEE_ID');
  const employee = filipinoFindActiveEmployee_(employeeId);
  if (!employee) return filipinoPracticeError_('EMPLOYEE_NOT_FOUND');
  return filipinoPracticeIdentityResult_(employee);
}

function filipinoPracticeRegister_(payload) {
  const employeeId = filipinoNormalizeEmployeeId_(payload && payload.employeeId);
  const deviceToken = String((payload && payload.deviceToken) || '').trim();
  if (!employeeId || !deviceToken) return filipinoPracticeError_('INVALID_REGISTRATION');

  const employee = filipinoFindActiveEmployee_(employeeId);
  if (!employee) return filipinoPracticeError_('EMPLOYEE_NOT_FOUND');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(FILIPINO_PRACTICE_SPREADSHEET_ID_);
    const sheet = ss.getSheetByName(FILIPINO_BINDING_SHEET_);
    if (!sheet) throw new Error('Missing sheet: ' + FILIPINO_BINDING_SHEET_);
    const lastRow = sheet.getLastRow();
    const rows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 7).getValues() : [];
    let sameDeviceRow = -1;

    for (let i = 0; i < rows.length; i++) {
      const rowEmployeeId = filipinoNormalizeEmployeeId_(rows[i][0]);
      const rowDeviceToken = String(rows[i][1] || '').trim();
      const rowStatus = String(rows[i][4] || '').trim().toUpperCase();
      if (rowEmployeeId !== employeeId || rowStatus !== FILIPINO_ACTIVE_) continue;
      if (rowDeviceToken === deviceToken) {
        sameDeviceRow = i + 2;
        break;
      }
      return filipinoPracticeError_('REGISTRATION_UNAVAILABLE');
    }

    const now = new Date();
    if (sameDeviceRow > 0) {
      sheet.getRange(sameDeviceRow, 4).setValue(now);
      return filipinoPracticeIdentityResult_(employee);
    }

    sheet.appendRow([employeeId, deviceToken, now, now, FILIPINO_ACTIVE_, '', '']);
    return filipinoPracticeIdentityResult_(employee);
  } finally {
    lock.releaseLock();
  }
}

function filipinoPracticeIdentity_(payload) {
  const deviceToken = String((payload && payload.deviceToken) || '').trim();
  if (!deviceToken) return filipinoPracticeError_('INVALID_DEVICE');

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(FILIPINO_PRACTICE_SPREADSHEET_ID_);
    const sheet = ss.getSheetByName(FILIPINO_BINDING_SHEET_);
    if (!sheet) throw new Error('Missing sheet: ' + FILIPINO_BINDING_SHEET_);
    const lastRow = sheet.getLastRow();
    const rows = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 7).getValues() : [];

    for (let i = 0; i < rows.length; i++) {
      const rowDeviceToken = String(rows[i][1] || '').trim();
      const rowStatus = String(rows[i][4] || '').trim().toUpperCase();
      if (rowDeviceToken !== deviceToken || rowStatus !== FILIPINO_ACTIVE_) continue;
      const employeeId = filipinoNormalizeEmployeeId_(rows[i][0]);
      const employee = filipinoFindActiveEmployee_(employeeId);
      if (!employee) return filipinoPracticeError_('EMPLOYEE_NOT_FOUND');
      sheet.getRange(i + 2, 4).setValue(new Date());
      return filipinoPracticeIdentityResult_(employee);
    }
    return filipinoPracticeError_('REGISTRATION_UNAVAILABLE');
  } finally {
    lock.releaseLock();
  }
}

function filipinoFindActiveEmployee_(employeeId) {
  const ss = SpreadsheetApp.openById(FILIPINO_PRACTICE_SPREADSHEET_ID_);
  const sheet = ss.getSheetByName(FILIPINO_EMPLOYEE_SHEET_);
  if (!sheet) throw new Error('Missing sheet: ' + FILIPINO_EMPLOYEE_SHEET_);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;
  const rows = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  for (let i = 0; i < rows.length; i++) {
    const id = filipinoNormalizeEmployeeId_(rows[i][0]);
    const status = String(rows[i][3] || '').trim().toUpperCase();
    if (id === employeeId && status === FILIPINO_ACTIVE_) {
      return {
        employeeId: id,
        englishName: String(rows[i][1] || '').trim(),
        chineseName: String(rows[i][2] || '').trim()
      };
    }
  }
  return null;
}

function filipinoPracticeIdentityResult_(employee) {
  return {
    ok: true,
    employeeId: employee.employeeId,
    englishName: employee.englishName,
    chineseName: employee.chineseName
  };
}

function filipinoPracticeError_(code) {
  return {
    ok: false,
    code: code,
    message: FILIPINO_REGISTRATION_MESSAGE_
  };
}

function filipinoNormalizeEmployeeId_(value) {
  return String(value || '').trim();
}

/*
Integration into the EXISTING doPost after its JSON payload is parsed:

  const practiceResult = handleFilipinoPracticeAction_(payload);
  if (practiceResult !== null) {
    return ContentService
      .createTextOutput(JSON.stringify(practiceResult))
      .setMimeType(ContentService.MimeType.JSON);
  }

Do not replace the existing doPost or deployment ID.
*/
