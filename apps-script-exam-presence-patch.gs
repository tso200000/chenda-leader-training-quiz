// 晨達｜總會考跨裝置考生連線狀態補丁
// 待合併到現役 Apps Script；此檔不會自行部署。
// 請勿把 Presence 寫進正式 Responses 成績分頁。

const PRESENCE_SHEET_NAME = 'ExamPresence';

function handleExamPresenceUpdate_(body) {
  const examId = String(body.examId || 'FINAL40').trim();
  const code = String(body.code || '').trim();
  const name = String(body.name || '').trim();
  if (!code || !name) return { ok:false, error:'code/name required' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(PRESENCE_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(PRESENCE_SHEET_NAME);
    sh.appendRow(['examId','code','name','question','total','state','lastSeen','startedAt']);
  }

  const values = sh.getDataRange().getValues();
  let row = 0;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === examId && String(values[i][1]) === code) {
      row = i + 1;
      break;
    }
  }

  const now = new Date();
  const record = [
    examId,
    code,
    name,
    Number(body.question) || 1,
    Number(body.total) || 40,
    String(body.state || 'active'),
    now,
    body.startedAt || now
  ];

  if (row) sh.getRange(row,1,1,record.length).setValues([record]);
  else sh.appendRow(record);

  return { ok:true, lastSeen:now.toISOString() };
}

function readExamPresence_(examId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(PRESENCE_SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) return { ok:true, rows:[] };

  const rows = sh.getRange(2,1,sh.getLastRow()-1,8).getValues()
    .filter(r => String(r[0]) === String(examId || 'FINAL40'))
    .map(r => ({
      examId:r[0],
      code:r[1],
      name:r[2],
      question:r[3],
      total:r[4],
      state:r[5],
      lastSeen:new Date(r[6]).toISOString(),
      startedAt:r[7]
    }));

  return { ok:true, rows };
}

// 現役 doPost(e) 解析 body 後，加入：
// if (body.action === 'examPresenceUpdate') {
//   return jsonOutput_(handleExamPresenceUpdate_(body));
// }
//
// 現役 doGet(e) 最前面加入：
// if ((e.parameter.action || '') === 'examPresence') {
//   return jsonOutput_(readExamPresence_(e.parameter.examId || 'FINAL40'));
// }
//
// 若現役程式沒有共用 JSON 回應函式，可使用：
function examPresenceJson_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
