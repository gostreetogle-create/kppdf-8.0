# Page ↔ TZ index

**Purpose:** Search by page/route to find which tasks touched or will touch it.  
**Updated:** 2026-08-09 (TZ-UX-314 list PAGE_SIZE=10)

How to use: `Ctrl+F` по route или имени страницы. Новые TZ обязаны указывать
`PAGES:` / `PAGE_DOCS:` в шапке (см. `tz-authoring`).

## Doc-constructor

| Route | Page doc | TZs |
|-------|----------|-----|
| `/doc-constructor/builder`, `/builder/:id` | builder.page.md, builder-tool-pane, builder-inspector | DOC-324…341; **DOC-342** upload null→400; **DOC-343 READY** create-parity свойства шаблона (name/category/page/orient) |
| `/doc-constructor/templates` | templates.page.md | DOC-324…341; **section chips** parity 2026-08-08 |
| `/doc-constructor/texts` | texts.page.md | DOC-316/326/336; **section chips**; **TZD-30** MCP AI-draft READY |
| `/doc-constructor/tables` | tables.page.md | **WAVE-DOC-TABLES 301–306 DONE**; **308 DONE** dialog layout/preview; **307 DONE** category КП + seed/apply preset (`WAVE-KP-TABLE-CONFIG`) |
| `/doc-constructor/documents` | documents.page.md | **UX-303 DONE** |
| `/import-todos` | import-todos.page.md | **TZD-29 DONE** (manager finish-list after import) |

## Catalog / production

| Route | Page doc | TZs |
|-------|----------|-----|
| `/materials` | materials.page.md | MATERIALS-*; **CATALOG-301** BE DONE; **FE поля 301 = TZ-CATALOG-316**; **CATALOG-UI-301** Group Chip; **UX-314 READY** PAGE_SIZE=10 |
| `/materials/:id` | **material-detail.page.md** | 312 section sheet; **FACT-304 DONE** FactStack; **CATALOG-337 DONE** A+ shell; **UX-313** smart back |
| `/products` | products.page.md | PRODUCTS-*; composition **302…305**; expand polish (gold tray); **hierarchy preview 307 DONE**; FE **317**; gap **320**; tree **311**; **CATALOG-UI-301**; **PRODUCTS-308/309**; **UX-314 READY** PAGE_SIZE=10 |
| `/products/:id` | **product-detail.page.md** | 319 stub docs; detail UI; **320** complex/cascade; **311** tree; **330–331** kind palette; **UX-313** smart back; **PRODUCTS-309** BomPanel also in FullEditor edit |
| `/modules`, `/modules/:id` | modules.page.md, **module-detail.page.md** | **CATALOG-336** A+; **COMPOSE-301** discoverability; **DIALOG-305** kind-C width; **UX-313**; **UX-314 READY** PAGE_SIZE=10 |
| `/catalog/appearance` | **catalog-appearance.page.md** | **CATALOG-331** kind palette settings (admin) |
| `/work-types` | work-types.page.md | WORKTYPES-*, **UX-305 DONE**, **PRODUCTION-302 DONE**; **CATALOG-UI-301**; **UX-314 READY** |
| `/people` | people.page.md | **UX-306 DONE**; **CATALOG-UI-301**; **UX-314 READY** |
| `/production` | production-cockpit.page.md | **300** Lego; **303 DONE**; **303.1 READY** hotfix+`?q=`; parked **308/309/310**; drawings **DRAWINGS-301**; 304–307 plug-ins later |
| `/orders` | orders.page.md | ORDERS-*; **303.1** deep-link `?q=` from inspector |

**Catalog audits / backlog:**  
[`2026-08-04-catalog-coherence-audit.md`](../audits/2026-08-04-catalog-coherence-audit.md) ·  
[`2026-08-04-catalog-readiness-fe-be.md`](../audits/2026-08-04-catalog-readiness-fe-be.md) ·  
[`_backlog/catalog/README.md`](../../tasks/_backlog/catalog/README.md) (316/317/319 + Wave 2) ·  
Review inbox: [`CATALOG-WAVE1-REVIEW.md`](../agent-checklists/CATALOG-WAVE1-REVIEW.md)


## Deals / orgs / lifecycle stubs

| Route | Page doc | TZs |
|-------|----------|-----|
| `/organizations` | organizations.page.md | **UX-305 DONE**; nav → **Админ** (NAV-301); **PARTY-301 DONE** (tenant-scope, soft-delete, `isOurCompany`, `GET /current`); **PARTY-302 DONE** (FullEditor kind C, паспорт ИП, бейдж «наша фирма»); очередь **ASSETS-301/302**; **UX-314 READY** PAGE_SIZE=10 |
| `/counterparties` | counterparties.page.md | **NAV-301** thin list; **PARTY-301 DONE** (бейдж «временный» ИНН); **PARTY-303 DONE** (FullEditor kind C + CRUD, роли из справочника); объекты/площадки → **ORDERS-303**; **UX-314 READY** pager+limit=10 |
| `/design`, `/supply`, `/shipping` | supply.page.md; **design/shipping OPS-307 DONE** | **NAV-301** stubs; page.md gaps: WAVE-PAGE-DOCS-GAPS |
| `/contracts` | contracts.page.md | **SALES-310 DONE** — dark Deals TOC, empty yellow row |
| `/orders` | orders.page.md | **SALES-310 DONE** — dark Deals TOC, empty yellow row |
| `/proposals` | proposals.page.md | **SALES-301**; **303** family API; **313 DONE** family expand (ex-304); **SALES-310 DONE** — TOC + `Создать КП`/`Все КП` |
| `/proposals/create` | **proposals-create.page.md** | **317…332 DONE**; **WAVE-KP-USABLE READY** 333 Save → 334 Client → 335 qty/photo → 336 lock; **320** PARK |
| top nav L→R | app-layout | **NAV-301** lifecycle IA |

## Reference

| Route | Page doc | TZs |
|-------|----------|-----|
| `/dictionaries` | dictionaries.page.md | UX-303; **DICT-303/308**; **DICT-311** (retire hub); **DICT-312** (dense/adaptive Group Chip chrome) |
| `/dictionaries/measurements` | measurements-group.page.md | **DICT-308 DONE**, **DICT-309** (units cutover), **DICT-312** (dense/adaptive Group Chip chrome) |
| `/dictionaries/units` | units.page.md | DICT-304 DONE; **DICT-309** → redirect |
| `/categories` | categories.page.md | UX-302; DICT-305; **DICT-310** (classification group); **DICT-312** (dense/adaptive Group Chip chrome) |
| `/doc-template-categories` | **OPS-305 DONE** → `document-template-categories.page.md` | UX-304; DICT-307; **DICT-310**; **DICT-312**; WAVE-PAGE-DOCS-GAPS |
| `/dictionaries/text-block-categories` | **OPS-305 DONE** → `text-block-categories.page.md` | DOC-334; DICT-307; **DICT-310**; **DICT-312**; WAVE-PAGE-DOCS-GAPS |
| `/dictionaries/color-references` | color-references.page.md | PRODUCTS-301; DICT-306; **DICT-310** (appearance group); **DICT-312** (dense/adaptive Group Chip chrome) |

## Warehouse

| Route | Page doc | TZs |
|-------|----------|-----|
| `/inventory` | inventory-dashboard.page.md | **UX-301 DONE**; **WAREHOUSE-UX-301 DONE** (dedupe TOC buttons) |
| `/storage-items` | storage-items.page.md | **UX-301 DONE**, **UX-305 DONE**, **MATERIALS-308 DONE** (фильтр склада ✅) |
| `/stock-movements` | stock-movements.page.md | type filter ✅; **WAREHOUSE-UX-301 DONE** (+warehouse filter) |
| `/warehouses` | warehouses.page.md | CRUD; **WAREHOUSE-UX-301 DONE** (type default main + hint; page doc created) |

## Admin / auth

| Route | Page doc | TZs |
|-------|----------|-----|
| `/admin/users`, `/admin/roles` | **OPS-306 DONE** → `admin-users` / `admin-roles`.page.md | ADMIN/RBAC archived; WAVE-PAGE-DOCS-GAPS |
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

## Desktop / pairing

| Route / surface | Page doc | TZs |
|-----------------|----------|-----|
| Pairing dialog «Скачать» | `desktop/docs/INSTALL.md`, PAIRING.md | TZD-16 done; **TZD-24 done** (ZIP + SPA skip `/downloads`) |
| Desktop API keys | PAIRING.md | **TZD-21** READY |

## Cost / состав

| Route / surface | Page doc | TZs |
|-----------------|----------|-----|
| `/products/:id` BOM + Себест. | product-detail.page.md; ui-composition-tree.md | COST-301…304 done; **COST-305** product-line in cost (RESERVED); **CATALOG-335** dark; pattern → **ORDERS-302** PARK |
| `/modules/:id` | module-detail.page.md | **CATALOG-336 P0** — parity с product detail A+ |

## Dictionaries / form profiles

| Route / surface | Page doc | TZs |
|-----------------|----------|-----|
| `/dictionaries/*` (+ form-profiles) | dictionaries.page.md; DICT-300 | **DICT-313 DONE** audit; **314–316** RESERVED (API / settings / QuickCreate) |

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
