# W601｜第一堂60題 Apps Script 隔離安裝說明

狀態：候選程式已整理；尚未安裝、未執行測試、不得視為正式上線。

## 安裝材料
- INSTALL-Course1Backend.gs：整合裝置驗證、60題答案判斷、practiceEvent 寫入。
- FilipinoPractice01.html：內含60題原始題庫、雙語版型與答題事件送出。

## 安裝方式（僅在現有綁定的 Apps Script 專案內）
1. 新增指令碼檔 Course1Backend.gs，貼入 INSTALL-Course1Backend.gs 全文；不要覆蓋現有 Code.gs。
2. 新增 HTML 檔 FilipinoPractice01，貼入同名候選 HTML 全文。
3. 在既有 doGet(e) 之中，既有 page=filipino-admin 等分支之後、action 判斷之前，加入：

```javascript
if (e && e.parameter && e.parameter.page === 'filipino-practice01') {
  return HtmlService.createHtmlOutputFromFile('FilipinoPractice01')
    .setTitle('Course 1 Practice｜第一堂習題庫');
}
```

4. 儲存後只用 /dev?page=filipino-practice01&employeeId=999998 進行測試；須使用原先完成綁定的相同瀏覽器。請先確認測試員工 999998 仍為 ACTIVE。
5. 第一題作答後，檢查 PracticeEvents 新增 ANSWER 事件，再核對管理員答題數。

## 尚未完成的 Gate
- 原登記頁 Start 成功後尚未自動導向習題頁，需接合後才是完整流程。
- 中斷續答尚未完成；重新整理會重新開始，不能把目前候選版當成完整續答功能。
- ROUND_COMPLETE 事件尚未接合。
- 測試前應檢查所有 HTML JS 解析及 DOM 元件完整，實際答題寫入尚未驗收。
- 正式版 GitHub Pages 的習題入口仍是舊的獨立練習頁，未更動。

## 安全說明
- 瀏覽器儲存的隨機 token 只是裝置識別，不是硬體驗證；被複製後仍可能冒用。
- 練習題與答案為公開教材，答題統計不應視為防作弊的正式考試成績。
- 每題寫入時既有 practiceEvent 再檢查 ACTIVE 綁定；不可只相信前端畫面。
