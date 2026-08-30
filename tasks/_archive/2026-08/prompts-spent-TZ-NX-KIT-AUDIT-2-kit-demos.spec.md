# TZ-NX-KIT-AUDIT-2-kit-demos

**РОЛЬ:** Executor (Claude CLI) · **DEP:** `TZ-NX-F3-data-access` must be archived first
**LAYER:** 2 (kit showcase pages)
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/kit/kit-overview.page.ts`;
`frontend-nx/apps/kppdf-web/src/app/pages/forms/forms.page.ts`;
`frontend-nx/apps/kppdf-web/src/app/pages/overlays/overlays.page.ts`

**НЕ ТРОГАТЬ:** `pages/login/**`, `pages/enroll/**`, `pages/forbidden/**`,
`pages/admin-*.page.ts`, `app.config.ts` auth wiring, `layout/kit-layout.component.ts`
— всё это принадлежит `TZ-NX-F3-data-access`, трогать только если после archive F3
осталась своя правка, требующая независимого фикса (отдельная задача).

## Origin

PO аудит "на какой стадии UI Kit" (2026-08-29): `/kit/overview` помечает "Формы и
таблицы" и "Оверлеи" как **"Статус: canonical"**, но обе страницы демонстрируют
меньше, чем реально есть в библиотеке. Разбор — в чате той сессии и в
`tasks/_archive/2026-08/TZ-NX-KIT-AUDIT-table-display.done.md` (раздел "Broader
audit findings").

## Обнаруженные, но не показанные примитивы (уже существуют в paper-and-ink)

- **`PiSelectAddRowComponent`** (`lib/select-add-row/`, TZ-UI-PLUS-605) —
  select + зелёная `+` в одном grid-ряду; клик открывает создание нового значения.
  Не выдумка — 25 живых мест использования в legacy `frontend/` (materials,
  products, orders, proposals, counterparties, doc-constructor). Мигрирован в
  F2a, но ни разу не используется в `frontend-nx/apps`.
- **`TableTreeComponent`** (`lib/pi-table-tree.component.ts`) — раскрывающаяся
  (expandable/tree) таблица с drag-drop reorder. Мигрирован в F2a, не
  используется в `frontend-nx/apps`.
- **`TableComponent`** (`lib/pi-table.component.ts`) сам по себе поддерживает
  `expandedRow`, `rowActions`, `selectionMode`, sticky-колонки — ни один из
  этих input'ов не задействован в текущем демо `/kit/forms`.

## ЧТО ДЕЛАТЬ

### B-1 — `/kit/forms`: реальные демо вместо голого стола

1. Добавить новую секцию (после текущей "Data table", отдельный eyebrow) —
   "Select + inline create": `app-pi-select` обёрнутый в
   `app-pi-select-add-row`, с рабочим `(addClick)` (минимум — открыть toast
   "Здесь будет создание нового значения" через уже подключённый
   `PiToastService`; полноценный create-flow — не в рамках этой задачи, это
   demo-заглушка на уровне "видно, что компонент работает и выглядит
   правильно").
2. Добавить секцию "Expandable table" — тот же `InventoryRow[]` датасет (или
   короткий отдельный), через `[expandedRow]` + `<ng-template>` показать
   расширенную строку (например доп. детали: поставщик/дата последней
   поставки — придумать 2-3 демо-поля, не тянуть реальный домен).
3. Добавить секцию "Tree table" — `app-pi-table-tree` с 2-3-уровневым
   демо-деревом (категории → подкатегории, как в `dictionaries/categories`,
   но заглушка-данные, не реальный API).
4. Опционально, если время позволяет: одна колонка в существующей Data table
   демонстрирует `sticky: 'right'` + `rowActions` (использовать
   `app-pi-row-actions`, уже мигрирован).

### B-2 — `/kit/overview`: честные статусы

5. "Формы и таблицы" — сменить `canonical` на честную формулировку, например
   `partial` с подписью, ЧТО именно canonical (select, form-field, input,
   basic table), а что показано частично (table variants — теперь показаны
   после B-1, так что можно вернуть `canonical`, если демо реально покрывает
   select-add-row + table-tree + expandedRow к моменту закрытия этой задачи).
6. Не выдумывать новый статус-словарь — использовать `canonical` /
   `experimental`, как остальная страница уже делает; при необходимости третье
   слово — согласовать с существующим паттерном, не изобретать with PO
   отдельно если неочевидно.

### B-3 — `/kit/overlays`: убрать overclaim

7. Docblock утверждает "Showcase 10 overlay primitives"; код honestly
   admits (комментарий в файле) что часть демонстрируется через Toast-имитацию
   вместо реального компонента (Sheet, Drawer, Tooltip, Popover, HoverCard,
   ContextMenu). Либо (a) реально смонтировать эти overlay-компоненты в демо
   (предпочтительно, если не тянет отдельную волну — они уже мигрированы в
   paper-and-ink), либо (b) если это осознанно отложено — переформулировать
   docblock и видимый на странице текст так, чтобы не заявлять "showcase 10
   primitives", а честно перечислить, что реально показано против того, что
   есть в библиотеке но не демонстрируется.

## Gates

```bash
cd frontend-nx && pnpm exec nx build kppdf-web
cd frontend-nx && pnpm exec nx run-many -t lint --all
cd frontend-nx && pnpm exec nx test kppdf-web --passWithNoTests
```

## Smoke (обязательно, не пропускать как в F4)

`nx serve kppdf-web` на `:4201` (или актуальный порт), реально открыть
`/kit/forms`:
- таблица скроллится ГОРИЗОНТАЛЬНО ВНУТРИ своей рамки (`overflow-x-auto`
  box), а не раздувает страницу — это и был исходный баг из скриншота PO,
  fix уже в `TZ-NX-KIT-AUDIT-table-display`, здесь только регрессия-check;
- select-add-row визуально виден и кликабелен;
- expandable/tree table раскрывается по клику.

Если сессия не может удержать background-процесс серва (как было в F4) —
явно зафиксировать в Executor report как known_limitation, не молчать об этом.

## Acceptance

- [ ] `select-add-row` реально смонтирован и виден на `/kit/forms`
- [ ] expandable table (либо `expandedRow`, либо `table-tree`, либо оба) виден на `/kit/forms`
- [ ] `/kit/overview` статусы соответствуют реально показанному на странице
- [ ] `/kit/overlays` не заявляет то, чего не показывает
- [ ] gates PASS
- [ ] smoke выполнен ИЛИ явно помечен known_limitation с причиной

## ARCHIVE

`tasks/_archive/2026-08/TZ-NX-KIT-AUDIT-2-kit-demos.done.md`
