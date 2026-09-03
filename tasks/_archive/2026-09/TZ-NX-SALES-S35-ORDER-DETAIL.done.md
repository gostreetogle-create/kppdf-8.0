# TZ-NX-SALES-S35-ORDER-DETAIL

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`apps/kppdf-web/tsconfig.app.json --noEmit`)
  - tests: PASS (focused detail/list/route-paths; 3 suites / 16 tests)
  - lint: PASS for S35-owned files
  - kppdf-web build: PASS (exit 0; existing Angular warnings)
  - checklist: ADDED and completed
  - progress.md: REDIRECTED; live state synchronized in `_NOW.md`
  - status synchronization: PASS

## Delivered

- Added the `/orders/:id` NX order card (`order-detail.page.ts`) + route children under the existing `/orders` route.
- Card reads `PiOrdersService.getById()` (`GET /api/orders/:id`): number, Russian status banner, counterparty/site meta, items (name × qty), quotation chip or «Без КП».
- Paid toggle → `PATCH { isPaid }` via `PiOrdersService.update()`; optimistic mirror signal with revert: on failure toast + direct checkbox re-assert («isPaid не врёт»).
- `quotationId` → quotation number + «КП в студии» → `/studio?quotationId=` (proposals pattern); no stub-proposal anywhere in the NX page.
- S34 list rows now link `Карточка` → `/orders/:id`; shared `order-status.ts` labels; route-paths spec asserts `/orders/:id`.
- Synchronized `docs/pages/orders.page.md` («NX order detail (S35)»).
- PAGE-TZ-INDEX intentionally untouched: it carries foreign WIP hunks; S35 adds no new page key.

## Gates

- Focused Jest: PASS, 3 suites / 16 tests.
- App typecheck: PASS.
- S35-owned ESLint scope: PASS, 0 errors.
- `nx build kppdf-web`: PASS, final gate.

## Integrity

FIC §A completed as a route child under the existing `/orders` entry; no new PAGE_KEY/permission/seed. SECTION-READINESS and COUPLING-MAP N/A (S31 row already covers list/card payment coupling). Foreign WIP (including PAGE-TZ-INDEX hunks) excluded from the commit.