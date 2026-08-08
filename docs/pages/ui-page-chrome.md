# UI page chrome — group workspace and page lists

Канон компактного ERP-chrome: списки и рабочие разделы используют существующий
`app-pi-group-workspace` с `pathLabel`, route chips и проекцией инструментов через
`tools`. Детальные страницы могут использовать `app-pi-page-chrome` с крошками и
заголовком.

## Group workspace

```html
<app-pi-group-workspace
  pathLabel="Раздел"
  [chips]="chips"
  activeId="current"
>
  <div tools class="flex items-center gap-form-field flex-wrap w-full">
    <!-- search, filters and actions -->
  </div>

  <!-- table, cards or an empty state -->
</app-pi-group-workspace>
```

Use one shared chip family for sibling routes. The active chip is the current
page; chips must point at real application routes. Keep business controls in the
`tools` slot so they stay in the sticky chrome row.

## Current long-haul adoption

| Section | Pages | Chips |
|---|---|---|
| Снабжение | `/supply`, `/shipping` | Закупки, Отгрузка |
| Проектирование | `/design` | Очередь |
| Документы | `/doc-constructor/documents` | Шаблоны, Архив, Тексты, Таблицы |
| Каталог | `/products`, `/modules`, `/materials` | Existing catalog chips |
| Сделки | `/proposals`, `/contracts`, `/orders` | Existing deals chips |

`app-pi-page-chrome` remains the appropriate pattern for detail pages and
simple pages without a sibling workspace. Do not duplicate app-layout
navigation, and do not use this migration to alter production cockpit internals.

See also [`page-chrome.md`](./page-chrome.md) for breadcrumb and section guidance.
