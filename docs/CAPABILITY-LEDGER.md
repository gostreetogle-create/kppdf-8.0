# Capability ledger — что продукт умеет / чего нет

> **Зачем:** агенты не должны «догонять» фичи из воздуха и не должны возвращать то, что PO уже снял.  
> **Состояния** (ровно одно на строку): `included` · `available` · `absent` · `removed`.  
> **Обновлено:** 2026-08-11 (adopted from vibe template idea; adapted to kppdf).

Связанные SoT (не дублировать длинно):

| Тема | Документ |
|------|----------|
| Готовность разделов для боевых данных | [`SECTION-READINESS.md`](./SECTION-READINESS.md) |
| Новая страница / право / MCP | [`FEATURE-INTEGRATION-CHECKLIST.md`](./FEATURE-INTEGRATION-CHECKLIST.md) |
| Роли / поток цеха | [`product-vision-lite.md`](./product-vision-lite.md) |
| Режимы задачи агента | [`AGENT-TASK-MODES.md`](./AGENT-TASK-MODES.md) |

---

## 0. Правила

1. Нет строки = **`absent`**. Добавь строку, не угадывай.
2. **`removed`** = намеренно выпилено / запрещено. Код-остаток или упоминание в docs **не** право вернуть без явного PO.
3. **`available`** = код/экран есть, но контур ещё нельзя считать рабочим; в Note — чего не хватает.
4. **`included`** = ожидается, что работает в текущем контуре (см. также SECTION-READINESS).
5. Обновляй ledger **в том же TZ/PR**, где capability добавлен/снят (как FIC).
6. Ledger — про **продуктовые способности**, не про файлы в репо.

---

## 1. Ledger (канон)

| Capability | State | Note |
| --- | --- | --- |
| Auth (login / JWT access+refresh) | included | Session must survive F5; Basic Auth на edge — ops, не замена login. |
| Admin users / roles / permissions | included | Базовый CRUD; warehouse-scoped ACL — нет. |
| Catalog: materials list/detail/forms | included | UI RU; остаток SoT = склад, не `Material.stockQty`. |
| Catalog: products + composition (BOM) | available | FullEditor + дерево есть; cutover/polish и единый write-path — дожимать по SECTION-READINESS. |
| Catalog: modules | available | Карточки/состав частично; не плодить второй BOM UI. |
| Dictionaries (units, colors, categories, form profiles S/M/L) | included | Справочники READY*; form profiles — канон быстрого create. |
| Counterparties / clients | included | Канон имени: Counterparty ≠ Organization. |
| Warehouse: warehouses, stock, movements | included | READY TO USE*; ACL/автосписание — HARDENING / absent. |
| Warehouse: auto-issue on work complete | absent | После ручного приход/расход; не блокирует READY склада. |
| Deals / quotations (КП) studio | available | WAVE KP на main; shame-polish / smoke у PO; не начинать параллельный create-path. |
| Orders (shop floor order card) | available | Зависит от sales→shop canon; не дублировать дерево состава. |
| Documents: templates / builder / archive | available | Builder MVP; create-parity и превью — смотри DOC-* / SECTION-READINESS. |
| Documents: PDF print from quotation | available | Puppeteer/Chrome path; 503 fallback — ок; live smoke зависит от host. |
| People / workers | available | People page; связка склад/производство позже. |
| Work types (₽/час) under Цех | included | Меню: Виды работ под Цех, не Settings/Каталог. |
| Production cockpit / Gantt | available | Shell/MVP; не бухгалтерия и не fine ACL. |
| Supply: quick order + registry + shipping | included | TZ-SUPPLY-305..312: `SupplyRequest` → «Заказано» → `SupplyTask` реестр; отгрузка из заказа (dispatch в транзакции). Stand smoke `scripts/smoke/supply-smoke.mjs` 23/23; браузерный проход PO после deploy. |
| Procurement legacy: PurchaseRequest/PurchaseOrder | available | **LEGACY (TZ-SUPPLY-313, вариант A)**: read-only API + MCP (`kppdf_list/get_purchase_*`), без UI, не расширять; новые закупки — через `SupplyRequest`/`SupplyTask`. Удаление — отдельная волна после развязки MCP (вариант B, successor). |
| Desktop app + MCP pairing | available | Basic Auth + `X-Access-Token`; version gate — backlog. |
| Desktop order import (Excel → mutation-journal → Order) | included | TZD-ORDER-IMPORT-01: `Order.source: desktop-import` + journal kinds (`order.create`/`counterparty.create`/`site.create`) + row-level `proposalId` + `kppdf_import_task_finalize_order` MCP tool; backend gates PASS (jest 958/960, desktop 122/122); live desktop→prod smoke — PO after deploy. |
| MCP photo upload (Photo SoT) | included | TZD-47 HITL 1 file → `POST /api/photos/upload` + optional `Product.photoIds`; CP bind REST отсутствует; bulk → MIG-303. |
| Fine-grained warehouse ACL (worker = свой склад) | absent | Vision; не импровизировать. |
| Full accounting / CRM / tender mega | removed | Вне scope product-vision-lite; не возвращать без PO. |
| Microservices split / extra brokers | removed | Монолит Nest; новый брокер только после measured limit + строка в ledger. |
| Shared FE/BE Zod contracts package | absent | Идея из vibe; не начинать без отдельного TZ. |

---

## 2. Как агент обязан использовать

- Перед новой фичей: найди строку. `absent`/`removed` → **стоп** или спроси PO; не «заодно сделаю».
- При DONE фичи: обнови State/Note + при необходимости SECTION-READINESS.
- В отчёте: если трогал capability — одна строка «ledger: …».

---

## 3. История (коротко)

| Дата | Что |
|------|-----|
| 2026-08-22 | TZD-ORDER-IMPORT-01: desktop Excel-импорт заказов через mutation-journal → included. Breadcrumb/TOC unification (TZ-UI-403..406), catalog photo lightbox (TZ-UI-344) — UI-only, capability state не меняют. |
| 2026-08-20 | TZ-SUPPLY-313: legacy PurchaseRequest/PurchaseOrder → официальный legacy-режим (вариант A); Supply quick order + registry + shipping → included. |
| 2026-08-17 | TZD-47: MCP photo upload HITL → Photo SoT + optional Product.photoIds. |
| 2026-08-11 | Первый ledger: adopt vibe capability idea; seed из SECTION-READINESS + vision. |
