# TZ-NX-KP-FAMILY-S45-SYNC

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: freebuff executor (agent_id: freebuff)
verification:
  - acceptance criteria: PASS (4/4)
  - typecheck: PASS via `nx build kppdf-web` (angular-compiler, strict)
  - tests: PASS (scoped `proposals-list.page.spec` 19/19 incl. 4 new S45; full app 337 PASS / 2 pre-existing unrelated `registries.catalog.spec`)
  - lint: PASS (scoped eslint `apps/kppdf-web/src/app/pages/proposals/`, 0 problems)
  - kppdf-web build: PASS (exit 0, last command)
  - checklist: ADDED and completed
  - status synchronization: PASS (wave [x], _NOW, QUEUE-LIVE)

## Delivered

- `proposals-list.page.ts` (NX `/proposals`): «Синхронизировать состав с мастером» (`proposal-family-sync`) shown in the expanded family panel only when the family has variants and `family.master.familyRole === 'master'`. `confirmSyncFromMaster(row)` → `AlertDialogComponent` confirm (RU copy: состав вариантов перезапишется с мастера, `parentDestroyRef: this.destroyRef`) → on confirm `syncFamilyFromMaster(row)` POSTs `PiQuotationsService.syncFromMaster(row._id)`, updates `familyByRow` from the response and toasts «Состав синхронизирован»; cancel → no POST; 400/network error → toast «Не удалось синхронизировать состав» with extracted message, cache unchanged. Solo / variant-less families never expose the CTA (mirrors BE no-op for solo).
- Specs: 4 S45 tests in `proposals-list.page.spec.ts` (CTA visibility gating, confirm → POST + familyVersion bump + success toast, cancel → no POST, error → toast + unchanged cache). No non-null assertions (guarded helper).
- Docs: `docs/pages/proposals.page.md` NX S45 bullet; `docs/pages/PAGE-TZ-INDEX.md` `/proposals` row updated.

## Gates

- Baseline `cd frontend-nx && pnpm exec nx build kppdf-web`: PASS at `36ca2ee3`.
- Green: scoped jest 19/19 PASS; scoped eslint 0 problems; full app suite 337 PASS.
- Closing `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 (last command).
- Pre-existing boundary (not S45): `registries.catalog.spec.ts` 2 failures at HEAD — stale expectations vs `vat-rate`/`formulas` catalog keys; unrelated clean file.

## Integrity

FIC checked: existing `/proposals` route + page docs only; S44 attach dialog and backend sync semantics untouched; no studio editor edits. Foreign WIP not in commit.
