# 現場幹部總會考 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在現場幹部培訓中心加入固定40題總會考正式頁，密碼9876，姓名由考生自行輸入，手機字體放大。

**Architecture:** 新增獨立 `leader-final-exam.html`，沿用既有純 HTML/CSS/JS 架構；首頁總會考卡改為可進入。題目順序固定，作答選項每次考試重新洗牌，答案映射保持正確。

**Tech Stack:** Static HTML/CSS/JavaScript + GitHub Pages

**Spec:** 2026-10-29 本聊天室主人確認之40題母版與Q10/Q20陷阱題。

## Global Constraints
- 40題，每題2.5分，滿分100。
- Q1–Q9、Q11–Q19、Q21–Q40使用已確認原題；情境代稱 A/B/C/D 只改甲/乙/丙/丁。
- Q10、Q20使用已確認陷阱題版本。
- 進頁密碼固定 9876。
- 工號與姓名皆由考生自行輸入；姓名不連動名冊。
- 手機優先可讀；登記、題目、選項字體加大。
- 此階段不做獎狀。

## Tasks
- [ ] 新增總會考頁與40題固定題庫。
- [ ] 實作密碼、登記、作答、選項洗牌、計分、錯題檢視。
- [ ] 更新 `leader-training.html` 總會考入口。
- [ ] 驗證40題、2.5分、密碼、姓名可輸入、手機樣式與入口。
