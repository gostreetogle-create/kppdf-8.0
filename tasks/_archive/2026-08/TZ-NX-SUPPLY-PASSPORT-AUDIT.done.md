# TZ-NX-SUPPLY-PASSPORT-AUDIT — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: claude
mode: analysis-only — no code, schema, or API changed; `data/*.xlsx` opened read-only

## Method

Both files are real OOXML `.xlsx` workbooks. Neither `openpyxl` nor `pandas` is available in this
environment (`ModuleNotFoundError` on both), and no `xlsx`/`exceljs` package exists anywhere in
the repo's `node_modules`. Read via `System.IO.Compression.ZipFile.OpenRead` (PowerShell, no
write handle ever opened) to extract `xl/workbook.xml` (sheet names/order), `xl/sharedStrings.xml`
(string table), and each `xl/worksheets/sheetN.xml` (headers + sample rows). This is a standard,
lossless way to inspect `.xlsx` structure without a spreadsheet library and without modifying the
source files. Personal data (individual staff names, phone numbers found in free-text columns)
and any secrets are **not** reproduced below — only their structural presence is noted, as
required.

---

## 1. Sheets and their purpose

### `data/Снабжение.xlsx` (317 KB, 4 sheets)

| Sheet | Rows | Columns | FACT — purpose |
|---|---|---|---|
| **Снабжение** | 997 | A–Q (17) | Master supply-request log, **all categories mixed** in one flat table. Columns: №, Дата, Категория, Наименование, Артикул, Цвет, Поставщик, Ссылка, Кол-во, Ед_изм., Заказчик, Примечание, Статус, Приоритет, Наша Компания, Доставка, Счета. |
| **Метизы** | 1991 | A–P populated (Q–AC empty) | Same shape as Снабжение but scoped to one category (fasteners/hardware) and adds a "Подал заявку" (requester name) column Снабжение lacks; adds "№ счета" (invoice number, combined with date as free text) in place of "Ссылка"/"Счета". |
| **Расходники** | 998 | A–P populated | Identical column shape to Метизы, scoped to consumables. |
| **Справочник** | 1000 | A–N populated | **Not one entity** — a side-by-side pack of independent flat lookup lists (each column is its own dictionary), used as Excel data-validation sources for the other three sheets: nomenclature names per category (A–F), priority (G, unlabeled), status (H), suppliers (I), category labels (J), units (K), "our company" legal-entity short codes (L), customer/site names (M), requester names (N). |

**FACT:** the three "log" sheets (Снабжение/Метизы/Расходники) are the same logical entity —
one supply-request row — split by category for editing convenience, not by any structural
difference. Метизы/Расходники together (2989 rows) outnumber the mixed Снабжение sheet (997 rows)
roughly 3:1, suggesting Снабжение is the older/general bucket and Метизы/Расходники are newer,
category-dedicated splits of the same workflow.

### `data/Pasports.xlsx` (30.5 MB — 30 MB of it is embedded images, 3 sheets)

| Sheet | Rows | Columns | FACT — purpose |
|---|---|---|---|
| **pasports** | 792 | A–O (15) | The actual passport register: Паспорт№, Дата, Гарантийный Талон, Номер Изделия, Фото, Категория, наименование, Артикул, Высота, Длинна, Ширина, Вес, описание, Объект, Поставщик. **225 embedded images** (`xl/media/*.png`, ~31 MB total, anchored via `xl/drawings/drawing1.xml`) are attached to some (not all — 225 images for 792 rows) rows' "Фото" cells. |
| **Products** | 1860 | A–K | A staging/template sheet, **mostly empty**: only "Наименование" (C) and a partially pre-composed description fragment (K, e.g. *"‹name› в дальнейшем именуемые как 'Изделие', изготовленная из "*) are populated for most rows; Артикул/Категория/dimensions/"изготовленная из"/"устанавливается"/"предназначено для" are blank in the large majority sampled. This is an unfinished attempt at building a reusable name→description-template list to make writing new passports faster — not a usable product catalog by itself. |
| **Лист6** | 10 (2 identical column blocks) | B–F and H–L | A **leftover fragment of one engineering BOM/specification** (Поз./Обозначение/Наименование/Материал/Кол-во — е.g. drawing-code parts like a roof, floor, fence, bench with quantities), duplicated side by side. Only 10 rows, `Материал` empty in every sampled row. Useful only as an example of what a real composition/BOM extract looks like — not a batch dataset.

---

## 2. Field-by-field mapping — Снабжение.xlsx → backend

Backend supply-side model, confirmed by re-reading the live schemas: `SupplyRequest`
(`backend/src/modules/supply/supply-request.schema.ts`) is a **standalone quick-order line**
(no required `orderId`); `SupplyTask` (`supply-task.schema.ts`) is a **registry entry tied to a
specific `Order` line** (`orderId` required). The spreadsheet has no order/quotation reference
anywhere — every row is closer in shape to `SupplyRequest`.

| Spreadsheet column | Sheets | → Field | Tag |
|---|---|---|---|
| Наименование | all 3 | `SupplyRequest.title` | **FACT** — direct free-text match |
| Артикул | all 3 | `SupplyRequest.article` | **FACT** |
| Цвет | Снабжение, Метизы, Расходники | `SupplyRequest.color` | **FACT** — schema comment literally says *"одно из значений `Material.colors`"*; spreadsheet values are free text, not validated against any material today |
| Кол-во | all 3 | `SupplyRequest.qty` | **FACT** |
| Ед_изм. | all 3 | `SupplyRequest.unit` | **FACT** — free string on both sides, no `Unit.key` validation either side |
| Ссылка (Снабжение only) | Снабжение | `SupplyRequest.productUrl` | **FACT** |
| Приоритет (Срочно/Обычный/Низко) | all 3 | `SupplyRequest.priority` (`urgent`/`normal`/`low`) | **FACT** — clean 3-value match |
| Примечание | Снабжение | `SupplyRequest.notes` | **FACT** |
| Поставщик | all 3 | `SupplyRequest.supplierId` (ref `Organization`) | **MIGRATION RISK** — spreadsheet stores a free-text company name/domain (examples seen: an LLC name, a bare website domain used as a supplier label); every distinct value must be resolved to an existing `Organization` doc with `type` containing `'supplier'`, or a new one created, with de-duplication (same real supplier typed two different ways) handled before import |
| Наша Компания (СИЮ/ССЮ codes) | all 3 | `SupplyRequest.companyId` (ref `Organization`, `isOurCompany: true`) | **DECISION NEEDED** — confirm these 2-letter codes map 1:1 to existing `isOurCompany: true` Organization docs (or `shortName`); not verified in this audit (would require querying live Mongo, out of scope) |
| Категория (`Наменклатура (X)` labels) | Снабжение | `SupplyRequest.categoryId` (ref `Category`) | **GAP** — these are a flat, ad-hoc bucket list (6 values, mirrored as Справочник columns A–F) unrelated to the real `Category` tree (`type: 'material'\|'product'\|'general'`, hierarchical via `parentId`/`fullPath`). No existing `Category` doc is guaranteed to match these labels 1:1. |
| Статус (`⏳ Ожидает`, `✅ Заказать`, `⚙️ В работе`, `☑️ Получено`, `💰 Оплачено`) | all 3 | `SupplyRequest.status` (`in_progress`\|`requested`\|`ordered`\|`received`\|`cancelled`) | **GAP** — 5 spreadsheet values, 5 backend values, but they are **not** the same 5 concepts: "Оплачено" (paid) has no backend equivalent (closest is `ordered`, but that conflates "ordered" and "paid" — two different real-world events); the emoji prefixes must be stripped and every value explicitly re-mapped, not string-matched |
| Заказчик | Снабжение | `SupplyRequest.requestedBy` (free text) | **DECISION NEEDED** — could also represent a `Site`/project name rather than "who asked"; schema comment says `requestedBy` is *"участок/отдел"* (department/site), which fits better than a person |
| Подал заявку | Метизы, Расходники | `SupplyRequest.responsible` **or** a net-new "submitted by" concept | **DECISION NEEDED** — schema has no explicit "who filed this request" field distinct from `responsible` (*"free text"*, purpose not pinned down in the schema comment); this column holds **individual staff names — do not import verbatim without a normalization/consent decision**, see Migration Risks §7 |
| № счета (e.g. a date + invoice number combined in one cell) | Метизы, Расходники | `SupplyRequest.supplierOrderDate` (date part) | **GAP + MIGRATION RISK** — the cell mixes a date and an invoice number as one free-text string; `SupplyRequest` has **no invoice-number field at all** (`priceHint`/`lineTotal` are cost fields, not identifiers) — splitting and a new field are both needed |
| Получено (Метизы/Расходники, blank in every sample) | Метизы, Расходники | overlaps `SupplyRequest.status === 'received'` | **DERIVED** — likely redundant with Статус once statuses are cleaned up; do not import as a second boolean unless a real distinction from Статус is confirmed |
| Доставка | Снабжение | *(none)* | **GAP** — no delivery-notes field on `SupplyRequest`; would currently have to fold into `notes` |
| Счета (Снабжение, blank in samples) | Снабжение | *(none)* | **GAP** — same as № счета above; no structured invoice field exists |
| *(no column)* | — | `SupplyRequest.priceHint` / `lineTotal` | **GAP** — the spreadsheet captures **no price or cost at all** for any supply line; any cost reporting built from this import will start with zero cost data, not approximate data |
| *(no column)* | — | `SupplyRequest.neededBy` | **GAP** — only one date (request date) exists per row; no "needed by" deadline is captured |
| *(no column)* | — | `SupplyRequest.materialId` | **GAP, expected** — free-text "Наименование"/"Артикул" are not linked to any `Material` document; matching would require fuzzy name/article matching against the live `materials` collection, not a mechanical field copy |
| *(no column)* | — | `SupplyRequest.orderId` / `linkedSupplyTaskId` | **N/A by design** — these rows are exactly the "quick order, no order link" case the schema already supports; nothing to fix |

### Справочник sheet — column-by-column

| Column | Values (examples, non-personal) | → | Tag |
|---|---|---|---|
| A–F (Наменклатура ×6) | equipment/purchased-goods/metal/wood/fasteners/consumables item names | free-text autofill source, not an entity | **DERIVED** (a pick-list, not a table to import as rows) |
| G (unlabeled, values Низко/Обычный/Срочно) | priority list | mirrors `SupplyRequest.priority` enum | **FACT** |
| H (Статус) | the 5 emoji statuses | mirrors `SupplyRequest.status`, imperfectly (see above) | **GAP** |
| I (Поставщики) | supplier names/domains | should become `Organization` docs (`type ⊇ ['supplier']`) | **MIGRATION RISK** (dedup) |
| J (Категория) | same 6 bucket labels as sheet1's Категория column | confirms Категория is a closed, small, already-known list (good news for normalization — see §5) | **DERIVED** |
| K (Ед_изм.) | шт, м, м2, м3, компл | maps toward `Unit.key`, **but `SupplyRequest.unit` is free text with no FK today** — importing these as-is is safe; validating them against the real `Unit` dictionary is a separate, optional step | **FACT** + **DECISION NEEDED** |
| L (Наша Компания) | short legal-entity codes | should map to `Organization.isOurCompany: true` docs | **DECISION NEEDED** (needs live-data confirmation) |
| M (Заказчики) | mix of project/site names | ambiguous — see `requestedBy` above | **DECISION NEEDED** |
| N (Подал заявку) | individual staff names | **personal data — normalize/gate before any import**, see §7 | **MIGRATION RISK** |

---

## 3. Field-by-field mapping — Pasports.xlsx → backend

`ProductPassport` (`backend/src/modules/product-passport/product-passport.schema.ts`) is a
**flat, denormalized print/certificate snapshot** — confirmed unchanged from this session's
earlier catalog audit. The mapping to the "pasports" sheet is the cleanest 1:1 relationship found
in this entire audit:

| Spreadsheet column | → `ProductPassport` field | Tag |
|---|---|---|
| Паспорт№ | `passportNumber` (required) | **FACT** |
| Дата | `date` | **FACT** |
| Гарантийный Талон | `warrantyCode` | **FACT** — format (`20258-224`) matches a code, not a free date |
| Номер Изделия | `productCode` | **FACT** |
| Фото | `photo` (single string) | **GAP** — schema field is a single string (one photo reference), but the sheet's images are anchored per-cell via `xl/drawings` (225 embedded PNGs), not a URL string; extracting, re-hosting, and linking each image is separate work from the field mapping itself, and only ~28% of rows (225/792) have an image at all |
| Категория | `category` (free string) | **FACT** — schema already stores this as free text, not a `Category` ref, so no normalization is structurally required (though the values are inconsistent, e.g. a misspelling of "оборудование" seen in samples) |
| наименование | `name` | **FACT** |
| Артикул | `article` | **FACT** — frequently blank or literally the text `#N/A` in samples; **do not import the literal string `#N/A` as a value** |
| Высота / Длинна / Ширина / Вес | `height` / `length` / `width` / `weight` | **FACT** — direct numeric match, including the field's own slightly non-standard spelling `length` for "Длинна" |
| описание | `description` | **FACT** — long, hand-composed technical/legal boilerplate paragraph per row (material, coating, installation context, purpose); this is genuinely free text today, not composed from structured fields |
| Объект | `installationSite` (free string) | **FACT** — schema field is already free text, not a `Site` ref; **DECISION NEEDED**: a real `Site` document requires a `counterpartyId` (client), which the passport sheet never records, so upgrading this to a real `Site` reference is not possible from this data alone |
| Поставщик | `supplier` (free string, blank in every sample seen) | **FACT** — schema field is already free text, not an `Organization` ref, consistent with the rest of `ProductPassport`'s deliberately flat shape |
| *(no column)* | `productId` (**required, unique** — ref `Product`) | **BLOCKER-level GAP** — see §4 |
| *(no column)* | `isActive` / `deletedAt` | **N/A** — backend lifecycle fields, not data-entry fields |

### "Products" sheet → backend

| Spreadsheet column | → | Tag |
|---|---|---|
| Наименование (C) | candidate `Product.name` / `ProductPassport.name` seed | **DERIVED** — the one reliably-populated column; could seed a name→description-template lookup, not a `Product` import by itself |
| Артикул / Категория / Высота / Длинна / Ширина / Вес | candidate `Product`/`ProductPassport` fields | **GAP** — sparse-to-empty in the overwhelming majority of sampled rows; not usable as a bulk import source as-is |
| изготовленная из / устанавливается / предназначено для (H/I/J) | fragments of `ProductPassport.description`'s boilerplate | **DERIVED** — this is exactly the template pattern the "pasports" sheet's `описание` column already hand-composes per row (material + install context + purpose); if these three fragments were completed for more rows, `description` could become a **computed** field (`DERIVED`) instead of hand-typed prose — today it cannot, because the fragments are empty for almost every row sampled |
| K (partial concatenation) | *(none)* | **DERIVED** — visible evidence of someone already starting to build the template computation described above, abandoned partway through |

### "Лист6" (BOM fragment) → backend

| Spreadsheet column | → | Tag |
|---|---|---|
| Поз. | `CompositionLine.sortOrder` (conceptually) | **DERIVED** — position number, same role sortOrder plays |
| Обозначение | *(no direct field)* | **GAP** — a drawing/designation code (e.g. `ИКС-0.00СБ`); neither `CompositionLine` nor `ProductModule`/`Product` has a "drawing code" field today |
| Наименование | `ProductModule.name` / `Material.name` (conceptually, if this became a real module) | **DERIVED** |
| Материал (empty in every row) | `CompositionLine.refId` → `Material` (conceptually) | **GAP** — no data present to map |
| Кол-во | `CompositionLine.quantity` | **FACT** (conceptually — only 10 rows exist, not a dataset) |

This sheet is **not** large enough or complete enough to drive any real composition import; it is
only useful as a concrete example of the shape a real BOM extract from engineering drawings would
take, for whenever the team designs an actual composition-import pipeline (out of scope here).

---

## 4. Missing entities / fields (GAP summary)

| Missing today | Needed for | Severity |
|---|---|---|
| `SupplyRequest.invoiceNumber` (or similar) | splitting the "№ счета" combined date+number cell | P1 — small schema addition |
| A documented, single meaning for "who filed this request" (person) vs "участок/отдел" (site/dept) | `Подал заявку` vs `Заказчик` vs `responsible` vs `requestedBy` — currently 4 loosely-defined free-text slots for what may be 2 real concepts | DECISION NEEDED before any import, not a schema gap per se |
| A closed dictionary/enum for the 6 spreadsheet "Категория" buckets, OR a decision to reuse `Category` | `SupplyRequest.categoryId` | DECISION NEEDED |
| Any price/cost field actually populated for supply lines | cost reporting from imported data | Not fixable by schema change — the **source data itself** lacks this, note as a reporting-scope limitation, not a backend gap |
| `ProductPassport.productId` resolution path for 792 passport-only rows with no catalog match | importing "pasports" at all | **BLOCKER** — see §6 |
| A structured place for the "Products" sheet's boilerplate fragments (material/install-context/purpose) if the team ever wants `description` to become computed | turning passport description into a template instead of free prose | Not urgent — today's data doesn't support it (too sparse) |

## What can be computed from existing data (DERIVED, no new storage needed)

- `SupplyRequest.status` for the small subset already unambiguous (Получено/Заказать map cleanly)
  can be derived by a lookup table, not stored as-is from the spreadsheet's emoji text.
- A `ProductPassport.description` template (name + material + install context + purpose) is
  **conceptually** derivable from `Product`/`ProductModule` fields already in the catalog, per the
  "Products" sheet's own unfinished attempt — but only once those catalog entities exist with
  populated `assortment`/`materialGrade`/`purpose`/`installation` fields (which `Product` already
  has: `purpose?: string; installation?: string`, confirmed in the schema). This is a real,
  actionable **DERIVED** opportunity for *future* passports, not a way to backfill the existing
  792.
- Priority/status/unit dictionaries in the Справочник sheet do not need their own new collection —
  they can be validated against (or simply left as informal free text matching) the *existing*
  enums/`Unit` dictionary; no new "SupplyDictionary" table is needed for these three.

## Fields that must NOT be duplicated

- **Supplier/company identity** — must resolve to the existing `Organization` collection
  (`type`/`isOurCompany`), never stored as a second, parallel "supplier name" table; the schema
  already models this correctly (`SupplyRequest.supplierId`/`companyId` as ObjectId refs) — the
  spreadsheet's free-text values are the input to a matching step, not a second source of truth.
- **Material identity** — `SupplyRequest.article`/`title` are explicitly documented in the schema
  itself as a **snapshot**, not a second Material registry (*"Snapshot артикула материала (без
  повторного join в списке)"*). Do not create new `Material` documents purely from unmatched
  supply-request rows without a deliberate catalog decision — that would silently duplicate the
  catalog.
- **Product identity for passports** — under no circumstances should the importer create a second,
  parallel "passport-only product" record; `ProductPassport.productId` must point at the *same*
  `Product` document the rest of the system already uses, or the one-to-one uniqueness constraint
  (`unique: true` on `productId`) becomes meaningless and passports drift from the real catalog.

## Live data vs snapshot

| Data | Live or snapshot | Evidence |
|---|---|---|
| `SupplyRequest.article`/`color`/`title` | **Snapshot** (explicitly, by schema comment) | avoids a join for list rendering; a later Material rename does not retroactively change historical request rows |
| `SupplyRequest.materialId`/`supplierId`/`companyId`/`categoryId` | **Live reference** (ObjectId) | resolved at read time against the current `Material`/`Organization`/`Category` state |
| `ProductPassport` as a whole | **Snapshot, by design** | confirmed in this session's earlier catalog audit: passport fields (name/category/article/dimensions) are copied at creation time and never re-synced from the live `Product` — this matches the spreadsheet's own reality (hand-typed values that already drift from any catalog article) |
| The "Products" sheet's boilerplate fragments | **Would become a live template source**, if ever finished | today too sparse to be either — effectively unused |

## Data that cannot be imported without normalization

1. **Supplier/company names** (Снабжение.xlsx `Поставщик`, Справочник `Поставщики`) — free text,
   inconsistent formatting (legal-entity names vs bare website domains used as a supplier label),
   needs de-duplication against the live `Organization` collection before any `supplierId` can be
   written.
2. **Status values** (all 3 supply sheets) — emoji-prefixed free text with one value ("Оплачено")
   that has no backend equivalent; needs an explicit, human-reviewed mapping table, not a
   mechanical strip-and-lowercase transform.
3. **Category buckets** (Снабжение.xlsx `Категория`) — a closed 6-value list unrelated to the real
   `Category` tree; needs an explicit decision on whether these become `Category` docs, a new
   small enum, or stay informal.
4. **Combined date+invoice-number cells** (`№ счета`, Метизы/Расходники) — needs string parsing
   and a schema field that doesn't exist yet (see §4).
5. **Personal data** — individual staff names in `Подал заявку` (Метизы/Расходники) and phone
   numbers embedded in free-text `Примечание` cells (seen in samples, not reproduced here). These
   must be reviewed under the project's own 152-ФЗ posture (see `docs/agents/CLOUDCODA.md`/PO-CANON
   references to 152-ФЗ elsewhere in this repo's conventions) **before** any bulk import writes
   them into a queryable field — at minimum, decide whether they belong in a free `notes` field
   (low structure, easy to redact later) or a proper `User`/`Person` reference (which would require
   matching real accounts, out of scope here).
6. **`Артикул` literal `#N/A`** (Pasports.xlsx) — Excel's own error marker leaking into a data
   column; must be treated as "no article," never imported as the string `#N/A`.
7. **Passport `Фото`** — 225 embedded images with no row-independent file path; extracting them
   from `xl/media`/`xl/drawings` and re-hosting through the existing `Photo` entity is a distinct,
   non-trivial migration step, separate from the tabular field mapping.

---

## 5. Minimal supply model (MVP)

Given `SupplyRequest` already covers the overwhelming majority of the spreadsheet's real fields,
**no new collection is required** for an MVP import of Снабжение.xlsx. Minimal scope:

1. Import `title`, `article`, `qty`, `unit`, `notes`, `priority` as direct free-text/enum copies
   (`priority` via the clean 3-value map).
2. Resolve `supplierId`/`companyId` via a one-time, human-reviewed name→`Organization` mapping
   table (produced once, reused for every row) — do not auto-create `Organization` docs from
   unrecognized names without review.
3. Map `status` via an explicit lookup table covering all 5 spreadsheet values, with a documented
   decision for "Оплачено" (recommend: treat as `ordered` with the true "paid" fact preserved only
   in `notes` until/unless a real `paid` status is added — a small, explicit schema decision, not
   silently dropped).
4. Leave `categoryId`, `materialId`, `neededBy`, `priceHint`/`lineTotal`, invoice number
   unpopulated in the MVP import (all GAPs above) rather than guessing.
5. Treat `Подал заявку`/`Заказчик`/`responsible`/`requestedBy` as a single explicit
   **DECISION NEEDED** to resolve before writing any of the four — do not import into four
   different fields on a guess.

**DECISION NEEDED (PO):** confirm whether the MVP import target is `SupplyRequest` (quick, no
order link — matches the data as-is) rather than `SupplyTask` (would require inventing an `Order`
per historical row, which the data doesn't support and shouldn't be fabricated).

## Minimal passport model (MVP)

`ProductPassport` needs **no schema change** for an MVP import of the tabular fields — the schema
already matches the sheet almost verbatim. The MVP scope is entirely a **data-resolution problem**,
not a modeling problem:

1. For each of the 792 "pasports" rows, resolve (or create) exactly one matching `Product`
   document — this is the load-bearing prerequisite the required+unique `productId` field demands.
   Recommend a human-reviewed matching pass keyed on `наименование`/`Артикул` against the live
   `products` collection, with an explicit "create new Product" path for genuine misses (many
   rows look like one-off custom builds, not catalog products, so a sizeable fraction may need new
   `Product` docs rather than matches).
2. Import the direct field set (`passportNumber`/`date`/`warrantyCode`/`productCode`/`category`/
   `name`/`article`/dimensions/`description`/`installationSite`/`supplier`) as free-text copies —
   this part is mechanical once step 1 is solved.
3. Treat photo migration (225 embedded images → `Photo` entities, referenced from
   `ProductPassport.photo`) as a **separate**, later work item — do not block the tabular import on
   it.
4. Do **not** attempt to upgrade `installationSite`/`supplier` to real `Site`/`Organization`
   references in the MVP — the source data lacks the counterparty/site linkage `Site` requires, and
   `ProductPassport`'s own schema already models these as free text by design.

---

## 6. Ordered implementation plan

**Sequential (each step gates the next):**

1. **DECISION NEEDED batch** — PO/domain owner resolves, in one sitting: (a) `Подал
   заявку`/`Заказчик`/`responsible`/`requestedBy` field assignment; (b) the 5-value status mapping
   including "Оплачено"; (c) whether the 6 "Категория" buckets become real `Category` docs or stay
   informal; (d) whether `SupplyTask` should ever be back-filled from this data (recommendation:
   no — see §5).
2. **Supplier/company normalization pass** — build the one-time name→`Organization` mapping table
   (manual/semi-automated dedup), reviewed by a human before any write.
3. **Backend TZ (small):** add an invoice-number field to `SupplyRequest` (or confirm `notes` is
   acceptable) to stop losing the "№ счета" data on import — a schema-owner decision, not this
   audit's call to make unilaterally.
4. **Supply import script** (one-off, not a general importer) using the resolved mappings from
   steps 1–3, targeting `SupplyRequest` only, per the minimal model in §5.
5. **Product-matching pass for passports** — the load-bearing prerequisite step for Pasports.xlsx;
   likely the single largest effort in this whole plan given 792 rows and sparse articles.
6. **Passport import script** (one-off) using the Product matches from step 5, per §5's minimal
   model — tabular fields only.
7. **Photo migration** (separate, later) — extract the 225 embedded images and re-host them via the
   existing `Photo` entity, then backfill `ProductPassport.photo`.

**Parallel opportunities:**

- Steps 2 (supplier normalization) and 5 (product matching) touch disjoint data and can run fully
  in parallel — different people, different spreadsheets, no shared state.
- Step 3 (backend schema decision/TZ) can be scoped and even implemented in parallel with steps 1–2
  (it's a small, additive field; it doesn't need the normalization pass to be finished first, only
  to be *used* by step 4).
- Step 7 (photo migration) can start at any time independently — it only needs the raw
  `xl/media`/`xl/drawings` extraction, not the tabular import to have landed first, though writing
  the *reference* back onto each `ProductPassport.photo` obviously has to wait for step 6.

## Blockers

1. **BLOCKER — passport↔Product matching.** No passport row carries a `productId`, and the schema
   requires one, unique. Nothing else in the passport pipeline can proceed until this resolution
   method is chosen and executed (manual review is realistic at 792 rows; a fully automatic
   name-similarity match risks silent mis-links to the wrong catalog product).
2. **BLOCKER (soft) — the four overlapping "who/where" free-text columns** (`Подал
   заявку`/`Заказчик`/`responsible`/`requestedBy`) must be resolved by a decision, not inferred by
   this audit, before any supply import writes personal names into a field whose actual intended
   meaning is ambiguous.
3. **Not a blocker, but load-bearing:** the supplier/company name normalization pass (§6 step 2) —
   if skipped, `SupplyRequest.supplierId`/`companyId` would either stay empty (defeating the point
   of a real link) or get populated by an unreviewed automatic match (real risk of merging two
   different real suppliers, or creating duplicate `Organization` docs).

## Checklist

See `docs/agent-checklists/TZ-NX-SUPPLY-PASSPORT-AUDIT.md` — Integrity slot filled, status DONE.
