# Page ↔ TZ index

**Purpose:** Search by page/route to find which tasks touched or will touch it.  
**Updated:** 2026-08-02 (Cursor UX sweep)

How to use: `Ctrl+F` по route или имени страницы. Новые TZ обязаны указывать
`PAGES:` / `PAGE_DOCS:` в шапке (см. `tz-authoring`).

## Doc-constructor

| Route | Page doc | TZs |
|-------|----------|-----|
| `/doc-constructor/builder`, `/builder/:id` | builder.page.md, builder-tool-pane, builder-inspector | DOC-324, DOC-325, DOC-326, DOC-317/318 (318 supersede after 325), DOC-319 done |
| `/doc-constructor/templates` | templates.page.md | DOC-324, DOC-308 done |
| `/doc-constructor/texts` | texts.page.md | DOC-316, DOC-326 |
| `/doc-constructor/tables` | tables.page.md | (open as needed) |
| `/doc-constructor/documents` | documents.page.md | **UX-303** (naming) |

## Catalog / production

| Route | Page doc | TZs |
|-------|----------|-----|
| `/materials` | materials.page.md | MATERIALS-*, **UX-305** (docs) |
| `/products`, `/products/:id` | products.page.md | PRODUCTS-* |
| `/modules`, `/modules/:id` | modules*.page.md | MODULES-* |
| `/work-types` | work-types.page.md | WORKTYPES-*, **UX-305** |
| `/people` or `/workers` | (pending) | WORKERS-302, **UX-306** |

## Deals / orgs

| Route | Page doc | TZs |
|-------|----------|-----|
| `/organizations` | organizations.page.md | **UX-305** |
| `/contracts` | contracts.page.md | — |
| `/orders` | orders.page.md | — |

## Reference

| Route | Page doc | TZs |
|-------|----------|-----|
| `/dictionaries` | dictionaries.page.md | **UX-303**, **UX-304** sibling |
| `/categories` | categories.page.md | **UX-302** |
| `/doc-template-categories` | — | **UX-304** |
| `/color-references` | color-references.page.md | PRODUCTS-301, **UX-304** |

## Warehouse

| Route | Page doc | TZs |
|-------|----------|-----|
| `/inventory` | inventory-dashboard.page.md | **UX-301** |
| `/storage-items` | storage-items.page.md | **UX-301**, **UX-305**, MATERIALS-308 |
| `/stock-movements` | stock-movements.page.md | **UX-301**, Z-001 (backend) |

## Admin / auth

| Route | Page doc | TZs |
|-------|----------|-----|
| `/admin/users`, `/admin/roles` | — | ADMIN/RBAC archived |
| `/admin` stub | — | optional redirect (P2, not tasked) |
| `/login` | login.page.md | — |

## Cross-cutting UX batch (this sweep)

| TZ | Pages | One-liner |
|----|-------|-----------|
| [UX-301](../tasks/TZ-UX-301-warehouse-nav.md) | inventory, storage-items, stock-movements | Add Склад nav |
| [UX-302](../tasks/TZ-UX-302-categories-dead-doccat.md) | categories | Strip dead docCat |
| [UX-303](../tasks/TZ-UX-303-nav-label-consistency.md) | documents, dictionaries | Unify labels |
| [UX-304](../tasks/TZ-UX-304-reference-pi-table.md) | color-references, doc-template-categories | pi-table |
| [UX-305](../tasks/TZ-UX-305-page-docs-sync.md) | orgs, work-types, storage, materials | Fix page.md |
| [UX-306](../tasks/TZ-UX-306-people-route-align.md) | people/workers | Route+nav align |
| [DOC-324..326](../docs/agent-checklists/DOC-CONSTRUCTOR-UX-AUDIT.md) | builder/templates/texts | Prior audit |

## Vision / access / sales (2026-08-02)

| TZ | Pages | One-liner |
|----|-------|-----------|
| Vision | — | [product-vision-lite.md](../product-vision-lite.md) |
| [ACCESS-301](../tasks/TZ-ACCESS-301-page-acl-catalog.md) | admin | Page ACL + 4 roles seed |
| [ACCESS-302](../tasks/TZ-ACCESS-302-director-page-grants-ui.md) | admin/access | Director page checkboxes |
| [JOURNEY-301](../tasks/TZ-JOURNEY-301-shop-flow-gap-map.md) | all | Flow gap map (docs) |
| [SALES-301](../tasks/TZ-SALES-301-proposal-thin-ui.md) | /proposals (NEW) | Thin КП list |
| GANT | parked | `_backlog/vision/GANT-calendar.md` |

Audit note (doc-constructor detail): `DOC-CONSTRUCTOR-UX-AUDIT.md`
