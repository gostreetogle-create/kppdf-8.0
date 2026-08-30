# TZ-NX-REGISTRIES-SUPPLY-PASSPORT-MATRIX — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
mode: analysis-only — derived from `TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md` + live code/route verification; no XLSX re-read; no code/schema/API changes

## Method

Matrix built from:
1. `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md` (spreadsheet ↔ backend mapping, PO decisions, blockers).
2. Live `frontend-nx/apps/kppdf-web/src/app/pages/registries/**` registry definitions and catalog.
3. Backend controller signatures (read-only grep) for endpoint honesty.
4. `frontend-nx/libs/data-access/**` — confirmed zero supply/passport/organization/storage-item slices.

No `data/*.xlsx` files were opened in this session.

---

## Master matrix

| Area | Status | Route / registry key | Entity | Primary endpoint(s) | Filters (registry / API) | Pagination | Actions (registry) | Known gaps / next TZ |
|------|--------|----------------------|--------|----------------------|--------------------------|------------|--------------------|----------------------|
| **Units** | **PRESENT** | `/registries/units` · `units` | `Unit` | `GET /units` · `PATCH /units/:key` · `DELETE /units/:key` (backend only) | `search`, `status`→`isActive` / API: `search`, `isActive` | `server` | copy-key, activate, deactivate; **no delete** (FE deferred) | FE delete: `tasks/_backlog/TZ-NX-REGISTRY-UNITS-DELETE-FE.md` (backend hard-delete fixed in TZ-NX-REGISTRY-UNITS-DELETE-FIX). No create in registry (admin dictionary). |
| **Materials** | **PRESENT** | `/registries/materials` · `materials` | `Material` (`materialKind=raw`) | `GET/POST/PATCH/DELETE /materials` · `POST /materials/:id/duplicate` | `search`, `categoryId` / API: `search`, `categoryId`, `materialKind` (fixed `raw` in adapter) | `server` | create, edit, copy, archive, open constructor | `categoryId` filter is raw ObjectId text, not picker. |
| **Details** | **PRESENT** | `/registries/details` · `details` | `Material` (non-raw kinds) | same `/materials` | `search`, `categoryId`, `materialKind` / API: one `materialKind` per request; empty filter → `part` | `server` | same as materials | No multi-kind single request; by design. |
| **Modules** | **PRESENT** | `/registries/modules` · `modules` | `ProductModule` | `GET/POST/PATCH/DELETE /modules` · composition subroutes | none in registry / API: optional `productId` only | **`client`** (list-all, no fake server paging) | create, edit, open composition, archive | No search/filter until backend adds query params. Large lists = client slice only. |
| **Products** | **PRESENT** | `/registries/products` · `products` | `Product` | `GET/POST/PATCH/DELETE /products` · duplicate · composition | `search`, `status` / API: `search`, `status`, `sortBy`, `sortOrder` — **no `isComplex` query** | `server` | create, edit, composition, copy, archive, constructor | Badge «Комплекс» only when API sends `isComplex` on row (detail today). |
| **Complex (derived)** | **PARTIAL** | *(no separate registry)* · column in `products` | derived `Product` (composition line `lineType=product`) | `GET /products/:id` may expose `isComplex` | n/a — **no list filter** | n/a | n/a | No «Комплексы» registry; no `isComplex` list query. Separate Complex/Part collection forbidden. |
| **SupplyRequest** | **MISSING** | — | `SupplyRequest` | `GET/POST/PATCH/DELETE /supply-requests` · lifecycle `POST …/ordered|received|cancel` | API: `status`, `priority`, `search`, `orderId` — no NX registry | API: list-all (no page/limit in controller) | — | No `frontend-nx` data-access slice; no `/registries/supply-requests`. Import blocked: status mapping, supplier dedup, invoice field — see audit §5–6. |
| **Organizations / Suppliers** | **MISSING** | — | `Organization` (`type` includes `supplier`) | `GET/POST/PATCH/DELETE /organizations` | API: `page`, `limit`, `search`, `type` | API: server | — | No NX registry; supplier resolution for supply import is **MIGRATION RISK** per audit. |
| **StorageItem** | **MISSING** | — | `StorageItem` | `GET /storage-items` · nested create under product/material | API: `warehouseId`, `productId`, `materialId`, `lowStock` | API: `{items,total}` but no page/limit | — | No NX registry; warehouse/stock UI elsewhere (legacy). |
| **ProductPassport** | **PARTIAL** | — (preview in product dialog only) | `ProductPassport` | `GET /passports` · `GET /products/:id/passport` · CRUD `/passports/:id` | API: `productId` optional on list | API: list-all | preview in `ProductFormDialogComponent` | No passport registry; import **BLOCKED** on `productId` matching (792 rows, audit §6). |
| **Departments (demo)** | **PRESENT** | `/registries/departments` · `departments` | fixture `DepartmentRow` | none (in-memory) | `search`, `status` | `fixture` | copy-code, archive (demo) | Explicitly demo; expandable rows; `failFirstAttempt` tests error/retry. |

---

## Spreadsheet mapping summary (from audit — not re-verified from XLSX)

### `data/Снабжение.xlsx` → `SupplyRequest`

| Spreadsheet concept | Backend target | Registry today | Tag |
|---------------------|----------------|----------------|-----|
| Supply log rows (3 sheets) | `SupplyRequest` | MISSING registry | FACT — shape matches quick-order line |
| Поставщик | `supplierId` → `Organization` | MISSING | MIGRATION RISK — free-text dedup |
| Статус (5 emoji values) | `SupplyRequest.status` (5 enum) | MISSING | GAP — «Оплачено» has no 1:1 backend value |
| Категория (6 buckets) | `categoryId` → `Category` tree | MISSING | DECISION NEEDED |
| № счета | *(no field)* | MISSING | GAP — needs schema TZ |
| Подал заявку / Заказчик | `responsible` / `requestedBy` | MISSING | DECISION NEEDED — 4 ambiguous slots |

### `data/Pasports.xlsx` → `ProductPassport` + `Product`

| Spreadsheet concept | Backend target | Registry today | Tag |
|---------------------|----------------|----------------|-----|
| pasports sheet (792 rows) | `ProductPassport` fields 1:1 | PARTIAL (dialog preview only) | FACT tabular mapping |
| productId | required unique ref `Product` | BLOCKER for import | No column in spreadsheet |
| Фото (225 embedded images) | `ProductPassport.photo` | GAP | Separate migration |
| Products sheet (staging) | `Product` name templates | MISSING | DERIVED — too sparse for import |

---

## PO decisions still open (recorded, not resolved)

1. **Supply status mapping** — explicit table for 5 spreadsheet statuses including «Оплачено» (audit recommends `ordered` + note in `notes` until `paid` exists).
2. **Supplier matching** — human-reviewed name→`Organization` map before any import write.
3. **Passport Product matching** — 792-row manual/semi-auto match; no parallel passport-only products.
4. **Invoice number** — `SupplyRequest` has no field; small backend TZ needed before import.
5. **Requester fields** — assign meaning to `Подал заявку` / `Заказчик` / `responsible` / `requestedBy` before import.

---

## Registry platform readiness (6 live registries)

| Check | Result |
|-------|--------|
| Master table + inline expand | PRESENT — `registries-page.ts` + `registry-detail-panel` |
| URL state (`:registryKey` + query params) | PRESENT — `registry-query-state.ts` |
| Error + retry banner | PRESENT — `data-test="registry-error-banner"` |
| Icon-only actions | PRESENT — verified in FULL-CLOSEOUT + this marathon stage 3 |
| Modules client pagination only | PRESENT — `paginationMode: 'client'`, `modules-http-data-source.ts` |
| Products no `isComplex` query | PRESENT — `products-http-data-source.ts` sends only page/limit/search/status/sort |
| Units no DELETE action | PRESENT — intentional until `TZ-NX-REGISTRY-UNITS-DELETE-FE` |
| `/constructor` preserved | PRESENT — materials/products row actions |

---

## Ordered implementation plan (next TZs)

1. `TZ-NX-REGISTRY-UNITS-DELETE-FE` — wire DELETE after PO approves (backend ready).
2. PO decision batch — supply status, categories, requester fields (audit §6 step 1).
3. `SupplyRequest` NX data-access + registry slice (new TZ) — after decisions.
4. `Organization` suppliers registry or reuse existing org UI (new TZ).
5. `ProductPassport` registry + import pipeline — after product-matching pass (BLOCKER).
6. `StorageItem` / warehouse registry — separate scope; not implied by spreadsheet audit alone.

---

## Evidence

- Source audit: `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md`
- Registry code: `frontend-nx/apps/kppdf-web/src/app/pages/registries/data/*.registry.ts`
- Page doc: `docs/pages/registries.page.md`
- Prior browser baseline: `docs/agent-checklists/evidence/TZ-NX-REGISTRIES-FULL-CLOSEOUT/`

## Checklist

See `docs/agent-checklists/TZ-NX-REGISTRY-READINESS-MARATHON.md` — stage 1 complete.
