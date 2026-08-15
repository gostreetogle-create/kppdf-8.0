═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-313: Карточка flyout — убрать пустой gutter
═══════════════════════════════════════════════════════════════

STATUS: READY
SOURCE: PO 2026-08-15 screenshot (red box empty space right of Карточка)
РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: none (studio chrome PASS)
LAYER: 3
PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/production-cockpit.page.ts ;
frontend/src/app/pages/production/blocks/order-inspector.component.ts ;
docs/pages/production-cockpit.page.md ;
docs/agent-checklists/TZ-PRODUCTION-313.md ;
docs/pages/PAGE-TZ-INDEX.md ;
progress.md

Проверено: `.production-studio-flyout-card { width: min(28rem, …) }` а
  `app-order-inspector` root `w-[20rem] xl:w-[22rem]` → ~6rem пустоты справа внутри flyout.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — CLAIM.
ШАГ 1 — Согласовать ширины: inspector `w-full` (без фиксированных 20/22rem);
  flyout-card `width: min(22rem, calc(100% - 1rem))` (или = content, без лишнего gutter).
  Паддинги flyout не оставлять «воздух» шире содержимого. Центр Ганта не сжимать лишним.
ШАГ 2 — Smoke: открыть Карточку — нет пустой колонки справа; scroll/composition ок.
ШАГ 3 — Docs one line + archive.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- gantt resize/drag logic (312)
- chrome rails / PiChromeTools
- backend

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Визуально: flyout карточки без заметного пустого gutter справа (ширина ≈ контент).
2. FE tsc PASS; existing production-cockpit jest still PASS if any assert widths.
3. Archive `tasks/_archive/2026-08/TZ-PRODUCTION-313.done.md` + lock + report.

FINALIZE: GEMINI.md + tasks/_archive/2026-08/
