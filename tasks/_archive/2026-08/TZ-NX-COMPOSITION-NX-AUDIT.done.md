# TZ-NX-COMPOSITION-NX-AUDIT — NX «Реестры» + «Конструктор» (analysis-only)

> Mode: analysis-only. No product code. Checklist:
> `docs/agent-checklists/TZ-NX-COMPOSITION-NX-AUDIT.md`.

## Purpose

Первый архитектурный срез состава каталога на NX: два раздела, а не
«ещё один demo-реестр». Источник: PO-промпт 2026-08-29 + legacy
`docs/compose/plans/2026-08-04-catalog-composition-vision.md` (D1–D4 LOCKED)
+ живой backend composition.

## Files read (read-only)

```
docs/PO-CANON.md
docs/CONTEXT.md
docs/TZ-AUTHORING.md
docs/FEATURE-INTEGRATION-CHECKLIST.md
docs/FEATURE-INTEGRATION-CHECKLIST.md (FIC A–E)
docs/pages/registries.page.md
docs/pages/ui-composition-tree.md
docs/pages/ui-overflow-select.md
docs/pages/product-detail.page.md
docs/pages/products.page.md (composition §)
docs/product-vision-lite.md
docs/adr/README.md
docs/compose/plans/2026-08-04-catalog-composition-vision.md
docs/agent-checklists/TZ-NX-REGISTRY-UNITS-DISCOVERY.md (shape)
tasks/_archive/2026-08/TZ-NX-REGISTRY-UNITS-READ-SLICE.done.md (skim)

frontend-nx/apps/kppdf-web/src/app/pages/registries/**
  registries-page.ts, registry-detail-panel.component.ts,
  registries.routes.ts, model/registry.types.ts,
  data/registries.catalog.ts, data/units.registry.ts,
  data/units-http-data-source.ts, data/fixture-registry-data-source.ts
frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts (registries chip)
frontend-nx/libs/data-access/src/index.ts + lib/units, lib/admin, lib/auth, lib/capabilities
frontend-nx/libs/features/src/index.ts + pi-group-workspace.component.ts
frontend-nx/libs/ui/paper-and-ink/src/lib/overflow-select/**
frontend-nx/libs/ui/paper-and-ink/src/lib/pi-table-tree.component.ts (not BOM)

backend/src/modules/catalog/composition-line.schema.ts
backend/src/modules/catalog/composition-line.dto.ts
backend/src/modules/catalog/composition-line.service.ts
backend/src/modules/catalog-graph/catalog-graph.service.ts
backend/src/modules/product/product.schema.ts
backend/src/modules/product/product.controller.ts
backend/src/modules/product/product.service.ts (isComplex, getTree, composition)
backend/src/modules/product-module/product-module.schema.ts
backend/src/modules/product-module/product-module.controller.ts
backend/src/modules/material/material.schema.ts
backend/src/modules/material/material.controller.ts
backend/src/common/snapshot/snapshot.helper.ts

frontend/src/app/pages/products/product-detail.page.ts (not fully — page.md + BOM panel grep)
frontend/src/app/shared/ui/composition/product-bom-panel.component.ts (isComplex)
```

MCP `claude_code` Agent: **unavailable** this session (`subagent_type` catalog empty).
Analysis done in Cursor Mode A.

---

## 1. Current NX shape

**`/registries`** — one page, two URLs. Master table of *registries* (not catalog
entities). Click expands **one** inline `RegistryDetailPanel` via
`/registries/:registryKey`. Chrome = crumbs only (TZ-NX-REGISTRIES-HEADER-CLEANUP).

| key | source | behavior |
|---|---|---|
| `units` | api | `PiUnitsService` GET `/units` + PATCH `/units/:key`; `rowId = key`; no sort; no DELETE |
| `departments` | demo | fixture; `failFirstAttempt`; expandable child rows |

**Contracts (`registry.types.ts`):** `RegistryDataSource.query` is a throwing
Promise; HTTP adapters `firstValueFrom` + `if (!ok) throw`. Filters: text +
select only. `RegistryRowAction.run(row, {reload, notify})` — **no dialog, no
DI, no create/edit form**. Expandable = flat field list, not a tree.

**data-access:** auth, capabilities, admin, units. Zero Product/Module/Material.

**features:** `PiGroupWorkspace` + `GroupChip` only.

**Nav:** header chip «Реестры», `skipPageAcl`, not in rails. No «Конструктор».
Dead-link filter still hides missing business routes.

**UI primitives already in NX (constructor can use, not invent):**
`pi-table`, `pi-page-chrome`, `pi-status-banner`, `pi-dialog`/`AlertDialog`,
`pi-toast`, `pi-overflow-select`, `pi-select-add-row`, `pi-badge`, `pi-switch`,
`pi-sheet`/`drawer`, form-field. **`pi-table-tree` is CDK drag-sort tree — not
the composition cascade.** Do not use it as BOM.

**Honest gap vs legacy BOM:** NX has **no** `app-composition-tree`, no
ProductBomPanel, no composition picker dialog, no where-used table.

---

## 2. Legacy composition inventory (do not invent)

**Collections (3, not 5):** `materials`, `productmodules`, `products`.
«Деталь» / «метиз» / «покупное» = `Material.materialKind` (`part` | `fastener` |
`purchased` | `other`). «Комплекс» = **derived** `isComplex` when
`composition` has `lineType === 'product'`. No `Part` / `Complex` collection
(D3 LOCKED).

**CompositionLine** (`composition-line.schema.ts`): `lineType` module|material|product,
`refId`, `quantity` ≥ 0.000001, `sortOrder`, optional `unit`,
`overrideDimensions {length,width,height,unit}`, `isPurchased`,
`sourcePosition`, `sourceCode`, `unitPriceOverride` (product lines only),
`notes`. Line `_id` for CRUD.

**Color:** **no field on the line.** Entity-level only: `Product.ralCode`;
`Material.colors[]` (supply picker). Constructor inspector shows inherited
color; do **not** add `overrideColor` without a backend TZ.

**Inclusion (D1/D2, validated in CompositionLineService):**

| Parent | Allowed children |
|---|---|
| Product | module, material with `materialKind ≠ raw`, product (→ complex) |
| Module | module, material (incl. raw). **Product lines 400** |

Self-ref and graph cycles → 400 via `CatalogGraphService.assertNoCycleAndDepth`.
Hard depth **8**. Duplicate `(lineType, refId)` rejected. Max 1000 lines.

**Canonical write:** `composition[]`. Dual-read still maps legacy
`product.productModuleIds` and `module.materials[]`. NX must write **only**
composition endpoints, not legacy arrays (`rejectLegacyMaterialsWrite` already
on module create).

**Endpoints (real):**

| Area | Read | Mutate |
|---|---|---|
| Materials | GET `/materials` `page,limit,search,categoryId,materialKind` | POST/PATCH/DELETE `/materials/:id` |
| Modules | GET `/modules` (**no page/search** — list-all) | POST/PATCH/DELETE `/modules/:id` |
| Products | GET `/products` `page,limit,search,categoryId,status,isActive,sortBy,sortOrder` | POST/PATCH/DELETE `/products/:id` |
| Composition | GET `/:id/composition`, GET `/:id/tree?maxDepth=` | POST/PATCH/DELETE `.../composition[/:lineId]` |
| Where-used | GET `/:id/where-used` | — |

Roles: list often `admin,director,manager`; tree/where-used sometimes includes
`user`; mutate `admin,manager`. Org-scoped catalog (unlike Units). Identifier
is Mongo `_id`, not slug.

**Snapshot:** catalog is **live SoT**. TZ-CORE-301 `createInlineSnapshot` is for
**order / specification / shipment** transitions — not a catalog version
table. Duplicate (`POST /products/:id/duplicate`) is the copy path. Constructor
must not invent git-like catalog versions.

**Legacy UI write-path:** `/products/:id` and `/modules/:id` = passport +
`ProductBomPanel` + `app-composition-tree` + overflow-select picker +
add-and-continue. Order/desk trees are **live catalog**, pencil opens catalog
dialogs (not order snapshot).

---

## 3. IA: two sections (decision)

### 3.1 «Реестры» = полка сохранённого

Operator **выбирает** уже существующие позиции. Не собирает BOM в expand
master-строки (registry engine cannot host nested composition honestly).

Master table rows (catalog keys, plus existing units):

| registryKey | Collection | Filter / view |
|---|---|---|
| `units` | units | already real |
| `materials` | materials | `materialKind=raw` (сырьё) |
| `details` | materials | `materialKind` in part/fastener/purchased/other — **same API**, not a new entity |
| `modules` | productmodules | list; **blocked on pagination** until backend list params exist |
| `products` | products | products with `isComplex !== true` (client filter **or** later query — do not invent `?isComplex=` until BE TZ) |
| `complexes` | products | `isComplex === true` (same) |

`departments` demo: keep until PO drops it; do not reuse key `products`.

Row action from a catalog registry: **«Открыть в конструкторе»** → navigate.
Optional later: archive via existing DELETE (soft `deletedAt` on product/module).
Toggle `isActive` only where the DTO already has it (Product yes; Material/Module
check before wiring).

### 3.2 «Конструктор» = единственный write-path состава

Создать карточку (паспорт) **и** собрать состав в одном workspace. Не
дублировать BOM на `/registries`. Не второй composition CSS — port
`app-composition-tree` behavior into NX (`libs/features` or
`pages/constructor/`), using existing overflow-select / dialog / toast.

**Kind on create:** material / detail (kind preset) / module / product.
Complex is **not** a create-kind: it appears when the operator adds a
product-line to a product.

**URL (NX):**

```
/registries                         master of registries
/registries/:registryKey            list of saved entities (flat table)

/constructor                        kind picker (empty workspace CTA)
/constructor/new/:kind              create passport then composition
/constructor/:kind/:id             edit saved entity (kind = material|module|product)
```

Header: new category «Конструктор», `entryPath: /constructor`,
`activeAliases: ['/constructor']`. Visibility: route-exists + same honesty as
registries (`skipPageAcl` until a real pageKey is seeded — **do not invent**
`constructor` permission in this wave). Not in left/right rails.

Crumbs: `Конструктор / <имя>` (detail); list registries stay crumbs-only.

**Do not** nest constructor under `/registries/:key/:id` — that fights the
one-expanded-row master table and mixes library vs workshop.

---

## 4. Reusable UI contracts

| Need | Reuse | Do not |
|---|---|---|
| Saved lists | `RegistryDefinition` + HTTP `RegistryDataSource` (units pattern) | Stretch definition into BOM |
| Catalog dropdown | `app-pi-overflow-select` | Native select for long names |
| Nested composition | Port composition-tree **behavior** (hit-target row, kind badge, pencil) | `pi-table-tree` as BOM; copy legacy CSS into registries |
| Qty / dims / purchased | Inspector beside tree (legacy BomPanel) | New CSS primitive |
| Validation errors | `PiStatusBanner` + toast; 400 cycle text as-is (RU from BE) | Silent client-only cycle check without BE |
| Create passport | Dialog/sheet already in NX; **platform createForm still missing** — constructor page owns forms, not RegistryRowAction | Invent RegistryDefinition.createForm inside a catalog TZ |

Platform gap (repeat of units discovery Risk 3): create/edit forms are
**constructor**, not registry contract. First catalog registry slice = **read
list + navigate to constructor**, same as units read-slice.

---

## 5. Data-access boundaries

New `@kppdf/data-access` services (silentHttp, `API_BASE_URL`), **no backend
changes** in first slices:

- `PiMaterialsService` — list/get/create/update; list params only those on GET `/materials`
- `PiModulesService` — list/get/composition/tree; **flag list-all** until GET `/modules` grows page/search
- `PiProductsService` — list/get/composition/tree/where-used; map `isComplex` from response (already computed on GET `:id`; **list** may omit it — verify in a read TZ before filtering complexes server-side)
- `PiCompositionService` or methods on parent services: POST/PATCH/DELETE composition lines; never DELETE catalog as “remove from BOM”

Adapters: `createMaterialsHttpDataSource` etc. `rowId = row._id` (not
`key`). Page size clamp to existing server limits (materials/products typically
20 default; do not assume units’ 100).

Org: pass through existing auth interceptor; do not add `organizationId` query
if controllers take it from user only.

---

## 6. Checkpoints (PO questions)

| Topic | NX rule |
|---|---|
| Nested composition | Tree from GET `.../tree`; writes to **selected parent’s** composition API (product vs module). Refs + qty, no deep-clone (F1). |
| Dropdown | overflow-select + existing list/bulk endpoints; search via `search` where it exists |
| Quantity | line `quantity`; inspector PATCH |
| Dimensions | entity dims on passport; **overrideDimensions** on line only (already in DTO) |
| Colors | display `ralCode` / `colors[]`; no line override |
| Purchased/manufactured | line `isPurchased` (optional bool). Module default true on **legacy** `materials[]` — composition line has no default in schema (undefined ≠ true). UI: explicit switch, PATCH `{isPurchased}` |
| Validation / cycles | trust BE 400/422; client can disable self in picker (exclude current id) |
| Version/snapshot | live catalog; snapshot only at order/KP transition (CORE-301). Constructor save = PATCH live doc |
| URL | §3.2 |
| API | existing composition + list; **modules pagination is a prerequisite TZ** for a proper modules registry |

---

## 7. Risks

1. **P0 — GET `/modules` is not a paginated registry API.** Wiring it like units
   would dump the full collection. Need backend list TZ **or** keep modules
   constructor-only until then.
2. **P0 — `isComplex` on list.** Derived on `findById`/`findByIds`, not
   guaranteed on `findAll`. Complexes registry must not invent `?isComplex=`.
   Options: client-side after fetch (bad at scale) or small BE TZ adding a
   filter. Shop ~10 users: **temporary client filter of current page is dishonest**;
   prefer BE filter TZ before the complexes row, or one «Изделия» registry with
   a badge column.
3. **P1 — RegistryDefinition cannot host BOM.** Expanding a product row with a
   nested tree would be a platform rewrite. Constructor page is mandatory.
4. **P1 — Dual IA with legacy `/products`.** NX constructor vs live Angular
   catalog until cutover. Do not dual-write. PO queue decides when NX replaces
   `/products` (PO-CANON п.7).
5. **P1 — No constructor/pageKey.** Same as registries: `skipPageAcl` or
   existing `products`/`materials`/`modules` keys — do not seed fake ACL.
6. **P2 — `pi-table-tree` looks like a tree** but is the wrong primitive for BOM.
7. **P2 — Units vs catalog identity** (`key` vs `_id`); keep adapters separate.

---

## 8. Ordered plan

**Sequential**

1. **TZ-NX-CONSTRUCTOR-SHELL** — route `/constructor`, header chip, empty
   workspace + kind CTA. No catalog API yet. Conflict:
   `layout/nav-categories.ts`, `app.routes.ts`, `pages/constructor/**`.
2. **TZ-NX-CATALOG-DATA-ACCESS** — PiMaterials + PiProducts list/get (read).
   Conflict: `libs/data-access/**`.
3. **TZ-NX-REGISTRIES-MATERIALS-READ** — replace nothing; add `materials` +
   `details` registry keys (filter `materialKind`). Pattern = units. No BOM.
4. **Backend TZ-MODULES-LIST** (if PO wants modules on the shelf) —
   `GET /modules?page&limit&search`. Then NX modules registry.
5. **TZ-NX-CONSTRUCTOR-PRODUCT-BOM** — port tree+picker+qty+dims+purchased
   against real composition API + cycle 400. Conflict: `pages/constructor/**`,
   `libs/features` if tree is shared.
6. **TZ-NX-REGISTRIES-PRODUCTS-READ** — products list + «Открыть в конструкторе».
   Complexes: after `isComplex` list filter exists **or** badge-on-one-list
   (PO Yes/No: one «Изделия» vs two rows).

**Parallel with 2–3:** units/departments stay; no shell rail work.

**Do not** in any of these: new composition DTO fields; color override; catalog
versioning; DELETE as BOM remove; org query invention; `frontend/**` edits;
new PermissionKey.

**First vertical slice (recommended):** constructor shell + materials/details
read registries. De-risks IA and HTTP list before BOM.

---

## Changed files (this task)

```
new:
  tasks/TZ-NX-COMPOSITION-NX-AUDIT.md
  docs/agent-checklists/TZ-NX-COMPOSITION-NX-AUDIT.md
  tasks/_archive/2026-08/TZ-NX-COMPOSITION-NX-AUDIT.done.md
  tasks/_active/TZ-NX-COMPOSITION-NX-AUDIT.md  (removed at closeout)
```

`frontend/**`, `backend/**`, `frontend-nx/**` — untouched.

## Gates

N/A — analysis-only.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: cursor
verification:
  - NX inventory: DONE
  - legacy composition: DONE (real fields/endpoints/cycles/snapshot)
  - two-section IA: DONE
  - ordered TZ plan: DONE
  - product code changed: NONE
