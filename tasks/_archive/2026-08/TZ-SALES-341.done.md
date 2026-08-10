# TZ-SALES-341: Create КП — коммерческие поля документа

PAGES: /proposals/create
PAGE_DOCS: proposals-create.page.md

## Outcome

- Persisted bounded `vatPercent`, `prepaymentPercent`, `productionDays` and `deliveryDays` on Quotations with DTO validation and defaults.
- Server quotation totals now apply per-KP markup before percent/amount discount and clamp the result at zero.
- Build totals carry VAT, discount and timing metadata; the existing A4 footer renders the discounted total and VAT extraction without adding a discount column.
- «Параметры» now has Russian «Документ», «Деньги» and «Сроки» sections with number/title/date/validity, VAT, percent/amount discount, reset, prepayment and lead-time fields. Parent inputs hydrate after F5/edit and autosave carries the fields.
- Existing frozen Create shell and composition path remain intact.

## Verification

- [x] Frontend app tsc: PASS.
- [x] Frontend proposal-create Jest: PASS (26/26).
- [x] Backend build tsc: PASS.
- [x] Backend quotation Jest: PASS (32/32 across quotation suites).
- [x] ESLint: PASS (only two pre-existing `any` warnings in document-template renderer).
- [x] Prettier: PASS on all changed FE/BE files.
- [x] `git diff --check`: PASS.
- [x] Browser-equivalent DOM self-check: PASS in proposal-create suite; live authenticated browser unavailable without backend data stack.

## Known limitations

- Currency remains ₽ by wave BAN.
- PDF/print, recipient, terms, custom lines, multipage, versions and vitrine remain queued.
- Explicit duplicate-number conflict mapping remains the existing API behavior; generated numbers are unchanged.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10
closed_by: Buffy / agent-d2515d7a53
protected_files:
  - backend/src/modules/quotation/quotation.schema.ts
  - backend/src/modules/quotation/dto/create-quotation.dto.ts
  - backend/src/modules/quotation/quotation.service.ts
  - backend/src/modules/document-template/dto/build-document.dto.ts
  - backend/src/modules/document-template/document-template.service.ts
  - backend/src/modules/table-template/table-template.service.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create.page.ts
  - frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts
  - frontend/src/app/shared/services/pi-proposals.service.ts
  - frontend/src/app/shared/services/pi-document-templates.service.ts
  - docs/pages/proposals-create.page.md
verification:
  - acceptance criteria: PASS
  - frontend typecheck/tests: PASS
  - backend typecheck/tests: PASS
  - lint/prettier/diff-check: PASS
  - checklist: UPDATED
notes: No catalog, TableTemplate preset, shell geometry, PDF, deploy, ZIP publish, or foreign WIP changes.
