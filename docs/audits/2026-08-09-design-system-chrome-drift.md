# Аудит: design-system chrome drift

**Дата:** 2026-08-08 (closed as 2026-08-09 filename per TZ)  
**Канон:** [`docs/pages/ui-page-chrome.md`](../pages/ui-page-chrome.md)  
**Триггер:** TZ-UX-310 · после UX-309

---

## 1. Вердикт

Большинство **рабочих списков** уже на `PiGroupWorkspace`.  
**Detail** карточки каталога/заказов — на `PiPageChrome` (ок).  
Главный drift: **doc-constructor siblings** (Шаблоны/Тексты/Таблицы) ещё на `PiPageHeader`, пока Архив уже workspace (UX-309).  
`material-detail` — `PiPageHeader` vs product/module `PiPageChrome`.

`text-5xl` встречается только на demo `foundations` — не ERP-экран.

---

## 2. Таблица path → chrome

| Path / page | Chrome | Verdict |
|-------------|--------|---------|
| /products, /modules, /materials | workspace | PASS |
| /catalog/appearance | workspace | PASS |
| /proposals, /contracts, /orders | workspace | PASS |
| /counterparties, /people | workspace | PASS |
| /work-types (+ production chips) | workspace | PASS |
| /inventory/*, /storage-items, /warehouses, /stock-movements | workspace | PASS |
| /dictionaries/*, /form-profiles | workspace | PASS |
| /admin/users, /roles | workspace | PASS |
| /supply, /shipping | workspace | PASS (UX-309) |
| /design | workspace | PASS (UX-309) |
| /doc-constructor/documents | workspace | PASS (UX-309) |
| /doc-constructor/templates | page-header | **FAIL** |
| /doc-constructor/texts | page-header | **FAIL** |
| /doc-constructor/tables | page-header | **FAIL** |
| /doc-constructor/builder | custom | WARN (tool UI; не list) |
| /products/:id, /modules/:id, /orders/:id | page-chrome | PASS |
| /materials/:id | page-header | **FAIL** (parity) |
| /organizations | page-header | FAIL (list; chips Клиенты?) |
| /production (cockpit) | custom | WARN — out of scope UX-309 |
| /login | none | PASS |
| foundations / playground / overview / basics / forms / overlays / navigation | page-header | WARN (design-system demos) |
| foundations `text-5xl` | demo | WARN only |

---

## 3. Prioritized FAIL → successor TZ

| Pri | FAIL | Successor |
|-----|------|-----------|
| P0 | doc-constructor templates/texts/tables → workspace + DOCUMENTS chips | **TZ-UX-311-docs-chrome** (new; не путать с archived UX-311 tree) → предложить **TZ-UX-313** |
| P1 | material-detail → PiPageChrome like product/module | **TZ-UX-314** (или DETAIL-304 если расширять) |
| P2 | organizations → Clients chips + workspace | **TZ-UX-315** |
| — | production cockpit / builder / demos | не в wave; только если PO попросит |

Не кодить в UX-310.

---

## 4. Known OK после волны

Клиенты / Цех / Сделки / Каталог / Логистика / Проектирование / Архив документов — path+chips канон.
