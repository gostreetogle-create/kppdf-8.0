# Page chrome — крошки и компактный заголовок

**Канон PO (2026-08-09):** без `text-5xl` «простыней»; раздел = жёлтый пункт
топ-меню (не `pathLabel` eyebrow). На group-workspace — TOC/chips вплотную
под header. H1 ERP: `font-display text-lg`. Catalog detail имя (passport):
`text-lg sm:text-xl` max (TYPE-302).

## Компоненты

| Компонент | Когда |
|-----------|--------|
| `app-pi-page-chrome` | ERP-списки и detail: крошки + короткий H1 + `[actions]` |
| `app-pi-page-header` | UI-kit showcase (`size="display"`); ERP — prefer chrome |
| `app-pi-group-workspace` | TOC + section chips + tools; `pathLabel` deprecated no-op (TZ-UX-315) |
| `app-pi-breadcrumb` | Демо в `/navigation`; production prefer chrome |

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

## Карта разделов

| Раздел | SoT (топ-меню) / первый crumb | Страницы |
|--------|-------------------------------|----------|
| Каталог | `Каталог` | products, modules, materials, people, work-types + details |
| Сделки | `Сделки` | proposals, orders, contracts, organizations, production |
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

- Кнопки видны только на широких экранах (min-width 1680px — когда есть реальное
  поле ≥ ~140px); на узких — скрыты, чтобы не наезжать на studio rails / palette / A4.
- **Позиция / chrome:** PO 2026-08-15 — не пиксельный сдвиг fixed-кнопок.
  Канон: **две прозрачные chrome-панели** (`app-chrome-rail-left` /
  `app-chrome-rail-right`, ширина 64px) якорятся к `.pi-page-frame`
  (`position: relative`; rails `left:0` / `right:0`, `inset-block: var(--header-h) 0`).
  ← только в left, → только в right. **TZ-UX-321-FIX READY FOR REVIEW**
  (2026-08-15) — repair после premature closeout UX-321 (один left rail +
  `left:64px` без relative parent). TZ-UX-320 floating superseded.
  Page-tools (фильтр и т.п.) → successor TZ-UX-322 (не смешивать).
- `/login` никогда не подставляется предыдущим URL — глобальный ← не выкидывает на вход.
- `AppHistoryStore` аддитивен к `CatalogReturnStore` (API не менялся).

## См. также

- Каталожный выпадающий список: [`ui-overflow-select.md`](./ui-overflow-select.md)
- Дерево состава (строка = кнопка): [`ui-composition-tree.md`](./ui-composition-tree.md)

---

_Создано: 2026-08-07. Обновлено: 2026-08-15 (TZ-UX-321-FIX)._
