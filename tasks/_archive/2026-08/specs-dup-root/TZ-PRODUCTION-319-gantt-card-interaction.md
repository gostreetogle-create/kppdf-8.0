═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-319: Gantt open/close IA — card only from order label; taller sheet
═══════════════════════════════════════════════════════════════

STATUS: DONE
SOURCE: PO 2026-08-15 screenshot (red circle = left «Заказ» column); toggle close; taller bottom sheet
РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-PRODUCTION-317/318 DONE
LAYER: 3
PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/production-cockpit.page.ts ;
frontend/src/app/pages/production/production-cockpit.page.spec.ts ;
frontend/src/app/pages/production/blocks/gantt-bars.component.ts ;
frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts ;
docs/pages/production-cockpit.page.md ;
docs/agent-checklists/TZ-PRODUCTION-319.md ;
docs/pages/PAGE-TZ-INDEX.md ;
progress.md ;
tasks/_backlog/WAVE-PRODUCTION-GANTT-TREE.md

Проверено: label + timeline `selectOrder` → `onSelect` always opens card + expands;
  child labels also emit selectOrder; chevron only toggleExpand; sheet max-height ~52vh still scrolls.

═══════════════════════════════════════════════════════════════
INTERACTION MATRIX (LOCK)
═══════════════════════════════════════════════════════════════

| Жест | Expand Gantt | Карточка снизу |
|------|--------------|----------------|
| ▸ / ▾ chevron на summary | toggle expand | **нет** |
| Клик **левой** подписи **summary** (номер заказа) | expand on open (ok) | **toggle**: same order+open → close; else open for that order |
| Клик левой подписи **child** (вид работ) | нет | **нет** (не открывать карточку) |
| Клик / drag полосы на timeline | не открывать карточку | **нет** (resize/move только; click без drag = optional select highlight без sheet, или noop) |
| Chrome «Карточка» | — | toggle if selected order exists |
| Backdrop / клик по пустому Gantt main (не sheet) | — | close sheet |
| Escape | — | close sheet (+ composition popovers already) |
| × на sheet | — | close |

Toggle close: `inspectorOpen && selectedOrderId===id` → closeInspector (keep expand state as-is unless ugly).

═══════════════════════════════════════════════════════════════
SHEET HEIGHT
═══════════════════════════════════════════════════════════════

Увеличить высоту ~**×2** к прежнему комфорту: например
`max-height: min(72vh, calc(100% - 0.75rem))` (или эквивалент),
`bottom` inset сохранён; header sheet всегда виден; body scroll только если контент всё ещё длиннее.
Полная ширина из 318 сохранить.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — CLAIM.
ШАГ 1 — Split outputs: e.g. `openOrderCard` / `toggleOrderCard` from summary label only;
  child label ≠ card; timeline row click ≠ card; wire cockpit to matrix.
ШАГ 2 — Taller sheet CSS; verify composition upward popovers still work.
ШАГ 3 — Jest: matrix cases (summary toggle open/close; child no open; chevron no open).
ШАГ 4 — Docs interaction blurb; archive.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- estimate days/start APIs; multi-order expand keep (317)
- left Заказы/Фильтры flyouts
- BE

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Карточка открывается **только** с левой подписи summary-заказа (или chrome Карточка).
2. Повторный клик по тому же заказу в левой колонке закрывает карточку.
3. Child / timeline / chevron не открывают карточку.
4. Sheet заметно выше (~×2), меньше вынужденного скролла; в viewport.
5. FE tsc + jest PASS; archive + Executor report.

FINALIZE: GEMINI.md + tasks/_archive/2026-08/
