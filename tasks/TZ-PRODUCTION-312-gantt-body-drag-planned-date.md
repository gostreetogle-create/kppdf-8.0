═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-312: Gantt body-drag — shift order plannedDate
═══════════════════════════════════════════════════════════════

STATUS: READY
SOURCE: PO 2026-08-15 screenshot; docs/audits/2026-08-15-gantt-bar-resize-drag-audit.md §P2
РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-PRODUCTION-309 DONE; TZ-PRODUCTION-311 DONE
LAYER: 3
PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/blocks/gantt-bars.component.ts ;
frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts ;
frontend/src/app/pages/production/production-cockpit.page.ts ;
frontend/src/app/pages/production/production-cockpit.page.spec.ts ;
docs/pages/production-cockpit.page.md ;
docs/agent-checklists/TZ-PRODUCTION-312.md ;
docs/pages/PAGE-TZ-INDEX.md ;
progress.md ;
tasks/_backlog/WAVE-PRODUCTION-GANTT-RESIZE.md

Проверено: bars sequential from `plannedDate ?? date ?? today`; right-edge resize →
  estimate-days; OrdersService.update supports plannedDate; inspector already edits plannedDate.

═══════════════════════════════════════════════════════════════
ПРОДУКТОВЫЙ LOCK
═══════════════════════════════════════════════════════════════

**Body-drag** полосы (не ручка resize) сдвигает **всю цепочку заказа** на N календарных дней:
commit = `PATCH /orders/:id` с новым `plannedDate` = oldAnchor + deltaDays.

- Длительности полос **не** меняются.
- Не invent per-bar lag / startOffset (successor TZ).
- Не трогать WorkType catalog.
- Resize handle остаётся отдельным жестом (pointer на handle ≠ body drag).
- readOnly / shipped|delivered|cancelled — без body-drag.
- Snap к дню через `GANTT_PX_PER_DAY`; Escape = cancel; preview translate/left.
- Cursor `grab` / `grabbing` на теле полосы; title/aria: «Сдвинуть начало заказа».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — CLAIM checklist + `_active`.
ШАГ 1 — gantt-bars: pointer on bar body (exclude resize handle) → emit
  `{ orderId, deltaDays }` (или absolute plannedDate ISO date-only).
ШАГ 2 — cockpit: resolve current anchor (plannedDate ?? date), apply delta,
  `ordersApi.update(id, { plannedDate })`, reload orders/bars; toast on error.
ШАГ 3 — Jest: emit on body drag; no emit when starting on resize handle; readOnly hides.
ШАГ 4 — Docs + gates + archive.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- estimateDayOverrides schema; left-edge resize; fact production; 304–307
- TZ-PRODUCTION-313 conflict: если 313 ещё IN WORK на тех же files — sequential after 313
  (этот агент делает 313 сначала, если оба в одной выдаче)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Body-drag ±N дней сдвигает все полосы заказа; days overrides не меняются.
2. Resize handle по-прежнему меняет только days override.
3. FE tsc + jest gantt-bars (+ cockpit если трогали) PASS.
4. Archive `tasks/_archive/2026-08/TZ-PRODUCTION-312.done.md` + lock + Executor report.

known_limitation: нельзя сдвинуть одну среднюю полосу независимо (нет lag SoT).

FINALIZE: GEMINI.md + tasks/_archive/2026-08/
