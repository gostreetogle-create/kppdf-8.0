# Page chrome — крошки и компактный заголовок

**Канон PO (2026-08-07):** без `text-5xl` «простыней»; единые хлебные крошки
`Раздел / страница`; на group-workspace — метка раздела над chips.

## Компоненты

| Компонент | Когда |
|-----------|--------|
| `app-pi-page-chrome` | ERP-списки и detail: крошки + короткий H1 + `[actions]` |
| `app-pi-page-header` | UI-kit showcase (`size="display"`); ERP — prefer chrome |
| `app-pi-group-workspace` `pathLabel` | Каталог / Справочники / Склад / Админ |
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

| Раздел | pathLabel / первый crumb | Страницы |
|--------|--------------------------|----------|
| Каталог | `Каталог` | products, modules, materials, people, work-types + details |
| Сделки | `Сделки` | proposals, orders, contracts, organizations, production |
| Документы | `Документы` | documents, templates, texts, tables |
| Справочники | `Справочники` | dictionary group-workspace |
| Склад | `Склад` | inventory group-workspace |
| Админ | `Администрирование` | users/roles |

## Не путать

Group Chip Workspace **не** дублирует deep path-breadcrumb вместо chips —
только лёгкий `pathLabel` раздела. Deep path — на detail и на «простынных»
списках без chips (сделки/документы до cutover на group workspace).

---

_Создано: 2026-08-07._
