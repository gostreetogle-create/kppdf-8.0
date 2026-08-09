# TZ-SALES-331 checklist

> Status: **DONE**
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-331-kp-deal-price-vat-footer.md`
> Archive: `tasks/_archive/2026-08/TZ-SALES-331.done.md`

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T15:03:14Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room reports unknown task; sync tasks first

## Acceptance

- [x] Markup changes only request `previewLines.unitPrice`; Product/listPrice is never PATCHed.
- [x] `dealVatPercent` applies to the whole КП and renders `Итого` plus `в т.ч. НДС` in the footer.
- [x] VAT 0/absent renders only `Итого`; admin table preview has no deal footer.
- [x] No discount column; 330 `tableLayout` and 317 shell remain intact.
- [x] Cursor/PO visual PASS: A4 shows the totals/VAT footer and markup changes the displayed figures.
- [x] `docs/pages/proposals-create.page.md` updated with VAT-inclusive mode and default 20%.

## Integrity slot

- [x] Type: page (`/proposals/create`).
- [x] FIC §A–E / docs integrity reviewed; page contract updated.
- [x] Foreign DOC-343 WIP excluded from commit.
- [x] Canon: `docs/audits/2026-08-09-kp-table-config-canon.md`.

## Gates (fact)

- [x] Backend tsc — PASS
- [x] Document-build e2e — PASS, 10/10
- [x] Frontend tsc — PASS
- [x] Proposal-create Jest — PASS, 12/12
- [x] Frontend Prettier — PASS
- [x] `git diff --check` — PASS

## Executor report (auto)

- Implementation commit: `25512c2a` (`Add deal pricing and VAT footer to KP preview`), pushed to `origin/main`.
- Effective preview price is rounded to kopecks from immutable catalog base price × clamped markup (−100…1000).
- Inspector adds «НДС %» with fixed MVP default 20 and copy «Меняет цены только в этом КП; каталог не трогаем».
- Build accepts request-only `dealTotals`; backend computes total from preview lines and extracts VAT as `sum × vat / (100 + vat)` for VAT-inclusive prices.
- Footer is appended only to the designated live line-items table; VAT 0 keeps «Итого» and hides the VAT row.
- Admin table preview calls without `dealTotals` remain unchanged; no discount column or Product PATCH was added.
- 330 `tableLayout`, frozen 317 shell, snapshots, quotation persistence, and foreign DOC-343 WIP remain untouched.
- PO visual PASS received: `Итого`/НДС is visible on the sheet and markup moves the displayed figures.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-09T15:35:06Z`
