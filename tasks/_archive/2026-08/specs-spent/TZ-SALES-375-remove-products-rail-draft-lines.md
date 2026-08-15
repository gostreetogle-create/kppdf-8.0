# TZ-SALES-375: Убрать «Позиции КП» из панели Товары

РОЛЬ АГЕНТА: Frontend UI (Create КП products rail)

ЗАВИСИМОСТИ: SALES-374 DONE; AUTH-305 keys не пересекаются

LAYER: 2

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

CONFLICT KEYS: frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts ; frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.spec.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.ts ; frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts ; docs/pages/proposals-create.page.md ; docs/pages/PAGE-TZ-INDEX.md

Проверено:
- UI блок: `proposal-product-rail.component.ts` L196–216 (`data-test="kp-rail-draft-lines"`, eyebrow «Позиции КП»)
- Qty на карточках: `В КП: N` + add-qty + «Добавить»/«Ещё +N» (L236–266) — оставить
- Qty/состав правятся в «Редакторе таблицы» через `lineChange` → `onCompositionLineChange`
- Rail `quantityChange` → page `onQuantityChange` — **только** от этого списка; table editor не использует
- `draftLines` input нужен для `inKpQty()` — **не** удалять input

Loose wording PO «позиции КП лишние / дубль таблиц» → удалить section `rail__draft-lines` из flyout Товары.

## ИСХОДНОЕ СОСТОЯНИЕ

1. Под поиском в «Товары» при `draftLines.length > 0` растёт список «Позиции КП» с qty inputs.
2. Список толкает сетку карточек вниз и дублирует qty из редактора таблицы + бейдж «В КП» на карточке.
3. PO: убрать блок; менять количество в таблице / через карточки.

## ЧТО ДЕЛАТЬ

### ШАГ 1. Убрать UI блок

1. Удалить template section `@if (draftLines().length > 0) { … rail__draft-lines … }`.
2. Удалить CSS `.rail__draft-lines` / `.rail__draft-line` / `.rail__draft-line-name` (и связанные, если только для блока).
3. Удалить `quantityChange` output, `onQuantityChange`, `lineTrack` если больше не нужны.

### ШАГ 2. Page wiring

1. В `proposal-create.page.ts` убрать `(quantityChange)="onQuantityChange($event)"` с `<app-proposal-product-rail>`.
2. Удалить page `onQuantityChange` **если** больше нигде не вызывается (table editor уже через `onCompositionLineChange`). Spec, который бил page method напрямую — перевести на `onCompositionLineChange({ index, patch: { quantity } })` или удалить как dead coverage.

### ШАГ 3. Tests

1. `proposal-product-rail.component.spec.ts`: удалить тест «clamps draft-line quantity…» / любые assert на `kp-rail-draft-lines` / `kp-line-quantity-*`.
2. Добавить/оставить assert: при непустых `draftLines` **нет** `[data-test="kp-rail-draft-lines"]`, но бейдж `kp-rail-in-kp-*` и «Ещё +N» работают.
3. Page specs: не требовать UI draft-list; qty через composition/table path.

### ШАГ 4. Docs

1. `proposals-create.page.md` — note **375**: в flyout «Товары» нет списка «Позиции КП»; состав/qty — «Редактор таблицы»; витрина — «В КП» + add.
2. `PAGE-TZ-INDEX.md` — `/proposals/create` + 375.

## ИЗМЕНЯТЬ

- CONFLICT KEYS выше + checklist / progress / archive по `GEMINI.md`

## НЕ ИЗМЕНЯТЬ

- Логику `draftLines` / autosave / build / table editor qty
- Карточный add-qty / «В КП» / «Ещё +N» / chips / поиск
- BE, schema, AUTH-305, `/products` catalog page
- Deploy

## КРИТЕРИИ ПРИЁМКИ

1. Create КП → Товары при строках в КП: **нет** блока «Позиции КП» / `kp-rail-draft-lines`.
2. Карточки сразу под фильтрами; «В КП: N» и add работают.
3. Qty меняется в «Редакторе таблицы» как раньше.
4. Gates:
   ```text
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- proposal-product-rail
   cd frontend && pnpm test -- proposal-create
   ```
5. Docs + PAGE-TZ-INDEX обновлены.
6. READY FOR REVIEW → archive **только** после Cursor PASS.

## known_limitation

- Custom lines без карточки каталога по-прежнему видны только в редакторе таблицы (это ок — не возвращать список в Товары).
