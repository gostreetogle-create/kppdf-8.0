# TZD-41 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-41.md`
> Commit/push: **required by continuous executor; deploy NO**

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy
- claimed_at: 2026-08-12T00:13:21Z
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable — Team Room CLI reported `Unknown task: TZD-41; sync tasks first`

## Preflight

- [x] Worktree fast-forwarded to current `main` (`5c6c3332`); no local product changes before claim
- [x] Прочитан `docs/agent-checklists/_active-map.md` и проверен `tasks/_active/` — чужого claim с MCP conflict keys нет
- [x] Прочитаны TZD-41, MCP audit copies, `GEMINI.md`, executor skill, PO canon and project memory
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-41.md` на месте
- [x] Desktop/MCP dependencies bootstrapped from the repository lockfile

## Acceptance

- [x] Every `kppdf_propose_*` success response exposes top-level `proposalId: string` when a proposal is produced; draft tools use stable draft ids
- [x] Every SoT-create success response exposes top-level `id: string`, normalizing backend `_id` (including `textBlockId`)
- [x] Canonical `kppdf_list_*` names cover materials, products, document types, import tasks and text-block categories; old names remain aliases where applicable
- [x] All registered write/propose/confirm/list/get tools in the conflict-key surface expose `outputSchema`
- [x] `desktop/docs/MCP.md` documents the response envelope and aliases; healthz tool count is 81
- [x] No business REST behavior, frontend, TZD-42/43/45 scope, or production cleanup changes
- [x] Known limitation recorded: the four domain/validate tools in `domain-tools.ts` remain outside this TZ’s conflict-key outputSchema sweep; successor may standardize them with the rest of the registry

## Conflict keys

- `desktop/mcp/src/tool-result.ts`
- `desktop/mcp/src/tools.ts`
- `desktop/mcp/src/write-tools.ts`
- `desktop/mcp/src/read-tools.ts`
- `desktop/mcp/src/commercial-tools.ts`
- `desktop/mcp/src/doc-tools.ts`
- `desktop/mcp/src/import-task-tools.ts`
- `desktop/mcp/src/import-todo-tools.ts`
- `desktop/mcp/src/text-block-tools.ts`
- `desktop/mcp/src/inbox-tools.ts`
- `desktop/mcp/src/stock-tools.ts`
- `desktop/docs/MCP.md`
- `desktop/mcp/src/tool-result.test.ts`

## Integrity slot (до READY / archive)

- [x] Тип изменения: MCP
- [x] FIC §E обновлён (TZD-41 response contract); §A–D N/A — no route, permission, backend module, or domain SoT change
- [x] page.md / PAGE-TZ-INDEX: N/A — no UI route
- [x] SECTION-READINESS: N/A — no user-contour change
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates (факт)

- [x] `cd desktop/mcp && pnpm test` — PASS, 98/98
- [x] `cd desktop/mcp && pnpm exec tsc --noEmit` — PASS
- [x] `git diff --check` — PASS
- [x] Formatting/lint: no Prettier/ESLint script or dependency is configured for `desktop/mcp`; command attempted and reported `prettier not found` (N/A)

## Primary / secondary signal

- Primary: MCP `tools/list` smoke — PASS, 81 tools; selected propose/confirm/material-list/canonical+alias list tools expose `{ok,result,id?,proposalId?}`. Pure propose call returned top-level `proposalId` and structured content.
- Secondary: MCP test 98/98, TypeScript, and diff-check — PASS.

## Executor report (auto)

- Implemented shared envelope/structured content, `_id`→`id`, proposal-id extraction, output schemas on the conflict-key tool surface, and canonical list aliases.
- No backend/REST business logic changed. Known limits: TZD-42 confirm-404, TZD-43 product category, TZD-44 hygiene, TZD-45 production/supply are separate queue items; domain-tool output schemas remain a successor.
- Smoke: `tools/list` count 81; `kppdf_propose_module_create` returned top-level `proposalId`.
- Review: scoped diff reviewed; no secrets or deploy artifacts.

## Closeout

- [x] archive + lock + progress + status synchronization
- [x] remove `_active/TZD-41.md` after archive
- [x] commit and push `main` (closeout pending at checklist write)
- closed_at: 2026-08-12
