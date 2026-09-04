# TZ-NX-GANTT-G5-WRITE-PATH checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-09/TZ-NX-GANTT-G5-WRITE-PATH.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T23:45:00+03:00
- workspace: D:\kppdf-8.0
- conflict keys held: `production-cockpit.page.ts`, `blocks/gantt-bars.component.ts` (нет правок), `libs/data-access/src/lib/sales/pi-orders.service.ts` (без правок — методы из G2), IMPLICIT `nx build kppdf-web`

## Preflight Check Output

- **Context read:** TZ + write matrix `docs/pages/production-cockpit.page.md` § Write-path + legacy page (persistGanttPatch / optimistic helpers).
- **Key Constraints:** один write-path; catalog — только через confirm; hard-frozen — drag off; revert при 409/сети.
- **Planned Deliverable:** wire 5 commit-хендлеров + refit после сдвигов + write spec → gates.
- **Validation Path:** FIC §A + Build integrity.

## Что сделано

1. `production-cockpit.page.ts` — вместо G5-стабов полные хендлеры (порт legacy 1:1):
   - `onOrderMetaCommit` → `ordersApi.update(priority, plannedDate)`;
   - `onEstimateDaysCommit` → `patchEstimateDays` (order override, НЕ каталог);
   - `onPlannedDateMoveCommit` → `update(plannedDate)` + `refitRangeAfterShift` (G4);
   - `onStartOffsetCommit` → `patchEstimateStart` (offsetDays ≥ 0 от visualAnchor) + refit;
   - `onCatalogDaysRequest` → `promptCatalogDaysChange` (confirm «для всех заказов») → `PiWorkTypesService.update`.
2. Optimistic: `cloneGanttState` snapshot → `applyOptimistic*` → silent PATCH; fail/exception → revert + RU toast; in-flight guard per order (TZ-PRODUCTION-333).
3. `PiWorkTypesService.update` добавлен (G5; отложен из G2) — `PATCH /work-types/:id`, вызов только confirm-затворён.
4. Модель: constraint-типы `applyOptimisticEstimateDays/StartOffset` переведены на `readonly` массивы (NX Order.immutable parity).
5. `production-cockpit.page.write.spec.ts` — 6 кейсов: API-shape estimate-days, plannedDate ISO, offset clamp ≥0, revert при 409, catalog confirm gate, caps=false → no call.

## Gates (факт)

```
tsc -p apps/kppdf-web/tsconfig.app.json --noEmit → PASS
jest apps/kppdf-web/src/app/pages/production → PASS 5 suites / 71 tests
nx build kppdf-web → PASS (LAST)
```

## Финализация

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: freebuff (Buffy)
verification:
  - acceptance criteria: PASS (drag persist, resize → order override, каталог только через confirm, build PASS)
  - typecheck: PASS; tests: PASS (71)
  - checklist: ADDED; status synchronization: PASS
