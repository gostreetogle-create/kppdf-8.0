# TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29T20:32:54Z
closed_by: claude
mode: analysis-only — no code, schema, API, `frontend/**`/`backend/**`/`frontend-nx/**`/
`package.json` changed; no DB writes; `data/*.xlsx` not opened this session (presence/size
verified only — unchanged since the prior read-only audit); one existing regression spec
(`unit.service.spec.ts`) run read-only (in-memory mock, no DB) as evidence for item 9/Units DELETE.

## Correction to Marathon inputs

`tasks/TZ-NX-REGISTRY-READINESS-MARATHON.md` lists
`tasks/_archive/2026-08/TZ-NX-REGISTRIES-SUPPLY-PASSPORT-AUDIT.done.md` as an input. The file that
actually exists on disk is `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md` (no
"REGISTRIES-" segment). This review used the real file and did not invent a second one.

## Purpose

Exact PRESENT/PARTIAL/BLOCKED/MISSING map of which future supply/passport tables are already
backend-supported vs. need a new backend TZ, for `tasks/TZ-NX-REGISTRY-READINESS-MARATHON.md` Lane
B, step 1.

---

## Summary table

| # | Item | Backend | Frontend-nx | Overall | Parallel / Sequential |
|---|------|---------|-------------|---------|------------------------|
| 1 | SupplyRequest | PRESENT | MISSING | **PARTIAL** | Parallel |
| 2 | SupplyTask | PRESENT | MISSING (+ Order NX missing) | **BLOCKED** (NX side) | Sequential (needs Order NX first) |
| 3 | Material | PRESENT | PRESENT | **PRESENT** | N/A — done |
| 4 | Organization/Supplier | PRESENT | MISSING | **PARTIAL** | Parallel |
| 5 | StorageItem | PRESENT | MISSING (+ Warehouse NX missing) | **PARTIAL/MISSING** | Sequential (needs Warehouse NX first) |
| 6 | ProductPassport | PRESENT | PARTIAL (unrelated computed preview only) | **PARTIAL** | Parallel (NX read) / Sequential (bulk import) |
| 7 | Product/Module composition | PRESENT | PRESENT (P2 polish open) | **PRESENT** | N/A — done |
| 8 | Invoice/delivery fields | MISSING | N/A | **MISSING** | Sequential (small backend TZ, PO decision already recorded) |
| 9 | Status/priority/category/unit mappings | PARTIAL | N/A | **PARTIAL** | Sequential (decisions recorded, not yet implemented) |
| 10 | Passport Product matching | MISSING (by design — human review) | N/A | **BLOCKED** | Sequential — the hard blocker |
| 11 | Embedded passport photos | MISSING (precedent pattern exists) | N/A | **MISSING** | Parallel — fully independent |
| 12 | Personal-data risks | N/A (dormant) | N/A | **PARTIAL** (flagged, not yet acted on) | N/A — re-check only when import is scoped |
| 13 | Duplicate entities/fields | N/A | N/A | **PRESENT** (no duplication found — clean) | N/A |

---

## 1. SupplyRequest

- **Backend: PRESENT.** Full module — `backend/src/modules/supply/supply-request.schema.ts`,
  `supply-request.controller.ts`, `supply-request.service.ts` (+ `.spec.ts`), DTOs. Standalone
  quick-order line, no `orderId` required — matches the spreadsheet's shape exactly (per the prior
  audit).
- **Frontend-nx: MISSING.** No `frontend-nx/libs/data-access/src/lib/supply/**` (confirmed by full
  glob of `data-access/src/lib/**` — only `units/`, `catalog/`, `admin/`, `auth/`, `capabilities/`
  exist). No `frontend-nx/apps/kppdf-web/.../registries/data/supply*.registry.ts` (confirmed by
  glob — only units/materials/details/modules/products/departments registries exist).
- **Recommended next TZ:** `TZ-NX-SUPPLY-REQUEST-DATA-ACCESS-READ` — read-only list/detail
  registry mirroring the existing units/materials read-only pattern. No create/edit/import in this
  TZ.
- **Parallel/Sequential: Parallel.** Doesn't need the Excel-import decisions (`TZ-NX-PASSPORT-SUPPLY-DECISIONS.done.md`)
  resolved first — a read-only registry shows whatever real rows exist today (there are none from
  import yet), it doesn't interpret historical spreadsheet data. Can run alongside every other lane.
  Note: `categoryId` would render as a raw ObjectId in any list column, same pre-existing
  limitation already visible in Materials/Details (not a new gap to fix here).

## 2. SupplyTask

- **Backend: PRESENT.** `backend/src/modules/supply/supply-task.schema.ts` +
  `supply-task.controller.ts` + `.service.ts`. `orderId` required (ref `Order`); partial-unique
  index prevents duplicate open tasks per order+material; `confirmedBy`/`confirmedAt` (D18 green
  flag) present.
- **Frontend-nx: MISSING, with an extra prerequisite.** No data-access/registry for SupplyTask
  itself, **and** no NX data-access module for `Order` at all — grepped "Order" across
  `frontend-nx/libs/data-access/src/lib/**`: the only hits are incidental (`sortOrder`-style
  fields inside `catalog/product.types.ts` etc.), not a dedicated Order service.
- **Recommended next TZ:** sequential — first confirm/scope `TZ-NX-ORDER-DATA-ACCESS-READ` (or an
  explicit PO decision that Order management stays legacy-frontend-only for now), only then
  `TZ-NX-SUPPLY-TASK-DATA-ACCESS-READ`.
- **Parallel/Sequential: Sequential (NX side) on the Order prerequisite.** Backend needs nothing
  new. Can be scoped/discussed in parallel with everything else; cannot be *implemented* in NX
  before Order NX exists or the PO explicitly defers SupplyTask.

## 3. Material

- **Backend: PRESENT.** `backend/src/modules/material/material.schema.ts` — rich shape
  (`materialKind` enum, `colors`, `dimensions[]`, `categoryId`, `supplierId`, `organizationId`,
  optimistic-lock plugin).
- **Frontend-nx: PRESENT.** Materials/Details registries live with create/edit/copy/archive
  dialogs — verified this same conversation via real browser smoke
  (`tasks/_archive/2026-08/TZ-NX-REGISTRIES-FULL-CLOSEOUT.done.md`).
- **Overall: PRESENT.** One already-filed, pre-existing limitation carries over unchanged: Details
  registry's "Все" filter still defaults to `materialKind=part` only (backend has no `$in`/`$ne`
  support) — filed as B1 in `TZ-NX-REGISTRIES-CATALOG-REVIEW.done.md`, not re-litigated here.
- **Recommended next TZ:** none for supply/passport readiness; B1's own fix stays a separate,
  already-tracked item.
- **Parallel/Sequential: N/A** — done.

## 4. Organization/Supplier

- **Backend: PRESENT, correctly modeled.** `backend/src/modules/organization/organization.schema.ts`
  — `type: string[]` (`customer`/`supplier`/`contractor`/`manufacturer`/`partner`),
  `isOurCompany: boolean`, banking/signer/passport(ИП) fields, `assets[]` (logo/seal/signature via
  `Photo` ref). **No separate `Supplier` collection exists anywhere** (confirmed — no
  `supplier*.schema.ts` file in the repo), matching the prior audit's "must not be duplicated"
  finding.
- **Frontend-nx: MISSING.** No `organization` data-access module, no registry (confirmed by the
  same full glob as item 1).
- **Recommended next TZ:** `TZ-NX-ORGANIZATION-DATA-ACCESS-READ`. This is the load-bearing NX
  piece for eventually resolving `SupplyRequest.supplierId`/`companyId` through a real picker
  instead of free text, per the decision sheet's supplier-normalization step.
- **Parallel/Sequential: Parallel.** Independent files from Material/SupplyRequest work. Should
  ideally land before any future Supply *create/edit* dialog (which would need a supplier picker),
  but a read-only Supply registry (item 1) doesn't need it first.

## 5. StorageItem

- **Backend: PRESENT.** `backend/src/modules/storage-item/storage-item.schema.ts` — refs
  `Warehouse` (required), `Product`/`Material` (exactly one, enforced at service/DTO boundary per
  its own comment), `quantity`/`reservedQty`/`minQuantity`, careful partial-unique indexes with an
  in-code note about a previously-reproduced bug (`$exists: true` vs `$type: 'objectId'` collision)
  already fixed — the same soft-delete-discriminator class of bug the current Units DELETE fix
  (item 9 below) also addresses.
- **Frontend-nx: MISSING**, with an unconfirmed extra prerequisite: `Warehouse` has a full backend
  module (`backend/src/modules/warehouse/**` — schema/controller/service/DTOs all present) but
  **zero** references anywhere under `frontend-nx/**` (glob for `*arehouse*` returned no files) —
  so a StorageItem registry would need a Warehouse picker that also doesn't exist in NX yet.
- **Recommended next TZ:** sequential — confirm/scope Warehouse NX readiness first (not attempted
  in this pass, flagged as an open question rather than assumed), then
  `TZ-NX-STORAGE-ITEM-DATA-ACCESS-READ`.
- **Parallel/Sequential: Sequential** on the Warehouse NX prerequisite; otherwise independent of
  both the Supply and Passport lanes — not required for the Marathon's supply/passport goal, listed
  here only because the task's checklist named it explicitly.

## 6. ProductPassport

- **Backend: PRESENT.** Full CRUD module — `backend/src/modules/product-passport/product-passport.schema.ts`
  + `.controller.ts` + `.service.ts` + DTOs. Schema is a flat, denormalized snapshot (by design,
  confirmed in the prior audit) — `productId` **required + unique** (see item 10).
- **Frontend-nx: PARTIAL, but for an unrelated feature.** `frontend-nx/apps/kppdf-web/src/app/pages/passport/**`
  exists (per `TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION.done.md`) — but it is a **computed preview**
  built from live `Product`/composition/Unit data, not a read/write path to the actual
  `ProductPassport` collection at all. That same archive's own "Backend blockers" table says
  plainly: *"Паспорт№, Дата, Гарантийный Талон, Номер Изделия, Поставщик — Только ProductPassport,
  нет read в NX."* So the real entity has **no** NX data-access module or registry today.
- **Recommended next TZ:** `TZ-NX-PRODUCT-PASSPORT-DATA-ACCESS-READ` — a real read (and later
  create/edit) surface for the actual `ProductPassport` collection, distinct from the existing
  computed preview. This can target **newly created** passports going forward; it does not need to
  wait for the historical 792-row import decision.
- **Parallel/Sequential:** NX data-access/registry work is **parallel** to the import-decision
  lane. The **bulk import of the 792 historical rows** is a separate, **sequential** activity
  gated on items 10/11 below — do not conflate "can we read/write passports in NX" (yes, backend
  ready) with "can we import the spreadsheet" (no, blocked on human review).

## 7. Product/Module composition

- **Backend: PRESENT.** `backend/src/modules/product/product.schema.ts` — `composition: CompositionLine[]`
  (embedded), `moduleIds: ObjectId[]` ref `ProductModule`, `purpose`/`installation` free-text
  fields (the exact fields the passport-description template idea from the original audit would
  eventually consume), `hasPassport`/`hasDrawing` booleans.
- **Frontend-nx: PRESENT** for the core mechanism — composition dialogs for Module/Product root
  composition CRUD are live (`TZ-NX-REGISTRIES-COMPOSITION-DIALOG-REVIEW.done.md`,
  `PASS_WITH_P1_FOLLOWUPS`). The nested-add-target gap that review flagged as P1-1 (add always
  targeted root, not a selected nested parent) reads as **already fixed** per
  `docs/pages/registries.page.md`'s own later "Composition parity
  (TZ-NX-REGISTRIES-COMPOSITION-PARITY-WAVE-1)" section: *"Add target: новая строка состава
  добавляется в выбранный nested module/product parent."* Remaining open items are P2-level polish
  (no photo thumb/arrow-keys in the tree, no `unitPriceOverride` in the picker, missing
  cycle/depth integration tests) — not readiness blockers for supply/passport work.
- **Recommended next TZ:** none required for this Marathon's supply/passport goal; P2 polish stays
  separate backlog.
- **Parallel/Sequential: N/A** — largely done, tangential to this review's core question (checked
  only because Product/Module composition is what `StorageItem.productId` and passport-matching
  both ultimately resolve into).

## 8. Invoice/delivery fields

- **Backend: MISSING.** Full read of `supply-request.schema.ts` confirms: no `invoiceNumber` field
  anywhere, no delivery-notes field. Only `supplierOrderDate: Date` exists, which can hold the date
  half of the spreadsheet's combined "date + invoice number" cell — the number half has nowhere
  structured to go today.
- **Recommended next TZ:** small additive backend TZ — add `SupplyRequest.invoiceNumber` (string).
  The PO decision for this is **already recorded**:
  `tasks/_archive/2026-08/TZ-NX-PASSPORT-SUPPLY-DECISIONS.done.md` item 7 (new field vs
  notes-only) — this readiness review does not re-decide it, only confirms the field still doesn't
  exist in code.
- **Parallel/Sequential: Sequential** relative to any real import (must land before an importer
  writes structured invoice data); can be scoped/implemented in parallel with the NX
  SupplyRequest read-only registry (item 1), which doesn't need this field to exist.

## 9. Status/priority/category/unit mappings

- **`status` enum:** `in_progress | requested | ordered | received | cancelled` (5 values,
  `supply-request.schema.ts:4-9,79-84`) — **PARTIAL** against the 5 spreadsheet values; the exact
  1:1 mapping (including the `Оплачено`→`ordered`+notes recommendation) is already worked out in
  `TZ-NX-PASSPORT-SUPPLY-DECISIONS.done.md` item 5, just not yet consumed by any importer (none
  exists).
- **`priority` enum:** `urgent | normal | low` — **PRESENT**, clean 3-value match, no gap.
- **`categoryId`:** real `ObjectId` ref to `Category` — **PRESENT as a field**, but the 6
  spreadsheet category buckets don't map to any existing `Category` doc; decision sheet item 6
  recommends leaving it unpopulated for MVP rather than guessing — still the right call, unchanged.
- **`unit`:** free string, no FK to the real `Unit` dictionary — **PRESENT as a field**, unvalidated
  by design (matches `Unit`'s own free-text-friendly posture elsewhere in the schema).
- **Overall: PARTIAL** — every sub-mapping is either an already-decided-but-unimplemented mapping
  (status) or a deliberately-informal field (category/unit), not a code gap needing a new TZ beyond
  what's already recorded.
- **Recommended next TZ:** none new; implementing the recorded decisions is part of whatever future
  import-script TZ gets scoped, not a separate readiness item.
- **Parallel/Sequential: Sequential** relative to any bulk import; independent of NX UI work.

## 9b. Units DELETE backend fix — status check (marathon step 4)

Not one of the 13 named checklist items, but the Marathon's step 4 explicitly asks to verify this,
and it directly informs whether any Units-adjacent supply/passport UI work can safely assume a
stable Units backend. Findings:

- `unit.controller.ts:66-72` already wires `DELETE /units/:key` (`@Roles('admin','manager')`,
  `@AuditAction`).
- `unit.service.ts`'s `remove()` has an **uncommitted, in-progress** diff (confirmed via
  `git diff`) switching from a broken soft-delete (`$set: { deletedAt }` on a schema with no
  `deletedAt` prop — silent no-op under Mongoose strict mode, the unit never actually disappeared)
  to a hard `deleteOne()`, matching the same pattern already used in `storage-item.service.ts`.
  Still guards `isSystem` units (throws `BadRequestException`).
- `unit.service.spec.ts` (new, untracked) — **run read-only this session, no DB, in-memory mock
  model: 3/3 tests PASS** (hard-delete removes and frees the unique key; system units refused;
  missing key rejected with `NotFoundException`).
- **No in-use guard beyond `isSystem`** — `remove()` does not check whether the unit's `key` is
  referenced by live `Material.unit`/`SupplyRequest.unit` free-text values before hard-deleting;
  since those are plain strings (not enforced refs), this doesn't corrupt data, only leaves
  historical rows with a label that no longer resolves to a live `Unit` doc — a minor, accepted-by-design
  risk given the rest of the codebase's snapshot-string conventions.
- **Status: PRESENT in code, but NOT YET MERGED** — this is uncommitted peer WIP (per
  `tasks/_backlog/TZ-NX-REGISTRY-UNITS-DELETE-FE.md`: *"DEPENDS: backend hard-delete `DELETE
  /units/:key` merged and verified on main (peer WIP `unit.service.ts`)"*). Tests passing locally
  is good evidence but is **not** the same as "merged and verified on main" — per the Marathon's
  own instruction *"Do not wire DELETE until the fix and tests pass"* — the tests do pass, but the
  commit itself should land (and ideally re-run once on a clean checkout) before
  `TZ-NX-REGISTRY-UNITS-DELETE-FE` is unblocked.
- **Recommended next TZ:** none new — commit/land the existing WIP diff, then unblock
  `TZ-NX-REGISTRY-UNITS-DELETE-FE` (already scoped, frontend-nx only).
- **Parallel/Sequential: Sequential** — the FE task stays blocked until the backend diff is
  committed; independent of every other item in this review.

## 10. Passport Product matching

- **Backend: MISSING by design — this is a human-review gate, not a code gap.**
  `product-passport.schema.ts:8-9`: `productId` is `required: true, unique: true`. Zero of the 792
  "pasports" spreadsheet rows carry any product reference (confirmed in the original audit); `Артикул`
  is frequently blank or the literal string `#N/A`.
- **Overall: BLOCKED.** This is the single largest, explicitly-flagged blocker across both the
  original audit and the decision sheet (item 9 there) — nothing in the passport import pipeline
  can proceed until a human-reviewed name+article matching pass against the live `products`
  collection is done, with an explicit "create new Product" path for genuine misses. The `unique`
  constraint also means at most one passport can ever attach to a given `Product` — if the review
  finds duplicate matches, that's a catalog-design question for the PO, not something an import
  script can resolve.
- **Recommended next TZ:** not a code TZ — a scoped human/PO-domain-expert review pass (792 rows),
  optionally assisted by the read-only Product registry (already `PRESENT`, item 3/7) or a future
  read-only Passport registry (item 6) for lookup convenience. No automated fuzzy-matching should
  be built for this.
- **Parallel/Sequential: Sequential** — must complete before any passport bulk import; fully
  independent of every NX registry-readiness item in Lane A.

## 11. Embedded passport photos

- **Backend: MISSING, but a clear precedent exists.** No extraction has been done (225 embedded
  PNGs across 792 rows in `xl/media`/`xl/drawings`, confirmed present and unchanged by file-size
  check this session, not re-opened). `ProductPassport.photo` is a single free-text string
  (`product-passport.schema.ts:53-54`) — not built to receive a gallery.
  **Precedent, confirmed this session:** `backend/src/modules/product-photo/product-photo.schema.ts`
  already models exactly this shape for `Product` (`productId` + `photoId` ref `Photo` +
  `isMain`/`sortOrder`), and `photos/photo.schema.ts` is the shared target entity every other
  gallery (`Organization.assets`, `Material.photoIds`, `Product.photoIds`) already reuses. A
  hypothetical `ProductPassportPhoto` join, or simply populating the existing `photo` string via
  the shared `Photo` entity, both have a working template to copy — this is not unexplored territory.
- **Recommended next TZ:** separate, later `TZ-BACKEND-PASSPORT-PHOTO-MIGRATION` — extract
  `xl/media`, create `Photo` docs, link. Explicitly deferred per decision sheet item 11, not a
  blocker for the tabular import.
- **Parallel/Sequential: Parallel — fully independent.** Can start any time; only the final
  `ProductPassport.photo` backfill step needs both this and the tabular import (items 9/10) to
  have landed first.

## 12. Personal-data risks

- Individual staff names in `Подал заявку` (Метизы/Расходники sheets) and phone numbers observed
  in free-text `Примечание` samples — both flagged in the original audit
  (`TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md` §7 item 5) and carried into the decision sheet (items
  1/3, `responsible` field 152-ФЗ posture).
- **Status: dormant, not realized.** No importer exists yet that would write this data anywhere;
  nothing in the live system stores it today. This review did not re-open the spreadsheets and
  reproduces **no** personal data here, per this task's own constraint.
- **Overall: PARTIAL** — correctly identified and parked pending a 152-ФЗ review (per PO-CANON's
  compliance canon, `docs/compliance/COMPLIANCE-RULES.md`), neither fixed nor ignored.
- **Recommended next TZ:** none until an actual import script is scoped; re-confirm this risk is
  still unaddressed at that point, not before.
- **Parallel/Sequential: N/A** — a standing constraint on the eventual import TZ, not an active
  work item today.

## 13. Duplicate entities and fields

Re-confirmed this session (via the full set of schema globs/reads above), consistent with and
extending the original audit:

- **No parallel Supplier collection** — `Organization` (`type ⊇ ['supplier']`) is the only model;
  no `supplier*.schema.ts` file exists anywhere in the repo.
- **No parallel passport-only product table** — `ProductPassport.productId` points at the same
  `Product` collection everything else uses; no shadow catalog.
- **No parallel category/dictionary table** created for the 6 Excel buckets — the question remains
  an open decision (item 6 above), not a duplication risk today.
- **No duplicate photo-storage entity** (newly checked this session) — `ProductPhoto` /
  `ProductModulePhoto` / `Photo` form one coherent, reusable join pattern; `ProductPassport.photo`
  deliberately stays a single string rather than a second, premature passport-specific photo table.
- **Overall: PRESENT** (as a "no duplication found" finding) — the codebase is clean on this axis.
- **Recommended next TZ:** none — a "stay this way" finding. Worth re-checking only if a future TZ
  proposes a new schema that risks duplicating one of the above.
- **Parallel/Sequential: N/A.**

---

## Recommended implementation order

Numbered so independent items can run in parallel within the same number; a later number depends
on an earlier one only where stated.

1. **(parallel)** `TZ-NX-SUPPLY-REQUEST-DATA-ACCESS-READ`, `TZ-NX-ORGANIZATION-DATA-ACCESS-READ`,
   `TZ-NX-PRODUCT-PASSPORT-DATA-ACCESS-READ` (real entity, not the existing computed preview),
   `TZ-BACKEND-PASSPORT-PHOTO-MIGRATION` (photo extraction only — no linking yet), commit-and-land
   the existing Units DELETE backend WIP diff. All touch disjoint files/collections.
2. **(parallel, gated on #1's Units-DELETE landing)** `TZ-NX-REGISTRY-UNITS-DELETE-FE` (already
   scoped in `tasks/_backlog/`).
3. **(sequential, small backend TZ)** `TZ-SUPPLY-INVOICE-NUMBER-FIELD` — PO decision already
   recorded, just needs implementing; can start any time after #1's SupplyRequest read registry
   exists (not required, just a sensible ordering so the field shows up somewhere once added).
4. **(sequential human task, independent of 1–3)** Passport↔Product manual matching review
   (792 rows) — the load-bearing blocker for any passport bulk import. Can be assisted by the
   read-only Product registry that already exists today.
5. **(sequential, needs #4 + the recorded status/category decisions)** The actual one-off
   Снабжение/Pasports import scripts — out of scope for any "TZ" that touches live product code;
   these are one-shot data-migration scripts per the original audit's plan, gated on #4 and on the
   already-recorded decision sheet.
6. **(sequential, needs #5's tabular passport import + #1's photo extraction)** Backfill
   `ProductPassport.photo` from the migrated photos.
7. **(separate track, needs its own scoping first)** Confirm Warehouse NX readiness →
   `TZ-NX-STORAGE-ITEM-DATA-ACCESS-READ`; confirm Order NX readiness (or explicit deferral) →
   `TZ-NX-SUPPLY-TASK-DATA-ACCESS-READ`. Neither blocks the Снабжение/Pasports goal directly.

---

## Sources

- `tasks/TZ-NX-REGISTRY-READINESS-MARATHON.md`
- `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md`
- `tasks/_archive/2026-08/TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION.done.md`
- `tasks/_archive/2026-08/TZ-NX-PASSPORT-SUPPLY-DECISIONS.done.md`
- `tasks/_archive/2026-08/TZ-NX-REGISTRIES-FULL-CLOSEOUT.done.md`
- `tasks/_archive/2026-08/TZ-NX-REGISTRIES-CATALOG-REVIEW.done.md`
- `tasks/_archive/2026-08/TZ-NX-REGISTRIES-COMPOSITION-DIALOG-REVIEW.done.md`
- `tasks/_backlog/TZ-NX-REGISTRY-UNITS-DELETE-FE.md`
- `data/Снабжение.xlsx`, `data/Pasports.xlsx` (presence/size check only)
- Backend: `supply/supply-request.schema.ts`, `supply/supply-task.schema.ts`,
  `material/material.schema.ts`, `organization/organization.schema.ts`,
  `storage-item/storage-item.schema.ts`, `product-passport/product-passport.schema.ts` (+ full
  module glob), `product/product.schema.ts` (grep), `category/category.schema.ts`,
  `photos/photo.schema.ts`, `product-photo/product-photo.schema.ts`, `unit/unit.controller.ts`,
  `unit/unit.service.ts` (uncommitted diff), `unit/unit.service.spec.ts` (run read-only),
  `warehouse/**` (glob, presence only)
- `frontend-nx/libs/data-access/src/lib/**` (full glob), `frontend-nx/apps/kppdf-web/.../registries/data/*.registry.ts`
  (full glob), `docs/pages/registries.page.md`, `docs/pages/passport/**` implementation notes

## Checklist

See `docs/agent-checklists/TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.md` — Integrity slot filled,
status DONE.

## Closeout

- [x] Archive created.
- [x] Active marker removed (`tasks/_active/TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.md` deleted
      after this file was written).
- closed_at: 2026-08-29T20:32:54Z
