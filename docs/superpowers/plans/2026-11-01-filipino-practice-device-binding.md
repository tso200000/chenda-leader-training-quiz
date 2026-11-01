# Filipino Practice Identity & Device Binding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add one-time learner registration, one-employee/one-device binding, external-browser QR entry, resumable practice, and manager-only unbind/statistics for Filipino practice banks.

**Architecture:** Keep the existing GitHub Pages + Apps Script + Google Sheets architecture. Introduce one shared learner identity client used by all Filipino practice pages, while Apps Script owns EmployeeMaster lookup, atomic binding enforcement, practice event storage, and admin unbind. Course 1 is the first live consumer; future Course 2-6 practice pages reuse the same client contract.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner, Google Apps Script, Google Sheets.

**Spec:** docs/superpowers/specs/2026-11-01-filipino-practice-device-binding-design.md

## Global Constraints
- One Employee ID may have only one ACTIVE device binding.
- Only administrators may release a binding.
- Learners must not see DeviceToken, device-lock wording, or unbind controls.
- Names come from EmployeeMaster; learners do not type or edit names.
- No hardware IDs, LINE identity, or browser fingerprinting.
- Practice history survives administrator-approved rebind.
- LINE QR entry uses openExternalBrowser=1.
- Do not create fake Course 2-6 practice pages before real question banks exist.
- Page opens do not count as practice effort.

## Review Focus
- Two near-simultaneous first registrations for same Employee ID must not create two ACTIVE bindings.
- Clearing browser storage must not delete history; new token stays blocked until admin releases prior binding.
- Network retry of one ANSWER event must not double-count.
- Returning to Course 1 after leaving for LINE must resume at next unanswered question.
- Already-bound learner error must not reveal DeviceToken or admin internals.

---

### Task 1: Shared learner identity client

**Files:**
- Create: tests/filipino-practice-identity.test.js
- Create: filipino-practice-identity.js

**Interfaces:**
- PracticeIdentity.getDeviceToken()
- PracticeIdentity.lookupEmployee(employeeId)
- PracticeIdentity.register(employeeId)
- PracticeIdentity.getCurrentIdentity()
- PracticeIdentity.clearCachedIdentity()
- Cached identity: employeeId, englishName, chineseName

- [ ] Write failing tests for one opaque token, reuse on reload, no fingerprinting, and token only sent to identity endpoints.
- [ ] Run: node --test tests/filipino-practice-identity.test.js and verify RED.
- [ ] Implement minimal shared identity module using crypto.randomUUID when available plus random fallback.
- [ ] Run test and verify GREEN.
- [ ] Commit: feat: add shared Filipino learner identity client

### Task 2: EmployeeMaster and atomic binding backend

**Files:**
- Modify Apps Script project 1Jf98B_F3LI68MNsdRwahd7g1jmzeJ-_g_NxQ34WX5ahPiWggT3TClzVd / Code.gs
- Add Google Sheet tabs EmployeeMaster and PracticeDeviceBindings to spreadsheet 1LcfHM6I1cltMhKAcXFG0Kb9nHCnYw-aw3ZCSxvmhsQs
- Create: tests/filipino-practice-backend-contract.test.js

**Interfaces:**
- employeeLookup request: employeeId
- practiceRegister request: employeeId, deviceToken
- practiceIdentity request: deviceToken
- success identity: ok, employeeId, englishName, chineseName
- already-bound rejection never returns the existing DeviceToken

- [ ] Write failing contract tests for action names, required fields, ACTIVE rule, learner-safe error, and one-active-binding rule.
- [ ] Run tests and verify RED.
- [ ] Add EmployeeMaster headers: EmployeeID, EnglishName, ChineseName, Status.
- [ ] Add PracticeDeviceBindings headers: EmployeeID, DeviceToken, BoundAt, LastSeenAt, Status, ReleasedAt, ReleasedBy.
- [ ] Implement lookup and registration with Apps Script LockService.getScriptLock around check-and-create.
- [ ] Verify unknown ID, INACTIVE ID, first binding, same-device repeat, and different-device rejection.
- [ ] Commit repository contract tests/docs.

### Task 3: Independent first-time registration page

**Files:**
- Create: filipino-practice-register.html
- Modify: filipino-practice-identity.js
- Create: tests/filipino-practice-register.test.js

**Interfaces:**
- Uses lookupEmployee and register.
- On success saves identity and returns to filipino-leader-training.html.

- [ ] Write failing page tests: only Employee ID editable; English/Chinese names read-only; lookup fills both; no device/binding/unbind wording.
- [ ] Run tests and verify RED.
- [ ] Implement bilingual English-first/Chinese-below registration UX.
- [ ] Run tests and verify GREEN.
- [ ] Commit: feat: add Filipino first-time practice registration

### Task 4: QR registration entry on training home

**Files:**
- Modify: filipino-leader-training.html
- Create: tests/filipino-training-registration-entry.test.js

**Interfaces:**
- One QR/first-time registration card targets filipino-practice-register.html?openExternalBrowser=1.

- [ ] Write failing test for QR entry, external-browser parameter, bilingual instructions, and Chrome/Safari fallback.
- [ ] Run tests and verify RED.
- [ ] Add QR card in top information area without changing the six-course layout.
- [ ] Run tests and verify GREEN.
- [ ] Commit: feat: add practice registration QR entry

### Task 5: Apply shared identity to Course 1 practice

**Files:**
- Modify: filipino-practice01.html
- Modify: filipino-practice-identity.js
- Create: tests/filipino-practice01-identity.test.js

**Interfaces:**
- Uses current identity and backend practiceIdentity.
- Shows read-only Employee ID, English name, Chinese name.

- [ ] Write failing tests for shared module load, unregistered redirect, auto-filled identity, and no unbind/device controls.
- [ ] Run tests and verify RED.
- [ ] Implement backend-validated identity gate.
- [ ] Run tests and verify GREEN.
- [ ] Commit: feat: identify learners in Filipino practice

### Task 6: Resumable Course 1 and practice events

**Files:**
- Modify: filipino-practice01.html
- Modify Apps Script Code.gs
- Add Google Sheet tab PracticeEvents
- Create: tests/filipino-practice-resume.test.js
- Create: tests/filipino-practice-events.test.js

**Interfaces:**
- Local progress key combines course + employee ID.
- practiceEvent fields: eventId, employeeId, courseId, eventType, questionNo, isCorrect, occurredAt, practiceRoundId.
- Event types: ANSWER, ROUND_COMPLETE.

- [ ] Write failing tests for save-after-answer, resume, one ROUND_COMPLETE per round, and EventId idempotency.
- [ ] Run tests and verify RED.
- [ ] Add PracticeEvents headers.
- [ ] Implement local progress save after every locked answer.
- [ ] Implement idempotent backend event write.
- [ ] Run tests and verify GREEN.
- [ ] Commit: feat: resume and track Filipino practice

### Task 7: Manager-only binding and practice statistics

**Files:**
- Modify: leader-admin.html
- Modify Apps Script Code.gs
- Create: tests/filipino-practice-admin.test.js

**Interfaces:**
- adminPracticeOverview
- adminReleasePracticeDevice
- Overview row: employeeId, englishName, chineseName, bindingStatus, boundAt, lastSeenAt, activeDays, answeredQuestions, completedRounds, correctRate, lastPractice.
- Release uses employeeId and preserves PracticeEvents.

- [ ] Write failing tests for overview fields, effort signals, confirmation before release, and history preservation.
- [ ] Run tests and verify RED.
- [ ] Implement backend aggregation and release by marking binding RELEASED, not deleting it.
- [ ] Add management-center UI behind existing admin login.
- [ ] Run tests and verify GREEN.
- [ ] Commit: feat: manage Filipino practice devices and effort

### Task 8: Full verification and owner UAT

- [ ] Run: node --test tests/*.test.js; expect 0 failures.
- [ ] Scan real QR from LINE and confirm registration opens in external browser; fallback instruction stays visible if handoff is ignored.
- [ ] UAT binding: device A registers; A auto-recognizes; device B is blocked; admin releases; B registers; history remains.
- [ ] UAT interruption: answer several Course 1 questions, switch to LINE, return, close/reopen browser, and confirm progress resumes.
- [ ] Verify answered questions, completed rounds, active days, correct rate, and last activity match UAT; no page-open metric.
- [ ] Update existing Apps Script deployment version without changing Deployment ID, then deploy GitHub Pages.
- [ ] Owner accepts classroom QR flow and admin unbind before future Course 2-6 practice pages inherit the shared module.
