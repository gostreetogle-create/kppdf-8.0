═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-320: Split left column — ▸ = Gantt tree; order name = card only
═══════════════════════════════════════════════════════════════

STATUS: DONE
SOURCE: PO 2026-08-15 — убрать «двойное» действие; стрелка и заказ раздельно
РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-PRODUCTION-319 + collapse fix (label/chevron already separate DOM)
LAYER: 3
PAGES: /production
PAGE_DOCS: production-cockpit.page.md

ARCHIVE: tasks/_archive/2026-08/TZ-PRODUCTION-320.done.md
LOCK: .mimocode/locks/TZ-PRODUCTION-320-split-expand-vs-card.lock

CONFLICT KEYS:
frontend/src/app/pages/production/blocks/gantt-bars.component.ts ;
frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts ;
frontend/src/app/pages/production/production-cockpit.page.ts ;
frontend/src/app/pages/production/production-cockpit.page.spec.ts ;
docs/pages/production-cockpit.page.md ;
docs/agent-checklists/TZ-PRODUCTION-320.md ;
docs/pages/PAGE-TZ-INDEX.md ;
progress.md ;
tasks/_backlog/WAVE-PRODUCTION-GANTT-TREE.md

Проверено: DOM уже два button, но `onSelect` / `onOrderLabelClick` всё ещё
  связывает карточку с expand/collapse → ощущение «двойного» клика.

═══════════════════════════════════════════════════════════════
INTERACTION LOCK (строго)
═══════════════════════════════════════════════════════════════

| Зона | Действие |
|------|----------|
| **▸ / ▾** (левая узкая колонка) | **только** expand/collapse состава на Ганте. Карточку не трогать. |
| **Номер заказа** (справа от стрелки) | **только** toggle нижней Карточки (open/close). **Не** expand и **не** collapse дерева. |
| Child work-type label | без карточки (как сейчас) |
| Empty canvas / Esc / × | close card; collapse trees на empty/Esc — оставить текущее dismiss поведение |
| Chrome «Карточка» | toggle card without forcing expand |

═══════════════════════════════════════════════════════════════
UI SPLIT (читаемо глазом)
═══════════════════════════════════════════════════════════════

1. Явная колонка expand (~28–32px) + hairline separator + зона номера.
2. `title` / `aria-label`: стрелка «Состав на Ганте…»; номер «Карточка заказа…».
3. Hover states раздельные (уже почти есть) — чуть усилить, чтобы зоны не сливались.
4. Header колонки можно подписать коротко или оставить «Заказ» — не критично.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — CLAIM.
ШАГ 1 — `onOrderLabelClick`: только select + open/close card; **удалить** setOrderExpanded / collapse из label path.
ШАГ 2 — `onSelect` (из label/card): **не** вызывать `setOrderExpanded(id, true)`.
ШАГ 3 — Visual split column + a11y copy.
ШАГ 4 — Jest: label open does not expand; chevron expand does not open card; label close does not collapse.
ШАГ 5 — Docs + archive.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- estimate APIs; bottom sheet height; upward composition popovers
- multi-order keep (317)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. ▸ раскрывает/сворачивает виды работ; карточка не появляется от ▸.
2. Клик по номеру заказа открывает/закрывает карточку; дерево Ганта не меняется.
3. Визуально две зоны на summary-строке.
4. FE tsc + jest PASS; archive + report.

FINALIZE: GEMINI.md + tasks/_archive/2026-08/
