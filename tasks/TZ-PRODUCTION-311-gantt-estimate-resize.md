═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-311: Gantt estimate — right-edge resize (order days)
═══════════════════════════════════════════════════════════════

STATUS: READY (blocked until TZ-PRODUCTION-309 DONE)
SOURCE: docs/audits/2026-08-15-gantt-bar-resize-drag-audit.md; PO screenshot handles
РОЛЬ АГЕНТА: Frontend (+ use 309 API only)
ЗАВИСИМОСТИ: TZ-PRODUCTION-309 DONE (estimateDayOverrides + PATCH estimate-days)
LAYER: 3
PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/blocks/gantt-bars.component.ts ;
frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts ;
frontend/src/app/pages/production/production-cockpit.page.ts ;
frontend/src/app/pages/production/production-read.facade.ts (только если нужен refresh hook) ;
docs/pages/production-cockpit.page.md ;
docs/agent-checklists/TZ-PRODUCTION-311.md ;
docs/pages/PAGE-TZ-INDEX.md ;
progress.md

Проверено: bars read-only click→inspector; GANTT_PX_PER_DAY + GANTT_ROW_PX;
  sequential pack in buildGanttBars; 309 даёт PATCH estimate-days.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Полосы статичны. Нужны **правые** ручки: ± календарные дни → order override →
пересчёт цепочки внутри заказа. Левый край / drag тела / fact schedule — OUT.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — CLAIM; убедиться 309 archived DONE и API есть в OrdersService.

ШАГ 1 — UI: на bar (не noTerm) правый handle (8–10px hit area), cursor ew-resize,
  visible on hover/focus. Snap к дню по `pxPerDay`. Preview ширины + «Nд» во время drag.
  Pointer capture; Escape = cancel; mouseup = commit.

ШАГ 2 — Commit: `PATCH estimate-days` с days = max(1, newSpanDays).
  Optimistic local bars optional; on success refresh facade/order; on error toast + rollback.
  Read-only (shipped/delivered/cancelled) или !canEdit → без ручек.
  Multi-order «Все активные»: resize разрешён только если selected order = bar.orderId
  **или** всегда по bar.orderId (предпочтительно: resize пишет в order полосы).

ШАГ 3 — a11y: handle `button`/role with aria-label «Изменить длительность …»;
  optional ArrowLeft/Right ±1 day when bar focused (nice-to-have, не блокер).

ШАГ 4 — Jest: handle present when editable; snap math unit if extracted;
  no handle for noTerm / readOnly. Gates tsc + jest gantt-bars.

ШАГ 5 — Docs page one paragraph; archive; **не** catalog WorkType PATCH from handles.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- WorkType catalog days write from Gantt
- left-edge resize, body drag, plannedDate from bar
- ProductionSchedule / 304–307 / weekend calendar SoT
- backend schema (309 only)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Правый resize меняет только этот заказ (override); другие заказы с тем же WorkType не едут.
2. После commit последующие полосы того же заказа сдвигаются (sequential pack).
3. noTerm / readOnly — без ручек; RU copy «оценка · не факт» не ломается.
4. Gates: FE tsc + jest gantt-bars (+ cockpit если трогали).
5. Executor report + archive `tasks/_archive/2026-08/TZ-PRODUCTION-311.done.md`.

known_limitation: left/move = successor; week zoom snap same day model; no undo stack.

FINALIZE: root GEMINI.md + tasks/_archive/2026-08/
