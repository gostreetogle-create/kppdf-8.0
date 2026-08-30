# TZ-NX-PASSPORT-SUPPLY-DECISIONS — DONE

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29T19:47:04Z
closed_by: claude
mode: analysis-only — no code, schema, API, or `frontend/**`/`backend/**`/`frontend-nx/**` file changed;
`data/*.xlsx` not re-opened (facts reused from the prior read-only audit, re-verified against the
live schema files listed in Sources)

## Purpose

Decision sheet for the PO covering the 11 open questions blocking any `Снабжение.xlsx` /
`Pasports.xlsx` import, per `tasks/TZ-NX-PASSPORT-SUPPLY-DECISIONS.md`. Each item: **FACT** →
**Recommendation** → **PO decision needed** → **data-loss risk**. No decision below has been
applied to code — this is the record the PO signs off on before any import/schema/UI work starts.

---

## 1. `Подал заявку` → какое поле

- **FACT** — column exists only on the **Метизы** (1991 rows) and **Расходники** (998 rows)
  sheets, not on **Снабжение** (997 rows). Holds individual staff names (personal data). No
  `SupplyRequest` field is documented as "who filed this request"; the closest candidate,
  `responsible` (`backend/src/modules/supply/supply-request.schema.ts:101-102`), has no comment
  pinning down its intended meaning.
- **Recommendation** — map `Подал заявку` → `SupplyRequest.responsible` (submitter/person who
  filed the line).
- **PO decision needed** — confirm `responsible` means "who submitted the request" and not "who
  is responsible for fulfilling it" (a different person in practice); also confirm the 152-ФЗ
  posture for storing individual staff names in this free-text field (redact, keep as-is, or gate
  behind a permission).
- **Data-loss risk** — the 997 Снабжение rows have no `Подал заявку` value at all, so
  `responsible` stays empty for ~25% of historical rows regardless of this decision (not fixable
  by mapping choice, just a coverage gap to record). If PO later decides `responsible` means
  something else, every already-imported row's `responsible` value is wrong and needs a full
  re-migration, not a patch.

## 2. `Заказчик` → какое поле

- **FACT** — column exists only on **Снабжение** (997 rows), not on Метизы/Расходники. The
  `SupplyRequest.requestedBy` field's own schema comment already reads *"Кто просил
  (участок/отдел)"* — department/site — which matches "Заказчик" (customer/site) better than a
  personal name.
- **Recommendation** — map `Заказчик` → `SupplyRequest.requestedBy`.
- **PO decision needed** — confirm `Заказчик` values are department/site/internal-project names,
  not external client/counterparty company names. If some values are real external clients, those
  rows need a `Counterparty`/`Site` reference instead of free text — not supported by today's
  schema (per the prior audit, `Site` requires a `counterpartyId` the spreadsheet never records),
  so that would be a separate schema decision, not a mapping choice.
- **Data-loss risk** — the 2989 Метизы/Расходники rows have no `Заказчик` value, so
  `requestedBy` stays empty for ~75% of rows regardless of this decision. If some `Заказчик`
  values turn out to be external clients, importing them as plain text loses the ability to link
  those historical requests to a real `Counterparty`/`Site` record later without re-parsing notes.

## 3. `responsible` → какое поле

- **FACT** — this is an *existing* `SupplyRequest` field (line 101-102), not a spreadsheet
  column; its own comment gives no definition beyond "free text." Per item 1, the only spreadsheet
  data proposed to feed it is `Подал заявку` (Метизы/Расходники only).
- **Recommendation** — formally adopt "submitter of the request" as `responsible`'s definition
  project-wide (not just for this import), so future manual entries in the UI use it consistently
  with the import.
- **PO decision needed** — approve this as the field's permanent meaning (today it is undefined,
  so any UI form using "responsible" today may already disagree with this reading — worth a quick
  check of the current supply UI copy/label before finalizing).
- **Data-loss risk** — none from the import itself; the risk is definitional drift if the UI label
  for `responsible` currently implies a different meaning (e.g. "who to contact about this
  order") — that would surface as confusing/contradictory data post-import, not data loss.

## 4. `requestedBy` → какое поле

- **FACT** — existing `SupplyRequest` field (line 63-65), comment already says *"участок/отдел"*.
  Per item 2, the only spreadsheet data proposed to feed it is `Заказчик` (Снабжение only).
- **Recommendation** — keep `requestedBy`'s existing schema-comment meaning (department/site) as
  the canonical definition; this is the one field of the four with an already-documented intent,
  so it anchors the other three decisions rather than being open itself.
- **PO decision needed** — none, if item 2's premise (Заказчик = department/site) holds. Only
  re-opens if item 2 finds external-client values mixed in.
- **Data-loss risk** — none, contingent on item 2.

## 5. Точная карта 5 Excel-статусов → backend statuses

- **FACT** — spreadsheet has 5 emoji-prefixed values (`⏳ Ожидает`, `✅ Заказать`,
  `⚙️ В работе`, `☑️ Получено`, `💰 Оплачено`); `SupplyRequest.status` has 5 enum values
  (`in_progress`, `requested`, `ordered`, `received`, `cancelled` —
  `supply-request.schema.ts:4-9,79-84`). Equal counts, but not the same 5 concepts:
  `Оплачено` (paid) has no backend equivalent, and `cancelled` has no spreadsheet source at all.
- **Recommendation** — exact mapping table:

  | Excel status | → backend `status` | Note |
  |---|---|---|
  | `⏳ Ожидает` | `requested` | awaiting action, not yet ordered |
  | `✅ Заказать` | `ordered` | clean match per prior audit |
  | `⚙️ В работе` | `in_progress` | clean name match |
  | `☑️ Получено` | `received` | clean match per prior audit |
  | `💰 Оплачено` | `ordered` + note | fold "paid" fact into `notes` (e.g. `"Оплачено (импорт)"`); `cancelled` is never set by import (no source data) — left available for manual use only |

- **PO decision needed** — (a) confirm `Ожидает`→`requested` / `В работе`→`in_progress` are the
  right way round (the two are close in meaning and only the PO/domain owner can say which
  lifecycle stage each spreadsheet emoji actually tracked in practice); (b) confirm `Оплачено`
  handling — fold into `notes` on `ordered` (recommended, no schema change) vs a follow-up backend
  TZ to add a real `paid` boolean/status (bigger, out of scope here).
- **Data-loss risk** — folding `Оплачено` into `notes` loses the ability to filter/report "which
  requests are paid" without parsing free text; if `Ожидает`/`В работе` are swapped from their
  true meaning, every imported row's lifecycle stage is misrepresented in reporting (silent, not
  caught by any validation).

## 6. Карта 6 Excel-категорий → existing Category или оставить текстом

- **FACT** — 6 flat category buckets (`Справочник` columns A–F / J: equipment, purchased goods,
  metal, wood, fasteners, consumables), unrelated in shape to the real `Category` tree
  (`type: 'material'|'product'|'general'`, hierarchical via `parentId`/`fullPath`,
  `backend/src/modules/category/category.schema.ts:15,18-19,23`). No existing `Category` doc is
  confirmed to match these 6 labels 1:1 (would require a live Mongo query, not done here).
- **Recommendation** — do **not** force-map onto the existing `Category` tree from this analysis
  alone. Default for MVP: leave `SupplyRequest.categoryId` unpopulated (matches the prior audit's
  MVP recommendation) and keep the original label as plain text inside `notes` so it isn't
  silently dropped. Only create new `Category` docs if PO explicitly wants queryable buckets, and
  only after a live-data check confirms none of the 6 labels already exist under a different
  spelling.
- **PO decision needed** — pick one: (a) leave `categoryId` empty, label parked in `notes`
  [recommended for MVP]; (b) create up to 6 new `Category` docs (`type: 'general'`) after a
  dedup check against live data.
- **Data-loss risk** — (a) loses category-based filtering/reporting on imported supply lines
  (recoverable later by re-running a categorization pass over `notes`); (b) done without the
  dedup check risks creating duplicate categories that already exist under a different label,
  or filing historical rows under a taxonomically wrong branch that's hard to detect later.

## 7. `№ счета` → notes or отдельное поле

- **FACT** — appears only on Метизы/Расходники, combined with the order date as one free-text
  cell (e.g. `"12.03 №445"`). `SupplyRequest` has no invoice-number field today; adding one is a
  small additive schema change (not made in this analysis-only pass).
- **Recommendation** — add a new `invoiceNumber` field via a small, separate backend TZ, and pair
  it with the already-existing `supplierOrderDate` for the date fragment, rather than putting an
  identifier inside `notes` where it can't be searched/joined.
- **PO decision needed** — approve the additive field (small schema change, needs its own TZ) vs
  accept notes-only storage (searchable only by manual/full-text review).
- **Data-loss risk** — notes-only storage makes the invoice number effectively unqueryable (no
  dedupe-by-invoice, no accounting join); if the value is captured in neither a field nor `notes`
  pending the schema decision, it is lost outright — recommend parking it in `notes` as an interim
  step even before the field decision is finalized, so nothing is dropped while waiting on PO.

## 8. Подтверждение импорта в SupplyRequest, не SupplyTask

- **FACT** — `SupplyRequest` is a standalone quick-order line (no required `orderId`);
  `SupplyTask` requires `orderId` tied to a specific `Order`. No row in either spreadsheet carries
  an order/quotation reference.
- **Recommendation** — import target is `SupplyRequest` only. Do not fabricate synthetic `Order`
  documents to satisfy `SupplyTask.orderId`.
- **PO decision needed** — explicit sign-off; this is a standing recommendation carried over from
  the prior audit, not a new ambiguity — needed as a recorded "yes" before the import script is
  written.
- **Data-loss risk** — none if approved as-is. If PO instead insists on `SupplyTask`, it would
  require inventing thousands of fake `Order` docs — active data fabrication, not a risk to
  mitigate but an approach to refuse.

## 9. Правила сопоставления 792 паспортов с Product

- **FACT** — `ProductPassport.productId` is `required: true, unique: true`
  (`product-passport.schema.ts:8-9`). Zero of the 792 "pasports" rows carry any product reference;
  matching must be done by `наименование`/`Артикул`, and `Артикул` is frequently blank or the
  literal string `#N/A`. Because `productId` is unique, **at most one passport can ever be linked
  to a given `Product` document** under today's schema — if the review finds multiple spreadsheet
  rows genuinely describe the same catalog product, only one can be imported as-is.
- **Recommendation** — a human-reviewed matching pass keyed on name + article against the live
  `products` collection; explicit "create new Product" path for genuine catalog misses; treat the
  literal `#N/A` as no-article, never as a real value. Surface the one-Product-one-passport
  constraint to the reviewer up front so duplicate matches are flagged, not silently dropped or
  overwritten.
- **PO decision needed** — (a) who performs the manual review and the effort budget for 792 rows;
  (b) what happens when N spreadsheet rows resolve to the same catalog `Product` — keep the
  newest/most complete one, or treat the others as evidence the catalog needs N distinct `Product`
  variants (a catalog decision, not an import-script decision).
- **Data-loss risk** — without review, either rows are skipped (losing that passport's data) or an
  automatic name-similarity match mis-links a passport to the wrong catalog product (worse than
  skipping — corrupts a live, referenced document). The unique constraint will reject a second
  passport for an already-matched `Product` at write time; without a decided dedup rule that
  rejection will look like a bug during the import run rather than an expected outcome.

## 10. Правила для строк без Product match

- **FACT** — some fraction of the 792 rows will have no plausible existing catalog `Product`
  (custom, one-off builds are visible in the sampled data). The schema gives no null/optional path
  around `productId`.
- **Recommendation** — two allowed outcomes per unmatched row, chosen by the reviewer: (a) it's a
  real catalog item missing from `products` → create it (reviewed, not auto-created), then link;
  (b) it's a genuine one-off never meant to be reordered → PO decides whether to still create a
  minimal placeholder `Product` to satisfy the FK, or to exclude that passport row from import and
  log it separately as "not imported — no catalog basis."
- **PO decision needed** — pick (a)-always-create / (b)-exclude-one-offs / a hybrid with the
  reviewer using judgment case by case; set the bar for "genuine one-off" vs "missing catalog
  item."
- **Data-loss risk** — excluding rows drops that passport's data as a deliberate, logged exclusion
  (acceptable if decided, harmful if it happens silently); creating throwaway `Product` docs for
  true one-offs pollutes the live catalog with entries no one will ever browse or reorder.

## 11. Подтверждение, что фото импортируются отдельно

- **FACT** — 225 embedded PNGs anchored via `xl/drawings` cover ~28% of the 792 rows (not all).
  `ProductPassport.photo` is a single free-text string (`product-passport.schema.ts:53-54`), not
  built to receive binary/anchor data directly; the repo already has a `Photo` entity used
  elsewhere in the catalog.
- **Recommendation** — confirm photo migration (extract `xl/media` images, re-host through the
  existing `Photo` entity, backfill `ProductPassport.photo` afterward) is a separate, later work
  item that does not block the tabular passport import (items 9–10).
- **PO decision needed** — sign-off on this sequencing (standing recommendation from the prior
  audit, needs an explicit recorded "yes"), and confirmation that photos re-host through the
  existing `Photo` entity rather than a new ad hoc image field.
- **Data-loss risk** — none if sequenced as recommended, provided `data/Pasports.xlsx` (or its
  extracted `xl/media` folder) is preserved untouched until the photo-migration step actually
  runs — if the source file is deleted/overwritten first, the 225 images are lost with no other
  copy on record.

---

## Sources

- `tasks/TZ-NX-PASSPORT-SUPPLY-DECISIONS.md` (spec for this task)
- `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md` (prior read-only xlsx audit — facts
  reused, not re-derived)
- `tasks/_archive/2026-08/TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION.done.md`
- `backend/src/modules/supply/supply-request.schema.ts`
- `backend/src/modules/product-passport/product-passport.schema.ts`
- `backend/src/modules/category/category.schema.ts`

## Checklist

See `docs/agent-checklists/TZ-NX-PASSPORT-SUPPLY-DECISIONS.md` — Integrity slot filled, status
DONE.

## Closeout

- [x] Archive created.
- [x] Active marker removed (`tasks/_active/TZ-NX-PASSPORT-SUPPLY-DECISIONS.md` deleted after this
      file was written).
- closed_at: 2026-08-29T19:47:04Z
