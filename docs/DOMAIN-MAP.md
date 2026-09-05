# DOMAIN-MAP — домен ↔ модули ↔ страницы

> TZ-OPS-304 · docs-only · **dual-track**: legacy `frontend/` + целевой **`frontend-nx`**
> Snapshots: legacy routes 2026-08-09 · NX `frontend-nx/.../app.routes.ts` 2026-09-05

## 1.1 Шапка

**Зачем:** быстрый канон связности — «домен → BE → legacy FE → **NX FE** → page.md → SoT».
**Цель UI:** итог продукта = **`frontend-nx`**. Legacy живёт до cutover; карту вести **параллельно** с NX-портами, не «одним махом потом».
**Правило:** в **той же TZ**, что меняет BE module / legacy route / **NX route** / page.md — обновить строку здесь (+ Integrity slot). При споре побеждают **живая schema** и **живой route** (после cutover SoT UI = NX).
**Ссылки:** `docs/PROJECT-MEMORY.md` · `docs/DOCS-INTEGRITY.md` · `docs/SECTION-READINESS.md` ·
`docs/pages/PAGE-TZ-INDEX.md` · `docs/data-model.md` (может отставать от schema).

## 1.2 Таблица доменов

`Домен | BE | Legacy FE | NX FE (target) | page.md | SoT | Не путать`

| Домен | BE modules | Legacy FE | NX FE (target) | page.md | SoT / канон | Не путать |
|-------|------------|-----------|----------------|---------|-------------|-----------|
| **Auth / Users / Roles** | `auth`, `user`, `role`, `permissions`, `rate-limit` | `/login`, `/admin/users`, `/admin/roles` | `/login`, `/enroll/:token`, `/admin/devices`, `/admin/roles`, `/forbidden` | `login`, `admin-users`, `admin-roles` | `docs/RBAC-CONTRACT.md`, `nx-auth-platform.md` | `User` ≠ `Worker`; `user:read` ≠ `user:admin` |
| **Party** | `counterparty`, `organization`, `person`, `worker`, `role-counterparty`, `role-org` | `/counterparties`, `/organizations`, `/people` | `/counterparties` (thin D3); orgs/people — **gap** | `counterparties`, `organizations`, `people` | `docs/data-model.md`, TZ-PARTY-*, TZ-NX-DEALS-D3 | **Counterparty = клиент**; **Organization = наша фирма** |
| **Catalog** | `product`, `product-module`, `material`, `bom`, `category`, … `catalog-graph` | `/products`, `/modules`, `/materials`, `/categories`, `/catalog/appearance` | **gap** (shell `/constructor` не в live routes) | `products`, `modules`, `materials`, … | `docs/data-model.md`, `product-vision-lite.md` | composition ≠ warehouse stock |
| **Warehouse** | `warehouse`, `storage-item`, `stock-movement`, `reservation`, `inventory` | `/inventory`, `/storage-items`, `/stock-movements`, `/warehouses` | **Live (W1–W3 DONE):** `/warehouses`, `/storage-items` (balances), `/stock-movements` (journal + in/out) | `warehouses`, `storage-items`, `stock-movements`, … | audit `2026-09-05-warehouse-nx-port-audit.md` | SoT qty = `StorageItem`/movements; NX без dashboard/types/zones/transfer-create |
| **Sales / КП / Orders** | `quotation`, `order`, `contract`, `shipment`, `invoice`, `order-closing` | `/dashboard`, `/desk`, `/proposals*`, `/orders*`, `/contracts`, `/shipping` | `/proposals`, `/orders`, `/orders/create`, `/orders/:id`, `/contracts`, `/contracts/:id` | `dashboard`, `manager-desk`, `proposals*`, `orders`, `contracts`, `shipping` | sales-to-shop canon, `COUPLING-MAP` | **КП ≠ Order**; desk ≠ inventory |
| **Documents / Studio** | `document-template`, `text-block`, `table-template`, `generated-document`, `registry`, … | `/doc-constructor/*`, `/builder/:id` | `/studio`, `/studio/:id` (Doc Studio) | `templates`, `documents`, `texts`, `tables`, `builder`, `document-studio` | builder/studio page.md, FIC | Template ≠ TableTemplate |
| **Production** | `production-order`, `work-order`, `work-type`, … | `/production`, `/work-types` | `/production` (**Gantt SoT NX**, WAVE G0–G7) | `production-cockpit`, `work-types` | SECTION-READINESS, `COUPLING-MAP` | `production-order` ≠ sales `order` |
| **Supply** | `supply`, `purchase-order`, `purchase-request`, `tender` | `/supply` | **WAVE READY** `WAVE-NX-SUPPLY` (S0 BE ∥; S1 after W1) | `supply` | same warehouse audit | Purchase* = LEGACY; NX = Supply* + kit confirm |
| **Desktop / Import** | `desktop`, `mutation-journal`, `import-*` | `/import-todos` | **gap** (Desktop app) | `import-todos` | `desktop/docs/MCP.md` | propose/confirm ≠ прямой SoT write |
| **Admin / Settings** | `admin`, `setting`, `feature-flag`, `form-profiles`, `counter`, `site` | `/admin/*`, form-profiles | `/admin/devices`, `/admin/roles` (+ kit вне бизнеса) | `form-profiles`, `admin-*` | RBAC | FE admin ≠ BE `admin` module |
| **Cost** | `actual-cost`, `cost-calculation`, … | — | — | N/A | data-model, TZ-COST-* | actual ≠ calculation |
| **Dictionaries / Registries** | `unit`, `color-reference`, `attribute-definition`, … | `/dictionaries/*`, `/categories`, … | `/registries`, `/registries/:registryKey` (**NX-only**) | `units`, `categories`, `registries`, … | SECTION-READINESS §4, registries.page.md | `Unit` ≠ группа «Измерения» |

## 1.3 Gap inventory (legacy route ↔ page.md)

Источники: `frontend/.../app.routes.ts` + `docs/pages/README.md` (2026-08-09).
**Итог legacy:** 36 бизнес-routes; **0 × NO** page.md (design/shipping — stub).
Полный список — в git history OPS-305→307; новые legacy routes → page.md в той же TZ.

## 1.4 NX surface (живой inventory)

Источник: `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` (+ `studio.routes`, `registries.routes`).
Не бизнес: `/kit/*` (design kit). Default auth landing: `/admin/devices`.

| NX route | page.md | Статус (кратко) |
|----------|---------|-----------------|
| `/login`, `/enroll/:token`, `/forbidden` | `login` (+ enroll note) | Auth platform F3 |
| `/admin/devices`, `/admin/roles` | `admin-users`, `admin-roles` | NX admin |
| `/registries`, `/registries/:registryKey` | `registries` | NX-only platform |
| `/studio`, `/studio/:id` | `document-studio` | Doc Studio волны |
| `/proposals`, `/proposals/list` (`create`→`/studio`) | `proposals` | NX KP family |
| `/production` | `production-cockpit` | Gantt SoT NX |
| `/orders`, `/orders/create`, `/orders/:id` | `orders` | NX deals/orders |
| `/warehouses` | `warehouses` | W1 live thin named-warehouse CRUD |
| `/storage-items` | `storage-items` | W2 live: balances list/filters + put-on-stock/adjust |
| `/stock-movements` | `stock-movements` | W3 live: journal + in/out create (no transfer-create) |
| `/contracts`, `/contracts/:id` | `contracts` | thin D4 read |

**NX gaps (ещё нет route):** supply, catalog lists, desk/combine, organizations/people, work-types, import-todos. Warehouse W1–W3 are DONE and live (WAVE-NX-WAREHOUSE); W4 is docs-only closeout.
Детали TZ: `docs/pages/PAGE-TZ-INDEX.md` (секции frontend-nx).

---

*Живой файл: строка домена + §1.4 при смене NX/legacy контура (`docs/DOCS-INTEGRITY.md`). Лимит: ≤180 строк.*
