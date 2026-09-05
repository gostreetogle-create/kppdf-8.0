# NX Gantt L0 (G3–G6) — independent peer review

date: 2026-09-05  
reviewer: claude (Reviewer posture — read-only except one authorized backend mini-fix)  
commits reviewed: `db6dd6e1` (G3), `f0eb20a4`/`208ef9a3` (G4), `4d09f2bc` (G5), `26b87bc3` (G6)  
baseline: legacy `frontend/src/app/pages/production/**`, `docs/ux/production-gantt-studio-spec.md`, `docs/pages/production-cockpit.page.md`  
scope discipline: did **not** patch `frontend-nx/apps/kppdf-web/src/app/pages/production/**` (Freebuff on G7 in parallel); one backend-only fix applied per this TZ's explicit authorization (see P0 below).

## Matches legacy (OK)

1. **Optimistic write + revert-on-fail (G5).** `production-cockpit.page.ts` `beginGanttOptimistic()` → `persistGanttPatch()` → `restoreGanttSnapshot()` (lines ~584–714) sets the bar/order state optimistically, PATCHes silently, and on failure or thrown error restores the pre-write snapshot + a single error toast — no success toast, no full reload. This matches the legacy contract exactly (`docs/pages/production-cockpit.page.md` TZ-PRODUCTION-333: "silent PATCH like 333 (no success toast, no full reload; fail → revert + error)"). Verified against `production-cockpit.page.write.spec.ts` ("PATCH failure → bars reverted").
2. **Per-order write mutex (G5).** `ganttWriteInFlight` (a `Set<string>` of order ids) makes `beginGanttOptimistic()` return `null` — a silent no-op — for a second write on the same order while the first is in flight. This matches the legacy `known_limitation` verbatim ("второй write того же заказа, пока PATCH в полёте, игнорируется") — intentional, not a regression.
3. **Catalog WorkType.days confirm-gate.** `onCatalogDaysRequest()` → `promptCatalogDaysChange()` (`order-inspector.component.ts`) still runs `window.prompt` + `window.confirm` before the global PATCH, then `clearCaches()` + full reload — matches the legacy "confirm «для всех заказов» + rollback" contract. Ported unchanged (22-line diff in G3 only touched call wiring).
4. **Role/capability gate split.** `canEditOrder` (`admin`/`manager`, `production-cockpit.page.ts:364`) gates meta/plannedDate writes; `canEditCatalog` (`caps.hasAny(['production:write'])`, line 370) gates estimate-days/estimate-start/catalog — matches the spec's write-path matrix (`docs/pages/production-cockpit.page.md` table) column-for-column.
5. **Workers-mode read-only guard exists and is correctly wired in product code.** `canResizeBar()`/`canMoveBar()` (`gantt-bars.component.ts:1743-1758`) both start with `if (this.groupByWorkers()) return false;` — every resize-handle and body-drag path in the template checks these before allowing an interaction. Confirmed by direct code read, not just the docstring in G6's own test file (see P2 below for why I didn't just trust that comment).

## P0 — cross-organization write on estimate-days / estimate-start (backend, fixed in this TZ)

**Fact:** `OrderController.patchEstimateDays` / `patchEstimateStart` (`backend/src/modules/order/order.controller.ts:161-193`, pre-fix) took no `@CurrentUser()` and called `OrderService.patchEstimateDays(id, dto)` / `patchEstimateStart(id, dto)` directly. Those methods (`order.service.ts:694-795`, pre-fix) fetch the order via `findByIdRaw(id)` → `this.model.findById(id).exec()` — an **unscoped** query, no `organizationId` filter anywhere.

The controller class carries `@RequireOrgScope()` + `@UseInterceptors(OrgScopeGuardInterceptor)`, but that interceptor (`common/interceptors/org-scope.interceptor.ts`) runs **after** the handler and only filters the *response* (`NotFoundException` if the returned doc's `organizationId` doesn't match the caller). For a **write**, `doc.save()` has already persisted the mutation by the time the interceptor runs. Net effect: an authenticated user in Organization A holding `production:write`, given (or guessing) an Order `_id` belonging to Organization B, could successfully mutate that order's `estimateDayOverrides`/`estimateStartOffsets` — the response would 404, but the write already landed.

**Risk:** confirmed, exploitable cross-tenant data corruption on a production-affecting field (estimate days/start feed the Gantt calendar for the *other* organization). Not a G3–G6 regression — `findByIdRaw`/`findById` predate this wave — but it's exactly the class of bug this TZ authorized me to fix directly ("backend-only баг в estimate-days/start (org leak, crash) — можно починить").

**Fix applied** (`order.controller.ts`, `order.service.ts`):
- Controller: both endpoints now take `@CurrentUser() user: AuthenticatedUser` and pass `user.organizationId` through.
- Service: new `assertOrgAccess(doc, organizationId)` — bypasses when either side has no org (mirrors `ProductService.organizationFilter`'s "no org id = legacy/global, allow" semantics, keeping bootstrap/system callers working), otherwise throws `NotFoundException` **before** any field mutation or `doc.save()`. Called immediately after `findByIdRaw` in both methods.

**Regression tests** (`order.service.spec.ts`): 4 new tests — cross-org caller rejected + `save()` never called (both endpoints), matching-org caller succeeds (both endpoints). Verified fail-on-old-code: `git stash` the fix → suite **fails to compile** (`TS2554: Expected 2 arguments, but got 3`) — the test's 3rd argument doesn't exist without the fix, which is stronger proof than a runtime failure. Restored and green (87/87 in the file, 1169/1169 backend-wide).

**Acceptance:** ✅ done — gates green (`tsc`, full `pnpm test`, `pnpm lint` 0 errors).

**Blast radius parked, not fixed (out of this TZ's authorized scope):** the same unscoped-`findByIdRaw` + post-hoc-interceptor-only pattern also applies to `OrderController.update()` (general `PATCH /orders/:id` — the **same** path `onOrderMetaCommit`/`onPlannedDateMoveCommit` use for plannedDate/priority!), `patchLineBoardLane`, `patchModuleLane`, and `setItemStatus` — none of these pass `organizationId` into their service methods either. Fixing all of them is a proper dedicated backend security TZ (needs its own test pass across every affected endpoint), not a "≤1 file" mini-fix riding on a Gantt review. **Recommend a follow-up backend-only TZ** (e.g. `TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN`) before this is considered closed platform-wide.

**Update 2026-09-05 — blast radius closed.** `update`, `setItemStatus`, `patchLineBoardLane`, `patchModuleLane` (all four named above) plus `setLineReady` (found during that TZ's own audit pass — its controller already carried `@CurrentUser()`, so it was a trivial extension of the same fix) now all call `assertOrgAccess` right after `findByIdRaw`, before any mutation, with regression tests verified fail-on-old-code the same way as the estimate endpoints. `reserveStock`, `ship`, `cancel`, and `remove` remain unscoped (`this.model.findById(id)` bypassing `findByIdRaw` entirely, inside `sessionRunner.run` transactions for the first three) — a separate, larger follow-up if PO wants full coverage; not attempted here to keep that TZ's scope proportionate. See `tasks/_archive/2026-09/TZ-BACKEND-ORDER-ORG-SCOPE-HARDEN.done.md` for the commit and full gate output.

**Update 2026-09-05 — TX blast radius closed too.** `reserveStock`, `ship`, `cancel` (all three `sessionRunner.run`-wrapped, fetching via raw `this.model.findById(id).session(session)`), and `remove` (via the public `findById`) now all call `assertOrgAccess` immediately after the order loads, before any side-effect (reservation create, shipment create, reservation release, soft-delete). Notably `ship()` already had an `organizationId` parameter before this fix — declared but never checked, a "looks guarded, isn't" trap. 8 new regression tests (cross-org reject + same-org allow × 4 methods), verified fail-on-old-code via `git stash` (TS2554 compile errors on the pre-fix signatures — stronger proof than a runtime assertion). Gates green: `tsc --noEmit` clean, `pnpm test` 126/126 suites, `pnpm lint` 0 errors (197 pre-existing warnings, unchanged baseline). This closes every unscoped write path named in this audit — `OrderService` is now fully org-scoped on writes. See `tasks/_archive/2026-09/TZ-BACKEND-ORDER-ORG-SCOPE-TX.done.md` for the commit and full gate output.

## P1 — viewport range never widens for a forward (later) plannedDate/start-offset shift

**Fact:** `refitRangeAfterShift()` (`production-cockpit.page.ts:746-763`) only handles the bar moving **earlier** than the current range:

```ts
const paddedStart = addDays(start, -1);
if (paddedStart < this.rangeStart()) {
  this.rangeStart.set(paddedStart);
  this.ctx.setZoom('month');
  this.requestTimelineScroll('bar', orderBars[0]!.id);
  return;
}
this.requestTimelineScroll('bar', orderBars[0]!.id);
```

It computes only the **start** of the moved order's bars and compares against `rangeStart()`. There is no equivalent check against `rangeEnd()` for the bars' end dates. Compare to `applyBars()` (line 844-864, used on load/select/filter), which pads **both** ends symmetrically (`paddedStart`/`paddedEnd`, `minDate`/`maxDate`).

The rendered timeline's total width is strictly `totalDays * pxPerDay` where `totalDays = dayDiff(rangeStart, rangeEnd)` (`gantt-bars.component.ts:1401-1416`) — a bar whose date now exceeds `rangeEnd` has no day-grid or scale-tick columns behind it and sits past the last rendered day. Dragging an order's plannedDate (or a child's start-offset) far enough **forward** in time is a completely ordinary operator action — there is nothing to stop them, and the write succeeds — but the moved bar can end up rendered past the visible/gridded timeline with no way for the current code to bring `rangeEnd` out to meet it.

**Confirmed untested in either existing spec:** `production-cockpit.page.write.spec.ts` exercises `onPlannedDateMoveCommit`/`onStartOffsetCommit` only with `deltaDays: -3` and `-7` (both backward). `gantt-bars.component.spec.ts`'s only range-adjacent test is titled *"renders a shifted bar that starts before rangeStart"* — earlier-direction only, with a comment noting "the page widens the range via refitRangeAfterShift". Neither spec has a forward-shift case, which lines up exactly with the asymmetry in the implementation — the gap was never exercised, so it was never caught.

**Risk:** an operator drags a summary bar (or a child's start-offset) forward past the current visible range → data saves correctly, but the moved bar visually falls off the edge of the rendered grid with no automatic re-fit, until the operator manually hits «Вместить сроки» or reloads. Not a crash, but a real "did my drag do anything?" UX regression versus the legacy behavior (which the spec's `applyBars` still gets right on reload).

**Minimal fix (for the successor TZ, not applied here — FE, Freebuff's G7 lane):**

```ts
private refitRangeAfterShift(bars: GanttBar[], orderId: string): void {
  const orderBars = bars.filter((b) => b.orderId === orderId);
  if (!orderBars.length) return;
  let start = orderBars[0]!.startDate;
  let end = orderBars[0]!.noTerm ? orderBars[0]!.startDate : orderBars[0]!.endDate;
  for (const b of orderBars) {
    if (b.startDate < start) start = b.startDate;
    const e = b.noTerm ? b.startDate : b.endDate;
    if (e > end) end = e;
  }
  const paddedStart = addDays(start, -1);
  const paddedEnd = addDays(end, 1);
  let widened = false;
  if (paddedStart < this.rangeStart()) { this.rangeStart.set(paddedStart); widened = true; }
  if (paddedEnd > this.rangeEnd()) { this.rangeEnd.set(paddedEnd); widened = true; }
  if (widened) this.ctx.setZoom('month');
  this.requestTimelineScroll('bar', orderBars[0]!.id);
}
```

**Acceptance for the successor:** drag a summary bar/start-offset forward by e.g. +60 days past the current `rangeEnd`; the bar remains fully inside the gridded/scaled timeline and the scroll-to-bar request lands on a visible column. Add a `gantt-bars.component.spec.ts` case mirroring the existing "before rangeStart" one but for `rangeEnd`, and a `production-cockpit.page.write.spec.ts` case with a positive `deltaDays`.

## P2 — G6 test file's read-only claim is not actually covered by a test

**Fact:** `gantt-workers-view.spec.ts`'s file doc-comment says the read-only guarantee is "покрыто компонентными тестами логики ниже" (covered by component tests below), but that file only tests `buildWorkerTreeBars` grouping/sorting — it never calls or asserts on `canResizeBar`/`canMoveBar`. A repo-wide grep for those two identifiers found zero references outside `gantt-bars.component.ts` itself (the implementation).

**Risk:** low as a runtime bug (I independently confirmed the actual guard in product code is correct — see "Matches legacy" #5) — but the codebase now carries a false claim of test coverage for a genuinely security/UX-relevant guarantee ("can a worker-mode row still be dragged"). If a future refactor accidentally drops the `groupByWorkers()` check, nothing would fail red.

**Minimal fix for the successor TZ:** a `gantt-bars.component.spec.ts` case that sets `groupByWorkers=true`, calls `canResizeBar`/`canMoveBar` (or drives the pointer-down handlers) on a worker-summary row, and asserts no PATCH-triggering path fires.

## Explicit gaps vs L1+ (not required now)

- Keyboard-only drag/resize for the Gantt body (grid a11y) remains a known future item per the legacy spec (`docs/pages/production-cockpit.page.md` "Known limitations" — "Полная keyboard-семантика grid — 310+"); G3–G6 did not add it and were not asked to.
- Session-cache across `/production` navigations (`clearCaches()` on destroy) is an existing legacy known_limitation, unaffected by this wave.
- The P1 range-widening gap is scoped to *this* wave's new optimistic-write viewport logic; it does not affect the reload path (`applyBars`), which already pads both directions correctly.

## Gates run this session (P0 fix only — no FE gates needed, nothing FE changed)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit  → PASS
cd backend && pnpm test                                       → PASS, 126 suites / 1169 tests
cd backend && pnpm lint                                        → PASS, 0 errors (197 pre-existing warnings)
```

Regression tests verified fail-on-old-code (test file fails to *compile* without the fix — stronger than a runtime assertion failure) and pass on the fix.

## Summary

| Severity | Item | Status |
|---|---|---|
| P0 | Cross-org write on estimate-days/estimate-start | **Fixed + tested this TZ**; broader controller blast radius parked as a successor backend TZ |
| P1 | `refitRangeAfterShift` doesn't widen `rangeEnd` on forward shifts | Finding only — successor FE TZ (draft below) |
| P2 | G6 test file overclaims coverage for `canResizeBar`/`canMoveBar` | Finding only — fold into the same or a small successor FE TZ |

Successor TZ draft: `tasks/_ready/TZ-NX-GANTT-G9-RANGE-REFIT-FORWARD.md` (P1 fix + P2 test, FE-only, hand to whoever picks up after Freebuff's G7).
