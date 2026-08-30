# Page ↔ TZ index

**Purpose:** Search by page/route to find which tasks touched or will touch it.  
**Updated:** 2026-08-25 (UX-HYGIENE-440 READY — DESK/SHIP/UX-440; IA-510 docs DONE — KP rail money/deadlines; UI War Room WR-500…512 DONE)

How to use: `Ctrl+F` по route или имени страницы. Новые TZ обязаны указывать
`PAGES:` / `PAGE_DOCS:` в шапке (см. `tz-authoring`).

## UI Density rollout (Paper & Ink — incremental)

> Program: [`WAVE-UI-DENSITY-PAPER-INK.md`](../../tasks/WAVE-UI-DENSITY-PAPER-INK.md) · Canon: [`ui-density-canon.md`](../ui-density-canon.md)

| Scope | DEN TZ | Note |
|-------|--------|------|
| Global tokens | **501–504 DONE** | `b14dd93f` … `bde452b2` — styles, FormField, shared/ui, button canon |
| App shell | **510·511 DONE** | `a1a6478d`, `4c4a79d4` |
| Desktop Import | **580 DONE** | `1ded0439` |
| Catalog | **520–522 DONE** | `cfb30fe9`, `2d3b21d8`, `a21356e8` — pi-table `[compact]` |
| Forms | **530·531 DONE** | `21533019`, `cdcd8866` |
| Doc-constructor | **540–541 DONE** | bundled `cfb30fe9` / `a21356e8` |
| Deals | **550·551 DONE** · **552 WAIT 409** | `d5454914`, `6b1e554f` |
| Production | **560·561 DONE** | `a7c50d2d`, `5cb571c7` |
| Auth/Admin | **570·571 DONE** | `d306586c`, `21533019` |
| Closeout | **590 DONE** · **599 DONE** | `b1b6442e` RU humanizer; guards in `UI-DENSITY-GUARDS.md` |
| `/desk` density | **512 DONE** | `d25cb1f4` |
| `/proposals/workspace` | **552 UNBLOCKED** | wave KP-SINGLE-WORKSPACE closed (409 DONE) |

## Overview

| Route | Page doc | TZs |
|-------|----------|-----|
| `/dashboard` | dashboard.page.md | **TZ-UI-414 DONE** dashboard lane helper micro-type 10px→11px |

## Doc-constructor

| Route | Page doc | TZs |
|-------|----------|-----|
| `/doc-constructor/builder`, `/builder/:id` | builder.page.md, builder-tool-pane, builder-inspector | DOC-324…341; **DOC-342** upload null→400; **DOC-343 READY** create-parity; **DOC-443 DONE** category `+` parity; **UX-316 READY** returnUrl из Create КП |
| `/doc-constructor/templates` | templates.page.md | DOC-324…341; **section chips** parity; **TZ-DOC-443 DONE** inline category `+` in setup + empty-state continuity; **UX-316/317 READY** nav return + gutters (shell); **UX-342 DONE** remove unused Показано helpers |
| `(app shell)` | page-chrome.md | **UX-317** ←→; **UX-321/FIX** rails; **UX-322/323 DONE** chrome page-tools + Gantt; **UX-324 READY** history↔tools gap; **UX-325 DONE** migration audit → 326…328 DONE; **UX-331 DONE** brand chip → home; **NAV-303 DONE**; **WAVE-UX-PAGINATION-UNIFY** **#1–#3 DONE**; **TZ-UX-345 READY** chrome-rail виден с 1024 (поле шапки, не откат w-12); audit `2026-08-15-chrome-page-tools-migration-audit.md` |
| `/doc-constructor/texts` | texts.page.md | DOC-316/326/336; **section chips**; **TZD-30** MCP AI-draft READY; **UX-342 DONE** drop dead pager total |
| `/doc-constructor/tables` | tables.page.md | **WAVE-DOC-TABLES 301–306 DONE**; **308 DONE** dialog layout/preview; **307 DONE** category КП + seed/apply preset (`WAVE-KP-TABLE-CONFIG`); **309 DONE** RU copy + taller fields; **310 READY FOR REVIEW** remove help + separate toolbar buttons; **UX-342 DONE** drop dead pager total; **TZ-UI-417 READY** counter 11px |
| `/doc-constructor/documents` | documents.page.md | **UX-303 DONE**; **UX-342 DONE** remove unused Показано helpers |
| `/doc-constructor/studio`, `/studio/:id` | **document-studio.page.md** | **WAVE-DOC-STUDIO** Wave 0 DONE (ADR); **101 READY** extract; 201a…1101 planned |
| `/import-todos` | import-todos.page.md | **TZD-29 DONE** (manager finish-list after import) |

## Catalog / production

| Route | Page doc | TZs |
|-------|----------|-----|
| `/materials` | materials.page.md | MATERIALS-*; **MATERIALS-313 DONE** pricePerUnit number (`e34b015d`, ждать кати); **CATALOG-301** BE DONE; **FE поля 301 = TZ-CATALOG-316**; **CATALOG-UI-301** Group Chip; **UX-314** PAGE_SIZE=10; **UX-341 DONE** grid→pi-pagination; **CATALOG-373 DONE** grid + filters-rail (parity products, `pi-materials-view-mode`); **CATALOG-375 DONE** list expandable preview (как products/modules); **TZ-UI-PHOTO-343 DONE** shared dropzone file/drag/Ctrl+V; **UX-328 DONE** chrome page-tools (mirror UX-326; no w-12 rail); **TZ-UI-407 DONE** filter Escape + `role="region"`; **TZ-UI-412 DONE** remaining catalog micro-type 10px→11px; **TZ-UI-413 DONE** material form micro-type 10px→11px; **TZ-UX-FORM-311 READY** FullEditor packing |
| `/materials/:id` | **material-detail.page.md** | 312 section sheet; **FACT-304 DONE** FactStack; **CATALOG-337 DONE** A+ shell; **UX-313** smart back; **TZ-UI-405 DONE** 2-level crumbs + single back; **TZ-UX-444C** info data-links (+ optional banner) |
| `/products` | products.page.md | PRODUCTS-*; composition **302…305**, **CATALOG-340 DONE** picker «Создать» → QuickCreate; expand polish (gold tray); **UX-319** expanded ink frame + sibling dim (pi-table); **hierarchy preview 307 DONE**; FE **317**; gap **320**; tree **311**; **CATALOG-UI-301**; **PRODUCTS-308/309**; **PRODUCTS-310** (circular ɵcmp edit); **CATALOG-338** article; **UX-314** PAGE_SIZE=10; **UX-341 DONE** grid→pi-pagination (15→10); **OPS-312 READY** page.spec dict-labels flush; **UX-PHOTO-301** upload progress DONE; **TZ-UI-PHOTO-343 DONE** shared dropzone file/drag/Ctrl+V; **UX-326 DONE** chrome page-tools; **MIG-306 DONE** BE categoryId filter string\|ObjectId (`audit/2026-08-13-product-category-filter-fix.md`); **TZ-UI-407 DONE** filter Escape + `role="region"`; **TZ-UI-412 DONE** leftover catalog micro-type 10px→11px; **TZ-UX-FORM-308 READY** shared FIELD_CAPACITY kind C; **TZ-UX-FORM-309 READY** FullEditor packing 12-col |
| `/products/:id` | **product-detail.page.md** | 319 stub docs; detail UI; **320** complex/cascade; **311** tree; **330–331** kind palette; **UX-313** smart back; **PRODUCTS-309** BomPanel in FullEditor; **PRODUCTS-310**; **CATALOG-340 DONE** picker «Создать» → QuickCreate; **UX-DIALOG-306** picker qty; **TZ-UI-405 DONE** single back; **TZ-UX-444B** where-used FE; **TZ-UX-444C** status-banner + info links; **TZ-UX-444D DONE** empty thumb hatch |
| `/modules`, `/modules/:id` | modules.page.md, **module-detail.page.md** | **FORMS-315 READY** number coerce; **CATALOG-336** A+; **COMPOSE-301** discoverability; **DIALOG-305** kind-C width; **CATALOG-340 DONE** picker «Создать» → QuickCreate/material form; **MODULES-341 DONE** form/detail/QC photoId upload; **TZ-UI-PHOTO-343 DONE** sweep + shared dropzone canon; **UX-313**; **UX-314** PAGE_SIZE=10; **UX-341 DONE** grid→pi-pagination; **OPS-312 READY** module-detail.spec dict-labels flush; **CATALOG-372 DONE** list vitrine parity (photo/grid/rail); **CATALOG-374 DONE** list expandable состав (как products); **UX-327 DONE** chrome page-tools (зеркало products UX-326); **TZ-UI-405 DONE** 2-level crumbs + single back; **TZ-UI-407 DONE** filter Escape + `role="region"`; **TZ-UI-412 DONE** leftover catalog micro-type 10px→11px; **TZ-UX-FORM-310 READY** FullEditor packing; **TZ-UX-444B** where-used FE |
| `/catalog/appearance` | **catalog-appearance.page.md** | **CATALOG-331** kind palette settings (admin) |
| `/work-types` | work-types.page.md | **FORMS-314 READY** helper+hourlyRate number; **Цех IA**; WORKTYPES-*, **UX-305 DONE**, **PRODUCTION-302 DONE**; **CATALOG-UI-301**; **UX-314 READY**; **PRODUCTION-STUDIO-A** docs-only; **PRODUCTION-309** mutate → `production:write` |
| `/people` | people.page.md | **UX-306 DONE**; **CATALOG-UI-301**; **UX-314 READY**; **TZ-UX-FORM-312 READY** FullEditor packing; **TZ-UX-440 READY** колонка «Почта» |
| `/production` | production-cockpit.page.md | **300** Lego; **303 DONE**; **DESK-416 DONE** tray `/desk` → `?orderId=&from=desk` («На стол»); **STUDIO-A–D** chrome PASS; **WAVE-PRODUCTION-GANTT-RESIZE** 309/311/312/313 **DONE**; **WAVE-PRODUCTION-GANTT-TREE** 314–320 **DONE**; **WAVE-PRODUCTION-GANTT-CASCADE** **321–323 DONE**; **WAVE-PRODUCTION-COCKPIT-HARDEN** **324–328 DONE** (98/100); **WAVE-PRODUCTION-COCKPIT-POLISH** **329–330 DONE**; **331 DONE** (plan fields through ready + siteId heal); **332 DONE** (day ticks DD.MM + ПН…ВС); **333 DONE** (optimistic Gantt drag, no full reload); **334 DONE** (workers list `limit: 100`); **335 DONE** (Gantt sort by start + meta auto-save); parked **308/310**; **ORDERS-HUB-303** `?orderId=`; **PRODUCTION-337 DONE** («Все активные» без `draft`, coupling `Order.status`); **GANTT-401** «По рабочим» RO (toggle в шапке Ганта); **PRODUCTION-338 DONE** Gantt hydrate parallel + non-blocking thumbs; **PRODUCTION-339 DONE** крупные ▸/▾ + рамки групп раскрытых заказов; **PRODUCTION-340 DONE** summary header tint (чуть теплее/темнее children); **PRODUCTION-341 DONE** hydrate concurrency↓ + 429 retry (throttle short 10/s); **WAVE-GANTT-IA-PRODUCT-MODULE** **PRODUCTION-342 DONE** Order→Product→Module→WT; **PRODUCTION-343 DONE** RU labels + product/module frames; **PRODUCTION-344 DONE** Worker→Module(context)→WT; **PRODUCTION-345 DONE** whole-product «… · целиком»; **PRODUCTION-346 DONE** nest indent+tint; **PRODUCTION-347 DONE** hide assembly/pack on Gantt; **PRODUCTION-348 DONE** toolbar+header+label-expand+stronger nest; **PRODUCTION-349 DONE** 4-level milky palette + distinct summary barFill; **PRODUCTION-350 DONE** mono milk ladder (hue ~82–90 L/C only); **PRODUCTION-351 DONE** worker FIO/summary tint dominant WT + ▸=modules; **PRODUCTION-352 DONE** tint hash fallback; **PRODUCTION-353 DONE** unassigned banner + People CTA |
| `/orders` | orders.page.md | ORDERS-*; **303.1** deep-link `?q=`; **ORDERS-HUB-301** DONE; **HUB-302 DONE**; **HUB-303 DONE** supply/production/docs expand; **HUB-304 DONE** readiness/warehouse/shipping stub; **ORDERS-336 DONE** form Save productId + default Site + freeze; **ORDERS-337 DONE** composition-tree pencil + list forest; **DESK-416 DONE** hub tray production без `from`; **TZ-UI-405 DONE** 2-level crumbs (`Сделки / №`); **TZ-UX-FORM-313 READY** order-form-panel packing; **TZ-TEST-421 READY** stale HUB-303/304 specs → канон DESK-423; **TZ-UX-444A DONE** PiStatusBanner на order-detail |

**Catalog audits / backlog:**  
[`2026-08-15-order-lifecycle-hub.md`](../audits/2026-08-15-order-lifecycle-hub.md) ·  
[`2026-08-15-catalog-list-vitrine-parity.md`](../audits/2026-08-15-catalog-list-vitrine-parity.md) ·  
[`2026-08-04-catalog-coherence-audit.md`](../audits/2026-08-04-catalog-coherence-audit.md) ·  
[`2026-08-04-catalog-readiness-fe-be.md`](../audits/2026-08-04-catalog-readiness-fe-be.md) ·  
[`_backlog/README.md`](../../tasks/_backlog/README.md) ·  
Review inbox: [`CATALOG-WAVE1-REVIEW.md`](../agent-checklists/CATALOG-WAVE1-REVIEW.md)


| `/production` ↔ `/work-types` | `production-gantt-studio-spec.md` | **WAVE-PRODUCTION-STUDIO-CHROME** A→D; prompt `PROMPT-PRODUCTION-STUDIO-CONTINUOUS`; master checklist resume; target 98–99 |

## Deals / orgs / lifecycle stubs

| Route | Page doc | TZs |
|-------|----------|-----|
| `/organizations` | organizations.page.md | **FORMS-316 READY** vat/days number; **UX-305 DONE**; nav → **Админ** (NAV-301); **PARTY-301 DONE** (tenant-scope, soft-delete, `isOurCompany`, `GET /current`); **PARTY-302 DONE** (FullEditor kind C, паспорт ИП, бейдж «наша фирма»); очередь **ASSETS-301/302**; **UX-314 READY** PAGE_SIZE=10 |
| `/counterparties` | counterparties.page.md | **FORMS-316 READY** vat/days number; **NAV-301** thin list; **PARTY-301 DONE**; **PARTY-303 DONE**; **MIG-304** поле «Почта» (git); **MIG-307 BLOCKED** до кати `da01f1e5` |
| `/design`, `/design/combine`, `/supply`, `/shipping` | **design.page.md**; **design-combine.page.md**; supply.page.md; shipping.page.md | **COMBINE-401…415**; **supply** live; **shipping** реестр (не stub); **TZ-SHIP-433 READY** отмена до dispatch; **SWEEP-401** ship; **TZ-SHIP-440 READY** warehouse select (не ObjectId); **TZ-UX-440 READY** supply «Почта организации»; **TZ-UX-443 LIVE** content inset; **TZ-SUPPLY-443 DONE** org `+` btn canon |
| `/` , `/desk` | **manager-desk.page.md** | **401…424 DONE**; **425…430 DONE** tray workspace + ship-without-doc; **TZ-DESK-440 DONE** honest primary CTA (нет «подключится позже»); audit `2026-08-25-ux-hygiene-sweep.md` |
| `/` , `/dashboard` | **dashboard.page.md** | **NAV-303 DONE** Обзор KPI (**не дом** после DESK-401); **TZ-DASHBOARD-401 DONE**; **UX-331** brand → стол; Канбан на `/design/combine`; **TZ-UI-414 READY** helper 11px |
| `/contracts` | contracts.page.md | **SALES-310 DONE** — dark Deals TOC, empty yellow row |
| `/orders` | orders.page.md | **SALES-310 DONE** — dark Deals TOC, empty yellow row; **SWEEP-401** readyForWork ≠ item.status |
| `/proposals` | **proposals.page.md** | **FORMS-316 READY** discount number; **SALES-301**; **303** family API; **313 DONE** family expand; **SALES-310 DONE** TOC; **TZ-SALES-350** shame RU statuses (WAVE-KP-SHAME-POLISH) |
| `/proposals/demo-workspace` | **kp-workspace-geometry.md** · **kp-workspace.page.md** | **Wave 0 DONE** geometry; SoT page doc |
| `/proposals/workspace` | **kp-workspace.page.md** · **kp-workspace-rail-ia.md** | **WAVE-KP-SINGLE-WORKSPACE DONE** (400–409); **WAVE-KP-RAIL-BIND** TZ-KP-IA-510/511 + TZ-KP-BIND-512 (Money/Deadlines rail; registry labels; 510 docs DONE); **TZ-UX-440 READY** catalog review dirty = RU, не `productName`; **TZ-KP-443 DONE** orientation from template (toggle убран с КП; Lucide в builder inspector) |
| `/proposals/create` | **proposals-create.page.md** (historical) | **= workspace с 408** (тот же компонент); IA 510–512 rails+bind; legacy-канон до cutover; см. banner в page doc; **TZ-KP-443 DONE** orientation from template |

| top nav L→R | app-layout | **NAV-301** lifecycle IA |

## Reference

| Route | Page doc | TZs |
|-------|----------|-----|
| `/dictionaries` | dictionaries.page.md | UX-303; **DICT-303/308**; **DICT-311** (retire hub); **DICT-312** (dense/adaptive Group Chip chrome); **WAVE-DICT-DEMO** (317–320) |
| `/dictionaries/measurements` | measurements-group.page.md | **DICT-308 DONE**, **DICT-309** (units cutover), **DICT-312**; **DICT-317** (units edit/roles) |
| `/dictionaries/kind-labels` | (DICT-320) | **DICT-319/320** productKind+materialKind labels; **DICT-441** chips Категории+Виды always visible; **TZ-UX-443 LIVE** inset via group-workspace |
| `/dictionaries/color-references` | color-references.page.md | PRODUCTS-301; DICT-306; **DICT-310**; **DICT-318** (RAL prefix) |
| `/dictionaries/units` | units.page.md | DICT-304 DONE; **DICT-309** → redirect |
| `/categories` | categories.page.md | UX-302; DICT-305; **DICT-310** (classification group); **DICT-312** (dense/adaptive Group Chip chrome); **DICT-441** shared CLASSIFICATION_CHIPS; **CATALOG-377** name-path + `?type=` + write-through; **TZ-UX-442 DONE** RU slug placeholders; **TZ-TEST-422** ActivatedRoute in categories.page.spec |
| `/doc-template-categories` | **OPS-305 DONE** → `document-template-categories.page.md` | UX-304; DICT-307; **DICT-310**; **DICT-312**; WAVE-PAGE-DOCS-GAPS; **UX-342 DONE** drop dead pager total |
| `/dictionaries/text-block-categories` | **OPS-305 DONE** → `text-block-categories.page.md` | DOC-334; DICT-307; **DICT-310**; **DICT-312**; WAVE-PAGE-DOCS-GAPS; **UX-342 DONE** drop dead pager total |

## Warehouse

| Route | Page doc | TZs |
|-------|----------|-----|
| `/inventory` | inventory-dashboard.page.md | **UX-301 DONE**; **WAREHOUSE-UX-301 DONE** (dedupe TOC buttons); **UX-342 DONE** drop dead pager total |
| `/storage-items` | storage-items.page.md | **UX-301 DONE**, **UX-305 DONE**, **MATERIALS-308 DONE** (фильтр склада ✅); **UX-342 DONE** drop dead pager total |
| `/stock-movements` | stock-movements.page.md | type filter ✅; **WAREHOUSE-UX-301 DONE** (+warehouse filter); **UX-342 DONE** drop dead pager total |
| `/warehouses` | warehouses.page.md | CRUD; **WAREHOUSE-UX-301 DONE** (type default main + hint; page doc created); **UX-342 DONE** drop dead pager total |

## Admin / auth

| Route | Page doc | TZs |
|-------|----------|-----|
| `/admin/users`, `/admin/roles` | **OPS-306 DONE** → `admin-users` / `admin-roles`.page.md | **TZ-AUTH-308 DONE**: users UI redirect→devices; roles KEEP |
| `/admin/devices` | admin-devices.page.md | **TZ-AUTH-308 DONE** canonical invite UI; AUTH-303/304/305 DONE; **TZ-UI-408 READY** dialog font tokens |
| `/enroll/:token` | enroll.page.md | **TZ-AUTH-303→304** passwordless named-computer enrollment; **TZ-COMP-401** privacy link |
| `/legal/privacy` | legal-privacy.page.md | **TZ-COMP-401** public policy (path A) |
| `/admin` stub | — | **TZ-AUTH-308** redirect → `/admin/devices` |
| `/login` | login.page.md | TZ-AUTH-301 notice; **AUTH-306** owner break-glass; **AUTH-305 DONE**; AUTH-307 park; **TZ-COMP-401** formula + privacy link; **TZ-UI-415 READY** footer 11px |
| **frontend-nx** `/login`, `/enroll/:token`, `/admin/*` | same page.md (behavior parity) | **TZ-NX-F3 READY** — port auth platform + BE effective-permissions fix; canon `docs/architecture/nx-auth-platform.md` |
| **frontend-nx-only** `/registries`, `/registries/:registryKey` | registries.page.md | **TZ-NX-REGISTRIES-MASTER-TABLE-UX DONE** — master table + inline detail panel (no separate detail route); `units` real API (`GET/PATCH /units`), `departments` demo fixture; no legacy equivalent, no domain permissions |
| **frontend-nx-only** `/registries` (closeout wave) | registries.page.md | **TZ-NX-REGISTRIES-FULL-CLOSEOUT DONE** — icon row actions + click-effect tests + real browser smoke (all 6 registries, create/edit/archive-confirm dialogs, zero console errors) — evidence `docs/agent-checklists/evidence/TZ-NX-REGISTRIES-FULL-CLOSEOUT/`; Units delete still deferred (backend blocker, see `tasks/_backlog/TZ-NX-REGISTRY-UNITS-DELETE-FE.md`) |
| **frontend-nx-only** `/constructor`, `/constructor/create/:kind` | constructor.page.md | **TZ-NX-CONSTRUCTOR-SHELL DONE** — catalog composition workspace shell; four create kinds (material/part/module/product); Complex not a create kind; header nav chip, no rails/API |

## UI War Room / WR-50x (2026-08-23)

Program SoT: [`docs/audits/2026-08-23-ui-war-room-program.md`](../audits/2026-08-23-ui-war-room-program.md).
Prompt: `tasks/PROMPT-FREEBUFF-UI-WR-WAR-ROOM.md` → A/B/C.
Closeout: **Proof of adoption** обязателен (`docs/TZ-AUTHORING.md`).
Merged: 502→501, 511→507, 512→506.

| TZ | Agent | One-liner |
|----|-------|-----------|
| TZ-UI-WR-500 | A | Canon rules + proof process |
| TZ-UI-WR-501 | A | Return-focus + z-* (ex-502) |
| TZ-UI-WR-503 | A | Builder flyout a11y |
| TZ-UI-WR-504 | C | Gold/on-gold |
| TZ-UI-WR-505 | B | ErrorBanner string API |
| TZ-UI-WR-506 | B | /kit routes + passports (ex-512) |
| TZ-UI-WR-507 | C | Filter + skeleton/error (ex-511) |
| TZ-UI-WR-508 | C | Dropdown portal + nav |
| TZ-UI-WR-509 | A | Desk flyout a11y |
| TZ-UI-WR-510 | A | KP review Esc=B exception |

## Post-WR ROI (2026-08-23, после Freebuff A/C)

| TZ | Ready? | One-liner |
|----|--------|-----------|
| [TZ-UI-ROI-520](../../tasks/TZ-UI-ROI-520-keyboard-only-qa.md) | сейчас (docs) | Keyboard-only чеклист |
| [TZ-UI-ROI-521](../../tasks/TZ-UI-ROI-521-native-select-fallback.md) | после 501 если CSS | Native select fallback канон |
| [TZ-UI-ROI-522](../../tasks/TZ-UI-ROI-522-ui-rules-kit-snapshot.md) | сейчас (после 506) | `docs/ui-rules.md` для агентов |
| [TZ-UI-ROI-523](../../tasks/TZ-UI-ROI-523-desk-dirty-close.md) | **после 509** | Dirty-close desk flyout |

## Cross-cutting UX batch (this sweep)

| TZ | Pages | One-liner |
|----|-------|-----------|
| [AUDIT-MGR-530](../../tasks/TZ-AUDIT-MGR-530-manager-journey-audit.md) | cross-cutting | Manager-journey smoke checklist + orchestration (PO smoke wave 2026-08-24) |
| [UX-301 DONE](../../tasks/_archive/2026-08/TZ-UX-301.done.md) | inventory, storage-items, stock-movements | Add Склад nav |
| [UX-302 DONE](../../tasks/_archive/2026-08/TZ-UX-302.done.md) | categories | Strip dead docCat |
| [UX-303 DONE](../../tasks/_archive/2026-08/TZ-UX-303.done.md) | documents, dictionaries | Unify labels |
| [UX-304](../../tasks/_archive/2026-08/TZ-UX-304-reference-pi-table.md) | color-references, doc-template-categories | pi-table |
| [UX-305 DONE](../../tasks/_archive/2026-08/TZ-UX-305.done.md) | orgs, work-types, storage, materials | Fix page.md |
| [UX-306 DONE](../../tasks/_archive/2026-08/TZ-UX-306.done.md) | people | Route+nav+dialog |
| [DOC-324..326](../agent-checklists/DOC-CONSTRUCTOR-UX-AUDIT.md) | builder/templates/texts | Prior audit |
| [DOC-334 audit](../audits/DOC-334-doc-constructor-ui-polish-audit.md) | builder/texts/tables/categories | Deploy polish queue 334→335→332→336 |

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
| Desktop Form Studio (Excel формы) | WAVE `WAVE-DESKTOP-EXCEL-FORMS` | TZD-50→52 DONE; TZD-53 0.5.5 code (deploy deferred) |
| Desktop IA shell (3 двери) | WAVE `WAVE-DESKTOP-IA-SHELL` | **TZD-54/55/56 DONE**; **TZD-61 DONE** (копирайт «не чат» — снимает TZD-62) |
| Desktop AI-чат | `desktop/docs/AI-PROVIDERS.md` | **TZD-62/63/64/65 DONE** (чат + любой .gguf + kppdf-глоссарий + OpenAI-compat API card) |

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
| [ACCESS-301](../../tasks/_archive/2026-08/TZ-ACCESS-301-page-acl-catalog.md) | admin | Page ACL + 4 roles seed |
| [ACCESS-302](../../tasks/_archive/2026-08/TZ-ACCESS-302-director-page-grants-ui.md) | admin/access | Director page checkboxes |
| [JOURNEY-301 DONE](../../tasks/_archive/2026-08/TZ-JOURNEY-301.done.md) | all | Flow gap map (docs) |
| [SALES-301](../../tasks/_archive/2026-08/TZ-SALES-301-proposal-thin-ui.done.md) | /proposals (NEW) | Thin КП list |
| GANT | parked | `_backlog/vision/GANT-calendar.md` |
| **[CORE-301](../../tasks/_archive/2026-08/TZ-CORE-301-snapshot-immutability-pattern.done.md) ** | backend/common | Snapshot-on-transition immutability helper (foundational) |
| **[DEPLOY-301](../../tasks/_archive/2026-08/TZ-DEPLOY-301-prep-first-deploy.done.md) ** | ops | **Gate перед первым деплоем** (auth/CORS/secrets/compose) |

Audit note (doc-constructor detail): `DOC-CONSTRUCTOR-UX-AUDIT.md`

| TZ-NX-DOCPLAT-01 DONE (docs/tasks) | tasks/ порядок + legacy-съёмка студии/builder/КП | archive: `tasks/_archive/2026-08/TZ-NX-DOCPLAT-01-INVENTORY-AND-ORDER.done.md` · evidence: `docs/agent-checklists/evidence/TZ-NX-DOCPLAT-01/` |
