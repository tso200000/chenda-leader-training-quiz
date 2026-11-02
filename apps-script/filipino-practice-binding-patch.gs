const FILIPINO_PRACTICE_SPREADSHEET_ID_ = '1LcfHM6I1cltMhKAcXFG0Kb9nHCnYw-aw3ZCSxvmhsQs';
const FILIPINO_EMPLOYEE_SHEET_ = 'EmployeeMaster';
const FILIPINO_BINDING_SHEET_ = 'PracticeDeviceBindings';
const FILIPINO_EVENTS_SHEET_ = 'PracticeEvents';
const FILIPINO_ACTIVE_ = 'ACTIVE';
const FILIPINO_REGISTRATION_MESSAGE_ = 'Registration unavailable. Please contact the training administrator.';

function handleFilipinoPracticeAction_(payload) {
  const action = String((payload && payload.action) || '').trim();
  if (action === 'employeeLookup') return filipinoEmployeeLookup_(payload);
  if (action === 'practiceRegister') return filipinoPracticeRegister_(payload);
  if (action === 'practiceIdentity') return filipinoPracticeIdentity_(payload);
  if (action === 'practiceEvent') return filipinoPracticeEvent_(payload);
  return null;
}


function handleFilipinoPracticeAdminAction_(payload, adminAuthorized) {
  const action = String((payload && payload.action) || '').trim();
  if (action !== 'adminPracticeOverview' && action !== 'adminReleasePracticeDevice') return null;
  if (adminAuthorized !== true) return {ok:false, error:'UNAUTHORIZED'};
  if (action === 'adminPracticeOverview') return filipinoAdminPracticeOverview_(payload);
  if (action === 'adminReleasePracticeDevice') return filipinoAdminReleasePracticeDevice_(payload);
  return null;
}

function filipinoAdminPracticeOverview_() {
  const ss = SpreadsheetApp.openById(FILIPINO_PRACTICE_SPREADSHEET_ID_);
  const employeeSheet = ss.getSheetByName(FILIPINO_EMPLOYEE_SHEET_);
  const bindingSheet = ss.getSheetByName(FILIPINO_BINDING_SHEET_);
  const eventSheet = ss.getSheetByName(FILIPINO_EVENTS_SHEET_);
  if (!employeeSheet || !bindingSheet || !eventSheet) throw new Error('Missing Filipino practice management sheet');

  const employeeRows = employeeSheet.getLastRow() > 1
    ? employeeSheet.getRange(2,1,employeeSheet.getLastRow()-1,4).getValues() : [];
  const bindingRows = bindingSheet.getLastRow() > 1
    ? bindingSheet.getRange(2,1,bindingSheet.getLastRow()-1,7).getValues() : [];
  const eventRows = eventSheet.getLastRow() > 1
    ? eventSheet.getRange(2,1,eventSheet.getLastRow()-1,8).getValues() : [];

  return {ok:true, rows:filipinoBuildPracticeOverview_(employeeRows, bindingRows, eventRows)};
}

function filipinoAdminReleasePracticeDevice_(payload) {
  const employeeId = filipinoNormalizeEmployeeId_(payload && payload.employeeId);
  if (!employeeId) return {ok:false, error:'INVALID_EMPLOYEE_ID'};

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(FILIPINO_PRACTICE_SPREADSHEET_ID_);
    const sheet = ss.getSheetByName(FILIPINO_BINDING_SHEET_);
    if (!sheet) throw new Error('Missing sheet: ' + FILIPINO_BINDING_SHEET_);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return {ok:true, released:0};

    const rows = sheet.getRange(2,1,lastRow-1,7).getValues();
    const now = new Date();
    let released = 0;
    for (let i=0;i<rows.length;i++) {
      const rowEmployeeId = filipinoNormalizeEmployeeId_(rows[i][0]);
      const rowStatus = String(rows[i][4] || '').trim().toUpperCase();
      if (rowEmployeeId !== employeeId || rowStatus !== FILIPINO_ACTIVE_) continue;
      rows[i][4] = 'RELEASED';
      rows[i][5] = now;
      rows[i][6] = 'ADMIN';
      sheet.getRange(i+2,1,1,7).setValues([rows[i]]);
      released++;
    }
    return {ok:true, released:released};
  } finally {
    lock.releaseLock();
  }
}

function filipinoBuildPracticeOverview_(employeeRows, bindingRows, eventRows) {
  const map = {};

  function ensure(employeeId) {
    const id = filipinoNormalizeEmployeeId_(employeeId);
    if (!id) return null;
    if (!map[id]) {
      map[id] = {
        employeeId:id,
        englishName:'',
        chineseName:'',
        bindingStatus:'UNBOUND',
        boundAt:'',
        lastSeenAt:'',
        activeDays:0,
        answeredQuestions:0,
        completedRounds:0,
        correctRate:null,
        lastPractice:'',
        _correctAnswers:0,
        _activeDayMap:{},
        _bindingSort:''
      };
    }
    return map[id];
  }

  (employeeRows || []).forEach(row => {
    const x = ensure(row[0]);
    if (!x) return;
    x.englishName = String(row[1] || '').trim();
    x.chineseName = String(row[2] || '').trim();
  });

  (bindingRows || []).forEach(row => {
    const x = ensure(row[0]);
    if (!x) return;
    const status = String(row[4] || '').trim().toUpperCase();
    const boundAt = filipinoIsoOrBlank_(row[2]);
    const lastSeenAt = filipinoIsoOrBlank_(row[3]);
    const sortKey = boundAt || lastSeenAt || '';
    const isActive = status === FILIPINO_ACTIVE_;
    const currentActive = x.bindingStatus === FILIPINO_ACTIVE_;
    if ((isActive && !currentActive) || (isActive === currentActive && sortKey >= x._bindingSort)) {
      x.bindingStatus = isActive ? FILIPINO_ACTIVE_ : (status || 'UNBOUND');
      x.boundAt = boundAt;
      x.lastSeenAt = lastSeenAt;
      x._bindingSort = sortKey;
    }
  });

  (eventRows || []).forEach(row => {
    const x = ensure(row[1]);
    if (!x) return;
    const eventType = String(row[3] || '').trim().toUpperCase();
    const occurredAt = filipinoIsoOrBlank_(row[6]);
    if (eventType === 'ANSWER') {
      x.answeredQuestions++;
      if (row[5] === true || String(row[5]).toUpperCase() === 'TRUE') x._correctAnswers++;
      const day = filipinoPracticeDay_(row[6]);
      if (day) x._activeDayMap[day] = true;
    } else if (eventType === 'ROUND_COMPLETE') {
      x.completedRounds++;
    }
    if (occurredAt && occurredAt > x.lastPractice) x.lastPractice = occurredAt;
  });

  return Object.keys(map).sort().map(id => {
    const x = map[id];
    x.activeDays = Object.keys(x._activeDayMap).length;
    x.correctRate = x.answeredQuestions
      ? Math.round(x._correctAnswers / x.answeredQuestions * 1000) / 10
      : null;
    delete x._correctAnswers;
    delete x._activeDayMap;
    delete x._bindingSort;
    return x;
  });
}

function filipinoPracticeDay_(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '';
  try {
    return Utilities.formatDate(d, 'Asia/Taipei', 'yyyy-MM-dd');
  } catch (_) {
    return d.toISOString().slice(0,10);
  }
}

function filipinoIsoOrBlank_(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toISOString();
}

function filipinoPracticeEvent_(payload) {
  const eventId = String((payload && payload.eventId) || '').trim();
  const employeeId = filipinoNormalizeEmployeeId_(payload && payload.employeeId);
  const courseId = String((payload && payload.courseId) || '').trim();
  const eventType = String((payload && payload.eventType) || '').trim().toUpperCase();
  const questionNo = payload && payload.questionNo !== undefined && payload.questionNo !== null ? payload.questionNo : '';
  const isCorrect = payload && typeof payload.isCorrect === 'boolean' ? payload.isCorrect : '';
  const occurredAt = String((payload && payload.occurredAt) || '').trim() || new Date().toISOString();
  const practiceRoundId = String((payload && payload.practiceRoundId) || '').trim();

  if (!eventId || !employeeId || !courseId || !practiceRoundId) {
    return filipinoPracticeError_('INVALID_PRACTICE_EVENT');
  }
  if (eventType !== 'ANSWER' && eventType !== 'ROUND_COMPLETE') {
    return filipinoPracticeError_('INVALID_PRACTICE_EVENT');
  }
  if (!filipinoFindActiveEmployee_(employeeId)) {
    return filipinoPracticeError_('EMPLOYEE_NOT_FOUND');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.openById(FILIPINO_PRACTICE_SPREADSHEET_ID_);
    const sheet = ss.getSheetByName(FILIPINO_EVENTS_SHEET_);
    if (!sheet) throw new Error('Missing sheet: ' + FILIPINO_EVENTS_SHEET_);

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const existingEventIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < existingEventIds.length; i++) {
        if (String(existingEventIds[i][0] || '').trim() === eventId) {
          return {ok: true, duplicate: true, eventId: eventId};
        }
      }
    }

    sheet.appendRow([
      eventId,
      employeeId,
      courseId,
      eventType,
      eventType === 'ANSWER' ? questionNo : '',
      eventType === 'ANSWER' ? isCorrect : '',
      occurredAt,
      practiceRoundId
    ]);
    return {ok: true, duplicate: false, eventId: eventId};
  } finally {
    lock.releaseLock();
  }
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

For ADMIN actions, integrate only AFTER the existing admin token/session check has succeeded:

  const practiceAdminResult = handleFilipinoPracticeAdminAction_(payload, true);
  if (practiceAdminResult !== null) {
    return ContentService
      .createTextOutput(JSON.stringify(practiceAdminResult))
      .setMimeType(ContentService.MimeType.JSON);
  }

Never pass true before the existing admin authentication succeeds.
Do not replace the existing doPost or deployment ID.
*/
