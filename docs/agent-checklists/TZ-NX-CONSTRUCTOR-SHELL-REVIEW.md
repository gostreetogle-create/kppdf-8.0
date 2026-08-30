# TZ-NX-CONSTRUCTOR-SHELL-REVIEW checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-CONSTRUCTOR-SHELL-REVIEW.done.md`
> Mode: **analysis-only** — no product code changed.

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T18:18:38Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `_NOW.md` + `tasks/_active/` — no conflicting claim on constructor/shell keys at start
- [x] `tasks/_archive/2026-08/TZ-NX-CONSTRUCTOR-SHELL.done.md` read in full
- [x] `docs/pages/constructor.page.md` read in full
- [x] All 8 files under `frontend-nx/apps/kppdf-web/src/app/pages/constructor/**` read in full
- [x] `app.routes.ts` (nx) + legacy `frontend/src/app/app.routes.ts` (collision check) read
- [x] `nav-categories.ts` + `app-shell.component.ts` + `app-shell-constructor-nav.spec.ts` read
- [x] `tasks/TZ-NX-SHELL-CANON.md` (living canon) read in full, cross-checked
- [x] Paper & Ink primitives used by constructor pages read (`card`, `button`, `status-banner`,
      `pi-page-chrome`) to verify input contracts and click/event semantics
- [x] `docs/pages/PAGE-TZ-INDEX.md` entry for constructor verified; legacy routes grepped for
      `/constructor` path collisions (none — legacy `doc-constructor/*` is unrelated)
- [x] Claim slot filled; `tasks/_active/TZ-NX-CONSTRUCTOR-SHELL-REVIEW.md` on disk

## Acceptance

- [x] Route matrix / create-kind list / no-Complex claims verified against live code
- [x] Shell canon (header-nav classification, no rails/sidebar change) verified
- [x] Visual/UX check
- [x] Dead-link check (nav filter, PAGE-TZ-INDEX, legacy route collision)
- [x] Accessibility check beyond existing `constructor-a11y.spec.ts` coverage
- [x] Paper & Ink token compliance check
- [x] Stale active claim check
- [x] Findings split PASS / BLOCKER / P1 / P2 with exact file:line
- [x] No product code changed

## Integrity slot

- [x] Тип изменения: analysis-only (docs/archive)
- [x] FIC §A–E: N/A — no product behavior changed by this review
- [x] page.md / PAGE-TZ-INDEX: N/A — no UI route added/changed by this review
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys: read-only review, no files under
      `frontend/**`/`backend/**`/`frontend-nx/**` touched
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- Analysis-only — no build/test/lint run, no code changed. `git status --short` after work shows
  changes only under `tasks/**` and `docs/agent-checklists/**`.

## Auditor report

Full findings in `tasks/_archive/2026-08/TZ-NX-CONSTRUCTOR-SHELL-REVIEW.done.md`. Headline: the
delivery is structurally sound and matches its own acceptance criteria (route matrix, 4 create
kinds, no Complex, header chip, canon-compliant shell integration), but review found **one
BLOCKER** — the placeholder page's "← К выбору типа" back button
(`constructor-create-placeholder.page.ts:65-68`) does not navigate when clicked, because
`ButtonComponent.onClick()` (`button.component.ts:117`) unconditionally calls
`event.stopPropagation()`, which prevents the click from ever reaching the wrapping
`<a routerLink="/constructor">`'s own RouterLink click handler. The existing test suite does not
catch this because it only asserts the anchor's `href` attribute, never dispatches a real click.
Also found one **P1** accessibility regression (`aria-labelledby` pointing at an element that only
exists in one `@if` branch) and several **P2** polish items. **Outcome: PASS with a blocker to
fix before this is considered production-ready** (see report for exact remediation and next
Cursor-prompt additions).

## Closeout

- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T18:18:38Z
