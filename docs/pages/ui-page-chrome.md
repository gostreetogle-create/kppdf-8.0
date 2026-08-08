# UI page chrome — group workspace and page lists

Канон компактного ERP-chrome (эталон — Справочники / Клиенты / Сделки).

## Когда что

| Паттерн | Когда |
|---------|--------|
| `app-pi-group-workspace` | Списки и рабочие разделы с sibling-маршрутами: `pathLabel` + route chips + `tools` |
| `app-pi-page-chrome` | Detail / карточка / простая страница без sibling workspace: крошки + опциональный H1/actions |

Не дублировать app-layout nav внутри страницы. Не трогать production cockpit deep.

## Group workspace

```html
<app-pi-group-workspace
  pathLabel="Раздел"
  [chips]="chips"
  activeId="current"
>
  <div tools class="flex items-center gap-form-field flex-wrap w-full">
    <!-- search, filters, CTA -->
  </div>

  <!-- table / stub / empty -->
</app-pi-group-workspace>
```

Одна chip-family на sibling routes. Active chip = текущая страница. Controls — в sticky `tools`.

## Adoption (TZ-UX-309)

| Section | Pages | Chips |
|---|---|---|
| Логистика | `/supply`, `/shipping` | Закупки, Отгрузка · pathLabel «Логистика» |
| Проектирование | `/design` | Очередь · pathLabel «Проектирование» |
| Документы | `/doc-constructor/documents` (+ siblings) | Шаблоны, Архив, Тексты, Таблицы · pathLabel «Документы» |
| Каталог / Сделки / Клиенты / Цех / Склад | existing | NAV-302 / DICT — не ломать |

См. также [`page-chrome.md`](./page-chrome.md).  
Chrome drift audit: [`../audits/2026-08-09-design-system-chrome-drift.md`](../audits/2026-08-09-design-system-chrome-drift.md) (UX-310).
