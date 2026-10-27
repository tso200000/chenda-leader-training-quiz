# Filipino Training Home Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Filipino shift-leader training entry to the platform home, positioned above Chinese Listening Assessment, while keeping the existing local-employee training card unchanged.

**Architecture:** Modify only `index.html`. Keep the existing card visual language. Use a two-column home layout where the left training card remains the primary card, while the right column contains Filipino training above Chinese Listening Assessment.

**Tech Stack:** Static HTML/CSS on GitHub Pages.

**Spec:** Approved in chat on 2026-10-27.

## Global Constraints
- Do not change the existing local-employee 8-course training content.
- Do not change Chinese Listening Assessment behavior or link.
- Filipino entry uses English first, Chinese below.
- Filipino entry links to `filipino-leader-training.html`.
- This step only adds/repositions the homepage entry.

## Review Focus
- Desktop card alignment.
- Mobile stacks cleanly.
- Existing links remain unchanged.
- New Filipino entry appears above listening assessment.
- No course is newly opened.

---

### Task 1: Platform home entry

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: existing `.card`, `.grid`, and training-center link styles.
- Produces: homepage link to `filipino-leader-training.html`.

- [ ] Step 1: Verify current page does not yet use the approved left-primary/right-stack layout.
- [ ] Step 2: Add minimal CSS for left primary card and right stacked column.
- [ ] Step 3: Move the existing Filipino training card above Chinese Listening Assessment in the right column.
- [ ] Step 4: Verify all three entries, ordering, and links.
- [ ] Step 5: Commit.
