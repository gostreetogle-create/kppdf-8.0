# TZ-NX-SALES-S37-QUOTATION-CONVERT

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (data-access + app)
  - tests: PASS (service HTTP contract 3/3; proposals page 3/3)
  - lint: PASS for S37-owned files
  - kppdf-web build: PASS (exit 0)
  - checklist: ADDED and completed
  - progress.md: REDIRECTED; live state synchronized in `_NOW.md`
  - status synchronization: PASS

## Delivered

- `PiQuotationsService.convertToOrder(id)` → `POST /quotations/:id/convert-to-order`, response typed `{ orderId }` (body `null`); HTTP contract regression added.
- Proposals list: `В заказ` button (`proposal-convert-order`) only on `accepted` rows; success → `/orders/:orderId`; failure → toast, stay; `convertingId` prevents double-click.
- New `proposals-list.page.spec.ts` (3 tests: button visibility, success navigation, failure toast).
- Synchronized `docs/pages/proposals.page.md` (S37 bullet).

## Gates

- Focused Jest: PASS (service 3/3, page 3/3).
- Typechecks: PASS (data-access tsconfig.lib + app tsconfig.app).
- Scoped ESLint: PASS.
- `nx build kppdf-web`: PASS, final gate.

## Integrity

No new route/PAGE_KEY/permission; action on the existing proposals page. Family API, stub-proposal, convert-to-contract untouched. Foreign WIP excluded from the commit.