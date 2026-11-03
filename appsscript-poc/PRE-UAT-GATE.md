# W601｜第一堂60題整合安裝前 Gate

狀態：NOT READY FOR UAT。僅隔離分支程式，尚未部署。

## 已完成
- INSTALL-Course1Backend-WithResume.gs 合併驗證、答題事件、續答讀取。
- FilipinoPractice01.html 已接裝置驗證、逐題送出、失敗重試、伺服器續答。
- GitHub 題庫60題結構核對完成。

## 必須先修正的缺口
1. 「重新練習」產生新輪次後，若還未答第一題就重新整理，後端只看最新 ANSWER，會錯誤恢復上一輪。須有可靠的輪次開始紀錄或等效伺服器權威狀態。
2. 最後一題完成尚未記錄 ROUND_COMPLETE，管理統計的完整輪次可能不準。
3. 需要檢查 Apps Script HtmlService 不同頁面之間 localStorage 的 token 是否可用；不能假設 GitHub Pages 的 localStorage 自動與 script.google.com 共用。
4. 需驗證 practiceEvent 接受 FILIPINO_C01 / ANSWER 的精確欄位格式與重複事件回傳；若回傳 duplicate 未明示，前端不能假稱去重成功。
5. 必須進行 HTML JavaScript 語法檢查與真實 /dev 驗收；靜態字串檢查不等於 PASS。
6. 在正式部署前，移除或限制測試函式，並避免讓測試資料混入正式11位統計。

## 驗收順序
A. 用999998已綁定裝置進入頁面；B. 答第一題並核對 PracticeEvents；C. 重整續答第二題；D. 網路失敗同事件重試；E. 60題完成與重新開始；F. 管理員統計。

## 禁止事項
不得直接把隔離版改成正式入口；不得宣稱已可上線；不得因有回傳 ok 就省略 Google Sheet 核對。
