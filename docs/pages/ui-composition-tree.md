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

### Переиспользование (PO 2026-08-08 — не потерять)

Тот же каскад (изделие→изделие→модуль→деталь, card-within-card + rail)
— **образец** для других вложенностей. Первый foreseen consumer:

- **Заказ:** chrome «Заказ №…» вместо «Состав»; корни = изделия заказа;
  внутри — live BOM каталога (`getProductTree`). Статусы на узлах — later.
  TZ: `tasks/_archive/2026-08/TZ-ORDERS-302.done.md` (DONE).
  Страница: `frontend/src/app/pages/orders/order-detail.page.ts` · `/orders/:id`.
- Pattern lock: [`../audits/2026-08-08-composition-cascade-pattern-lock.md`](../audits/2026-08-08-composition-cascade-pattern-lock.md)
- Скрин-эталон (dark): [`assets/composition-tree-cascade-dark-2026-08-08.png`](./assets/composition-tree-cascade-dark-2026-08-08.png)

Правило: новые экраны **подключают** `app-composition-tree`, не копируют CSS.

## Обязательное поведение (AC)

1. **Hit-target = вся строка** (бейдж + имя + qty), не только ›.
2. **Свёрнуто** → клик = выбрать и раскрыть.
3. **Уже выбран и раскрыт** → повторный клик = свернуть.
4. **Клик по другому уже открытому узлу** = выбрать, **не** схлопывать чужие ветки.
5. **Материал** (лист) → только выбор, раскрывать нечего.
6. **Без выделения текста:** `select-none` + `mousedown.preventDefault` на строке.
7. › — декоративный индикатор (**≤ `text-base`**, TZ-UI-TYPE-302), **только если есть дети**;
   пустой модуль/изделие и материал — без стрелки (spacer). Не единственная зона клика.
8. **Цвет по kind (TZ-330):** только бейдж ИЗД/МОД/МАТ (текст + рамка) и
   left rail nest — **строка/карточка белая** (`--color-paper`), без kind-wash.
   Не RAL. Persist пресетов → TZ-331.
9. **Containment:** раскрытый узел = **одна карточка** (шапка + nest без зазора
   `mt-0`; общая hairline-рамка на node). Nest — мягкий каскад Paper & Ink
   (~4/8/13/18%), rail 5px. Kind — бейдж + rail. Свёрнуто → nest нет в DOM.
10. **Пачки:** sibling gap (`mb-3` на раскрытом node), `space-y-3` внутри nest.
11. **Thumb + имя (TZ-UX-311/312):** после бейджа ИЗД/МОД/МАТ — превью
    **≥36px** (`w-9 h-9`; `photoUrl` → `<img object-cover>`; иначе Lucide Image
    opacity ~0.45). Имя: `line-clamp-2` + `break-words` (не `truncate`);
    `title` = полное имя; qty / счётчик — `shrink-0`.
    Строка: `min-h-11`, плотные `px-1.5 py-1 gap-1` (ближе к краям).
12. **Type scale (TZ-UI-TYPE-302):** kind badge / «глуб.» — `eyebrow` / `text-xs`
    (не `text-[10px]`); имя `text-sm`; qty `text-xs`.

## Запрещено

- Раскрывать только по 16×16 стрелке («прицеливание»).
- Оставлять native text-selection на кликабельной строке дерева.
- Путать с editable-полем: здесь строка — control, не параграф для копирования.
- Фиксированные 3 колонки «Изделие | Модуль | Материал» (Excel rowspan).

## Тёмная тема (TZ-CATALOG-335)

На dark nest `color-mix(ink→paper)` со light-шагами (~4/8/13/18%) давал
**слабый серый каскад**. Исправление (без kind-wash flood):

| Режим | Стратегия |
|-------|-----------|
| **Light** | без изменений 334: ink 4/8/13/18% + мягкий rule mid-stop |
| **Dark** | (A)+(B)+(C): ink **12/22/34/46%**, rule chroma mid-stop 10–28%, inset edge shadow по depth |

Kind по-прежнему только бейдж + left rail. Строки — `paper`, не tinted wash.

## Связь с другими канонами

| Тема | Документ |
|------|----------|
| Каталожный dropdown | [`ui-overflow-select.md`](./ui-overflow-select.md) |
| Карточка изделия / BOM | [`product-detail.page.md`](./product-detail.page.md) |
| Containment outline | [`../audits/2026-08-08-composition-containment-outline.md`](../audits/2026-08-08-composition-containment-outline.md) |
| Nest cohesion / пачки | [`../audits/2026-08-08-composition-block-cohesion-visual.md`](../audits/2026-08-08-composition-block-cohesion-visual.md) |
| Pattern → Orders | [`../audits/2026-08-08-composition-cascade-pattern-lock.md`](../audits/2026-08-08-composition-cascade-pattern-lock.md) |
| Dark depth | **TZ-CATALOG-335 DONE** (dark ladder 12/22/34/46 + rule chroma + inset) |

## Фраза для агента / PO

> «Дерево / строки состава — по канону composition-tree»  
> = открыть этот файл и править `app-composition-tree` (или клонировать поведение).  
> Заказ целиком — тот же паттерн (ORDERS-302), не второе дерево.

---

_Создано: 2026-08-07. Обновлено: 2026-08-08 (333/334 · Orders · dark 335 · UX-311/312 thumb density)._
