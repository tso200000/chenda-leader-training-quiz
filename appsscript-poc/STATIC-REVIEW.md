# W601｜第一堂60題橋接相容性檢查

狀態：STATIC_REVIEW_ONLY／未部署／未執行寫入。

## 已查證
- GitHub 原始題庫共有60題，題號1～60連續且無重複，每題4選項，答案索引均在0～3。
- Course1Bridge.gs 與 Course1Persist.gs 均存在隔離分支。
- Course1Bridge.gs 使用 validatePracticeDevice(id, token)；尚未從現役 Code.gs 完整正文證明該函式存在且回傳布林值。不可直接安裝。
- Course1Persist.gs 使用 practiceEvent({...})，需與現役事件欄位、eventType、courseId 及回傳格式核對。
- HtmlService 候選仍鎖定，尚未接入身份驗證、事件送出、錯誤重試及續答。

## 安裝前必要修正
1. 核對現役 ACTIVE 裝置驗證函式名稱與參數；不憑猜測使用 validatePracticeDevice。
2. 核對 practiceEvent 是否接受 ANSWER／FILIPINO_C01，並確認相同 eventId 重送不會重複計數。
3. 在隔離版實作每題寫入成功才進下一題，失敗保持同一 eventId 重試。
4. 實作中斷後從伺服器事件恢復；不可把 localStorage 當作權威進度。
5. 先用999998測試員工與隔離部署，驗證 PracticeEvents 寫入與管理統計，再開放正式11人。

## 結論
題庫靜態結構 PASS；橋接與現役 Apps Script 相容性 UNKNOWN；不可宣稱已完成接合或可部署。
