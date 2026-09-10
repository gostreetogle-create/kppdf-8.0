# TZ-NX-SHELL-01-IDLE-RAILS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SHELL-01-IDLE-RAILS.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-10T18:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM
- [x] TZ прочитан
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SHELL-01-IDLE-RAILS.md` на месте

### Preflight Check Output

- **Context read:** TZ; `shell-tool-rail.service.ts` (DEFAULT_LEFT/RIGHT fallback); `tool-rail-definitions.ts` (+spec, only consumer is the service+app-shell, safe to delete); `app-shell.component.ts` (full template — 3-col fixed grid, back/forward inside asides); `app-shell.component.spec.ts` (tests to rewrite); `nav-history.service.ts` (back/forward/canGoBack/canGoForward API, unaffected); production-cockpit.page.ts + studio-editor.page.ts (confirm `setTools`/`clear` call sites, effect-based, unaffected by template change); their specs (assert on service signals directly, not `AppShellComponent` DOM — safe); `docs/pages/page-chrome.md` (documents the **legacy** `frontend/` chrome-rail system, not NX — needs a new NX section, not an edit to the legacy prose)
- **Key Constraints:** no disabled placeholder tools; rails DOM-absent when empty; history single SoT in header; production/studio regression must stay green
- **Planned Deliverable:** service default→empty; delete `tool-rail-definitions.ts`(+spec); app-shell template rewrite (header back/forward, conditional asides, computed grid-template-columns); spec rewrite; page-chrome.md NX section
- **Validation Path:** `nx test kppdf-web --testPathPattern=app-shell|shell-tool|production-cockpit|studio-editor-chrome`; `nx build kppdf-web` last

## Acceptance

- [x] `/counterparties`, `/supply` — no L/R rails with disabled «скоро» placeholders (idle routes never call `setTools`, so `leftTools()`/`rightTools()` are `[]` → asides not in DOM)
- [x] `/production`, studio editor — rails render with real tools (regression green: `production-cockpit.page.spec.ts`, `studio-editor-chrome-ia.spec.ts`, `studio-editor-catalog-queue.spec.ts` all pass unmodified + new app-shell regression test for setTools→clear)
- [x] ←→ live in header (`data-test="shell-nav-back"/"shell-nav-forward"` inside `<header>`), work, disabled state correct

## Gates (факт)

- `nx test kppdf-web --testPathPattern=app-shell|shell-tool|production-cockpit|studio-editor-chrome` → **PASS** (105/105 suites — was 106, minus the deleted `tool-rail-definitions.spec.ts`; 724 passed, 7 skipped)
- `nx lint kppdf-web` → touched files clean, zero new issues
- `nx build kppdf-web` → **PASS**, exit 0, same 2 pre-existing warnings as baseline

## Executor report

- `shell-tool-rail.service.ts`: default state → `{ owner: null, left: [], right: [] }`, removed `DEFAULT_LEFT`/`DEFAULT_RIGHT` fallback + the now-unused `tool-rail-definitions` import.
- Deleted `tool-rail-definitions.ts` + `tool-rail-definitions.spec.ts` — their only purpose was producing the disabled demo placeholders; no other consumer existed (verified by grep).
- `app-shell.component.ts`: moved back/forward buttons into the header trailing cluster (next to notifications/theme, same `data-test` names — single SoT); rails (`<aside>`) now `@if (leftTools().length > 0)` / `@if (rightTools().length > 0)`; new `gridTemplateColumns` computed signal drives `[style.grid-template-columns]` on `.shell-workspace` (1/2/3 columns depending on which sides have tools); removed the now-dead `.shell-rail-tools-gap` spacer + its markup, removed the mobile media-query rule that hid real page tools (it existed only to hide the always-visible history-only rail on narrow viewports — moot now that history isn't in rails); mobile media query now just narrows `--shell-rail-w`. Removed dead `isToolDisabled()` method (unused in template, depended on the deleted file's type).
- `app-shell.component.spec.ts`: rewrote the 2 tests that asserted the old always-3-column/rail-hosted-history layout; replaced the disabled-placeholder test with a no-placeholder assertion; added a regression test for the "cleared page falls back to placeholders" bug (now: clears to genuinely empty, no rails) and a right-side-absent assertion on the existing studio regression test.
- `docs/pages/page-chrome.md`: added a new "NX shell rails" section (the existing prose in this file documents the **legacy** `frontend/` chrome system — different component names/API — so I added alongside it rather than editing legacy-accurate text).
- Not touched: Gantt/studio flyout business logic, BE, any new page-tools.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-10T18:20:00Z
