# TZ-NX-GANTT-G4-PAN-ZOOM-FIX checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-09/TZ-NX-GANTT-G4-PAN-ZOOM-FIX.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T23:20:00+03:00
- workspace: D:\kppdf-8.0
- conflict keys held: `blocks/gantt-bars.component.ts`, `blocks/production-scale-controls.component.ts` (audit only), `production-cockpit.page.ts` (today/fit/scroll), IMPLICIT `nx build kppdf-web`

## Preflight Check Output

- **Context read:** TZ + `docs/pages/production-cockpit.page.md` (Zoom-таблица, QA-445E today-контракт) + audit 2026-08-15 (drag/resize) + порт G3.
- **Key Constraints:** не менять write API; zoom-поведение 1:1 legacy; today не silent no-op.
- **Planned Deliverable:** scrollRequest `bar` target + `refitRangeAfterShift` (G5 hook) + regression specs → gates.
- **Validation Path:** FIC §A + Build integrity.

## Что сделано

1. `gantt-bars.component.ts`: `scrollRequest` расширен (`target: 'today'|'start'|'bar'`, `barId?`); `scrollToBar()` — re-center строки переехавшего заказа по `gantt-row-<id>`; публичный `scrollToBarId()` для страницы. «Сегодня» — pulse + recenter как legacy (QA-445E spirit), zoom День/Месяц/Вместить — портированы в G3 без изменений.
2. `production-cockpit.page.ts`: `refitRangeAfterShift(bars, orderId)` — если новый startDate раньше rangeStart → расширить диапазон + fit Месяц + scroll к бару; иначе — re-anchor вьюпорта на moved row (фикс «залипает справа»). `handleBarsAfterShift()` — точка входа для G5 optimistic-коммитов.
3. `blocks/gantt-bars.component.spec.ts` — G4 regression: day=36/month=12 parity; бар раньше rangeStart рендерится; scrollToBarId не бросает (jsdom без layout).

## Gates (факт)

```
tsc -p apps/kppdf-web/tsconfig.app.json --noEmit → PASS
jest apps/kppdf-web/src/app/pages/production → PASS 4 suites / 65 tests
nx build kppdf-web → PASS (LAST)
```

## Финализация

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: freebuff (Buffy)
verification:
  - acceptance criteria: PASS (Fit/Today/Day/Month работают; spec на earlier-date range/scroll; build PASS)
  - typecheck: PASS; tests: PASS (65)
  - checklist: ADDED; status synchronization: PASS
