# TZD-44 checklist

> Status: **DONE**
> Marker: removed after archive
> Commit/push: **required by continuous executor; deploy NO**

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-12T00:36:07Z
- workspace: D:\\kppdf-8.0 (Freebuff worktree; resulting SHA landed on origin/main)
- team_room_claim: unavailable — Team Room CLI previously reported unknown task; scope guarded by active marker

## Preflight

- [x] Current isolated worktree and Git state verified
- [x] `_active-map.md` and `tasks/_active/` checked; no conflicting TZD-44 claim
- [x] TZD-44, MCP audit copies, executor rules, and existing soft-delete endpoints read
- [x] Scope is Desktop/MCP; no frontend, TZD-45, production cleanup, or deploy
- [x] Active marker existed during implementation and was removed only after archive

## Acceptance

- [x] `kppdf_find_duplicates` groups normalized duplicate name/SKU/INN values and ids
- [x] `kppdf_cleanup_test_data` requires exactly one non-empty explicit filter and `userOk:true`
- [x] `dryRun:true` lists candidates and performs zero mutations
- [x] Approved filtered cleanup calls existing backend DELETE soft-delete handlers only
- [x] MCP.md documents the hygiene protocol and production-cleanup gate
- [x] No hard delete, tenant wipe, or live production cleanup

## Conflict keys

- `desktop/mcp/src/hygiene-tools.ts`
- `desktop/mcp/src/hygiene-tools.test.ts`
- `desktop/mcp/src/tools.ts`
- `desktop/docs/MCP.md`
- `desktop/mcp/src/backend.ts` (small shared DELETE HTTP helper)
- `desktop/mcp/src/tools-registry.test.ts`
- `docs/FEATURE-INTEGRATION-CHECKLIST.md`

## Integrity slot (до READY / archive)

- [x] Тип изменения: MCP data-hygiene tools
- [x] FIC §E updated with the TZD-44 row
- [x] page.md / PAGE-TZ-INDEX: N/A — no UI route
- [x] SECTION-READINESS: N/A — no user-contour change
- [x] Foreign WIP excluded; conflict keys respected
- [x] Canon: `docs/DOCS-INTEGRITY.md`

## Gates (fact)

- [x] `cd desktop/mcp && pnpm test` — 32 suites / 110 tests PASS
- [x] `cd desktop/mcp && pnpm exec tsc --noEmit` — PASS
- [x] `git diff --check` — PASS
- [x] Prettier — N/A: binary not installed in desktop/mcp; code follows existing formatting

## Executor report

- Added read-only duplicate grouping for material/product/module/counterparty using normalized name, SKU/article, and counterparty INN.
- Added gated filtered cleanup with `userOk:true`, exactly one non-empty prefix/regex/id filter, dry-run mode, max 100 ids, and existing backend DELETE endpoints only.
- Added shared MCP DELETE HTTP helper, registry coverage, mock-fetch regressions, MCP docs, and FIC entry.
- Known limitation: no production cleanup is executed; PO must explicitly say `да, чисти Тест*` after TZD-44 before any live operation.

## Closeout

- [x] archive + lock + progress + status synchronization
- [x] remove `_active/TZD-44.md` after archive
- [x] commit and push `main` — recorded below after commit
- closed_at: 2026-08-12T00:36:35Z
