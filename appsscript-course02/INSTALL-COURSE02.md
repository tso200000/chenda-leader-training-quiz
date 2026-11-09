# W601｜第二堂60題｜Apps Script 測試安裝說明

狀態：ISOLATED_CANDIDATE，程式語法檢查通過，尚未安裝及實機驗收。

## 材料
- Course2BackendV2.gs：第二堂後端；課程代碼 FILIPINO_C02。
- FilipinoPractice02V2.html：第二堂60題英中雙語習題頁。

## 與第一堂共存
第二堂使用 c2 前綴的私有輔助函式與 filipinoCourse2 前綴的公開函式，避免覆蓋第一堂 c1 / filipinoCourse1 函式。兩堂共用既有 EmployeeMaster、PracticeDeviceBindings、PracticeEvents 與管理員總覽。

## 安裝步驟（測試版）
1. 在現有 Apps Script 專案新增指令碼 Course2BackendV2，貼上後端全文。
2. 新增 HTML FilipinoPractice02V2，貼上 HTML 全文。
3. 在現有 doGet(e) 的 page 分支中加入以下入口，保留原有分支：

```javascript
if (e && e.parameter && e.parameter.page === 'filipino-practice02-v2') {
  const page = HtmlService.createTemplateFromFile('FilipinoPractice02V2');
  page.employeeId = String(e.parameter.employeeId || '').trim();
  return page.evaluate().setTitle('Course 2 Practice｜第二堂習題庫');
}
```

4. 儲存，使用既有 /dev 測試部署；不要更新 /exec 正式部署。
5. 用原先綁定的同一瀏覽器與測試工號 999998 開啟：
https://script.google.com/macros/s/AKfycbyPyfqy4LwAkusw3iSPBWvj37ofItV604kcTQMS5zg/dev?page=filipino-practice02-v2&employeeId=999998
6. 第一題寫入後，核對 PracticeEvents 的 CourseId=FILIPINO_C02、EventType=ROUND_START/ANSWER，確認管理員答題數增加。
7. 重新整理，驗證從第二題續答；再驗證錯序拒絕、重試去重、整輪完成與重新練習。

## 上線 Gate
- GitHub 第二堂獨立習題庫與首頁入口已提交，但該頁目前不需裝置登記，也不會寫入 PracticeEvents。
- 只有第二堂 Apps Script /dev 實機驗收成功，才能考慮將正式入口導向受控練習流程。
- 不要把未驗收的 /dev 網址交給正式11位幹部。
- 兩堂的完整練習資料共用同一張 PracticeEvents，管理員統計可能需要按課程分開呈現，須另外驗收。
