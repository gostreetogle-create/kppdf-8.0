# TZD-31 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZD-31.md` (создан при CLAIM)
> Commit/push: yes after DONE (wave policy)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `buffy`
- claimed_at: `2026-08-10T20:05:00Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable`

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0 (worktree `freebuff/kppdf-8-0-wave-mcp-gap-…` при 4a2e7b77, main clean)
- [x] `_active-map` + `tasks/_active/` — нет чужого CLAIM на CONFLICT KEYS
- [x] Прочитал `tasks/TZD-31-mcp-runtime-sync.md` + audit 2026-08-10
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-31.md` на месте

## Acceptance

- [x] healthz: toolCount + toolsSample includes list_categories + propose_product_create
- [x] KPPDF_MCP_HOST_DIR documented + implemented
- [x] Wrong package.json name → clear error
- [x] desktop/mcp tests + tsc PASS
- [x] MCP.md / INSTALL.md updated
- [x] No mcp-runtime commit

## Integrity slot

- [x] Тип: MCP
- [x] FIC: N/A MCP host (no new web page) — one line
- [x] page.md / PAGE-TZ-INDEX: N/A
- [x] SECTION-READINESS: N/A
- [x] Conflict keys only
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- desktop/mcp `pnpm test`: 74/74 PASS (incl. new tools-registry + healthz payload suites)
- desktop/mcp `pnpm exec tsc --noEmit`: PASS
- desktop zone `pnpm typecheck` (tsc --noEmit, mcpHost.ts touched): PASS
- Live smoke: `GET /healthz` → `toolCount: 51`, `toolsSample` = [kppdf_list_categories, kppdf_propose_product_create, …], `packageVersion: 0.1.0`, `hostDir` abs path; startup log prints hostDir + toolCount.
- Deploy: NO

## Executor report (auto)

- Registry: `listRegisteredToolNames()` in tools.ts aggregates existing *_TOOL_NAMES (+ kppdf_ping) — no hand-duplication; actual toolCount 51 ≥ 40.
- healthz payload builder `buildHealthzPayload()` + `toolsSample()` (unit-tested); http-server serves it and logs hostDir/toolCount at start.
- mcpHost: `KPPDF_MCP_HOST_DIR` (import.meta.env KPPDF_ prefix / process.env) overrides resourceDir walk; `package.json` name ≠ @kppdf/desktop-mcp → RU status error, no spawn.
- vite.config: envPrefix adds KPPDF_ for dev Desktop .env.
- Docs: MCP.md (healthz schema, «после git pull → Restart MCP», KPPDF_MCP_HOST_DIR) + INSTALL.md (update section).
- mcp-runtime/** untouched; deploy NO.
- Commit: `930fcbc1b683689d64b1046fa4a8bb9b4502184e`

## Closeout

- [ ] archive `tasks/_archive/2026-08/TZD-31.done.md` + lock
- [ ] progress.md; `_active` removed; Status DONE
- [ ] commit+push; deploy NO
- closed_at: _(ISO)_
