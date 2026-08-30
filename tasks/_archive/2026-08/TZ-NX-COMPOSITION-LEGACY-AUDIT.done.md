# TZ-NX-COMPOSITION-LEGACY-AUDIT — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: claude

## Scope

Analysis-only audit of the legacy `backend/**` + `frontend/**` catalog domain — `materials`,
`product-modules`, `products`, `complexes/sets` and related tables — as input for a future
`frontend-nx` redesign. No product code changed; no files under `frontend/**`, `backend/**`,
`frontend-nx/**`, `package.json` were touched.

**Key structural finding up front:** there is no dedicated "Complex"/"Set" entity. A "комплекс"
is simply a `Product` whose `composition[]` contains at least one line with `lineType: 'product'`
(self-referencing product graph). See §3.

## 1. Real models, DTOs, endpoints, fields

### 1.1 Material — `materials` collection

- Schema: [material.schema.ts](../../../backend/src/modules/material/material.schema.ts) (109 lines)
- Controller: [material.controller.ts](../../../backend/src/modules/material/material.controller.ts)
- DTO: [create-material.dto.ts](../../../backend/src/modules/material/dto/create-material.dto.ts), `update-material.dto.ts` (PartialType)

Fields (schema lines 28–103): `name` (required, indexed), `article` (required, trimmed —
`material.schema.ts:34`), `materialKind?: 'raw'|'part'|'fastener'|'purchased'|'other'`
(`:38`, enum `MATERIAL_KINDS`), `assortment?`, `standardRef?`, `materialGrade?`, `weightKg?`,
`sku?` (unique+sparse), `unit!: string` (free text, **not** a ref — see §4), `categoryId?`
(ref `Category`), `description?`, `pricePerUnit?`, `stockQty?`, `dimensions: Dimension[]`
(embedded, `_id: false`, see §4), `colors?: string[]` (free list, see §5), `photoIds`/`mainPhotoId`
(ref `Photo`), `supplierId?` (ref `Organization`), `notes?`, `deletedAt?: Date|null` (soft delete,
`:96`), `organizationId?` (multi-tenant scope), `isSystem?`.

Indexes: `{organizationId,article}` unique+sparse (`:108`), `{deletedAt,organizationId}` (`:109`),
`optimisticLockPlugin` applied (`:106`) → manual `__v` optimistic lock is active for Material.

Endpoints (`material.controller.ts:11-63`), all under `/materials`, `@Roles` gated:
| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/materials` | admin,director,manager | filters: search, categoryId, materialKind |
| GET | `/materials/:id/where-used` | +user | catalog backlinks, paginated |
| GET | `/materials/:id` | +user | |
| POST | `/materials` | admin,manager | |
| PATCH | `/materials/:id` | admin,manager | |
| DELETE | `/materials/:id` | admin,manager | **soft delete**, 204 |
| POST | `/materials/:id/duplicate` | admin,manager | server-side clone |

### 1.2 ProductModule — `productmodules` collection

- Schema: [product-module.schema.ts](../../../backend/src/modules/product-module/product-module.schema.ts)
- Controller: [product-module.controller.ts](../../../backend/src/modules/product-module/product-module.controller.ts)
- Service: [product-module.service.ts](../../../backend/src/modules/product-module/product-module.service.ts)

Fields (`:49-67`): `name`, `article!` (required, trimmed, `:52`), `organizationId?`,
`dimensions?: {width,height,depth,unit}` (own module box, **no length** — inconsistent with
Product/Material which use length/width/height), `weight?`, `sortOrder!`, `deletedAt?`,
`photoIds`/`mainPhotoId` (canonical — comment `:59` says `ProductModulePhoto` collection is
legacy-only now), `workTypes: ModuleWorkTypeSchema[]` (ref `WorkType`, `estimatedHours`,
`sortOrder`), `materials: ModuleMaterialSchema[]` (**legacy embedded BOM**, `:64` — retained only
for TZ-CATALOG-302/304 dual-read, writes disabled, see §6), `composition: CompositionLine[]`
(**canonical**, `:66`).

`ModuleMaterialSchema` (`:35-42`, legacy, read-only): `materialId` (ref Material), `quantity`,
`unit` (default `'шт'`), `isPurchased` (default `true`), `overrideDimensions?
{length,width,height,unit}`, `sortOrder`.

**No `optimisticLockPlugin`** on `ProductModuleSchema` (contrast with Material/Product which both
have it, `material.schema.ts:106`, `product.schema.ts:64`) — see §7 finding #1.

Endpoints (`product-module.controller.ts:14-97`), under `/modules`:
| Method | Path | Notes |
|---|---|---|
| GET | `/modules?productId=` | list, optionally scoped to a product's composition |
| GET | `/modules/bulk?ids=` | |
| GET | `/modules/:id/where-used` | |
| GET/POST/PATCH/DELETE | `/modules/:id/composition[/:lineId]` | canonical composition CRUD |
| GET | `/modules/:id/tree` | recursive graph (catalog-graph) |
| GET | `/modules/:id/cost-preview` | TZ-COST-302, read-only rollup |
| GET/POST/PATCH | `/modules/:id` | |
| DELETE | `/modules/:id` | **archive** (soft, 204), 409 if referenced |

### 1.3 Product — `products` collection

- Schema: [product.schema.ts](../../../backend/src/modules/product/product.schema.ts)
- Controller: [product.controller.ts](../../../backend/src/modules/product/product.controller.ts),
  [product-subroutes.controller.ts](../../../backend/src/modules/product/product-subroutes.controller.ts)
- Service: [product.service.ts](../../../backend/src/modules/product/product.service.ts)
- DTO: [create-product.dto.ts](../../../backend/src/modules/product/dto/create-product.dto.ts),
  `update-product.dto.ts`, `duplicate-product.dto.ts`, `query-product.dto.ts`

Fields (`:21-60`): `name?` (falls back to `sku` everywhere — `product.service.ts:67,92,106`),
`sku!` (required, trimmed), `kind!: 'good'|'service'|'work'`, `unit!` (default `'шт'`),
`categoryId?`, `subcategory?`, `status?: 'new'|'active'|'archived'|'draft'`, `listPrice`,
`basePrice`, `costPrice`, `defaultMarkupPercent` (default 30), `stockQty`, `description`, `notes`,
`photoIds`, `dimensions?: {length,width,height,unit}`, `weightKg`, `ralCode?` (see §5 — **misnamed**,
holds a `ColorReference.slug`, not an actual RAL code), `hasPassport?`, `hasDrawing?`,
`copiedFromProductId?` (ref Product, set by `duplicate()`), `productModuleIds` (**legacy M:N**,
`:47`, write path disabled — see §6), `composition: CompositionLine[]` (**canonical**, `:52`),
`isActive!`, `deletedAt?`, `purpose?`, `installation?`, `organizationId?`, `isSystem?`.

`attributes` (EAV, see §1.4) is accepted by `CreateProductDto`/`UpdateProductDto`
(`create-product.dto.ts:190-193`) but is **not a schema field** — it's stripped in the service
(`product.service.ts:35,113`) and persisted via `EavService` into a separate collection.
`isComplex` is a **computed, non-persisted** field added only on `findById`/`findByIds`
(`product.service.ts:94,107`): `composition.some(line => line.lineType === 'product')`.

`optimisticLockPlugin` applied (`:64`); composition writes additionally guard with an explicit
`__v` filter (`versionedCompositionFilter`, `product.service.ts:287`) — stronger than the plain
`$set` used for scalar fields in `update()` (`:119-125`, deliberately last-write-wins per the
in-code comment `:116-118`).

Endpoints (`product.controller.ts:17-43` + subroutes), under `/products`:
| Method | Path | Notes |
|---|---|---|
| GET | `/products` | filters: search, categoryId, status, isActive, sort |
| GET | `/products/bulk?ids=` | |
| GET | `/products/:id/where-used` | |
| POST | `/products/:id/duplicate` | safe copy, new sku/name, `status:'draft'` |
| GET/POST/PATCH/DELETE | `/products/:id/composition[/:lineId]` | canonical composition CRUD |
| GET | `/products/:id/tree` | recursive graph |
| GET/POST/PATCH/DELETE | `/products/:id` | |
| POST/DELETE | `/products/:productId/modules[/:moduleId]` | **`GoneException` — dead, TZ-CATALOG-317** (`:263-264`) |
| POST | `/products/:id/photos` | subroutes controller, legacy attach-by-id |

### 1.4 Supporting dictionaries

| Entity | Collection | Schema | Purpose |
|---|---|---|---|
| `Category` | `categories` | [category.schema.ts](../../../backend/src/modules/category/category.schema.ts) | shared tree for both `type:'material'` and `type:'product'`; `skuPrefix` drives auto-SKU (`material.service.ts:28`, `counter.service`) |
| `ColorReference` | `color_references` | [color-reference.schema.ts](../../../backend/src/modules/color-reference/color-reference.schema.ts) | RAL dictionary, see §5 |
| `Unit` | `units` | [unit.schema.ts](../../../backend/src/modules/unit/unit.schema.ts) | measurement-unit dictionary, see §4 |
| `AttributeDefinition` + `EntityAttributeValue` | `attributedefinitions` + EAV collection | [attribute-definition.schema.ts](../../../backend/src/modules/attribute-definition/attribute-definition.schema.ts), [eav.service.ts](../../../backend/src/common/eav/eav.service.ts) | generic EAV for `Product.attributes` (and any `entityType`), properly normalized, transactional `bulkWrite` (`eav.service.ts:68-83`) |
| `ProductPassport` | `productpassports` | [product-passport.schema.ts](../../../backend/src/modules/product-passport/product-passport.schema.ts) | flat, **denormalized** print/certificate snapshot (own `name`, `category: string`, `article`, `height/length/width/weight`, `supplier: string`, `photo: string`) — not linked back to live Product fields after creation |
| `ProductPhoto` / `ProductModulePhoto` | `productphotos` / `productmodulephotos` | [product-photo.schema.ts](../../../backend/src/modules/product-photo/product-photo.schema.ts), [product-module-photo.schema.ts](../../../backend/src/modules/product-module-photo/product-module-photo.schema.ts) | **legacy per-entity photo galleries**, still actively used by frontend (`product-detail.page.ts`, `products.page.ts`) in parallel with the canonical `photoIds[]`/`mainPhotoId` on Product/ProductModule themselves — two live photo mechanisms, see §7 |
| `Bom` | `boms` | [bom.schema.ts](../../../backend/src/modules/bom/bom.schema.ts) | **separate legacy versioned BOM**, dead — see §3/§7 |

## 2. Existing relations

```
Category (type:material|product|general, self-parent tree)
  ▲ categoryId            ▲ categoryId
  │                       │
Material ◄──┐         Product ─┐
  ▲         │ composition      │ composition (self-ref, lineType:'product')
  │ composition             lineType:'module'|'material'|'product'
  │ lineType:'material'         │
  └──────────────ProductModule ◄┘
                    │ composition (lineType:'module'|'material', self-nesting allowed)
                    ▲
              (module can contain another module or a material)

Material ── colors[] (free strings) ──► chosen 1:1 on SupplyRequest.color
Product  ── ralCode (string = ColorReference.slug) ──► ColorReference
Product  ── attributes ──► EntityAttributeValue ──► AttributeDefinition
Order.items[].productId ──► Product (live ref; composition NOT frozen, see §6)
```

Everything nests through **one generic embedded schema**,
[CompositionLine](../../../backend/src/modules/catalog/composition-line.schema.ts) (`_id:true`,
line 24-62): `lineType: 'module'|'material'|'product'`, `refId`, `quantity` (min `0.000001`),
`sortOrder`, `unit?`, `overrideDimensions?`, `isPurchased?`, `sourcePosition?`, `sourceCode?`,
`unitPriceOverride?` (product-lines only), `notes?`. It is embedded verbatim on both `Product`
and `ProductModule`. Allowed edges, enforced in
[composition-line.service.ts:46-77](../../../backend/src/modules/catalog/composition-line.service.ts#L46-L77):

| Parent | Allowed `lineType` | Guard |
|---|---|---|
| Product | `module`, `material`, `product` | `material.materialKind==='raw'` rejected directly on a product (`:64-68`) — raw stock may only live inside a module |
| Module | `module`, `material` | `product` rejected (`product-module.service.ts:115`) |

Cross-references (`getWhereUsed`, `getTree`) live in
[catalog-graph.service.ts](../../../backend/src/modules/catalog-graph/catalog-graph.service.ts) —
one generic BFS/DFS engine (`MAX_DEPTH = 8`, `:9`) that walks `composition[]` first and falls back
to the legacy `productModuleIds` / `materials[]` arrays when `composition` is empty
(`getChildren`, `:262-274`) — i.e. **dual-read is implemented graph-wide**, not just per-entity.

## 3. Composition and quantity ("complexes/sets")

There is **no separate Complex/Set/Kit entity or collection**. A product is a "комплекс" purely
by convention: `Product.composition` contains ≥1 line with `lineType:'product'`. This is computed
on the fly, never stored:

- Backend: `product.service.ts:94` and `:107` — `composition.some((line) => line.lineType === 'product')`
- Frontend (independently re-derived, not trusted from API): `product-detail.page.ts:628-630`,
  `product-bom-panel.component.ts:346` (`composition-complex-badge` UI, `:79`)

`quantity` is a plain number per line (min `0.000001`, `composition-line.schema.ts:31`) with an
optional `unit` override string per line. Cycles and depth are actively guarded server-side:
`assertNoCycleAndDepth` (`catalog-graph.service.ts:47-80`) blocks self-reference, produces a
human-readable Russian cycle error naming both entities (`:66-73`), and caps total depth at 8
(`MAX_DEPTH`). `MAX_COMPOSITION_LINES = 1000` per parent (`composition-line.service.ts:9`).
Duplicate `(lineType, refId)` pairs are rejected on write (`ensureNoDuplicateKeys`) but merged by
quantity on `upsertDeduplicated` when adding (`:92-112`) — two different behaviors depending on
which endpoint is called (POST add vs PATCH update), worth resolving in any redesign.

## 4. Sizes and units of measurement

- **Material** dimensions are a typed array, not fixed fields:
  `Dimension { type: 'length'|'width'|'height'|'thickness'|'diameter'|'depth', value, isImmutable }`
  (`material.schema.ts:12-24`). `isImmutable` is the load-bearing flag: it blocks any
  `overrideDimensions` at the composition-line level for that dimension type
  (`assertMaterialsAndOverridesAllowed`, `product-module.service.ts:177-195`, TZ-MATERIALS-309).
  One type per material is enforced (`assertUniqueDimensionTypes`, `material.service.ts:126-129`).
- **Product** and **ProductModule** each have their own fixed, differently-shaped dimension
  sub-schema: Product = `{length,width,height,unit}` (`product.schema.ts:7-12`); ProductModule =
  `{width,height,depth,unit}` (`product-module.schema.ts:6-11`, **no length**). A per-line
  `overrideDimensions: {length,width,height,unit}` also exists on `CompositionLine`
  (`composition-line.schema.ts:5-17`) for overriding a referenced Material's box inside one
  specific composition line.
- **Units are free text everywhere they're consumed.** `Material.unit`, `Product.unit`,
  `ProductModule.materials[].unit`, `CompositionLine.unit` are all plain `string` props with only
  length validation in DTOs (e.g. `create-material.dto.ts:95-98`, `@Length(1,32)` — no `@IsIn`).
  The `Unit` dictionary (`unit.schema.ts`) exists purely as a dropdown source
  (`GET /units/active`, `unit.controller.ts:40-44`) — there is **no FK, no enum, no runtime
  validation** tying stored `unit` strings to `Unit.key`. Confirmed mismatch: the seed
  (`backend/src/common/seed/units.seed.ts:16-23`) defines `key` slugs `pcs`, `kg`, `m`, `m2`,
  `m3`, `sheet`, while every other schema/DTO in the codebase defaults/exemplifies `unit` as the
  **Russian symbol** (`'шт'` — `product.schema.ts:27`, `product-module.schema.ts` `ModuleMaterialSchema:38`;
  `'м2'` — `create-material.dto.ts:95` example). The dictionary and the actual data speak two
  different vocabularies; nothing enforces convergence.

## 5. Color and its overrides

- **Product** carries a single `ralCode?: string` (`product.schema.ts:41`) that — despite the
  name — stores a `ColorReference.slug`, not a RAL numeric code
  (comment, `color-reference.schema.ts:14`: *"the value stored in `Product.ralCode` by the
  product form dialog"*). `ColorReference` (`color_references` collection) is a proper
  ownership-scoped dictionary: `name`, `slug` (stable key), `hex?` (`#RRGGBB`, validated,
  `color-reference.service.ts:28,325-330`), `isSystem`, `isDefault`, `deletedAt` (soft delete).
  Server-side default resolution (`resolveDefault`, `:221-243`) falls back to a seeded system
  color `«Не выбран»` (`slug: 'ne_vybran'`, `color-reference.schema.ts:7`) so every product always
  resolves to *some* color state.
- **Material** carries `colors?: string[]` (`material.schema.ts:79-80`) — a free, deduplicated
  (case-insensitively, `material.service.ts:138-150`) list of colors the material *can be ordered
  in*, with no link to `ColorReference`. The actual per-order color choice happens one level away,
  on `SupplyRequest.color` (`supply-request.schema.ts:42-44`: *"Выбранный цвет строки — одно из
  значений Material.colors"*), which is **not validated server-side against that list** (free
  `trim()`-only string, `:43-44`).
- **No color override exists at `ProductModule` or `CompositionLine` level.** If a Product is
  assembled from several modules that should each carry a different color, the data model has no
  place to record that — color is a single, product-wide attribute only. This is a real gap for
  any workflow where a "комплекс" mixes colors across its component products/modules.
- `Order`/`OrderItem` (`order.schema.ts`) has **no color field at all** — color is not snapshotted
  onto an order line.

## 6. Purchased vs manufactured entities

Two independent, non-synchronized signals exist:

1. **`Material.materialKind`** (`material.schema.ts:7-8,38-39`): `'raw'|'part'|'fastener'|
   'purchased'|'other'` — classifies the *catalog leaf itself*. Enforced by
   `composition-line.service.ts:64-68`: a `'raw'` material may only be added inside a module, never
   directly on a product.
2. **`CompositionLine.isPurchased?: boolean`** / legacy `ModuleMaterialSchema.isPurchased`
   (default `true`, `product-module.schema.ts:39`) — a per-composition-line flag, independent of
   `materialKind`, so a `'raw'` material could in principle be flagged `isPurchased:false` on one
   line and `true` on another.

**`isPurchased` is effectively dead weight in the UI**: it is defined in the frontend types
(`pi-product-modules.service.ts`, `shared/models/modules.ts`) and referenced only in specs
(`modules.page.spec.ts`) — no production component reads or writes it
(`grep isPurchased frontend/src/app/**` → 3 files, all types/specs, zero components). The only
purchased/manufactured signal actually surfaced to users is the `materialKind` badge/filter text
"Деталь, метиз, покупное — без сырья" (`product-composition-picker-dialog.component.ts:360`).
There is no purchased/manufactured concept at the Product or ProductModule level at all — only at
the Material classification level.

## 7. Versions, archiving, deletion

| Entity | Soft delete | Optimistic lock | Hard-delete guard |
|---|---|---|---|
| Material | `deletedAt` (`material.schema.ts:96`) | `optimisticLockPlugin` (`:106`) | `remove()` checks `productmodules`, `costcalculations`, `purchaseorders` (`material.service.ts:167-169`) — **misses direct `products.composition` material lines**, see finding #2 below |
| ProductModule | `deletedAt` (`product-module.schema.ts:58`) | **none** — see finding #1 | `remove()` checks `boms`, `products` (`product-module.service.ts:158-159`) — **misses other `productmodules` that nest this module (module-in-module)**, see finding #1b |
| Product | `deletedAt` + `isActive:false` + `status:'archived'` on remove (`product.service.ts:260`) | `optimisticLockPlugin` + explicit `__v` filter on composition writes (`versionedCompositionFilter`) | `remove()` checks `orders`, `quotations`, `costcalculations`, `boms` (`:258`) via **raw `this.model.db.collection(...)` calls**, bypassing injected models — works but is untyped and easy to silently break |
| Category / ColorReference / AttributeDefinition / ProductPassport / ProductPhoto / ProductModulePhoto | `deletedAt` | Category has `optimisticLockPlugin`; others don't | none beyond soft-delete |
| Bom | `deletedAt` (`bom.schema.ts:57`) + own `isActive`/`version`/`effectiveFrom`/`effectiveTo` | none | none |

**Order-time versioning is NOT a snapshot of composition.** `OrderItem` freezes only
`productName`, `productSku`, `unitPrice`, `total`, `quantity` (`order.schema.ts:26-45`); the
composition tree shown against an order line is fetched **live** from
`GET /products/:id/tree` (`order-composition-forest.ts:13-16,48`: *"Live catalog BOM roots for
order lines... not an order copy"*). If a product's composition changes after the order was
placed, the order view will show the **current** composition, not what was actually ordered. This
is a deliberate, documented choice in the current code, but it is a real product-versioning gap
worth a conscious decision (snapshot vs live) before/while redesigning in `frontend-nx`.

## 8. Current bugs and ambiguities (verified in code, not speculative)

1. **`ProductModuleSchema` has no `optimisticLockPlugin`**, unlike `Material`/`Product`/`Category`
   (compare `product-module.schema.ts:69-73` vs `material.schema.ts:106`,
   `product.schema.ts:64`). `ProductModuleService.update()`/composition writes use plain
   `doc.save()` (`product-module.service.ts:102,124,142,153`) with no version check — two
   concurrent module edits can silently lose one writer's change. Product's own composition
   writes explicitly guard against exactly this (`versionedCompositionFilter`).
   1b. `ProductModuleService.remove()` (`:156-162`) only checks the `boms` and `products`
   collections for references — it does **not** check other `ProductModule` documents whose own
   `composition[]` nests this module (`lineType:'module'` is a valid child of a module, confirmed
   in `composition-line.service.ts:75-76`). A module nested only inside another module can be
   archived while still referenced, producing a dangling `refId`.
2. **`MaterialService.remove()` (`material.service.ts:161-171`) misses direct product references.**
   `composition-line.service.ts:64-69` explicitly allows a non-`raw` material as a direct
   `lineType:'material'` line on a **Product** (not just inside a Module), but `remove()` only
   queries the `productmodules` collection for `composition.refId`/`materials.materialId` — it
   never queries `products.composition`. A material referenced only by a product's own
   composition can be soft-deleted while still in use.
3. **`Bom` module (`backend/src/modules/bom/**`) is dead and partly broken.** Registered in
   `app.module.ts` and reachable at `/boms/*`, but no frontend code calls it (confirmed: no
   `/boms` fetch anywhere under `frontend/src/app`; `product-bom-panel.component.ts` — despite the
   name — exclusively uses the `/products/:id/composition` and `/tree` endpoints). Its
   `getExpanded()` (`bom.service.ts:68-95`) populates `material` and `workTypeId` sub-paths on
   `productComponentId` (a `ProductModule` ref) that **do not exist on `ProductModuleSchema`**
   (the real fields are `materials[]` / `workTypes[]`, plural, nested) — the populate is a no-op
   and `estimatedTotalCost` always computes to `0`. This is legacy TZ-83-era code that predates
   the current `composition[]` model and was never fully migrated or removed.
4. **Two competing "purchased" signals** that can disagree (§6) — `Material.materialKind` vs
   `CompositionLine.isPurchased`/`ModuleMaterialSchema.isPurchased` — with the latter unused by
   any UI.
5. **Unit strings are unvalidated free text** with a dictionary (`Unit`) whose seeded `key`
   vocabulary doesn't match the actual stored values (§4) — the dictionary cannot currently be
   trusted as a source of truth.
6. **`Product.ralCode` field name is misleading** — it stores a `ColorReference.slug`, never an
   actual RAL code (§5). Anyone reading the schema cold will assume otherwise.
7. **Dead duplicate frontend type layer.** The entire directory
   `frontend/src/app/shared/models/` (`index.ts`, `materials.ts`, `modules.ts`, `organizations.ts`,
   `products.ts`, `users.ts`, `work-types.ts`) is unreferenced from anywhere in
   `frontend/src/app` (`grep -r "shared/models/" frontend/src` → 0 hits). Its `Material`/
   `ProductModule` interfaces are stale duplicates of the live ones co-located in
   `frontend/src/app/shared/services/materials.service.ts` and `pi-product-modules.service.ts`
   (missing `materialKind`, `assortment`, `standardRef`, `materialGrade`, `weightKg`, `composition`,
   etc.) — safe to delete outright in a future cleanup TZ, but out of scope here (analysis-only).
8. **Two live, parallel photo mechanisms** per Product/ProductModule: the canonical `photoIds[]`/
   `mainPhotoId` array directly on the entity, and the legacy `ProductPhoto`/`ProductModulePhoto`
   collections — both are actively read/written by current frontend pages
   (`product-detail.page.ts`, `products.page.ts`, `pi-product-module-photos.service.ts`). No
   dual-read/cutover comment marks one as canonical the way `composition` vs `productModuleIds`/
   `materials[]` is explicitly marked (`product.schema.ts:46`, `product-module.schema.ts:59,63`).
9. **Inconsistent duplicate-line merge semantics**: adding a duplicate `(lineType, refId)`
   composition line merges quantities (`upsertDeduplicated`), while updating a line to collide
   with an existing one is rejected outright (`ensureNoDuplicateKeys`) — same underlying
   invariant, two different user-facing behaviors depending on which HTTP verb is used.
10. **`ProductDimensions` (length/width/height) vs `ModuleDimensions` (width/height/depth)** use
    different axis sets for conceptually the same "box" — a redesign should pick one shape.

## 9. What to carry forward vs leave behind

**Carry forward (proven, single source of truth):**
- The generic `CompositionLine` graph model (`lineType: module|material|product`, `refId`,
  `quantity`, `sortOrder`, `overrideDimensions`, `unitPriceOverride` restricted to product-lines) —
  this is the one mechanism that correctly represents materials-in-modules, modules-in-products,
  modules-in-modules, and products-in-products ("complexes") with a single schema, single
  validation service (`CompositionLineService`), and single graph engine (`CatalogGraphService`,
  cycle/depth guards, where-used, tree).
- `Material.dimensions[]` typed-array model with per-dimension `isImmutable`, and the
  override-permission rule it drives on composition lines (TZ-MATERIALS-309).
- `ColorReference` dictionary with scoped ownership + system default resolution.
- The `EntityAttributeValue`/`AttributeDefinition` EAV pair — normalized, transactional, generic.
- Soft-delete + reference-guarded archive pattern for Product/Material (once the gaps in §8.1–2
  are closed).

**Leave behind / do not port as-is:**
- `Bom` module (schema/service/controller) — dead, partly broken, fully superseded by `composition`.
- Legacy `productModuleIds` (Product M:N) and `materials[]` (ProductModule embedded) write paths —
  already `GoneException`-blocked server-side; only needed for reading pre-migration rows.
- `ModuleMaterialSchema.isPurchased` / `CompositionLine.isPurchased` — unused by any UI; either
  wire it up for real or drop it rather than carry a silently-ignored field forward.
- `frontend/src/app/shared/models/*` — orphaned duplicate types (§8.7).
- The free-text `unit` convention as-is — needs either enforcement against `Unit.key` or an
  explicit decision to keep it free text (and then the `Unit` dictionary should stop implying
  otherwise).
- `Product.ralCode` naming — rename or re-document before it's carried into a new schema; the
  current name actively misleads.

**Needs a product decision before porting, not purely technical:**
- Whether order composition should snapshot at order time or stay live (§6/§7) — current behavior
  is live-only and undocumented as a limitation anywhere user-facing.
- Whether color should become overridable per module/composition-line for multi-color complexes
  (§5), since the current model cannot express that at all.

## Blockers

None for the audit itself. The findings in §8 (items 1, 1b, 2 especially — orphan-reference gaps
on delete) are **data-integrity risks in the current legacy system**, independent of any
`frontend-nx` work; flagging them here for PO awareness, not fixing them (out of scope,
analysis-only).

## Checklist

See `docs/agent-checklists/TZ-NX-COMPOSITION-LEGACY-AUDIT.md` — Integrity slot filled, status DONE.
