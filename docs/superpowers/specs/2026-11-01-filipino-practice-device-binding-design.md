# Filipino Practice Identity & Device Binding Design

**Date:** 2026-11-01

## Intent
The Filipino shift-leader practice banks should record who is actually practicing without making workers manage a visible device-binding system. The first class establishes identity once; later practice sessions recognize the same learner automatically, preserve progress when interrupted, and let managers see trustworthy practice effort.

## Goals
- One independent first-time practice registration page shared by all six Filipino training courses.
- Learner enters only Employee ID; English name and Chinese name come from backend EmployeeMaster.
- First successful registration binds one Employee ID to one opaque browser/device token.
- Binding mechanics stay invisible to learners.
- Only administrators can release a binding.
- All current/future Filipino practice banks reuse the same identity.
- LINE QR entry requests the external mobile browser.
- Practice progress saves after every answered question and can resume after interruption.
- Track active practice days, answered questions, completed rounds, correct answers/rate, and last activity.

## Non-goals
- No IMEI, Android ID, MAC address, phone serial number, LINE identity, or browser fingerprinting.
- No learner self-unbind.
- No page-open-count ranking.
- Do not invent Course 2-6 practice pages before their actual question banks/pages exist.

## Approved Architecture
1. Training home exposes a prominent first-time registration QR section.
2. QR target is the shared registration page URL with openExternalBrowser=1.
3. Registration page creates/reads one opaque random browser token and asks only for Employee ID.
4. Backend looks up Employee ID in EmployeeMaster and returns English + Chinese names.
5. On confirmation, backend atomically enforces one Employee ID = one active device token.
6. Browser stores only the opaque token and cached display identity; backend remains source of truth.
7. All practice pages call the same shared identity module. Valid token auto-fills Employee ID / English name / Chinese name as read-only.
8. Only management center can release an active binding; release never deletes practice history.
9. Practice progress saves locally after every answered question and synchronizes practice events to backend.
10. Practice history stays keyed to Employee ID so manager-approved rebind preserves history.

## Data Model

### EmployeeMaster
Columns: EmployeeID, EnglishName, ChineseName, Status.
Only ACTIVE may register.

### PracticeDeviceBindings
Columns: EmployeeID, DeviceToken, BoundAt, LastSeenAt, Status, ReleasedAt, ReleasedBy.
Only one ACTIVE binding per EmployeeID.

### PracticeEvents
Columns: EventId, EmployeeID, CourseId, EventType, QuestionNo, IsCorrect, OccurredAt, PracticeRoundId.
EventType: ANSWER or ROUND_COMPLETE.
Retries must be idempotent by EventId.

## Learner UX
First-time page:
- Employee ID editable.
- English Name read-only and auto-filled.
- Chinese Name read-only and auto-filled.
- Confirm/Start button.
- No visible wording about device locking.

Practice identity strip:
- Employee ID
- English Name
- Chinese Name
All read-only and auto-filled.

If another device tries the same Employee ID, show only a generic message asking the learner to contact the training administrator.

## Management UX
Show Employee ID, English Name, Chinese Name, binding status, bound date, last seen, practice days, answered questions, completed rounds, correct rate, last practice, and an administrator-only 解除裝置 action.
Unbind requires confirmation and does not delete PracticeEvents.

## Practice Ranking
Do not rank by page-open count.
Primary effort signals:
1. active practice days
2. answered questions
3. completed rounds
Correct rate is learning quality, not effort by itself.

## LINE / Browser Requirement
QR points to the normal web registration URL using openExternalBrowser=1, so LINE requests an external browser rather than keeping the session inside LINE's in-app browser. Registration page also shows a fallback instruction to open in Chrome/Safari if needed.

## Success Criteria
- First-time learner enters one Employee ID and sees correct English + Chinese names from EmployeeMaster.
- First successful registration creates exactly one active device binding.
- Same device returns without re-entering identity.
- Different device cannot register same Employee ID until admin releases binding.
- Learner pages never expose DeviceToken or unbind controls.
- Management center can release binding without deleting history.
- Current Course 1 practice can be interrupted and resumed without losing answered-question progress.
- Shared identity code is reusable by Course 2-6 when their practice pages are created.
- Practice statistics reflect actual answered questions/completed rounds, not page visits.
