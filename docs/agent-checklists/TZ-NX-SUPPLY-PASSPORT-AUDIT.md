# TZ-NX-SUPPLY-PASSPORT-AUDIT checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md`
> Mode: **analysis-only** — no code/schema/API changed; xlsx files read-only.

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T19:36:41Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `_NOW.md` + `tasks/_active/` — empty at claim time, no conflicting claim
- [x] Confirmed no native xlsx reader available (`openpyxl`/`pandas` absent); used
      `System.IO.Compression.ZipFile` read-only OOXML extraction instead (documented as a Method
      note in the active TZ)
- [x] `data/Снабжение.xlsx` — all 4 sheets' names, headers, and sample rows extracted
- [x] `data/Pasports.xlsx` — all 3 sheets' names, headers, and sample rows extracted; confirmed
      225 embedded images (`xl/media/*`) explain the file's 30MB size (per-row "Фото" attachments)
- [x] Backend schemas read/re-confirmed: `material.schema.ts`, `product-module.schema.ts`,
      `product.schema.ts`, `unit.schema.ts`, `organization.schema.ts`, `storage-item.schema.ts`,
      `supply-request.schema.ts`, `supply-task.schema.ts`, `order.schema.ts` (top-level fields),
      `quotation.schema.ts` (QuotationItem), `product-passport.schema.ts`, `site.schema.ts`,
      `counterparty.schema.ts`
- [x] Confirmed no dedicated `Supplier` collection exists — `Organization`/`Counterparty` with
      `type: string[]` including `'supplier'` is the real model
- [x] Confirmed `frontend-nx/libs/data-access/**` has no supply/passport/organization/storage-item
      slice today — any NX work here starts from zero, no existing groundwork to reuse
- [x] Claim slot filled; `tasks/_active/TZ-NX-SUPPLY-PASSPORT-AUDIT.md` on disk

## Acceptance

- [x] Sheet-by-sheet purpose documented for both files
- [x] Full field-by-field mapping table (spreadsheet → entity.field) with FACT/DERIVED/GAP/
      DECISION NEEDED/MIGRATION RISK tags
- [x] Mandatory fields, dictionaries, suppliers, purchase lines, stock, statuses, relations,
      passport fields all identified
- [x] Minimal supply model and minimal passport model specified
- [x] Ordered implementation plan, parallelization, blockers given
- [x] No personal data (names, phone numbers) or secrets copied into the report — only structural
      observations and non-personal example values (company/product names)
- [x] No code, schema, or API changed; xlsx files opened read-only (`ZipFile.OpenRead`)

## Integrity slot

- [x] Тип изменения: analysis-only (docs/archive)
- [x] FIC §A–E: N/A — no product behavior changed
- [x] page.md / PAGE-TZ-INDEX: N/A — not touched
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys: read-only, nothing under
      `frontend/**`/`backend/**`/`frontend-nx/**` touched; `data/*.xlsx` opened read-only
- [x] Coupling map: N/A
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- Analysis-only — no build/test/lint run, no code/schema/API changed. `git status --short` after
  work shows changes only under `tasks/**` and `docs/agent-checklists/**`; `data/*.xlsx` untouched
  (verified byte-identical — read via `ZipFile.OpenRead`, never opened for write).

## Auditor report

Full findings in `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md`. Headline:
`data/Pasports.xlsx`'s "pasports" sheet maps almost 1:1 onto the existing `ProductPassport` schema
(passportNumber/date/warrantyCode/productCode/category/name/article/height/length/width/weight/
description/installationSite/supplier) — but `ProductPassport.productId` is required+unique
(one real `Product` per passport), while the spreadsheet has **zero** product references, only
duplicated free-text name/dimensions — the central migration blocker for passports is
product-matching/creation, not schema gaps. `data/Снабжение.xlsx` maps closely onto the existing
`SupplyRequest`/`SupplyTask` schemas and the "supplier = Organization with type⊇['supplier']"
pattern already in place, but its status vocabulary (5 emoji-prefixed free-text values including
"Оплачено") doesn't fully align with `SupplyRequest.status`'s fixed 5-value enum, its "Категория"
column is a flat ad-hoc bucket list unrelated to the real `Category` tree, invoice number+date are
combined in one free-text cell, and there is no price/cost column at all. **Outcome: PASS** — no
backend/frontend/frontend-nx work was needed or attempted; this is a pure data/schema-fit audit.

## Closeout

- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T19:36:41Z
