# TZ-NX-SALES-S36-ORDER-CREATE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`apps/kppdf-web/tsconfig.app.json --noEmit`)
  - tests: PASS (focused create/list/route-paths; 3 suites / 16 tests)
  - lint: PASS for S36-owned files
  - kppdf-web build: PASS (exit 0)
  - checklist: ADDED and completed
  - progress.md: REDIRECTED; live state synchronized in `_NOW.md`
  - status synchronization: PASS

## Delivered

- Added `/orders/create` (`order-create.page.ts`) + `Создать заказ` CTA on the list.
- Form loads counterparties (`PiCounterpartiesService.list`), products (`PiProductsService.list({ isActive: true })`), organizations (`PiOrganizationsService.list`).
- Site resolved via `PiSitesService.ensureDefault(counterpartyId)` before POST; failure → banner, order not created.
- `create({ counterpartyId, siteId, items, organizationId?, isPaid?, status: 'draft' })` — no quotationId, no stub-proposal; success → `/orders/:id`.
- Guards: no customer or empty items → no POST.
- Form uses native `(submit)` event (ngSubmit needs FormsModule) with `preventDefault`.
- Synchronized `docs/pages/orders.page.md` («NX order create (S36)»).

## Gates

- Focused Jest: PASS, 3 suites / 16 tests.
- App typecheck: PASS.
- S36-owned ESLint scope: PASS, 0 errors.
- `nx build kppdf-web`: PASS, final gate.

## Integrity

FIC §A completed as a route child under the existing `/orders` entry; no new PAGE_KEY/permission/seed. SECTION-READINESS and COUPLING-MAP N/A. `studio-editor.page.ts` untouched (conflict key). Foreign WIP (including PAGE-TZ-INDEX hunks) excluded from the commit.