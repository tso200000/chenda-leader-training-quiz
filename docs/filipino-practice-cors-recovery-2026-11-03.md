# W601｜菲律賓幹部習題｜CORS 修復與通訊整合（2026-11-03）

## 已驗證的問題
- GitHub Pages 上的預覽登記頁對 Google Apps Script /exec 使用 fetch POST。
- Edge Console 顯示 CORS policy、preflight 與缺少 Access-Control-Allow-Origin。
- 在瀏覽器直接開啟 /exec 的 GET 健康檢查成功，不代表跨網域 JavaScript 可以讀取 POST 回應。
- 改為 text/plain 仍無法解決：不能把這當作已修復。
- Apps Script 現役部署第14版；EmployeeMaster、PracticeDeviceBindings、PracticeEvents 已存在。
- EmployeeMaster 有 999999 / TEST EMPLOYEE / 測試員工 / ACTIVE 的臨時測試資料。

## 決策
優先採用 Apps Script HtmlService 作為「登記、習題、管理」的執行頁來源，使用 google.script.run 呼叫同一 Apps Script 專案中的伺服器函式，避免 GitHub Pages → Apps Script 跨網域 fetch。GitHub Pages 僅作導覽與課程入口；正式考試主線維持原狀。

### 必須先處理的安全條件
- HtmlService 頁面可能對所有人開放，不能直接暴露可無授權執行的 admin* 函式。
- 將伺服器端函式設計為單一受控入口，管理動作需驗證現有管理員 token；不能依賴隱藏前端按鈕。
- 不能只相信前端傳入的 employeeId、deviceToken 或答題正確與否；至少要核對 ACTIVE 綁定。練習數據是活動指標，不應宣稱可防止有意偽造。
- 工號查詢屬於人員資料，必須避免公開可批次枚舉姓名；需限制查詢、評估適當授權與告知用途。
- 維持「一個工號一個瀏覽器儲存的隨機識別碼」，這不是硬體裝置 ID；清除瀏覽器資料後需管理員解除才可重新登記。
- 不要使用 JSONP 執行寫入、CORS 停用、no-cors 不透明回應、未驗證的第三方代理。

## 實作階段
1. **核對現役 Code.gs**：只從已儲存的第14版正文取得 doGet/doPost、管理 token、EmployeeMaster/PracticeDeviceBindings/PracticeEvents 的現役函式名稱及資料格式；不可拿舊 GitHub 補丁直接覆蓋。
2. **建立 Apps Script HtmlService 頁面**：從現役 doGet 增加獨立的 page=filipino-register 路由（不影響原有 GET），由 HtmlService 載入註冊 HTML。
3. **受控 google.script.run 橋接**：建立 server wrapper，對 employeeLookup、practiceRegister、practiceIdentity、practiceEvent 逐一驗證；管理功能另外驗證現有 token。客戶端加入 success/failure handler、逾時與顯示訊息。
4. **課程入口**：GitHub Pages QR 改指向正式 Apps Script HtmlService 登記網址，並保留 LINE 開外部瀏覽器的可用路徑；必須用真實手機掃碼驗收。
5. **練習頁**：將第一堂60題現有題庫、答題 UI 與續答邏輯遷移至 HtmlService（或先驗證可行的同源橋接）；不能讓練習事件繼續使用會被 CORS 阻擋的 fetch。
6. **管理後台**：將練習統計與解除裝置入口接上受保護的 server wrapper；原台籍管理中心不得破壞。
7. **驗收**：空白/不存在工號、999999 自動帶姓名、首次登記、同瀏覽器再訪、第二裝置拒絕、答題續答、事件去重、統計、管理員解除與歷史保留；另驗證既有總會考與成績不受影響。
8. **清理**：僅在主人驗收後刪除 999999 的測試綁定/事件/名冊，先備份並確認範圍。

## 部署 Gate
- 在完成步驟1～3前，禁止修改現役第14版。
- 先以隔離測試部署/網址驗證 HtmlService，再核准正式部署。
- 所有測試必須有實際執行證據；程式碼存在或單純語法 PASS 不等於手機實測 PASS。
