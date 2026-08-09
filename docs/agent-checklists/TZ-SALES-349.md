# TZ-SALES-349 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-SALES-349.md` (removed after closeout)
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-349-quotation-legacy-index-hygiene.md`
> Scope: guarded cleanup of stale unique indexes on `quotations`.

## Claim slot

- agent_id: `buffy`
- claimed_at: `2026-08-09T19:07:29Z`
- workspace: `D:\kppdf-8.0`
- only active TZ: TZ-SALES-349

## Acceptance

- [x] Existing non-canonical unique quotation indexes are logged and dropped safely; drop failures are contained and reported.
- [x] Canonical `_id_`, `number_1`, and `masterId_1_organizationId_1` indexes are retained.
- [x] Migration is idempotent and safe on an empty collection, including a missing namespace.
- [x] Create → soft-delete → create twice succeeds with distinct numbers and live-only list.
- [x] Startup wiring runs the migration after the database connection and logs the inspected/dropped summary.

## Integrity and scope

- [x] Migration and focused unit coverage added.
- [x] Quotation e2e sequence and `/proposals/create` page note updated.
- [x] Foreign WIP `system-role.guard*`, `roles-admin*`, DOC-343/344 and frozen 317/320 scope excluded.
- [x] Deploy not run.

## Gates (fact)

- [x] `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` — PASS.
- [x] `pnpm --dir backend exec tsc -p tsconfig.build.json --noEmit` — PASS.
- [x] migration Jest — 4/4 PASS.
- [x] quotation e2e — 7/7 PASS, including repeated create/delete.
- [x] focused proposal/Create Jest — 21/21 PASS (merged-main regression gate).
- [x] changed-file Prettier and `git diff --check` — PASS.

## Browser self-verify

- [x] Headless browser authenticated against the running canonical main app without repeated login attempts after rate-limit protection engaged.
- [x] Browser-context API scenario: `POST /api/quotations` → `DELETE` → two further `POST`s returned `[201, 200, 201, 201]`.
- [x] Numbers were distinct (`QTN-2026-025`, `QTN-2026-026`, `QTN-2026-027`); deleted КП was absent from the list and both live КП remained visible.
- [x] Browser UI `/proposals/create?new=1` opened with Russian «Создать КП» / «Добавить шаблон» copy; no deploy started.

## Executor report

- Implemented a guarded `OnApplicationBootstrap` migration in `DatabaseModule` using the live `quotations` collection.
- It inspects every index, drops only non-canonical unique indexes, tolerates a concurrent disappearance, and does not touch ordinary helper indexes.
- `QuotationService` and `quotation.schema.ts` were not changed; quotation numbering and soft-delete logic remain canonical.

## Closeout

- [x] Archive and lock created; active marker removed.
- [x] Progress and `_active-map` updated.
- [x] Commit and push completed; SHA recorded in the archive after commit.
- closed_at: `2026-08-09T19:18:00Z`
