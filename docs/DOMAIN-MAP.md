# DOMAIN-MAP — домен ↔ модули ↔ страницы

> TZ-OPS-304 · docs-only · факты из репо (routes/modules прочитаны read-only 2026-08-09)

## 1.1 Шапка

**Зачем:** быстрый канон связности для агентов — «домен → BE module → FE route → page.md → SoT».
**Правило:** при споре побеждают **живая schema** (`backend/src/modules/<x>/`) и **route**;
карта обновляется в той же TZ, что меняет контур домена.
**Ссылки:** `docs/PROJECT-MEMORY.md` · `docs/DOCS-INTEGRITY.md` · `docs/SECTION-READINESS.md` ·
`docs/data-model.md` (осторожно: может отставать от schema).

## 1.2 Таблица доменов

`Домен | BE modules (папки) | FE routes | page.md | SoT / канон docs | Не путать`

| Домен | BE modules | FE routes | page.md | SoT / канон | Не путать |
|-------|-----------|-----------|---------|-------------|-----------|
| **Auth / Users / Roles** | `auth`, `user`, `role`, `permissions`, `rate-limit` | `/login`, `/admin/users`, `/admin/roles` | `login`, `admin-users`, `admin-roles` | `docs/RBAC-CONTRACT.md`, `permissions.constants.ts` | `User` (аккаунт) ≠ `Worker` (сотрудник цеха); `user:read` ≠ `user:admin` |
| **Party (контрагенты/орг)** | `counterparty`, `organization`, `person`, `worker`, `role-counterparty`, `role-org` | `/counterparties`, `/organizations`, `/people` | `counterparties`, `organizations`, `people` | `docs/data-model.md`, TZ-PARTY-* | **Counterparty = клиент сделки; Organization = наша фирма / supplier org** |
| **Catalog** | `product`, `product-module`, `material`, `bom`, `category`, `product-passport`, `product-photo`, `product-module-photo`, `certificate`, `inventor-file`, `catalog`, `catalog-graph` | `/products`, `/products/:id`, `/modules`, `/modules/:id`, `/materials`, `/materials/:id`, `/categories`, `/catalog/appearance` | `products`, `product-detail`, `modules`, `module-detail`, `materials`, `material-detail`, `categories`, `catalog-appearance` | `docs/data-model.md`, `docs/product-vision-lite.md` | **Catalog composition ≠ warehouse stock**; `Product` ≠ `ProductModule`; материал ≠ готовое изделие |
| **Warehouse / Inventory** | `warehouse`, `storage-item`, `stock-movement`, `reservation`, `inventory` | `/inventory`, `/storage-items`, `/stock-movements`, `/warehouses` | `inventory-dashboard`, `storage-items`, `stock-movements`, `warehouses` | `docs/SECTION-READINESS.md` §2 (Склад READY) | **Остаток SoT = `StorageItem`/movements, не `Material.stockQty`**; движение ≠ остаток |
| **Sales / КП / Orders** | `quotation`, `order`, `contract`, `shipment`, `invoice`, `order-closing` | `/dashboard`, `/proposals`, `/proposals/create`, `/orders`, `/orders/:id`, `/contracts`, `/shipping` | `dashboard`, `proposals`, `proposals-create`, `orders`, `contracts`, `shipping` (stub) | `docs/audits/2026-08-08-sales-to-shop-flow-canon.md`, `docs/COUPLING-MAP.md` (`Order.status`) | **КП ≠ Order**; Комбайн `/dashboard` ≠ склад `/inventory`; `draft` ≠ работа цеха |
| **Documents / Builder** | `document-template`, `document-template-category`, `doc-type`, `template-block`, `text-block`, `text-block-category`, `table-template`, `document-table-type`, `generated-document`, `registry`, `attachment` | `/doc-constructor/templates`, `/documents`, `/texts`, `/tables`, `/builder/:id` | `templates`, `documents`, `texts`, `tables`, `builder` (+ tool-pane, inspector) | `docs/pages/builder.page.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`, `desktop/docs/MCP.md` | `DocumentTemplate` ≠ `TableTemplate`; `TableTemplateCategory` enum ≠ `DocumentTemplateCategory` dict |
| **Production** | `production-order`, `work-order`, `work-order-operation`, `work-type`, `work-center`, `routing-step`, `tech-process`, `order-task` | `/production`, `/work-types` | `production-cockpit`, `work-types` | `docs/SECTION-READINESS.md` (SHELL/MVP), `docs/COUPLING-MAP.md` | `WorkType` ≠ `RoutingStep`; `production-order` ≠ sales `order`; цех фильтрует sales `Order.status` |
| **Supply** | `supply`, `purchase-order`, `purchase-request`, `tender` | `/supply` | `supply` | `docs/SECTION-READINESS.md`, `docs/data-model.md` | supply-task ≠ sales order; закупка ≠ договор продажи |
| **Desktop / Import / MCP** | `desktop`, `mutation-journal`, `import-task`, `import-todo`, `import-jobs` | `/import-todos` | `import-todos` | `desktop/docs/MCP.md`, journal propose→confirm vision | write через journal propose/confirm ≠ прямой SoT write; `import-todo` ≠ `import-task` |
| **Admin / Settings** | `admin`, `setting`, `feature-flag`, `form-profiles`, `counter`, `site` | `/admin/*`, `/dictionaries/form-profiles` | `form-profiles`, `admin-users`, `admin-roles` | `docs/RBAC-CONTRACT.md`, `permissions.constants.ts` | FE `admin/*` routes ≠ BE `admin` module; form-profiles ≠ роли |
| **Cost** | `actual-cost`, `cost-calculation`, `financial-report`, `reconciliation-act`, `rpp` | — (нет отдельного UI) | N/A | `docs/data-model.md`, TZ-COST-* | `actual-cost` ≠ `cost-calculation`; учётная/закупочная цена ≠ цена продажи |
| **Dictionaries / refs** | `unit`, `color-reference`, `attribute-definition`, `entity-attribute-value`, `status`, `currency`, `doc-type` | `/dictionaries/*`, `/categories`, `/doc-template-categories`, `/dictionaries/text-block-categories` | `measurements-group`, `units`, `categories`, `color-references`, `document-template-categories`, `text-block-categories` | `docs/data-model.md`, `docs/SECTION-READINESS.md` §4 | `Unit` ≠ «Измерения» (группа); общая `Category` vs legacy ProductCategory/MaterialCategory |

## 1.3 Gap inventory (route ↔ page.md)

Источники (read-only): `frontend/src/app/app.routes.ts` + `docs/pages/README.md` (2026-08-09).

`Route | Есть page.md? (yes/path/NO) | Примечание`

| Route | Есть page.md? | Примечание |
|-------|---------------|------------|
| `/login` | yes — `login.page.md` | |
| `/`, `/dashboard` | yes — `dashboard.page.md` | Комбайн заказов; не путать со складом `/inventory` |
| `/materials`, `/materials/:id` | yes — `materials`, `material-detail` | |
| `/organizations` | yes — `organizations` | |
| `/counterparties` | yes — `counterparties` | |
| `/design` | yes — `design` (stub-documented) | stub (TZ-NAV-301) |
| `/supply` | yes — `supply` | |
| `/shipping` | yes — `shipping` (stub-documented) | stub (TZ-NAV-301) |
| `/dictionaries/measurements` | yes — `measurements-group` | `/dictionaries/units` legacy → redirect |
| `/categories` | yes — `categories` | |
| `/doc-template-categories` | yes — `document-template-categories` | справочник категорий шаблонов (TZ-DOC-308) |
| `/dictionaries/text-block-categories` | yes — `text-block-categories` | категории текстовых блоков (TZ-DOC-334) |
| `/dictionaries/color-references` | yes — `color-references` | |
| `/dictionaries/form-profiles` | yes — `form-profiles` | |
| `/catalog/appearance` | yes — `catalog-appearance` | |
| `/products`, `/products/:id` | yes — `products`, `product-detail` | |
| `/modules`, `/modules/:id` | yes — `modules`, `module-detail` | |
| `/work-types` | yes — `work-types` | |
| `/import-todos` | yes — `import-todos` | |
| `/people` | yes — `people` | |
| `/orders`, `/orders/:id` | yes — `orders` (деталь внутри) | |
| `/production` | yes — `production-cockpit` | |
| `/proposals`, `/proposals/create` | yes — `proposals`, `proposals-create` | |
| `/contracts` | yes — `contracts` | |
| `/doc-constructor/templates` | yes — `templates` | `/doc-constructor/builder` bare → redirect |
| `/doc-constructor/documents` | yes — `documents` | |
| `/doc-constructor/texts` | yes — `texts` | |
| `/doc-constructor/tables` | yes — `tables` | |
| `/doc-constructor/builder/:id` | yes — `builder` (+ tool-pane, inspector) | |
| `/inventory` | yes — `inventory-dashboard` | README исправлен на `/inventory` (OPS-307) |
| `/storage-items` | yes — `storage-items` | |
| `/stock-movements` | yes — `stock-movements` | |
| `/warehouses` | yes — `warehouses` | |
| `/admin/users`, `/admin/roles` | yes — `admin-users`, `admin-roles` | admin registry/roles; `/admin` → redirect |

**Итог:** 36 бизнес-routes; **0 × NO** — все документированы (design/shipping — stub-documented, OPS-307).

> Gap fill **DONE** (WAVE-PAGE-DOCS-GAPS / OPS-305→307): шесть former-NO закрыты page.md;
> README hygiene (`/inventory` вместо `/dashboard`, индекс живых страниц) — в OPS-307.
> Дальше: при новых routes — page.md в том же PR/TZ (см. `docs/DOCS-INTEGRITY.md`);
> опциональный авто-скрипт routes↔page.md — P2, не срочно.

---

*Живой файл: обновляй строку домена при смене контура (см. `docs/DOCS-INTEGRITY.md`). Лимит: ≤180 строк.*
