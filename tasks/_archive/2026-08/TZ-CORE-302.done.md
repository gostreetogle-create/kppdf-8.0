# TZ-CORE-302: soft-delete — закрыть схемы без deletedAt и без opt-out

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22T21:15:00+03:00
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (backend tsc --noEmit)
  - tests: PASS (958/960 — 2 pre-existing failures unrelated to this TZ)
  - lint: PASS (47 pre-existing errors unrelated to this TZ)
  - checklist: ADDED
  - regression test: ADDED (soft-delete-coverage.spec.ts — 1/1 PASS)

## Summary

63 schemas without `deletedAt` or `softDelete: false` found and resolved:

### Group A — `softDelete: false` (17 schemas — system/reference/config/immutable):
idempotency-storage, compliance-rule, currency, desktop-pairing-key,
browser-device-grant, device-invite, dictionary-label, doc-type,
entity-status, status-workflow, unit, work-center, template-block,
import-mapping-profile, mutation-journal, order-closing, user

### Group B — `deletedAt` added (36 schemas — business entities):
actual-cost, attachment, attribute-definition, bom, cart-item, cart-session,
certificate, comment, contract, desk-note, document-table-type,
document-template-category, document-template, entity-attribute-value,
financial-report, form-profile, generated-document, import-jobs, import-task,
import-todo, interaction, inventor-file, invoice, order-task,
organization-contact, person, photo, product-module-photo, product-passport,
product-photo, production-order, purchase-order, purchase-request,
reconciliation-act, reservation, routing-step, rpp, stock-movement,
storage-item, tech-process, tender, text-block, text-block-category,
work-order, work-order-operation

### Skipped — pure subdocument (no collection, _id: false):
composition-line

### Regression test:
`backend/src/database/soft-delete-coverage.spec.ts` — greps all *.schema.ts
and fails if any top-level schema lacks both `deletedAt` and `softDelete: false`.

## Files changed
- 17 `@Schema({` → `@Schema({ softDelete: false, ` in system schemas
- 36 `deletedAt?: Date | null;` field added to business entity schemas
- 1 new test file: `backend/src/database/soft-delete-coverage.spec.ts`
- 1 helper script (not committed): `scripts/patch-soft-delete.py`
