# TZ-SALES-331 — Create КП price/VAT/footer

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T15:35:06Z

## Implementation

- Feature commit: `25512c2a`
- Request-only effective `previewLines.unitPrice` applies clamped markup to immutable catalog prices.
- Whole-deal VAT defaults to 20%; prices are VAT-inclusive and VAT is extracted as `sum × vat / (100 + vat)`.
- Right-aligned `Итого` / `в т.ч. НДС` renders only below the designated live line-items table.
- VAT 0 keeps `Итого` and hides the VAT row; admin table previews remain footer-free.
- 330 `tableLayout`, frozen 317 shell, snapshots, quotation persistence, and the discount-column ban remain intact.

## Gates

- Backend tsc: PASS
- document-templates-build e2e: PASS 10/10
- Frontend tsc: PASS
- proposal-create Jest: PASS 12/12
- Frontend Prettier: PASS
- diff-check: PASS

## Visual

- Cursor/PO visual PASS received: `Итого`/НДС is visible on the A4 sheet and markup changes the displayed figures.

## Scope

- Foreign DOC-343 / dirty `document-template.service.ts` orientation WIP excluded.
- No Product PATCH, quotation persistence, snapshot changes, discount column, 317 shell rewrite, 320/322, or deploy.
