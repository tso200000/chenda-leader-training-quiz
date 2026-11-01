# Training Admin Final Results Design

**Date:** 2026-11-01

## Intent
All eight training courses and the final comprehensive exam are complete. The management center must stop presenting completed courses as "準備中" and must expose their real results. The final comprehensive exam is especially important and must be stored in the same backend result history so it can be analyzed, listed, and exported.

## Goals
- Show all eight course areas as completed/open in the management center.
- Preserve the existing combined exams: Course 4+7 share C04; Course 5+6 share C05.
- Add Course 8 as C08.
- Add the final comprehensive exam as independent course id FINAL40.
- Persist FINAL40 submissions to the existing Apps Script Responses backend.
- Include FINAL40 in score list and CSV export.
- Provide useful FINAL40 statistics without inventing course-domain metrics that the final exam does not currently store.

## Non-goals
- Do not change any exam questions or answers.
- Do not split the combined C04/C05 historical records.
- Do not change the existing Apps Script deployment URL or Deployment ID.
- Do not delete or migrate historical Responses rows.
- Do not redesign the visual language of the management center.

## Approved Approach
1. Extend the shared course context to include C04, C05, C08 and FINAL40, with labels that reflect combined exams.
2. Update the management dashboard so all eight teaching courses are shown open/completed and FINAL40 appears as a separate results row/tool entry.
3. Update FINAL40 submission to POST its identity and score to the existing Apps Script endpoint.
4. Reuse the existing adminSummary/adminResults/leaderboard/stats backend shape wherever possible. If the existing deployed backend already accepts arbitrary courseId rows, no backend schema migration is introduced.
5. For FINAL40 stats, show aggregate score metrics and question/error analysis only if answer data is available; do not fabricate domain analysis.

## Data Identity
- C01: Course 1
- C02: Course 2
- C03: Course 3
- C04: combined Course 4 + Course 7
- C05: combined Course 5 + Course 6
- C08: Course 8
- FINAL40: 1–8 comprehensive final exam

## FINAL40 Submission
The final exam submission includes:
- course: 總會考｜1～8堂綜合測驗
- courseId: FINAL40
- code: employee ID
- name: employee name
- email: empty
- publicOpt: false
- date: Asia/Taipei local date
- score: correct * 2.5
- correct
- total: 40
- answers
- domains: empty object unless a trustworthy domain mapping is explicitly present
- startedAt
- finishedAt

## UX
Management tools should expose:
- 成績與能力分析: C01, C02, C03, C04(第4、7堂), C05(第5、6堂), C08, FINAL40
- 成績列表: same set
- 全體成績匯出 CSV: includes FINAL40 and includes a 姓名 column when available
- Course overview: eight teaching courses all open/completed; combined-course wording remains clear.

## Success Criteria
- FINAL40 submission appears in backend adminResults.
- FINAL40 leaderboard can show employee ID/name, score, correct/40, date.
- Admin summary no longer labels completed Course 4/7/8 as preparing.
- CSV export includes FINAL40 rows.
- Existing course tests continue to pass; new tests pin the new course set and FINAL40 submission behavior.
