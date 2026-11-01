# Training Admin Final Results Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the management center cover all completed course exams plus FINAL40, and persist FINAL40 results to the existing backend.

**Architecture:** Keep the current static GitHub Pages + Apps Script architecture. Extend the shared course registry and final-exam POST payload; reuse existing admin endpoints and page components rather than creating a second result system.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner, Google Apps Script backend.

**Spec:** `docs/superpowers/specs/2026-11-01-training-admin-final-results-design.md`

## Global Constraints
- Do not change exam question content or correct answers.
- Preserve combined C04 (Course 4+7) and C05 (Course 5+6) identities.
- FINAL40 is a separate courseId.
- Keep the existing Apps Script deployment URL/ID.
- Preserve all historical result rows.
- Use existing page visual language.

## Review Focus
- FINAL40 submit must POST exactly once per final submission and include code/name/date/score/correct/total/answers.
- Combined C04/C05 must not duplicate historical results as separate course rows.
- Course 8 must route to course08.html and C08 statistics.
- FINAL40 stats must degrade cleanly when no domain metrics exist.
- CSV must not lose older rows and must include FINAL40/name when present.

---

### Task 1: Expand shared course/result registry

**Files:**
- Modify: `course-context.js`
- Test: `tests/multi-course-management.test.js`
- Test: `tests/course-open-status.test.js`

**Interfaces:**
- Produces: CourseContext entries for C01/C02/C03/C04/C05/C08/FINAL40.

- [ ] **Step 1: Write failing tests**
  Assert management links contain C04, C05, C08, FINAL40; C04/C05 labels identify combined courses; C08 routes to course08.html; FINAL40 routes to leader-final-exam.html.

- [ ] **Step 2: Run tests and verify RED**
  Run: `node --test tests/multi-course-management.test.js tests/course-open-status.test.js`

- [ ] **Step 3: Implement minimal registry/admin-status changes**
  Extend CourseContext and set completed/open teaching course state without duplicating C06/C07 result identities.

- [ ] **Step 4: Run tests and verify GREEN**

- [ ] **Step 5: Commit**
  `git commit -m "feat: expose all completed training results"`

### Task 2: Persist FINAL40 submissions

**Files:**
- Modify: `leader-final-exam.html`
- Create/Test: `tests/leader-final-exam-results.test.js`

**Interfaces:**
- Produces: one POST payload with `courseId: 'FINAL40'` after score calculation.

- [ ] **Step 1: Write failing test**
  Assert the final exam contains an Apps Script POST on submit with FINAL40, employee ID/name, local date, score, correct, total=40, answers, startedAt, finishedAt.

- [ ] **Step 2: Run test and verify RED**

- [ ] **Step 3: Implement minimal async result POST**
  Keep Presence finish logic independent; score display still works even if result POST fails, but show a clear backend-recording status.

- [ ] **Step 4: Run test and verify GREEN**

- [ ] **Step 5: Commit**
  `git commit -m "feat: save final exam results"`

### Task 3: Update management tools for FINAL40 and all completed courses

**Files:**
- Modify: `leader-admin.html`
- Modify: `stats.html`
- Modify: `leaderboard.html`
- Test: `tests/multi-course-management.test.js`
- Test: `tests/course-open-status.test.js`
- Create/Test: `tests/final40-management.test.js`

**Interfaces:**
- Consumes: CourseContext FINAL40 entry and existing Apps Script admin endpoints.
- Produces: management links, FINAL40 list/stat view, CSV with name.

- [ ] **Step 1: Write failing tests**
  Assert all completed result identities appear; admin open count represents 8/8 teaching courses; FINAL40 appears separately; CSV headers include 姓名; stats question-bank loading handles FINAL40 without falling back to C01.

- [ ] **Step 2: Run tests and verify RED**

- [ ] **Step 3: Implement minimal admin/stats/leaderboard changes**
  Add FINAL40 label/route, preserve C04/C05 combined wording, support no-domain FINAL40 aggregate display, and include name in export/list when available.

- [ ] **Step 4: Run tests and verify GREEN**

- [ ] **Step 5: Commit**
  `git commit -m "feat: add final exam management views"`

### Task 4: Full verification

**Files:**
- Verify all repository tests and rendered management flow.

- [ ] **Step 1: Run full suite**
  Run: `node --test tests/*.test.js`
  Expected: 0 failures.

- [ ] **Step 2: Browser QA**
  Flow: leader-admin.html -> login -> completed course rows + FINAL40 tools -> FINAL40 leaderboard/stats -> CSV control.
  Check desktop and mobile where practical, console health, and no broken links.

- [ ] **Step 3: Backend reality check**
  Submit a controlled FINAL40 result only if a safe test identity is available; otherwise verify endpoint behavior without creating fake production score data and report that live write UAT remains owner-run.

- [ ] **Step 4: Final review**
  Confirm no question content changed and no historical course identity was split.
