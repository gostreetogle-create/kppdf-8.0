═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-316: Per-bar start offset — parallel move on Gantt
═══════════════════════════════════════════════════════════════

STATUS: DONE
SOURCE: PO 2026-08-15 — двигать каждый вид влево/вправо; столярка ∥ сварка
РОЛЬ АГЕНТА: Backend + Frontend
ЗАВИСИМОСТИ: TZ-PRODUCTION-309 DONE; TZ-PRODUCTION-314 DONE
LAYER: 3/4
PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
backend/src/modules/order/** ;
frontend/src/app/pages/production/gantt-bar.model.ts ;
frontend/src/app/pages/production/blocks/gantt-bars.component.ts ;
frontend/src/app/pages/production/production-cockpit.page.ts ;
frontend/src/app/pages/production/production-read.facade.ts ;
frontend/src/app/pages/orders/orders.service.ts ;
docs/pages/production-cockpit.page.md ;
docs/agent-checklists/TZ-PRODUCTION-316.md ;
docs/pages/PAGE-TZ-INDEX.md ;
progress.md ;
tasks/_backlog/WAVE-PRODUCTION-GANTT-TREE.md

Проверено: без offset все bars sequential; body-drag child disabled in 314; need SoT for free start.

═══════════════════════════════════════════════════════════════
SCHEMA LOCK
═══════════════════════════════════════════════════════════════

На Order рядом с estimateDayOverrides:

```ts
estimateStartOffsets: Array<{
  orderItemIndex: number;
  moduleId: ObjectId;
  workTypeId: ObjectId;
  offsetDays: number; // int >= 0 from order visualAnchor (plannedDate??date??today)
}>
```

`PATCH /orders/:id/estimate-start` body:
`{ orderItemIndex, moduleId, workTypeId, offsetDays: number | null }`
null = clear override → bar снова участвует в sequential pack для «дыр» без override.
Auth: `@Permissions('production:write')` (как estimate-days).

Pack algorithm in `buildGanttBars`:
- For each work type in sort order:
  - days = resolveEstimateDays(...)
  - if offset override → start = anchor + offsetDays; end = start + days - 1
  - else → start = sequential cursor (current behavior); advance cursor
- Bars with explicit offset **do not** advance sequential cursor (parallel OK) 
  **OR** document chosen rule in «Проверено» after implementing — prefer:
  **cursor = max(cursor, end+1) only for sequential bars; offset bars independent.**

Summary bar (314) = min/max over visible children.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — CLAIM after 314.
ШАГ 1 — BE schema + endpoint + tests.
ШАГ 2 — FE service + buildGanttBars + facade normalize.
ШАГ 3 — Child body-drag → PATCH estimate-start (delta → new offsetDays);
  summary body-drag remains plannedDate (offsets stay relative → whole order shifts).
ШАГ 4 — Jest parallel overlap case; gates BE+FE; docs; archive.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- WorkType catalog days from Gantt
- fact schedule / ProductionOrder
- 315 bottom sheet (unless already done)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Две полосы одного заказа могут перекрываться по датам после drag.
2. Summary отражает новый max end.
3. Clear offset restores sequential for that bar.
4. Gates tsc/jest BE+FE; archive + report.

known_limitation: нет FS/SS связей MS-Project; только offset от якоря заказа.

FINALIZE: GEMINI.md + tasks/_archive/2026-08/
