# TZ-NX-KP-FAMILY-S47-CONVERT-GUARD-UX

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: freebuff executor (agent_id: freebuff)
verification:
  - acceptance criteria: PASS (2/2)
  - typecheck: PASS via `nx build kppdf-web` (angular-compiler, strict)
  - tests: PASS (scoped `proposals-list.page.spec` 25/25 incl. 3 new S47; full app 343 PASS / 2 pre-existing unrelated `registries.catalog.spec`)
  - lint: PASS (scoped eslint `apps/kppdf-web/src/app/pages/proposals/`, 0 problems)
  - kppdf-web build: PASS (exit 0, last command)
  - checklist: ADDED and completed
  - status synchronization: PASS (wave [x], _NOW, QUEUE-LIVE)

## Delivered

- `proposals-list.page.ts` (NX `/proposals`): «В заказ» row CTA now renders only when `row.status === 'accepted' && (row.familyRole ?? 'solo') !== 'variant'`; `convertToOrder()` early-returns for variant rows before any API call (defense in depth). Audit result: the only convert CTA is the row-level one — the family expand panel exposes no convert path, and variant rows are absent from the flat list (S42 `filtered()` excludes `familyRole === 'variant'`).
- Specs: 3 S47 tests in `proposals-list.page.spec.ts` (convert button exists only on the accepted master row, never a variant; `convertToOrder(variant)` invoked directly does not POST/navigate; accepted master still converts and navigates `/orders/:orderId`).
- Docs: `docs/pages/proposals.page.md` NX S47 bullet; `docs/pages/PAGE-TZ-INDEX.md` `/proposals` row updated.

## Gates

- Baseline `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS at `3c74ecd2`.
- Green: scoped jest 25/25 PASS; scoped eslint 0 problems; full app suite 343 PASS.
- Closing `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 (last command).
- Pre-existing boundary (not S47): `registries.catalog.spec.ts` 2 failures at HEAD — stale expectations vs `vat-rate`/`formulas` catalog keys; unrelated clean file.

## Integrity

FIC checked: existing `/proposals` route only; no backend convert / family-role assert changes; no orders-create flow edits. Foreign WIP not in commit.
