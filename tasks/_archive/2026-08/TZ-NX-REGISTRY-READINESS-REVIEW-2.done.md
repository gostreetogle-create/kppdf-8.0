# TZ-NX-REGISTRY-READINESS-REVIEW-2 — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29T20:52:00Z
closed_by: cursor
mode: analysis-only — no code, schema, API, XLSX content, or config changed

## Verdict

Marathon + matrix + supply-passport review are **largely accurate** for the six live catalog
registries. Three **material discrepancies** found between archives and repo truth (Units DELETE
merge state, FULL-CLOSEOUT departments narrative, marathon “backend ready” wording). Future READ
TZs are directionally correct but need **explicit pagination-mode constraints** for SupplyRequest
and ProductPassport to avoid fake server paging.

---

## 1. Registry status (verified against live code)

| Area | Status | Route / key | NX data-access | Honest pagination | Notes |
|------|--------|-------------|----------------|-------------------|-------|
| Units | **PRESENT** | `/registries/units` | `PiUnitsService` | `server` ✓ | No DELETE in FE; `PiUnitsService` has no `delete()` |
| Materials | **PRESENT** | `/registries/materials` | `PiMaterialsService` | `server` ✓ | |
| Details | **PRESENT** | `/registries/details` | same | `server` ✓ | Default `materialKind=part`; not “all kinds” |
| Modules | **PRESENT** | `/registries/modules` | `PiModulesService` | **`client` ✓** | `list()` no page/limit; spec enforces |
| Products | **PRESENT** | `/registries/products` | `PiProductsService` | `server` ✓ | No `isComplex` in list params |
| Complex (derived) | **PARTIAL** | column in products | n/a | n/a | `isComplex` only on `findById` / bulk-by-id, not `findAll` |
| Departments | **PRESENT (demo)** | `/registries/departments` | fixture | `fixture` ✓ | Has row actions (see §6) |
| SupplyRequest | **MISSING** | — | none | API: **list-all, cap 500** | `findAll` returns `[]`, no page/limit query |
| Organization/Supplier | **MISSING** | — | none | API: **server** ✓ | `type` filter on `type: string[]` |
| StorageItem | **MISSING** | — | none | API: **pseudo-total** | `{items,total}` but no skip/limit |
| ProductPassport | **PARTIAL** | preview only | none | API: **list-all** | `GET /passports` no pagination |
| SupplyTask | **BLOCKED (NX)** | — | none | — | Needs Order NX first (unchanged from review-1) |

**XLSX:** `data/Снабжение.xlsx` (317746 B) and `data/Pasports.xlsx` (30511047 B) present; not
opened this session. Mapping facts taken from `TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md` + decision
sheet — still valid.

---

## 2. Row actions → real endpoints (live registries)

| Registry | Action | Endpoint / behavior | Verified |
|----------|--------|---------------------|----------|
| units | copy-key | clipboard only | ✓ |
| units | activate / deactivate | `PATCH /units/:key` `{ isActive }` | ✓ |
| units | delete | **absent** (intentional) | ✓ |
| materials/details | create | `POST /materials` via dialog | ✓ |
| materials/details | edit | `PATCH /materials/:id` via dialog | ✓ |
| materials/details | copy | `POST /materials/:id/duplicate` | ✓ |
| materials/details | archive | `DELETE /materials/:id` + confirm | ✓ |
| materials/details | constructor | router → `/constructor` | ✓ |
| modules | create/edit/composition | `POST/PATCH /modules`, composition subroutes | ✓ |
| modules | archive | `DELETE /modules/:id` (soft) | ✓ |
| products | create/edit/copy/archive/composition/constructor | `/products` CRUD + duplicate + composition | ✓ |
| departments | copy-code | clipboard (fixture) | ✓ |
| departments | archive | in-memory fixture + confirm | ✓ |

No dead row-action IDs found in registry action builders.

---

## 3. Fake filters / pagination — current + future risk

### Current (PASS)

- **Modules:** `paginationMode: 'client'`; no filter keys; `modules-http-data-source` calls
  `list()` without page/limit — enforced by `registry-filters-pagination.spec.ts`.
- **Products:** `products-http-data-source` sends only page/limit/search/status/sort — no
  `isComplex` (`pi-products.service.spec.ts` asserts).
- **Units/Materials/Details:** server params match backend query contracts.

### Future TZ traps (must fix in next Cursor prompts)

| Future registry | API truth | **Required** `paginationMode` | Forbidden |
|-----------------|-----------|----------------------------------|-----------|
| SupplyRequest (`TZ-NX-SUPPLY-REQUEST-REGISTRY-READ`) | `GET /supply-requests` → array, `.limit(500)` in service, filters: status/priority/search/orderId | **`client`** (or `fixture` if empty) | `server` + fake page/limit query params |
| ProductPassport (`TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ`) | `GET /passports` → full array; optional `productId` filter | **`client`** | `server` |
| Organization (`TZ-NX-ORGANIZATION-REGISTRY-READ`) | `GET /organizations` → `{ items, total, page, limit }` | **`server`** ✓ | — |
| StorageItem (no TZ file yet) | `GET /storage-items` → `{ items, total: items.length }` | **`client`** if ever built | `server` |

**SupplyRequest filters (honest mapping):** status, priority, search, orderId — map 1:1 to API;
do **not** add category/supplier/invoice filters until backend supports them.

---

## 4. No duplicate Supplier / Part / Complex entities (PASS)

- **Supplier:** only `Organization` with `type: string[]` (`organization.schema.ts`); no
  `supplier*.schema.ts`.
- **Part:** only `Material` with `materialKind` (`part`, etc.); Details registry, not a collection.
- **Complex:** derived `Product` (`composition.lineType === 'product'`); `formatComplexBadge` shows
  badge only when `row.isComplex === true`; list API does not populate it (`product.service.ts`
  `findAll` vs `findById`).

---

## 5. ProductPassport `productId` blocker (unchanged BLOCKER)

- Schema: `productId` **required + unique** (`product-passport.schema.ts:8-9`).
- Spreadsheet: zero product references (audit FACT).
- NX today: `ProductPassportPreviewComponent` builds **computed preview** from live `Product` +
  composition — does **not** call `GET /passports` or `GET /products/:id/passport`.
- `TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ` correctly scopes read-only registry for the **collection**,
  distinct from preview — but must not imply import readiness or Product matching.

---

## 6. SupplyRequest gaps (schema + spreadsheet + TZ)

| Gap | Backend today | Spreadsheet | Import / registry impact |
|-----|---------------|-------------|--------------------------|
| `invoiceNumber` | **MISSING** | combined in `№ счета` cell | Decision sheet item 7; needs small backend TZ before structured import |
| Status mapping | 5 enum values | 5 emoji values incl. «Оплачено» | Recorded in `TZ-NX-PASSPORT-SUPPLY-DECISIONS.done.md` item 5 — **not for READ registry** |
| Category buckets | `categoryId` ref `Category` | 6 ad-hoc buckets | Decision item 6 — leave empty in MVP import |
| Requester fields | `requestedBy`, `responsible` (ambiguous) | `Заказчик` / `Подал заявку` | Decision items 1–4 — recommendations only, PO sign-off pending |
| Delivery notes | **MISSING** | `Доставка` column | Fold to `notes` or new field — not in READ TZ |
| List pagination | hard cap 500, no page API | n/a | READ registry must surface cap honestly |

`TZ-NX-SUPPLY-REQUEST-REGISTRY-READ` correctly forbids import, write, invoice field invention —
**add explicit client pagination + 500-cap note** in executor prompt.

---

## 7. Archive discrepancies (independent findings)

### D1 — Units DELETE backend “ready” vs git (material)

| Source | Claim |
|--------|-------|
| `TZ-NX-REGISTRY-READINESS-MARATHON.done.md` | “backend hard-delete fixed” |
| `TZ-NX-REGISTRY-UNITS-DELETE-FIX.done.md` | fix documented |
| **Live git (this review)** | `backend/src/modules/unit/unit.service.ts` **modified**, `unit.service.spec.ts` **untracked** |

Code in working tree **does** hard-delete (`deleteOne`), and `pnpm test -- unit` passes when run in
marathon — but **not merged/clean on branch**. `TZ-NX-REGISTRY-UNITS-DELETE-FE` backlog dependency
remains valid: land backend WIP before FE delete action.

### D2 — FULL-CLOSEOUT departments narrative (doc error)

`TZ-NX-REGISTRIES-FULL-CLOSEOUT.done.md` smoke table says departments is *“expand-only (no create/row
actions)”*. **False:** `departments.registry.ts` defines `copy-code` and `archive` row actions;
marathon smoke captured them. Create is absent (correct). **Fix:** doc-only correction in a future
docs pass — not a product defect.

### D3 — TZ naming drift

| `TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.done.md` recommends | On disk today |
|-------------------------------------------------------------|---------------|
| `TZ-NX-SUPPLY-REQUEST-DATA-ACCESS-READ` | `tasks/TZ-NX-SUPPLY-REQUEST-REGISTRY-READ.md` |
| `TZ-NX-ORGANIZATION-DATA-ACCESS-READ` | `tasks/TZ-NX-ORGANIZATION-REGISTRY-READ.md` |
| `TZ-NX-PRODUCT-PASSPORT-DATA-ACCESS-READ` | `tasks/TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ.md` |

Scope equivalent (data-access + registry row). **No blocker** — next prompt should reference
**on-disk filenames**, not review-1 aliases.

### D4 — Marathon input path typo (already noted in review-1)

Marathon TZ referenced non-existent `TZ-NX-REGISTRIES-SUPPLY-PASSPORT-AUDIT.done.md`; real file is
`TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md`.

---

## 8. Composition parity (confirmed)

`TZ-NX-REGISTRIES-COMPOSITION-PARITY-WAVE-1.done.md` claims (nested add target, focusComposition,
page-scoped dialogs, getById-before-edit) match current `registries.page.md` and code paths in
`composition-panel.component.ts`, `catalog-registry-dialog-host.ts`. **PRESENT** for catalog
readiness; P2 polish (photos in tree, cycle tests) remains out of scope.

---

## 9. Documentation cross-check

| Doc | Accurate? | Gap |
|-----|-----------|-----|
| `docs/pages/registries.page.md` (post-marathon) | **Yes** for catalog + supply/passport MISSING/PARTIAL | — |
| `TZ-NX-REGISTRIES-SUPPLY-PASSPORT-MATRIX.done.md` | **Yes** | SupplyRequest pagination described as “list-all” — executor should add “cap 500” |
| `TZ-NX-REGISTRY-READINESS-MARATHON.done.md` | **Mostly** | Overstates Units DELETE backend merge (D1) |
| `TZ-NX-REGISTRIES-FULL-CLOSEOUT.done.md` | **Mostly** | Departments row actions wrong (D2); G4 “backend not confirmed” was true at closeout — still true in git until merge |

---

## 10. Unclosed backend blockers (for Cursor, not this review)

| Blocker | Status | Owner |
|---------|--------|-------|
| Units DELETE merge | WIP in tree | land `unit.service.ts` + spec, then `TZ-NX-REGISTRY-UNITS-DELETE-FE` |
| `SupplyRequest.invoiceNumber` | schema gap | small backend TZ (decision recorded) |
| Passport↔Product matching (792 rows) | human gate | not automatable |
| Passport photo extraction | separate migration | parallel, not blocking READ registry |
| SupplyTask NX | blocked on Order NX | out of current READ wave |
| StorageItem NX | blocked on Warehouse NX | no TZ file in queue |

---

## 11. What the next Cursor prompt must fix / specify

1. **Executor wave order (parallel where noted):**
   - `TZ-NX-SUPPLY-REQUEST-REGISTRY-READ` — **client pagination**, 500-cap banner, filters =
     status/priority/search only; read-only; no status/category mapping implementation.
   - `TZ-NX-ORGANIZATION-REGISTRY-READ` — **server pagination**; `type=supplier` filter for supplier
     lens; no Supplier entity.
   - `TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ` — **client pagination**; read `GET /passports`; clearly
     separate from `ProductPassportPreviewComponent`; no import/matching/photos.
   - **Before or in parallel:** commit/merge Units DELETE backend WIP → then
     `TZ-NX-REGISTRY-UNITS-DELETE-FE`.

2. **Explicit forbids in each executor TZ (if not already):**
   - No `paginationMode: 'server'` for SupplyRequest or ProductPassport.
   - No `isComplex` query on products (already shipped — do not regress).
   - No fake Modules server pagination (already shipped — do not regress).
   - No Part/Complex/Supplier collections.

3. **Docs hygiene (low priority):**
   - Correct FULL-CLOSEOUT departments smoke line.
   - Amend marathon matrix row for Units DELETE: “fix in tree, merge pending” not “merged”.

4. **Do not start in READ wave:**
   - XLSX import, status emoji mapping, supplier dedup writes, passport bulk import, invoice schema
     (unless separate backend TZ claimed).

---

## Sources (this review)

**Archives:** marathon, supply-passport-readiness-review, full-closeout, composition-parity-wave-1,
supply-passport-matrix, supply-passport-audit, passport-supply-decisions.

**Future TZ:** `tasks/TZ-NX-SUPPLY-REQUEST-REGISTRY-READ.md`,
`tasks/TZ-NX-ORGANIZATION-REGISTRY-READ.md`, `tasks/TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ.md`.

**Frontend-nx:** `registries/data/*.registry.ts`, `*-http-data-source.ts`, `*-registry-actions.ts`,
`registry-filters-pagination.spec.ts`, `libs/data-access/src/lib/**` (glob — no supply/org/passport
modules), `pages/passport/product-passport-preview.component.ts`.

**Backend:** `supply-request.schema.ts`, `supply-request.service.ts`, `supply-request.controller.ts`,
`organization.schema.ts`, `organization.service.ts`, `product-passport.schema.ts`,
`product-passport.service.ts`, `product.service.ts` (`findAll` vs `findById` isComplex),
`unit.service.ts`, `storage-item.controller.ts`.

**Git:** `git status --short backend/src/modules/unit/` (uncommitted DELETE fix).

**XLSX:** `Test-Path` + file size only.

## Checklist

See `docs/agent-checklists/TZ-NX-REGISTRY-READINESS-REVIEW-2.md`.
