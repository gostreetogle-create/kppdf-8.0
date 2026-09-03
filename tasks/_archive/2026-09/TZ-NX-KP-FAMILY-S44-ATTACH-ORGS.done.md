# TZ-NX-KP-FAMILY-S44-ATTACH-ORGS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: freebuff executor (agent_id: freebuff)
verification:
  - acceptance criteria: PASS (5/5)
  - typecheck: PASS via `nx build kppdf-web` (angular-compiler, strict)
  - tests: PASS (scoped `proposals-list.page.spec|attach-orgs` 19/19; full app 333 PASS / 2 pre-existing unrelated failures in `registries.catalog.spec`)
  - lint: PASS (scoped eslint `apps/kppdf-web/src/app/pages/proposals/`, 0 problems)
  - kppdf-web build: PASS (exit 0, last command)
  - checklist: ADDED and completed
  - status synchronization: PASS (wave [x], _NOW, QUEUE-LIVE)

## Delivered

- `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposal-attach-orgs.dialog.ts` (NEW): Paper & Ink dialog «Несколько фирм» — multi-select Организации (excludes orgs already attached as variants), optional `orgMarkupPercent` per org, confirm disabled on empty selection/orgs, empty-state copy when no orgs available.
- `proposals-list.page.ts` (NX `/proposals`): CTA «Несколько фирм» (`proposal-attach-orgs`) on solo/master rows → dialog → `PiQuotationsService.attachOrganizations(row._id, { items })` on close-with-result; success updates `familyByRow` cache from the API response + toast «Варианты добавлены»; 400/404 → toast «Не удалось добавить фирмы» with extracted message, cache untouched; cancel/empty → no POST. Added `DestroyRef` injection for `parentDestroyRef` dialog auto-close contract.
- Specs: `proposal-attach-orgs.dialog.spec.ts` (3 tests) + 5 S44 tests in `proposals-list.page.spec.ts` (CTA only on solo/master; dialog data excludes existing variants; POST payload + cache + toast; cancel → no POST; error toast + unchanged state). Mock `DialogRef.close(v)` now writes the `closed` signal like the real service.
- Docs: `docs/pages/proposals.page.md` NX S44 bullet; `docs/pages/PAGE-TZ-INDEX.md` `/proposals` row updated.

## Gates

- Baseline `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS at `4ab75f87`.
- Green: scoped jest 19/19 PASS; scoped eslint 0 problems.
- Closing `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 (last command).
- Pre-existing boundary (not S44): `registries.catalog.spec.ts` 2 failures at HEAD — stale expectations vs `vat-rate`/`formulas` catalog keys; unrelated clean file.

## Integrity

FIC checked: existing `/proposals` route + page docs only; no new route/permission/module/MCP/capability; no backend or legacy `frontend/` edits. Foreign WIP not in commit.
