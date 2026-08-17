# TZ-PRODUCTION-344: Gantt «По рабочим» — модули с контекстом + ▸

STATUS: DONE  
РОЛЬ АГЕНТА: local executor  
ЗАВИСИМОСТИ: TZ-PRODUCTION-342 DONE  
LAYER: 3  
PAGES: /production  
PAGE_DOCS: production-cockpit.page.md  
CONFLICT KEYS: frontend/src/app/pages/production/gantt-bar.model.ts ; frontend/src/app/pages/production/gantt-bar.model.spec.ts ; frontend/src/app/pages/production/blocks/gantt-bars.component.ts ; frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts ; frontend/src/app/pages/production/production-cockpit.page.ts ; frontend/src/app/pages/production/production-cockpit.context.ts ; frontend/src/app/pages/production/production-cockpit.page.spec.ts

Проверено: WAVE-GANTT-IA; audit 2026-08-16-gantt-ia; GANTT-401 worker tree always-expanded WT children; 342 landed Order→Product→Module→WT for order lens.

## ИСХОДНОЕ

- «По рабочим»: Worker summary → сразу WT («Сборка/Сварка») — PO не видит заказ/изделие/модуль.
- Нет ▸ на группе рабочего.

## ЧТО ДЕЛАТЬ

1. Worker tree: `Worker summary → Module rows → WorkType` (при ▸ модуля).
2. Лейбл модуля: короткий контекст `номерЗаказа · изделие · модуль` (truncate ok).
3. Worker summary ▸ expandable (default collapsed или expanded — выбери UX: **default collapsed** consistent with orders; document in page.md).
4. Read-only write rules GANTT-401 сохранить (no drag/resize in worker mode).
5. Specs + gates FE tsc + jest model/bars/cockpit focused. Deploy нет.

## НЕ ИЗМЕНЯТЬ

- Order-lens tree (342), estimate PATCH, BE, hydrate, Desktop
- 343 polish (labels/toggle) — only if blocking; else leave to 343

## КРИТЕРИИ

1. По рабочим: под Ивановым ▸ → модули с заказом/изделием, не сырой список WT.
2. ▸ модуля → виды работ + cascade read-only.
3. Gates PASS; archive; push.

## Промпт

```text
Прочитай GEMINI.md + tasks/TZ-PRODUCTION-344-gantt-workers-modules.md
+ docs/audits/2026-08-16-gantt-ia-order-product-module.md.
CLAIM → worker lens Module+context + expand → gates → archive → push.
Order lens не ломать. Deploy запрещён.
```
