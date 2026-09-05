# TZ-NX-GANTT-G9-RANGE-REFIT-FORWARD: viewport range does not widen on a forward shift

**РОЛЬ АГЕНТА:** Executor (frontend-nx)  
**LAYER:** 1  
**PAGES:** production  
**ЗАВИСИМОСТИ:** G3–G6 on main; peer review `docs/audits/2026-09-05-gantt-nx-l0-peer-review.md` (P1 + P2)  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.page.ts` (`refitRangeAfterShift`); `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.ts` (test-only, no product change expected)  
**IMPLICIT:** backend untouched

## ИСХОДНОЕ

Peer review of NX Gantt L0 (G3–G6) found two findings, both FE-only, both left as findings-not-patches per the review TZ's scope (Freebuff was on G7 at review time — check `_active`/`_NOW` for current FE ownership before claiming).

## P1 — range never widens forward (fix)

`refitRangeAfterShift()` (`production-cockpit.page.ts`) only compares the moved order's earliest bar date against `rangeStart()` and widens backward. It never compares the latest bar date against `rangeEnd()`. Since the rendered timeline's width is strictly `totalDays * pxPerDay` (`gantt-bars.component.ts` `totalDays`/`timelineMinWidth`), a summary-bar or start-offset drag that moves an order **forward** past the current `rangeEnd` renders past the last day-grid/scale-tick column — no crash, but the bar visually falls off the gridded area until the operator manually hits «Вместить сроки» or reloads.

Suggested minimal fix (see full diff in the audit md, `P1` section) — widen `rangeEnd` symmetrically to how `rangeStart` is already widened, using the same padding convention as `applyBars()`.

## P2 — G6 test file overclaims read-only coverage

`gantt-workers-view.spec.ts`'s doc-comment claims `canResizeBar`/`canMoveBar` read-only guarantees are covered by "компонентными тестами" — no such test exists (grep confirmed). The underlying product-code guard IS correct (verified by direct read in the peer review); this is a test-hygiene gap only.

## ЧТО ДЕЛАТЬ

1. `refitRangeAfterShift`: widen `rangeEnd` when the moved order's latest bar end exceeds it (mirror the existing `rangeStart` branch; see suggested diff in the audit).
2. Add a `gantt-bars.component.spec.ts` case mirroring the existing "renders a shifted bar that starts before rangeStart" test, but for the `rangeEnd` side (bar shifted well past the current end).
3. Add a `production-cockpit.page.write.spec.ts` case with a **positive** `deltaDays` (forward shift) on `onPlannedDateMoveCommit` and/or `onStartOffsetCommit`, asserting `rangeEnd` widens and the scroll-to-bar target is reachable.
4. Add a `gantt-bars.component.spec.ts` (or new) case that sets `groupByWorkers=true` and asserts `canResizeBar`/`canMoveBar` return `false` for a worker-summary row — closing the P2 gap so the G6 file's claim is backed by a real assertion.
5. Gates: `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit && pnpm exec jest apps/kppdf-web/src/app/pages/production && pnpm exec nx build kppdf-web` (last).

## НЕ ИЗМЕНЯТЬ

- Backend (`order.controller.ts`/`order.service.ts` org-scope fix already landed separately).
- Visual/zoom/scale logic beyond the range-widening branch.
- Any L1+ feature (assignment, fact production, etc.) — out of wave per `docs/ux/production-gantt-studio-spec.md` §10.

## КРИТЕРИИ ПРИЁМКИ

1. Forward drag/resize past `rangeEnd` keeps the moved bar inside the gridded timeline (visible, scale ticks behind it).
2. New tests cover both directions (backward — already covered; forward — new) and the worker-mode read-only guard.
3. Gates PASS.

## Финализация

Archive → `tasks/_archive/2026-09/TZ-NX-GANTT-G9-RANGE-REFIT-FORWARD.done.md`
