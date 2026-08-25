# Page chrome — крошки и компактный заголовок

**Канон PO (2026-08-09):** без `text-5xl` «простыней»; раздел = жёлтый пункт
топ-меню (не `pathLabel` eyebrow). На group-workspace — TOC/chips вплотную
под header. H1 ERP: `font-display text-lg`. Catalog detail имя (passport):
`text-lg sm:text-xl` max (TYPE-302).

## Плотность (TZ-UI-DEN-511 + `ui-density-canon.md`)

| Элемент | Размер / класс | px |
|---------|----------------|-----|
| Крошки (links + meta) | `text-xs` | 12px |
| Текущая крошка (list-only title) | `text-base` | 16px |
| H1 (detail) | `text-lg` max | 18px |
| Описание под H1 | `text-xs` | 12px |
| Блок chrome | `pi-edge-bleed py-2 hairline-b` | vert 8px; horiz = `--space-page-x` через bleed |
| Межэлементный gap | `gap-1.5` / `gap-2` | 6–8px |
| **Content column inset** | `--panel-content-inset` on `.group-body` | ≥16px |

**Content column inset:** под `app-pi-group-workspace` (и аналогичный ERP list body) текст/контролы/доски **не** стартуют с x=0 колонки. Min **16px** (`--panel-content-inset`) `padding-inline` на `.group-body`. Anti-pattern: eyebrow/H1/label flush к левому краю `main` / к вертикали hairline-таблицы без общего inset (TZ-UX-443). `flushBody=true` (KP studio) — полный bleed без inset.

SoT компонента: `frontend/src/app/shared/page/pi-page-chrome.component.ts`.

## Brand home (TZ-UX-331 + TZ-NAV-303)

Левый бренд шапки `KPPDF · 8.0` — **кликабельный chip** (`data-test="nav-brand-home"`)
на `/` → **рабочий стол** `/desk` (**TZ-DESK-401**). Soft sunrise/gold + золотой маркер;
aria/title **«Рабочий стол — главная»** (не «Комбайн», не «Обзор» как дом).
Обзор KPI остаётся на `/dashboard`. Комбайн — **Проект** `/design/combine` (TZ-NAV-305).
Не путать с entry «Сделки» (Создать КП).


## Компоненты

| Компонент | Когда |
|-----------|--------|
| `app-pi-page-chrome` | ERP-списки и detail: крошки + короткий H1 + `[actions]` |
| `app-pi-page-header` | UI-kit showcase (`size="display"`); ERP — prefer chrome |
| `app-pi-group-workspace` | TOC + section chips + tools; `pathLabel` deprecated no-op (TZ-UX-315) |
| `app-pi-breadcrumb` | Демо в `/navigation`; production prefer chrome |

## Пагинация списков (TZ-UX-340)

Канон: **`<app-pi-pagination>`** — единственный визуальный pager SoT.

- Диапазон `N–M из T` + `‹`/`›` + номера (gaps) + select **10 / 25 / 50**
- Дефолт `PI_DEFAULT_PAGE_SIZE = 10` (`pi-pagination.constants.ts`)
- `app-pi-table` footer встраивает тот же компонент (`pageChange` / `pageSizeChange`)
- Скрытие при `total ≤ pageSize`; при смене size родитель сбрасывает на page 1
- Миграция grid/rail pages → TZ-UX-341 / 342

Аудит: `docs/audits/2026-08-16-pagination-unification-audit.md`

## Паттерн крошек

**Списки (шаблоны, заказы, КП…):** только крошки — без H1 и без `PiSection` «Каталог».

```html
<app-pi-page-chrome [crumbs]="[
  { label: 'Документы', link: '/templates' },
  { label: 'Шаблоны' }
]" />
<app-pi-toolbar>…</app-pi-toolbar>
<div class="pi-table-surface …">
  <app-pi-table … />
</div>
```

**Detail / нужен H1:**

```html
<app-pi-page-chrome
  [crumbs]="[{ label: 'Каталог', link: '/products' }, { label: name }]"
  [title]="name"
/>
```

## Рабочий стол `/desk` (TZ-DESK-406+)

Стол — **дом** после входа; раздел уже в brand-home («Рабочий стол — главная»).
**Не** дублировать label «Рабочий стол» в body chrome.

| Правило | Деталь |
|---------|--------|
| Shell | **`app-pi-group-workspace`** — одна sticky chip-row (daily workflow: Стол · КП · Комбайн · …), как peers на `/orders` |
| Запрет | Отдельный `<nav>` под `app-pi-page-chrome`; вторая crumb-строка «Рабочий стол / …» |
| Expand | Номер заказа — **suffix в той же** chip-row (`aria-current="page"`), не второй header |
| Ширина | Без своего `max-width`/padding поверх `.pi-page-frame` — контент = ширина ERP-списков |
| H1 | Нет видимого «Очередь заказов»; sr-only / aria ok |
| Эталон | `orders.page.ts` (group-workspace) + chips-константа `desk-workflow-chips.ts` |

## Карта разделов

| Раздел | SoT (топ-меню) / первый crumb | Страницы |
|--------|-------------------------------|----------|
| Каталог | `Каталог` | products, modules, materials, people, work-types + details |
| Сделки | `Сделки` | proposals, orders, contracts, organizations, production |
| Рабочий стол | brand-home → `/desk` | `/desk` — chips-only chrome, см. выше |
| Документы | `Документы` | documents, templates, texts, tables |
| Справочники | `Справочники` | dictionary group-workspace |
| Склад | `Склад` | inventory group-workspace |
| Админ | `Администрирование` | users/roles |

## Не путать

Group Chip Workspace **не** дублирует раздел над chips — раздел уже в топ-меню
(`pathLabel` input deprecated, TZ-UX-315). Deep path — на detail и на
«простынных» списках без chips.

## Возврат (TZ-UX-313)

| Механизм | Роль |
|----------|------|
| Browser ← (Alt+← / mouse back) | Полноценная история SPA |
| Ghost «← …» на catalog detail | Smart back: `Location.back()` если есть same-app `previousUrl`, иначе fallback на список раздела (`/products`, `/modules`, `/materials`) |
| Крошки (`PiPageChrome`) | **Структурные** IA (`Каталог / Модули / имя`), **не** browser history |

- Label кнопки: «← Назад» при известном referrer, иначе «← К каталогу / модулям / материалам».
- Прямой заход по закладке (нет previous) → всегда fallback на список.
- Helper: `frontend/src/app/shared/navigation/catalog-return.util.ts` (`CatalogReturnStore`).

## Системные ← → в полях (TZ-UX-317 + TZ-UX-320/321, канон 2026-08-12)

Глобальные **←** / **→** в **gutters** app shell (поля слева/справа от max-width
колонки `pi-page-frame`) — на всём сайте, **не** дубль жёлтого меню и **не**
крошки (крошки = структура IA, не история). Старый запрет «глобальных ←→ нет»
**отменён** PO — канон: `docs/audits/2026-08-12-nav-return-gutters-canon.md`.

| Механизм | Роль |
|----------|------|
| Глобальные ← → (`data-test="app-nav-back" \| "app-nav-forward"`) | **Браузерная история** через `Location.back()/forward()` |
| `AppHistoryStore` (`shared/navigation/app-history.store.ts`) | Same-app URL-стек из Router events: imperative навигации пушат, `popstate` двигает индекс, `replaceUrl`-тики (например `?categoryId` в builder) не растят стек |
| Кнопка без истории | **disabled** (deep-link / заход после логина) — не прыгает молча на fallback раздела |
| `returnUrl` (TZ-UX-316) | Приоритетнее истории для локального «←» в builder (Create КП → `/builder/:id` → «← К созданию КП») |

- Кнопки chrome-rail: старый порог **≥1680px** прятал рейлы, пока шапка ещё
  полная. С **1024px** у `.pi-page-frame` уже `padding-inline: 64px` — то же
  поле, что ширина рейла. **TZ-UX-345:** показывать с 1024. Ниже — toolbar fallback.
- **Позиция / chrome:** PO 2026-08-15 — не пиксельный сдвиг fixed-кнопок.
  Канон: **две прозрачные chrome-панели** (`app-chrome-rail-left` /
  `app-chrome-rail-right`, ширина 64px) якорятся к `.pi-page-frame`
  (`position: relative`; rails `left:0` / `right:0`, `inset-block: var(--header-h) 0`).
  ← только в left, → только в right. **TZ-UX-321-FIX READY FOR REVIEW**
  (2026-08-15) — repair после premature closeout UX-321 (один left rail +
  `left:64px` без relative parent). TZ-UX-320 floating superseded.
  Page-tools → **TZ-UX-322** (`PiChromeToolsService`, см. ниже).
- `/login` никогда не подставляется предыдущим URL — глобальный ← не выкидывает на вход.
- `AppHistoryStore` аддитивен к `CatalogReturnStore` (API не менялся).

## Page tools в chrome-rail (TZ-UX-322 / 323 / канон PO 2026-08-15)

### Зачем

Глобальные панели `app-chrome-rail-left/right` (64px, цель ≥1024 — TZ-UX-345, поле шапки) — **место для
иконок страницы**, чтобы не есть ширину рабочей плоскости (Гант, таблица, студия). History ←→ всегда сверху; page-tools — ниже, **со своим набором на
каждый route**.

### Как оформлять (обязательный паттерн)

```text
app-chrome-rail-left          app-chrome-rail-right
┌─────────────┐               ┌─────────────┐
│  ← history  │  (global)     │  → history  │  (global)
│  · spacer · │  ≈1 кнопка    │  · spacer · │
│  tool …     │  (page)       │  tool …     │  (page)
│  tool …     │               │  tool …     │
└─────────────┘               └─────────────┘
        │                              │
        └──── flyout overlay на main ──┘
              (центр НЕ сжимать)
```

| Правило | Деталь |
|---------|--------|
| API | `PiChromeToolsService.setTools(ownerId, items)` / `clear(ownerId)` на destroy |
| Только кнопки | В chrome — icon + RU aria/title; панели/списки = **flyout overlay** у страницы |
| Один owner | Обычно id страницы (`production-cockpit`); не копить чужие tools |
| Global ≠ page | History = браузерная навигация; page-tools = действия **этого** экрана |
| Отступ | Между history и первым page-tool — зазор ≈ высота одной кнопки (**TZ-UX-324**) |
| Visual | Лёгкое отличие фона/бордера page-tool от history (не вторая «коробка») |
| Пустая страница | Только ←→; spacer не показывать |
| Viewport | Пока шапка в `lg` (padding 64px, ≥1024) — рейлы видны (TZ-UX-345). 1680 был лишний. На &lt;1024 — icon-fallback в toolbar, **не** колонка `w-12` |
| Запрет | Не возвращать локальные 48px (`filters-rail` `w-12`) внутрь страницы. Крошки/TOC (**TZ-UI-404/405**) рейлы **не** удаляли |

### Эталон consumer

`/production` (Гант) — **TZ-UX-323 DONE**: Заказы · Фильтры · Обновить | Карточка · Сегодня · Масштаб.

### Миграция остальных страниц

1. **Аудит кандидатов** — **TZ-UX-325 DONE** →
   [`docs/audits/2026-08-15-chrome-page-tools-migration-audit.md`](../audits/2026-08-15-chrome-page-tools-migration-audit.md)
   (P0: `/products` **UX-326 DONE**, `/modules` **UX-327**, `/materials` **UX-328 DONE** —
   локальный `filters-rail` `w-12` снят на products/modules/materials).
2. **Волна переносов** —
   [`tasks/_backlog/WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE.md`](../../tasks/_backlog/WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE.md)
   (#1–#3 DONE; 329→330 по PO).
3. **Новые dense UI (обязательно):** сразу `PiChromeToolsService` + flyout overlay —
   **не** добавлять локальную колонку ~48px / `w-12` рядом с контентом.
4. Студии с уже готовым icon-rail (КП Create, Builder) — **не дублировать** в chrome
   без отдельного PO; Гант уже мигрирован (323).

Страницы проецируют icon-tools через
`PiChromeToolsService` (`frontend/src/app/shared/chrome/`):

| API | Роль |
|-----|------|
| `setTools(ownerId, items)` | Один write-path: заменить список владельца |
| `clear(ownerId)` | Снять tools при destroy страницы |
| `leftTools` / `rightTools` | Merged computed для AppLayout |

- Кнопки `data-test="chrome-tool-{id}"`, RU `aria-label`/`title`.
- Класс `app-chrome-page-tool` (+ `.is-active`) — muted paper-2/rule vs raised history.
- Spacer `data-test="chrome-rail-tools-gap"` только когда на стороне есть tools.
- Flyout/панели остаются у страницы (overlay).

## Куда делись боковые меню (не откат)

Локальные полоски фильтра у каталога (`filters-rail` `w-12`) **перенесены**, не стёрты:
**TZ-UX-326** `/products`, **327** `/modules`, **328** `/materials` (канон 15–16.08:
место у ←→). Иконки — `PiChromeToolsService` → chrome-rail; панель фильтров — flyout.

**TZ-UI-404/405** (крошки/TOC) chrome-rail **не трогали**.

Почему казалось, что пропали: `display:none` ниже 1680px + почти прозрачный фон
(UX-321-FIX), хотя поле шапки 64px уже с 1024. **Не** git revert 326–328.

## См. также

- Каталожный выпадающий список: [`ui-overflow-select.md`](./ui-overflow-select.md)
- Дерево состава (строка = кнопка): [`ui-composition-tree.md`](./ui-composition-tree.md)
- Gantt studio SoT: [`../ux/production-gantt-studio-spec.md`](../ux/production-gantt-studio-spec.md)

---

_Создано: 2026-08-07. Обновлено: 2026-08-23 (DEN-511 page-chrome density)._
