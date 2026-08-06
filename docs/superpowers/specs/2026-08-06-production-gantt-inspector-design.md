# Design: Production Gantt cockpit — inspector + people↔workTypes (2026-08-06)

**Status:** APPROVED by PO intent («делай до конца») · implements wave after PRODUCTION-303  
**North star:** страница отражает производство по заказам; клик по заказу = иерархия состава + управление оценкой; люди привязаны к видам работ и видны на Ганте.

## PO asks (captured)

1. День чуть уже (дата «04.08» + воздух).
2. Предпочтительно: клик заказ → боковая панель управления (не обязательно активный drag календаря).
3. В панели: поля для Ганта (дни вида работ, planned, приоритет, стадии) + дерево товар→модуль→вид работ.
4. Обязательно: люди ↔ виды работ в форме «Люди»; отражение на полосках Ганта.
5. Drag полосок — только если чисто; иначе не ломать.
6. Фильтры (даты, важность/приоритет).

## Approaches

| # | Approach | Pros | Cons |
|---|----------|------|------|
| A | Full interactive Gantt (drag resize + schedule writes) | Familiar MS Project | Нет order-level duration SoT; resize = PATCH catalog WorkType.days — опасно |
| B | **Inspector-first (рекомендация)** | Совпадает с PO «проще»; дерево + edits; drag later | Drag отложен |
| C | Modal dialog only | Быстро | Хуже для дерева + постоянный контекст с календарём |

**Выбор: B.** Панель справа в layout кокпита (не modal). Drag полосок — **out of this wave** (нужен order-level override days; иначе правка каталога).

## Design

### Layout
```
[ Orders rail | Gantt timeline ................ | Order inspector (optional) ]
```
- Inspector открывается по клику заказа в rail (и по клику строки/полосы).
- «Все активные» закрывает inspector.
- Размер inspector ~360–400px, Paper & Ink, hairline.

### Inspector content
1. Header: номер, status pip, priority select, plannedDate input, Save.
2. Tree (expand/collapse):
   - Product (qty ×N)
     - Module
       - WorkType: days (number), workers labels (from Worker.workTypeIds)
3. Edit days → PATCH `/work-types/:id` `{ days }` with hint «дни справочника — на все заказы с этим видом».
4. Empty composition → clear RU status.

### People form
- Checkbox list / multi-select of active WorkTypes → persist `workTypeIds`.

### Gantt
- `GANTT_PX_PER_DAY.day`: 48 → **36**.
- `workerLabel` from workers whose `workTypeIds` contains bar.workTypeId (join «, », else «—»).
- Filters in header/rail: priority multi or select; date from/to on plannedDate/date.

### Explicitly not in this wave
- Bar drag/resize writes.
- Actual vs planned dual bars.
- ProductionOrder / check-in.

## Success criteria
- `/production`: уже день; клик заказ → inspector с деревом.
- Люди: видны и сохраняются виды работ.
- Полоски показывают ФИО при привязке.
- Фильтр priority + date range сужает rail и/или bars.
- Jest production + people form green; FE tsc pass.
