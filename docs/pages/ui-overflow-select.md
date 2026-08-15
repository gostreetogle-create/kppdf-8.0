# UI: Overflow Select — каталожный выпадающий список

**Канон PO (2026-08-07):** длинные названия не раздувают окно и не заставляют
скроллить диалог. Образец в коде: `app-pi-overflow-select`.

**Эталон потребителя:** диалог «Добавить в состав» —
`product-composition-picker-dialog.component.ts`.

## Когда применять

Любой выбор из **каталога / справочника** с человекочитаемыми длинными
лейблами (изделие, модуль, материал, склад, контрагент…):

- внутри диалога / sheet / drawer;
- рядом с поиском-фильтром;
- где native `<select>` уезжает за экран или клипится `overflow` родителя.

## Когда НЕ

| Ситуация | Что взять |
|----------|-----------|
| 2–5 коротких enum (статус, тип) | обычный `<select class="pi-input">` или `app-pi-select` |
| Нав / меню действий | `piDropdownTrigger` / menu |
| Всегда видимый listbox без «выпадашки» | `app-pi-select` (list под триггером) |

## Обязательное поведение (AC)

1. **Закрыто:** одна строка-кнопка шириной колонки; выбранный текст до 2 строк
   (`line-clamp-2`), иначе placeholder.
2. **Открыто:** панель в **CDK Overlay** поверх диалога (не внутри
   `overflow-y-auto` body) — диалог **не** скроллится из‑за списка.
3. **Высота панели:** до `min(70vh, 28rem)`, свой скролл у списка.
4. **Ширина:** ≈ ширина триггера (min 280px); **не** раздувается длинным текстом.
5. **Текст опций:** `whitespace-normal break-words` — перенос, не одна бесконечная строка.
6. Закрытие: выбор пункта, клик по backdrop, Escape.
7. Поиск (если есть) — **слева** или сверху; список справа/ниже; фильтр не
   меняет ширину диалога.

## Запрещено

- `<select size="N">` (карусель/listbox навсегда открытый).
- Native `<select>` с длинными option внутри dialog `overflow-hidden`.
- Абсолютный dropdown **внутри** dialog body (обрежется → скролл диалога).
- Дергать ширину диалога при смене вкладки/контента списка.

## Код

```html
<label class="block min-w-0">
  <span class="eyebrow block mb-1.5">Что добавить</span>
  <app-pi-overflow-select
    [items]="available()"
    [(value)]="selectedId"
    placeholder="— выбрать —"
    ariaLabel="Что добавить"
  />
</label>
```

Компонент: `frontend/src/app/shared/ui/overflow-select/pi-overflow-select.component.ts`

## Checkbox / multi-toggle menus (канон UX-318)

Любой выпадающий список с **чекбоксами / multi-toggle** (не только
`PiOverflowSelect`): открыл → ставишь/снимаешь галочки → панель **остаётся
открытой**. Закрытие только: клик вне панели, Escape, повторный клик по
триггеру. **Запрещено:** `mouseleave` close и close-on-each-toggle для
checkbox-меню. Single-select / action-меню (один пункт = действие) по-прежнему
может закрываться сразу после выбора.

## Multi-select mode

`app-pi-overflow-select` supports `[multiple]="true"` with `selectedValues` / `selectedValuesChange` for a checkbox-like multi-choice panel. The overlay stays open while items are toggled, displays optional item `meta`, keeps the same `max-h-[min(70vh,28rem)]` panel, and applies the existing `searchable="auto"` threshold. Use this for multiple source fields inside dialogs; do not replace it with native `<select multiple>` or a 100px scroll box.

```html
<app-pi-overflow-select
  [items]="fieldItems()"
  [multiple]="true"
  [selectedValues]="selectedFieldKeys()"
  (selectedValuesChange)="onFieldsChange($event)"
  searchable="auto"
  placeholder="— выбрать поля —"
  ariaLabel="Поля источника"
/>
```

## Catalog selector inventory (TZ-UI-SELECT-301)

| Form / field | Control | Search policy | Value contract |
|---|---|---|---|
| Product FullEditor / category | `app-pi-overflow-select` | `searchable="auto"` (10+) | category id or empty |
| Material FullEditor / supplier | `app-pi-overflow-select` | `searchable="auto"` (10+) | supplier id or empty |
| Order / counterparty, site, product | `app-pi-overflow-select` | `searchable="auto"` (10+) | existing form ids |
| Proposal / organization, counterparty, product | `app-pi-overflow-select` | `searchable="auto"` (10+) | existing form ids |
| QuickCreate L / product category | `app-pi-overflow-select` | `searchable="auto"` (10+) | category id or empty |
| Fixed enums (status, kind, priority, units) | native `<select>` | not applicable | existing enum values |

Search is intentionally shown at ten or more loaded items; below that threshold the compact panel has no search field.

## См. также

- Дерево состава (строка = кнопка): [`ui-composition-tree.md`](./ui-composition-tree.md)
- Пикер «несколько подряд»: [`ui-add-and-continue.md`](./ui-add-and-continue.md)

## Фраза для агента / PO

> «Выпадающий список — по канону overflow-select»  
> = открыть `docs/pages/ui-overflow-select.md` и использовать `app-pi-overflow-select`.

---

_Создано: 2026-08-07. Источник: Карточка изделия → диалог состава._
