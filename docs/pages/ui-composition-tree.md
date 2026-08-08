# UI: Composition Tree — строки состава как кнопки

**Канон PO (2026-08-07):** дерево состава кликается как каталог-папки, без
прицеливания в крошечную стрелку и без синего выделения текста.

**Образец в коде:** `app-composition-tree`  
`frontend/src/app/shared/ui/composition/composition-tree.component.ts`  
**Эталон потребителя:** BOM на Карточке изделия (`ProductBomPanel`).

## Когда применять

Любое **иерархическое дерево** с длинными именами (состав изделия, модули,
вложенные справочники), где строка = действие (выбрать / раскрыть), а не
текстовое поле для копирования.

## Обязательное поведение (AC)

1. **Hit-target = вся строка** (бейдж + имя + qty), не только ›.
2. **Свёрнуто** → клик = выбрать и раскрыть.
3. **Уже выбран и раскрыт** → повторный клик = свернуть.
4. **Клик по другому уже открытому узлу** = выбрать, **не** схлопывать чужие ветки.
5. **Материал** (лист) → только выбор, раскрывать нечего.
6. **Без выделения текста:** `select-none` + `mousedown.preventDefault` на строке.
7. › — декоративный индикатор (крупнее строки), **только если есть дети**;
   пустой модуль/изделие и материал — без стрелки (spacer). Не единственная зона клика.
8. **Цвет по kind (TZ-330):** wash строки + цвет бейджа/бордера через
   `catalogKindOklch` (`shared/ui/catalog/catalog-kind-oklch.ts`). Не RAL.
   Persist пресетов → TZ-331.
9. **Containment outlines (TZ-333+):** раскрытый узел с детьми рисует
   `.comp-tree__nest` — нейтральная paper-подложка + hairline рамка; kind
   **не** заливает панель (иначе «всё розовое»). Свёрнуто → nest нет в DOM.
   Module-in-module = рамка в рамке. Не Excel-колонки. Канон смысла:
   [`docs/audits/2026-08-08-composition-containment-outline.md`](../audits/2026-08-08-composition-containment-outline.md).
10. **Пачки / cohesion (TZ-334+):** соседние nest — отдельные блоки
    (`space-y-4` / `mb-3`), толстый left rail 5px `catalogKindBorder(parent)`,
    inset hairline, сдвиг (`ml-5` / `pl-5`). Цвет kind — на **строках** и
    rail, не на заливке nest. Expand/клик без изменений.
    Канон:
    [`docs/audits/2026-08-08-composition-block-cohesion-visual.md`](../audits/2026-08-08-composition-block-cohesion-visual.md).

## Запрещено

- Раскрывать только по 16×16 стрелке («прицеливание»).
- Оставлять native text-selection на кликабельной строке дерева.
- Путать с editable-полем: здесь строка — control, не параграф для копирования.
- Фиксированные 3 колонки «Изделие | Модуль | Материал» (Excel rowspan).

## Связь с другими канонами

| Тема | Документ |
|------|----------|
| Каталожный dropdown | [`ui-overflow-select.md`](./ui-overflow-select.md) |
| Карточка изделия / BOM | [`product-detail.page.md`](./product-detail.page.md) |
| Containment outline | [`../audits/2026-08-08-composition-containment-outline.md`](../audits/2026-08-08-composition-containment-outline.md) |
| Nest cohesion / пачки | [`../audits/2026-08-08-composition-block-cohesion-visual.md`](../audits/2026-08-08-composition-block-cohesion-visual.md) |

## Фраза для агента / PO

> «Дерево / строки состава — по канону composition-tree»  
> = открыть этот файл и править `app-composition-tree` (или клонировать поведение).

---

_Создано: 2026-08-07. Обновлено: 2026-08-08 (TZ-333 nest · TZ-334 cohesion)._
