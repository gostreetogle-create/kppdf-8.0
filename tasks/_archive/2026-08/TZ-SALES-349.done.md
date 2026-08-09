# TZ-SALES-349 — DONE

- closed_at: `2026-08-09T19:18:00Z`
- status: **DONE**
- scope: quotation legacy unique-index hygiene only
- feature_sha: `pending closeout commit`
- closeout_sha: `pending closeout commit`
- lock: `.mimocode/locks/TZ-SALES-349-quotation-index-hygiene.lock`

## Outcome

`DatabaseModule` now runs a guarded `quotations` index migration after the Mongo connection is ready. It logs every discovered index and removes only unique indexes outside `_id_`, `number_1`, and `masterId_1_organizationId_1`; ordinary helper indexes remain untouched. Missing collections and concurrent index removal are safe, and a summary is logged without blocking startup.

## Acceptance evidence

- Migration unit Jest: **4/4 PASS** — stale unique drop, canonical/helper retention, empty namespace/idempotency, concurrent disappearance.
- Backend TypeScript: **PASS**.
- Quotation e2e: **7/7 PASS**; create → soft-delete → create twice returned 201/200/201/201, distinct numbers, deleted row hidden.
- Frontend TypeScript: **PASS**; focused proposal/Create Jest **21/21 PASS** on merged main.
- Changed-file Prettier and diff-check: **PASS**.
- Browser self-verify on canonical main: browser-context API repeated create/delete returned `[201,200,201,201]`; numbers were distinct, deleted КП was hidden, both live КП were visible. `/proposals/create?new=1` opened with Russian UI copy.

## Scope disclosure

`quotation.schema.ts`, numbering, soft-delete logic, frozen A4/print 320, and foreign `system-role.guard*`, `roles-admin*`, DOC-343/344 WIP were not changed or staged. Deploy was not run.
