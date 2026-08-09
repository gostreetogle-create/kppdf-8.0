# UI page chrome — group workspace and page lists

Канон компактного ERP-chrome (эталон — Справочники / Клиенты / Сделки).

## Когда что

| Паттерн | Когда |
|---------|--------|
| `app-pi-group-workspace` | Списки и рабочие разделы с sibling-маршрутами: TOC/chips + `tools` (раздел = топ-меню; `pathLabel` deprecated) |
| `app-pi-page-chrome` | Detail / карточка / простая страница без sibling workspace: крошки + опциональный H1/actions |

Не дублировать app-layout nav внутри страницы. Не трогать production cockpit deep.

## Group workspace

```html
<app-pi-group-workspace
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
Раздел уже в топ-навигации — не передавать `pathLabel` (TZ-UX-315).

## Adoption (TZ-UX-309)

| Section | Pages | Chips |
|---|---|---|
| Логистика | `/supply`, `/shipping` | Закупки, Отгрузка |
| Проектирование | `/design` | Очередь |
| Документы | `/doc-constructor/documents` (+ siblings) | Шаблоны, Архив, Тексты, Таблицы |
| Каталог / Сделки / Клиенты / Цех / Склад | existing | NAV-302 / DICT — не ломать |

См. также [`page-chrome.md`](./page-chrome.md).  
Chrome drift audit: [`../audits/2026-08-09-design-system-chrome-drift.md`](../audits/2026-08-09-design-system-chrome-drift.md) (UX-310).
