# TZ-SUPPLY-443: «+» поставщика = канон pi-select-add-btn (не голый плюс)

PAGES: `/supply` (быстрый заказ)
PAGE_DOCS: supply related page.md если есть ; AI-UI-CONTRACT.md ; ui-rules.md

РОЛЬ АГЕНТА: Frontend UI Engineer  
ЗАВИСИМОСТИ: Нет  
LAYER: 3

### Preflight Check Output
- **Context read:** `supply-quick-order.component.ts` ~511–526 (`class="pi-select-add-btn supply-quick-order__org-add"`); `pi-select-add-row.component.ts` (стили **encapsulated**); `frontend/angular.json` → styles только `src/styles.css`; `frontend/src/app/styles.css` содержит `.pi-select-add-btn` но **не подключён** к билду
- **Key Constraints:** Stop rule AI-UI-CONTRACT — не сырой «+»; reuse SoT
- **Planned Deliverable:** глобальные стили кнопки в живом `src/styles.css` + verify org-add; grep orphan naked `+`
- **Validation Path:** jest + visual; frontend tsc

CONFLICT KEYS:
`frontend/src/styles.css`;
`frontend/src/app/styles.css` (удалить дубль или пометить obsolete);
`frontend/src/app/shared/ui/select-add-row/pi-select-add-row.component.ts`;
`frontend/src/app/pages/supply/supply-quick-order.component.ts`;
`frontend/src/app/pages/supply/supply-quick-order.component.spec.ts`;
`docs/AI-UI-CONTRACT.md` (1 строка про `.pi-select-add-btn`)

## Domain preflight

- **Проверено:** PO скрин — у «Организация» после «Карточка» стоит чёрный текстовый `+`, рядом в колонке A зелёные квадраты `+` на select-add-row.
- **Корень:** разметка уже ставит `pi-select-add-btn`, но **CSS класса нет в бандле**: Angular грузит только `src/styles.css`; дубль в `src/app/styles.css` мёртв; компонент `PiSelectAddRow` держит стили у себя (encapsulation) → голый `<button class="pi-select-add-btn">` снаружи выглядит как plain text.
- **НЕ:** не менять меню dropdown / promote / карточку поставщика; не трогать BE.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — SoT стилей кнопки в живой CSS

Перенести (или синхронизировать) блок `.pi-select-add-btn` (+ hover/focus/disabled) из `src/app/styles.css` / component styles в **`frontend/src/styles.css`** `@layer components` (рядом с другими pi-*).

`PiSelectAddRowComponent`: оставить разметку; **убрать дублирующие** button styles из component `styles:` (оставить только grid row), чтобы один SoT — global class. Комментарий: «styles in styles.css — reusable outside host».

`src/app/styles.css`: если файл не в angular.json — либо удалить мёртвый блок select-add, либо весь файл не трогать кроме удаления дубля (не подключать второй styles bundle без нужды).

### ШАГ 2 — Supply org row

В `supply-quick-order.component.ts` зона B «Организация»:

- Кнопка `data-test="supply-quick-supplier-add"` **обязана** визуально совпадать с зелёным `+` колонки A (ширина/высота/фон/border).
- «Карточка» остаётся text-link (`supply-quick-order__card-link`) — не делать её квадратом.
- Предпочтение: обернуть overflow-select + add в паттерн `app-pi-select-add-row` **если** «Карточка» не ломает grid; иначе оставить custom `org-row`, но кнопка только с классом `pi-select-add-btn` + `pi-focus-ring`.

### ШАГ 3 — Регресс-свип (короткий)

`rg "pi-select-add-btn" frontend/src` — каждый hit либо внутри `app-pi-select-add-row`, либо имеет global class (после шага 1). Не оставлять страниц, где `+` без класса/стиля.

### ШАГ 4 — Тест

- Jest supply: `supply-quick-supplier-add` имеет класс `pi-select-add-btn`.
- Опционально: snapshot/computed style в jsdom слаб — достаточно class + комментарий visual smoke в checklist.
- Jest select-add-row: row+btn по-прежнему PASS.

## КРИТЕРИИ ПРИЁМКИ

1. На `/supply` быстрый заказ → expand row → «Организация» → `+` = зелёный квадрат как у Категория/Материал (не plain text).
2. Dropdown по `+` работает (меню поставщика).
3. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
4. `cd frontend && pnpm exec jest src/app/pages/supply/supply-quick-order.component.spec.ts src/app/shared/ui/select-add-row/pi-select-add-row.component.spec.ts --no-coverage --runInBand`
5. В `AI-UI-CONTRACT.md` таблица: **PiSelectAddBtn** = class `.pi-select-add-btn` (styles.css) · использовать с `app-pi-select-add-row` или solo.

## Archive

`tasks/_archive/2026-08/` + checklist.
