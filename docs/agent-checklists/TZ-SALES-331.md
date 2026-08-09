# TZ-SALES-331 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-SALES-331.md`
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-331-kp-deal-price-vat-footer.md`
> Commit/push: **NO** until Cursor/PO visual PASS

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T15:03:14Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room reports unknown task; sync tasks first

## Preflight

- [x] Get-Location + git rev-parse → `D:\kppdf-8.0`; canonical `main` at `ec839925`.
- [x] TZ-SALES-330 DONE and its `_active` marker removed before claim.
- [x] `_active-map` and `_active/` scanned; no competing 331 claim.
- [x] Canon, TZ, and 325/330 behavior read.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS before code.
- [x] `tasks/_active/TZ-SALES-331.md` created.

## Acceptance

- [x] Markup changes only request `previewLines.unitPrice`; Product/listPrice is never PATCHed.
- [x] `dealVatPercent` applies to the whole КП and renders `Итого` plus `в т.ч. НДС` in the footer.
- [x] VAT 0/absent renders only `Итого`; admin table preview has no deal footer.
- [x] No discount column; 330 `tableLayout` and 317 shell remain intact.
- [x] Gates PASS; Cursor/PO visual PASS required before archive.
- [x] `docs/pages/proposals-create.page.md` updated with VAT-inclusive mode and default 20%.

## Integrity slot

- [x] Type: page (`/proposals/create`).
- [x] FIC §A–E / docs integrity reviewed; page contract updated.
- [x] Page doc updated.
- [x] Foreign DOC-343 WIP excluded from commit.
- [x] Canon: `docs/audits/2026-08-09-kp-table-config-canon.md`.

## Gates (fact)

- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- [x] `cd backend && pnpm test:e2e test/e2e/document-templates-build.e2e-spec.ts` — PASS, 10/10
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `cd frontend && pnpm exec jest --config jest.config.js --runInBand src/app/pages/commercial/proposals/proposal-create.page.spec.ts` — PASS, 12/12
- [x] `git diff --check` — PASS
- [x] Frontend Prettier on changed FE files — PASS

## Executor report (auto)

- Effective preview price is rounded to kopecks from immutable catalog base price × clamped markup (−100…1000).
- Inspector adds «НДС %» with fixed MVP default 20 and copy «Меняет цены только в этом КП; каталог не трогаем».
- Build accepts request-only `dealTotals`; backend computes total from preview lines and extracts VAT as `sum × vat / (100 + vat)` for VAT-inclusive prices.
- Footer is appended only to the designated live line-items table; VAT 0 keeps «Итого» and hides the VAT row.
- Admin table preview calls without `dealTotals` remain unchanged; no discount column or Product PATCH was added.
- 330 `tableLayout`, frozen 317 shell, snapshots, quotation persistence, and foreign DOC-343 WIP remain untouched.
- READY FOR REVIEW: visual check required on A4 prices/sums and right-aligned footer.

## Review handoff

- [x] READY FOR REVIEW
- [ ] Do not archive until Cursor/PO visual PASS.

## Closeout (after PASS)

- [ ] archive + lock + progress + remove `_active`
- [ ] Status = DONE
- closed_at: _
