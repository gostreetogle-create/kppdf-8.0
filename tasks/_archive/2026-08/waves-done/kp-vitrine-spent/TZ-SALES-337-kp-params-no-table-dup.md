═══════════════════════════════════════════════════════════════
TZ-SALES-337: Create КП — убрать дубль «Таблица» из Параметров
═══════════════════════════════════════════════════════════════

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

РОЛЬ АГЕНТА: frontend
ЗАВИСИМОСТИ: TZ-SALES-332 DONE
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts; docs/pages/proposals-create.page.md

Проверено: `[tableOnly]="rightPane() === 'table'"` уже передаётся; в inspector `@if (!tableOnly())` оборачивает только org/наценка/НДС/оценка — секция `inspector__table` (**всегда** в DOM). PO видит дубль внизу Параметров.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Обернуть блок `<section class="inspector__table" …>` (и CTA «Открыть шаблон таблицы») в `@if (tableOnly()) { … }`.
2. Параметры = только фирма / наценка / НДС / оценка / клиент(stub или 334).
3. Таблица = только rail «Таблица».
4. Spec/test: params pane не содержит `data-test="kp-insp-table"`; table pane содержит.
5. Page doc one line.

НЕ: менять sync/layout/BE; deploy; Save.

AC: открыл Параметры — секции Таблица нет; открыл Таблица — колонки есть.
Gates: frontend tsc + proposal-create jest.
Archive after quick visual (можно Cursor PASS без PO если AC DOM clear).

Финализация: `tasks/_archive/2026-08/TZ-SALES-337.done.md`.
