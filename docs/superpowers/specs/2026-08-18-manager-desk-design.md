# Design: рабочий стол менеджера (2026-08-18, rev.2)

> **Статус:** 401 DONE; PO review 2026-08-18 — **правки раскладки до наполнения**.  
> **Page:** [`docs/pages/manager-desk.page.md`](../../pages/manager-desk.page.md)

## 0. Зачем

Менеджер утром открывает **одну** страницу: очередь заказов, клик по строке → сразу
вся информация и действия **внутри строки**, без прыжков вправо и без «второго экрана
ниже списка». Flyout — только для форм. Гант/Комбайн — через **хлебные крошки** на
том же `/desk`, не отдельная вселенная.

## 1. Платформа

Веб = SoT. Десктоп не клонирует CRUD. Один write-path на заказ/состав/ lane.

## 2. PO review (401) — зафиксировано

| # | Запрос PO | Решение |
|---|-----------|---------|
| 1 | Много заказов → выбранный «уезжает вниз» | **Expand-in-row** (как `/orders` HUB-302): клик по строке раскрывает tray **под этой строкой**, не отдельный блок ниже очереди |
| 2 | Дубль «нижнего меню» | Убрать `__innards` под очередью; всё в expanded tray |
| 3 | Далеко ехать вправо за кнопками | **Primary actions в tray** (CTA, ссылки снабжение/документы, мини-комбайн); rail — вторичный/дублирующий |
| 4 | Левые кнопки → flyout **слева** | `panelSide=left` для create/filter/summary (эталон: `production-cockpit`, `kp-create-studio__flyout--left`) |
| 5 | Правые кнопки → flyout **справа** | client/bom/docs/supply — как сейчас, но справа |
| 6 | «Личное пространство» сверху | Заменить eyebrow+H1 на **`app-pi-page-chrome`** (crumbs only, без description) |
| 7 | Хлебные крошки + быстрый Гант | Crumbs: `Рабочий стол / З-1001 / Гант`; `?view=desk\|gantt\|combine` + `orderId` — **DESK-407** |
| 8 | Блокнот заметок к заказу/изделию/модулю | Новая сущность + колонка «Блокнот» — **DESK-408** (после 402) |
| 9 | Мини-комбайн в tray заказа | Read-only полосы lane по изделиям (+ DnD — только если reuse Combine без второго write-path) — **403+** |
| 10 | Быстрое прикрепление изделий/модулей/материалов | Successor — **409** |
| 11 | Workflow crumbs (не справочники/админ) | Strip: Стол·КП·Комбайн·Гант·Снабжение·Отгрузка — §3a |
| 12 | Не велосипед | **Reuse-first** §11 |

### 3a. Workflow strip (daily flow)

Полоса ссылок в chrome стола. **Включить:** Рабочий стол, КП, Комбайн, Гант, Снабжение, Отгрузка.
**Исключить:** Каталог, Клиенты, `/orders` (дубль), Справочники, Админ, Конструктор документов, Договоры (v1).

| RU | Route |
|----|-------|
| Рабочий стол | `/desk` |
| КП | `/proposals/create` |
| Комбайн | `/design/combine` (+ `orderId` если выбран) |
| Гант | `?view=gantt` (407) или `/production?orderId=` |
| Снабжение | `/supply` |
| Отгрузка | `/shipping` |

Path crumbs рядом: `/ З-1001` · `/ Гант` при drill-in.

## 3. Раскладка (rev.2)

```
[ app chrome nav ]
[ workflow strip: Стол · КП · Комбайн · Гант · Снабжение · Отгрузка ]
[ path crumbs: / З-1001 / … ]

[ L rail ] [ центр ≥65% ] [ R rail if expanded ]
           [ L flyout overlay | R flyout overlay ]  ← не push, rail остаётся кликабельным

Центр:
  ┌─ очередь (scroll только список, max-height или virtual later)
  │   row З-1001
  │   ▼ expanded tray (gold rail, как orders.page)
  │       § Заказ · § Исполнение · § Комбайн-strip · § Состав · inline CTA
  │   row З-1002
  └─ …
```

**Пустой выбор:** crumbs = `Рабочий стол`; правый rail скрыт; CTA «Создать заказ» в empty queue.

**Блокнот (408):** опциональная **левая колонка** в центре (40/60) или flyout `panel=notebook` —
решение в 408; не блокирует 405.

## 4. Flyout grammar

| Rail | Panels | Сторона flyout |
|------|--------|----------------|
| Left | create, filter, summary | **left** (после L rail, `360–400px`) |
| Right | client, bom, docs, supply | **right** |

Backdrop + Esc. Центр не сжимается.

## 5. Breadcrumb + studio views (407)

Query: `orderId`, `panel`, **`view`**.

| view | Crumbs (пример) | Центр |
|------|-----------------|-------|
| `desk` (default) | Рабочий стол / З-1001 | очередь + expand |
| `gantt` | Рабочий стол / З-1001 / Гант | reuse `GanttBarsComponent` + rail subset для одного orderId |
| `combine` | Рабочий стол / З-1001 / Комбайн | reuse mini-kanban strip / filtered combine rows |

Клик «Рабочий стол» → `view=desk`. **Не** iframe; **не** второй API write-path.
Если embed слишком дорог — fallback 404 (`/production?from=desk`) с кнопкой «На стол».

## 6. Блокнот (408, outline)

Сущность **`DeskNote`** (рабочее имя): `text`, `kind` (`note`|`checklist`|`reminder`),
anchor `{ orderId, lineId?, moduleId? }`, `authorId`, timestamps.
Не личный календарь; фильтр по заказу/изделию/модулю; компактный список + «+ заметка».
Backend CRUD + FE column. Не reuse `Comment` (`packageTag` — другой домен).

## 7. Переиспользование

| Паттерн | Откуда | На столе |
|---------|--------|----------|
| Expand row | `orders.page` expandedTpl | 405 |
| `app-pi-page-chrome` | product-detail, combine | 405 |
| L/R flyout | production-cockpit, kp-create | 405 |
| composition-tree | orders expand | 403 в tray |
| order form panel | order-form-dialog | 402 |
| Gantt bars | production-cockpit | 407 |
| Combine rows | dashboard.page | 403/407 |

## 8. Волны (rev.2)

| ID | Что | Gate |
|----|-----|------|
| **401** | ✅ fixture каркас | DONE |
| **405** | Crumbs, expand-in-row, dual flyout, убрать innards | PO «раскладка ок» v2 |
| **402** | Форма заказа, GET /orders | после 405 |
| **403** | Состав + combine-strip в tray | после 402 |
| **404** | Deep-link студии + «На стол» (fallback) | параллельно 403 ok |
| **407** | Breadcrumb `view=gantt\|combine` embed | после 405 |
| **408** | Блокнот DeskNote BE+FE | после 402 |
| **409** | Быстрое add item/module/material | backlog |
| **410** | Search/filter/sort очереди (reuse orders) | после 402 |
| **411** | Capabilities strip + CTA why-disabled | после 405/402 |
| **412** | **Extract shared order-hub-tray** | после 405, **до 403** |

Подробно: [`2026-08-18-manager-desk-architect-gaps.md`](./2026-08-18-manager-desk-architect-gaps.md)

## 9. НЕ

- Отдельный блок «выбранный заказ» под очередью (401 anti-pattern)
- Один flyout справа для всех панелей
- Eyebrow «Ежедневная тетрадь…» вместо crumbs
- Второй FormGroup заказа; второй tree; десктоп-клон
- God-page > ~400 строк shell — выносить tray/notebook в child components

## 11. Reuse-first (канон наполнения)

PO: «не неделями ловить баги на столе».

1. **Host, не rewrite** — tray = extract из `orders.page` `#expandedTpl`; flyout L/R = паттерн `production-cockpit`; tree = `composition-tree`; форма = `order-form-panel`.
2. **Баг в источнике** — если при переносе видим коллапс (400, статус, DTO) → сначала TZ/fix в **исходном** экране, потом host на `/desk`.
3. **Один write-path** — стол только вызывает те же сервисы/API, не дублирует FormGroup.
4. **405–407** = визуальная грамматика + fixture/stubs; **402–403** = живой код через reuse.

## 10. Успех для PO

Клик по З-1002 → tray под строкой: статус, клиент, CTA, полоска комбайна, состав,
кнопки рядом. Слева «Создать» — панель слева. Crumbs → «Гант» — тот же заказ на
Ганте в центре, crumb «Рабочий стол» — обратно. Утром не стыдно показать коллеге.
