═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-315: Карточка заказа — bottom sheet под Гантом
═══════════════════════════════════════════════════════════════

STATUS: DONE
SOURCE: PO 2026-08-15 — карточка мешает Ганту справа; попробовать снизу
РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: soft: 314 first if same agent
LAYER: 3
PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/production-cockpit.page.ts ;
frontend/src/app/pages/production/blocks/order-inspector.component.ts ;
docs/pages/production-cockpit.page.md ;
docs/agent-checklists/TZ-PRODUCTION-315.md ;
docs/pages/PAGE-TZ-INDEX.md ;
progress.md ;
tasks/_backlog/WAVE-PRODUCTION-GANTT-TREE.md

Проверено: Карточка = right flyout `.production-studio-flyout-right` + chrome tool «Карточка».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — CLAIM (после 314 archive if same run).
ШАГ 1 — Перенести flyout карточки в **bottom dock**:
  - full width (or max ~960px centered) under Gantt / over bottom of studio-body;
  - height ~min(42vh, 22rem), scroll inside; Gantt остаётся сверху и читаем;
  - backdrop optional light; close × / Escape / клик вне;
  - chrome tool «Карточка» по-прежнему toggles; right-side card flyout **убрать**.
ШАГ 2 — Inspector root: убрать aside border-l / full-height rail assumptions; layout horizontal-friendly
  (meta + composition scroll). Не ломать days/plannedDate save.
ШАГ 3 — Docs: карточка = bottom sheet. Jest smoke if selectors change.
ШАГ 4 — Archive.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Заказы/Фильтры left flyouts; scale flyout can stay right or join bottom later
- estimate math; 316 offsets
- app-chrome-rail API

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Карточка открывается снизу; справа пусто (нет right card flyout).
2. Гант не перекрыт по ширине; можно скроллить timeline.
3. Save priority/plannedDate/days override работают.
4. FE tsc + relevant jest PASS; archive + report.

known_limitation: точная высота/«подвал» — PO подправит следующим скрином.

FINALIZE: GEMINI.md + tasks/_archive/2026-08/
