# TZ-NX-KP-FAMILY-S46-VARIANT-STUDIO

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: freebuff executor (agent_id: freebuff)
verification:
  - acceptance criteria: PASS (2/2)
  - typecheck: PASS via `nx build kppdf-web` (angular-compiler, strict)
  - tests: PASS (scoped `proposals-list.page.spec` 22/22 incl. 3 new S46; full app 340 PASS / 2 pre-existing unrelated `registries.catalog.spec`)
  - lint: PASS (scoped eslint `apps/kppdf-web/src/app/pages/proposals/`, 0 problems)
  - kppdf-web build: PASS (exit 0, last command)
  - checklist: ADDED and completed
  - status synchronization: PASS (wave [x], _NOW, QUEUE-LIVE)

## Delivered

- `proposals-list.page.ts` (NX `/proposals`): variant rows inside the expanded family panel now render «В студии» (`proposal-member-open-studio`) → `openVariantInStudio(member)` → shared private `openQuotationInStudio(quotationId, studioDocumentId?)`. Navigation prefers an existing studio document bound to that quotation id (`linkedQuotationId`/`context.quotationId`, → `/studio/:docId`); otherwise opens `/studio` with `?quotationId=<variantId>`. Row-level `openInStudio` refactored onto the same helper with identical behavior (S20/S37 pattern preserved).
- Specs: 3 S46 tests in `proposals-list.page.spec.ts` («В студии» visible per variant; fallback nav uses the variant id — never the master; linked studio-doc nav when the variant already has one). Studio-doc list passed at setup since the page loads it on init.
- Docs: `docs/pages/proposals.page.md` NX S46 bullet; `docs/pages/PAGE-TZ-INDEX.md` `/proposals` row updated.

## Gates

- Baseline `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS at `6b77407f`.
- Green: scoped jest 22/22 PASS; scoped eslint 0 problems; full app suite 340 PASS.
- Closing `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 (last command).
- Pre-existing boundary (not S46): `registries.catalog.spec.ts` 2 failures at HEAD — stale expectations vs `vat-rate`/`formulas` catalog keys; unrelated clean file.

## Integrity

FIC checked: existing `/proposals` + `/studio` routes only; no backend, no studio-editor internals, no attach/sync dialog changes. Foreign WIP not in commit.
