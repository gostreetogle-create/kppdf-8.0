# TZ-NX-SALES-S30-CURRENCY-RUB — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: claude
source_task: `tasks/TZ-NX-SALES-S30-CURRENCY-RUB.md`
checklist: `docs/agent-checklists/TZ-NX-SALES-S30-CURRENCY-RUB.md`
lock_file: `.mimocode/locks/TZ-NX-SALES-S30-CURRENCY-RUB.lock` (local; ignored by Git)

## Outcome

- `DEFAULT_CURRENCIES` now contains RUB only.
- Existing USD/EUR records are retained for historical references and deactivated with `isActive: false`.
- Bootstrap is idempotent: RUB is not recreated when present, and legacy records are never recreated.
- No API, invoice, payment, UI, or production data path was changed.

## Verification

- acceptance criteria: PASS
- focused test: `cd backend && pnpm test -- src/common/seed/currencies.seed.spec.ts --runInBand` — PASS, 2 tests
- typecheck: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- lint: `cd backend && pnpm exec eslint src/common/seed/currencies.seed.ts src/common/seed/currencies.seed.spec.ts` — PASS
- baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; existing Angular budget warnings only
- integrity: PASS; FIC/page/section/coupling entries N/A for existing bootstrap-only change
- review diff: PASS; unrelated dirty worktree files excluded from staging
- status synchronization: wave S30 marked DONE; S31 is next

## Known limitation

Legacy USD/EUR documents remain addressable through retained inactive currency records; the dictionary UI successor is outside this TZ.
