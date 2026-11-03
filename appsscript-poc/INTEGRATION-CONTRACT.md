# W601｜第一堂60題 Apps Script 接合契約（隔離候選）

狀態：INTEGRATION_PENDING。此文件不代表功能已部署或驗收。

## 已查證
- 原始題庫：filipino-practice01-data.js，60題，含英文/中文題幹、選項、答案與解析。
- 原始練習頁：filipino-practice01.html，純前端 index/correct/locked，尚未記錄 PracticeEvents。
- Apps Script HtmlService 首次登記頁可透過 google.script.run 呼叫 filipinoRegisterBridge。
- PracticeDeviceBindings 已驗收雙向裝置綁定、解除、重新登記。
- 隔離 HTML 候選：appsscript-poc/FilipinoPractice01.html，目前刻意鎖定。

## 必須核對的現役契約
1. practiceIdentity(p) 的成功/失敗 JSON 格式、是否驗證 ACTIVE 裝置、是否核對 EmployeeMaster 狀態。
2. practiceEvent(p) 的成功/失敗格式、eventId 去重、courseId、eventType、questionNo、isCorrect、occurredAt、practiceRoundId 驗證及是否防止未綁定寫入。
3. doGet(e) 新增 page=filipino-practice01 前，需確保原有 exampresence/leaderboard/stats 不受影響。
4. PracticeEvents 中是否有既有事件與重複事件規則。

## 安全與可靠性要求
- 在 Apps Script 的 server wrapper 裡檢查每個事件的 ACTIVE 裝置綁定；不要信任單獨傳來的 employeeId 或 isCorrect。
- 答案正確與否應以後端受控的題庫答案判定；目前 GitHub 題庫是公開的，練習統計僅供學習參考，不作正式考試或防作弊證據。
- eventId 在前端送出前產生並保留，失敗重試使用相同 ID，避免重複計數。
- 答題寫入成功才可允許下一題；失敗顯示重試，不得假稱已記錄。
- 重新整理後以已確認的伺服器端事件恢復進度，切勿只靠 localStorage 當作權威紀錄。
- 解除綁定後，舊裝置不能繼續寫入；重新綁定後的 session 應重新核對。
- GitHub 原始題庫與正式考試保持不動，先在 /dev 測試。

## 下一個 Gate
讀取現役 Code.gs 的 practiceIdentity 與 practiceEvent 完整函式，再編寫 server bridge、HTML event adapter 與恢復流程；沒有函式正文之前不得推測或上線。
