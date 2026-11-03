# W601｜第一堂60題｜V2 一次安裝與實機驗收

狀態：ISOLATED_CANDIDATE／模擬測試 PASS／現役 Apps Script 尚未安裝。

## 安裝材料（僅此兩份，勿同時安裝舊候選）
1. Course1BackendV2.gs：工號裝置驗證、ROUND_START、ANSWER、ROUND_COMPLETE、去重、答案核對、續答。
2. FilipinoPractice01V2.html：60題雙語練習頁、儲存重試、續答、重新練習。

**不可**同時安裝舊的 Course1Combined.gs、Course1Resume.gs、Course1Access.gs；同名函式會互相覆蓋。

## 現有 Apps Script 測試專案安裝
1. 在現有 Apps Script 專案新增 Script 檔案 `Course1BackendV2.gs`，貼上候選檔全文。
2. 新增 HTML 檔案 `FilipinoPractice01V2`，貼上候選 HTML 全文。
3. 在現有 `doGet(e)` 中、既有 `page=filipino-register` 與 `page=filipino-admin` 分支之後、`const action=...` 之前新增：

```javascript
if (e && e.parameter && e.parameter.page === 'filipino-practice01-v2') {
  const page = HtmlService.createTemplateFromFile('FilipinoPractice01V2');
  page.employeeId = String(e.parameter.employeeId || '').trim();
  return page.evaluate().setTitle('Course 1 Practice｜第一堂習題庫');
}
```

4. 只儲存，使用既有 /dev 測試部署，不要更新 /exec 正式部署。
5. 使用原本完成 999998 綁定的**相同瀏覽器**開啟：
`https://script.google.com/macros/s/AKfycbyPyfqy4LwAkusw3iSPBWvj37ofItV604kcTQMS5zg/dev?page=filipino-practice01-v2&employeeId=999998`
6. 若顯示「請先在此瀏覽器完成登記」，代表 HtmlService 不同頁面之間無法讀取同一個 localStorage token；先停止，不要把 token 放入網址。應改用受控同源 session 機制後再測。
7. 用 999998 答第一題，核對 PracticeEvents 新增 ROUND_START 和 ANSWER 兩筆，再重整看是否從第二題繼續。
8. 驗證管理員練習統計的答題數是否增加1；管理頁如未納入新 eventType，需先調整統計規則。
9. 最後測試60題完成、ROUND_COMPLETE、重新練習、網路失敗重試、第二瀏覽器拒絕。

## 重要限制
- 題庫公開，練習統計僅供學習追蹤，不能當正式考試防作弊成績。
- 裝置 token 是瀏覽器儲存的隨機值，不是手機硬體ID。
- 現役 /exec、11位正式員工資料、GitHub 正式習題頁保持不動。
- 不可在未經主人實機驗收前更新正式 QR 或開放正式11人。

## 模擬測試結果（非實機）
- 60題答案索引及題號完整 PASS。
- ROUND_START、ANSWER、去重、錯序拒絕、未授權拒絕、60題完成、ROUND_COMPLETE、重新開始 PASS。
- HTML 最後一段 JavaScript 語法 PASS（測試時以字串取代 Apps Script template scriptlet）。
- 仍待真正 Apps Script /dev 及 Google Sheet 寫入驗收。
