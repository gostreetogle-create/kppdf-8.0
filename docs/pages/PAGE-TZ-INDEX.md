# Page ↔ TZ index

**Purpose:** Search by page/route to find which tasks touched or will touch it.  
**Updated:** 2026-08-04 (CATALOG Wave 1 docs; UI pages — после 305)

How to use: `Ctrl+F` по route или имени страницы. Новые TZ обязаны указывать
`PAGES:` / `PAGE_DOCS:` в шапке (см. `tz-authoring`).

## Doc-constructor

| Route | Page doc | TZs |
|-------|----------|-----|
| `/doc-constructor/builder`, `/builder/:id` | builder.page.md, builder-tool-pane, builder-inspector | DOC-324, DOC-325, DOC-326, DOC-317/318, DOC-319 done, DOC-331 done, **DOC-332 done**, DOC-333 done, DOC-335 done; create **не** на builder (DOC-341) |
| `/doc-constructor/templates` | templates.page.md | DOC-324, DOC-308 done, DOC-336 done, **DOC-337…339 done** (pageSize/category/duplicate), DOC-341 docs |
| `/doc-constructor/texts` | texts.page.md | DOC-316, DOC-326, **DOC-336 done** (shell+editor polish) |
| `/doc-constructor/tables` | tables.page.md | **DOC-335** done (editId), **DOC-336 done** (shell+dialog), **UX-DIALOG-301** (375px clamp) |
| `/doc-constructor/documents` | documents.page.md | **UX-303 DONE** |

## Catalog / production

| Route | Page doc | TZs |
|-------|----------|-----|
| `/materials` | materials.page.md | MATERIALS-*; **CATALOG-301** BE DONE; **FE поля 301 = TZ-CATALOG-316** (∥ Wave 1) |
| `/materials/:id` | (pending → 312) | CATALOG Wave 2 |
| `/products` | products.page.md | PRODUCTS-*; composition backend **302…305**; FE cutover **317** |
| `/products/:id` | **product-detail.page.md** | stub TZ-CATALOG-319; detail UI exists |
| `/modules`, `/modules/:id` | modules.page.md, module-detail.page.md | MODULES-*; hard-delete Module (docs fixed 319); photos `/product-module-photos` |
| `/work-types` | work-types.page.md | WORKTYPES-*, **UX-305 DONE**, **PRODUCTION-302 DONE** (days) |
| `/people` | people.page.md | **UX-306 DONE** (Worker API) |

**Catalog audits / backlog:**  
[`2026-08-04-catalog-coherence-audit.md`](../audits/2026-08-04-catalog-coherence-audit.md) ·  
[`2026-08-04-catalog-readiness-fe-be.md`](../audits/2026-08-04-catalog-readiness-fe-be.md) ·  
[`_backlog/catalog/README.md`](../../tasks/_backlog/catalog/README.md) (316/317/319 + Wave 2) ·  
Review inbox: [`CATALOG-WAVE1-REVIEW.md`](../agent-checklists/CATALOG-WAVE1-REVIEW.md)


## Deals / orgs

| Route | Page doc | TZs |
|-------|----------|-----|
| `/organizations` | organizations.page.md | **UX-305 DONE** |
| `/contracts` | contracts.page.md | — |
| `/orders` | orders.page.md | — |

## Reference

| Route | Page doc | TZs |
|-------|----------|-----|
| `/dictionaries` | dictionaries.page.md | UX-303; **DICT-303/308**; **DICT-311** (retire hub) |
| `/dictionaries/measurements` | measurements-group.page.md | **DICT-308 DONE**, **DICT-309** (units cutover) |
| `/dictionaries/units` | units.page.md | DICT-304 DONE; **DICT-309** → redirect |
| `/categories` | categories.page.md | UX-302; DICT-305; **DICT-310** (classification group) |
| `/doc-template-categories` | — | UX-304; DICT-307; **DICT-310** (documents-ref chip) |
| `/dictionaries/text-block-categories` | — | DOC-334; DICT-307; **DICT-310** (documents-ref chip) |
| `/dictionaries/color-references` | color-references.page.md | PRODUCTS-301; DICT-306; **DICT-310** (appearance group) |

## Warehouse

| Route | Page doc | TZs |
|-------|----------|-----|
| `/inventory` | inventory-dashboard.page.md | **UX-301 DONE**, **MATERIALS-308 DONE** (material в low-stock) |
| `/storage-items` | storage-items.page.md | **UX-301 DONE**, **UX-305 DONE**, **MATERIALS-308 DONE** (material-позиции + фильтр) |
| `/stock-movements` | stock-movements.page.md | **UX-301 DONE**, Z-001 (backend) |

## Admin / auth

| Route | Page doc | TZs |
|-------|----------|-----|
| `/admin/users`, `/admin/roles` | — | ADMIN/RBAC archived |
| `/admin` stub | — | optional redirect (P2, not tasked) |
| `/login` | login.page.md | — |

## Cross-cutting UX batch (this sweep)

| TZ | Pages | One-liner |
|----|-------|-----------|
| [UX-301 DONE](../tasks/_archive/2026-08/TZ-UX-301.done.md) | inventory, storage-items, stock-movements | Add Склад nav |
| [UX-302 DONE](../tasks/_archive/2026-08/TZ-UX-302.done.md) | categories | Strip dead docCat |
| [UX-303 DONE](../tasks/_archive/2026-08/TZ-UX-303.done.md) | documents, dictionaries | Unify labels |
| [UX-304](../tasks/TZ-UX-304-reference-pi-table.md) | color-references, doc-template-categories | pi-table |
| [UX-305 DONE](../tasks/_archive/2026-08/TZ-UX-305.done.md) | orgs, work-types, storage, materials | Fix page.md |
| [UX-306 DONE](../tasks/_archive/2026-08/TZ-UX-306.done.md) | people | Route+nav+dialog |
| [DOC-324..326](../docs/agent-checklists/DOC-CONSTRUCTOR-UX-AUDIT.md) | builder/templates/texts | Prior audit |
| [DOC-334 audit](../docs/audits/DOC-334-doc-constructor-ui-polish-audit.md) | builder/texts/tables/categories | Deploy polish queue 334→335→332→336 |

## Stabilization Wave (2026-08-03)

| TZ | Pages | One-liner |
|----|-------|-----------|
| DOC-337…339 | templates + setup dialog + DTO | pageSize A3–A5; system categories; duplicate honesty |
| DOC-340 / UX-DIALOG-301 | pi-dialog + form dialogs | `min(…, 100vw - 2rem)` |
| DOC-341 | templates/builder page.md | create only on templates |
| PROC-301 | SESSION + RUNBOOK | post-deploy smoke AC |
| Canon | [`STABILIZATION-WAVE-2026-08.md`](../STABILIZATION-WAVE-2026-08.md) | DoD vertical path |

## Vision / access / sales (2026-08-02)

| TZ | Pages | One-liner |
|----|-------|-----------|
| Vision | — | [product-vision-lite.md](../product-vision-lite.md) |
| [ACCESS-301](../tasks/TZ-ACCESS-301-page-acl-catalog.md) | admin | Page ACL + 4 roles seed |
| [ACCESS-302](../tasks/TZ-ACCESS-302-director-page-grants-ui.md) | admin/access | Director page checkboxes |
| [JOURNEY-301 DONE](../tasks/_archive/2026-08/TZ-JOURNEY-301.done.md) | all | Flow gap map (docs) |
| [SALES-301](../tasks/TZ-SALES-301-proposal-thin-ui.md) | /proposals (NEW) | Thin КП list |
| GANT | parked | `_backlog/vision/GANT-calendar.md` |
| **[CORE-301](../tasks/_backlog/TZ-CORE-301-snapshot-immutability-pattern.md)** | backend/common | Snapshot-on-transition immutability helper (foundational) |
| **[DEPLOY-301](../tasks/TZ-DEPLOY-301-prep-first-deploy.md)** | ops | **Gate перед первым деплоем** (auth/CORS/secrets/compose) |

Audit note (doc-constructor detail): `DOC-CONSTRUCTOR-UX-AUDIT.md`
