# TZ-NX-PRODUCTION-COCKPIT-RESIDUAL-THIN checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PRODUCTION-COCKPIT-RESIDUAL-THIN.md` (removed on closeout)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T15:24:22Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — `_active` пуст, no conflicting claim
- [x] TZ / `production-cockpit.page.ts` (423 LOC) / `libs/features/src/lib/production/**` read
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-PRODUCTION-COCKPIT-RESIDUAL-THIN.md` на месте

## Acceptance

- [x] Page residual template/chrome thinned (423 → 357 LOC), ShellToolRail stays in app (sibling file, same pattern as `TZ-NX-STUDIO-EDITOR-PAGE-THIN`)
- [x] No gantt write semantics change — only chrome-rail wiring moved, all `cockpit.*`/`ctx.*` calls byte-identical
- [x] production-cockpit* + gantt* specs green
- [x] `nx build kppdf-web` — last gate, exit 0
- [x] This is the LAST TZ in the B10 chain — STOP after archive+commit

## Integrity slot

- [x] Тип изменения: page (internal refactor, no route/behavior change)
- [x] FIC §A–E: N/A — pure internal decomposition
- [x] page.md / PAGE-TZ-INDEX: N/A
- [x] DOMAIN-MAP / SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity

- [x] Baseline `nx build kppdf-web` green (verified earlier this session)
- [x] `_active/` был пуст перед claim
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `nx test kppdf-web` (full 555-test suite, same pattern-flag caveat as prior TZs this session) — **PASS** for `production-cockpit.page.spec.ts` + `production-cockpit.page.write.spec.ts`. Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as prior TZs this session (nav quicknav chip drift, unrelated).
- `nx test features` (production/gantt live in the `features` lib project, not `kppdf-web` — separate jest target; the `kppdf-web` full run doesn't cover it, confirmed by 0 "gantt-bars" hits in that log) — **PASS**, all 52 suites/453 tests, including `gantt-bars.component.spec.ts` and `production-read.facade.spec.ts`.
- `nx build kppdf-web` — **PASS**, exit 0. Same pre-existing Angular/budget warnings as baseline.
- `nx lint kppdf-web` + `nx lint features` — baseline FAIL (pre-existing lazy-boundary violations, same pattern as prior TZs this session). Zero new issues: `production-cockpit-shell-tools.ts` doesn't appear in either lint output.

## Executor report

Thinned `ProductionCockpitPage` 423 → 357 LOC, zero behavior change:

- Extracted the ShellToolRail chrome-rail-wiring (`syncShellTools()` + the constructor's tracking `effect()`) into a new sibling app file `production-cockpit-shell-tools.ts` — same pattern as `TZ-NX-STUDIO-EDITOR-PAGE-THIN`'s `studio-editor-shell-tools.ts` this session. `ShellToolRailService` is app-only, so this stays in `apps/kppdf-web`, not `@kppdf/features/production`.
- Preserved the original's two-phase effect pattern exactly (track `leftTool()`/`filtersDirty()` outside `untracked()`, then read again for the actual value inside `untracked()` — the original comment explicitly warns `setTools reads+writes rail state — must not be effect-tracked (infinite loop)`; the helper function reproduces this structure verbatim, just parameterized via a `deps` object instead of `this`).
- Removed dead code found in the same pass: `Filter` icon import (imported, never used anywhere in the file) and `LucideAngularModule` (imported + listed in the component's own `imports` array, but the page's inline template never renders a `<lucide-icon>` — same dead-import pattern found in `studio-editor.page.ts` earlier this session).
- Left the template (flyouts, gantt-bars binding, error/loading banners) and the page-specific layout CSS (`.production-studio-flyout*`, `.production-studio-backdrop`, etc.) untouched — this is genuine page-shell geometry, not misplaced logic or reusable chunks.

**This closes the B10 residual-thin chain** (registries-facade → registries-to-features → studio-editor-thin → supply-residual → cockpit-residual, all 5 DONE). Per the original chain instruction ("Цепочка→STOP"), stopping here rather than picking up the newly-queued Order Workspace wave noted in `_NOW.md` — that's a new instruction the PO/coordination layer added after this chain started, not part of the claimed scope.

## Closeout

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T15:27:24Z

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing, zero new issues)
  - checklist: ADDED
  - progress.md: N/A (refactor-only)
  - status synchronization: PASS
