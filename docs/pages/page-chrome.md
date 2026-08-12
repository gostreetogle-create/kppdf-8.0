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
- **PENDING TZ-UX-316/317 (WAVE-NAV-RETURN):** deep-link edit + `returnUrl`; системные ←→ в **gutters** app shell (поля слева/справа от колонки). Старый запрет «глобальных ←→ нет» **отменяется** PO 2026-08-12 — канон: `docs/audits/2026-08-12-nav-return-gutters-canon.md`. После 317 этот абзац заменить фактом реализации.

## См. также

- Каталожный выпадающий список: [`ui-overflow-select.md`](./ui-overflow-select.md)
- Дерево состава (строка = кнопка): [`ui-composition-tree.md`](./ui-composition-tree.md)

---

_Создано: 2026-08-07. Обновлено: 2026-08-08 (TZ-UX-313)._
