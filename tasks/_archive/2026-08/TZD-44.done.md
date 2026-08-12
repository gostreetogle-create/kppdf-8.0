# TZD-44 DONE — MCP data hygiene

- **Closed:** 2026-08-12T00:36:35Z
- **Executor:** Buffy
- **Deploy:** NO
- **Scope:** Desktop/MCP data hygiene only

## Change

- Added `kppdf_find_duplicates` for material, product, module, and counterparty catalogs.
- Duplicate groups use normalized names and SKU/article; counterparty scans also support INN and return candidate ids plus slim item views.
- Added `kppdf_cleanup_test_data` with exactly one explicit non-empty `namePrefix`, `nameRegex`, or `ids[]` filter (maximum 100 ids).
- Cleanup is fail-closed unless `userOk: true`; `dryRun: true` performs candidate lookup only and reports zero mutations.
- Approved cleanup calls only existing backend DELETE routes, preserving Nest soft-delete/reference guards. No hard delete, collection drop, tenant wipe, or direct production operation was added.
- Added the shared MCP DELETE HTTP helper, registry coverage, mock-fetch regressions, MCP docs, and FIC §E entry.

## Safety / known limitation

Production cleanup was not run. The PO must explicitly say `да, чисти Тест*` before any live cleanup; dry-run remains the first step. Module duplicate discovery is supported, while cleanup targets only entities with existing DELETE handlers: material, product, and counterparty.

## Gates

- `cd desktop/mcp && pnpm test` — 32 suites / 110 tests PASS
- `cd desktop/mcp && pnpm exec tsc --noEmit` — PASS
- `git diff --check` — PASS
- Prettier — N/A: no binary installed in desktop/mcp; existing formatting conventions followed

## Integrity / scope

- FIC §E updated; no UI route/page docs or section-readiness change was applicable.
- Foreign dirty WIP excluded from the TZD-44 commit.
- No frontend, TZD-45 production/supply read, production cleanup, deploy, or hard-delete changes.
