═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-318: Bottom card — full width, on-screen; composition expands up
═══════════════════════════════════════════════════════════════

STATUS: READY (after 317 if same agent — shared cockpit/inspector)
SOURCE: PO 2026-08-15 — sheet cut off below viewport; make wide + raise; composition expand upward
РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-PRODUCTION-315 DONE
LAYER: 3
PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/production-cockpit.page.ts ;
frontend/src/app/pages/production/blocks/order-inspector.component.ts ;
docs/pages/production-cockpit.page.md ;
docs/agent-checklists/TZ-PRODUCTION-318.md ;
docs/pages/PAGE-TZ-INDEX.md ;
progress.md ;
tasks/_backlog/WAVE-PRODUCTION-GANTT-TREE.md

Проверено: `.production-studio-sheet-card` width min(60rem), height min(42vh,22rem),
  bottom: 0.5rem — content clipped off-screen; tree expand grows downward inside sheet.

═══════════════════════════════════════════════════════════════
ПРОДУКТОВЫЙ LOCK
═══════════════════════════════════════════════════════════════

1. **Sheet:** nearly full studio width (`calc(100% - 1rem)` or left/right 0.5rem inset);
   raise so **entire sheet stays in viewport** (use `bottom` + `max-height` from available
   viewport above chrome, e.g. `max-height: min(40vh, calc(100% - 1rem))` with internal scroll
   on body — header always visible). Prefer slightly taller usable area without going under OS dock.
2. **Состав заказа:** module/product expand panels open **upward** (popover/flyout above the
   row / above sheet content), not pushing content below the fold off-screen.
   First try: upward popover anchored to the composition row; Escape/click-away closes.
   (Rightward vertical columns = fallback only if upward is ugly — implement upward first.)
3. Keep dense Paper & Ink; Russian labels; don’t block Gantt entirely (sheet overlays bottom).
4. Priority/plannedDate/days save still work.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — CLAIM after 317.
ШАГ 1 — CSS/layout sheet full-width + viewport-safe max-height + scroll.
ШАГ 2 — Composition tree: upward expand UI (absolute/fixed popover above trigger).
ШАГ 3 — Visual polish; jest smoke data-test sheet; docs; archive.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Gantt multi-order expand logic (317)
- BE APIs
- chrome rails

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Open Карточка: sheet spans nearly full width; no half-panel below screen edge.
2. Expand product/module in составе: detail opens **upward**; stays readable.
3. FE tsc + relevant jest PASS; archive + report.

known_limitation: exact height PO may tweak next screenshot.

FINALIZE: GEMINI.md + tasks/_archive/2026-08/
