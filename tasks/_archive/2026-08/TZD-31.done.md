# TZD-31 — MCP runtime sync — DONE

- closed_at: `2026-08-10T20:30:00Z`
- agent: `buffy`
- workspace: `D:\kppdf-8.0`
- status: DONE
- wave: WAVE-MCP-GAP-2026-08-10 #1
- scope: tool-name registry export, rich /healthz, `KPPDF_MCP_HOST_DIR` override + package validation in desktop host, restart docs, smoke test.

## Acceptance evidence

- Live smoke `GET http://127.0.0.1:19743/healthz` → `{ ok: true, service: "kppdf-desktop-mcp", port, toolCount: 51, packageVersion: "0.1.0", hostDir: "<abs path>", toolsSample: ["kppdf_list_categories", "kppdf_propose_product_create", "kppdf_ping", …] }`.
- Startup log prints `hostDir` + `tools 51 registered`.
- `listRegisteredToolNames()` aggregates existing `*_TOOL_NAMES` exports + `kppdf_ping` — единый источник, без ручного дублирования (факт toolCount 51 ≥ порога 40; число зафиксировано в AC TZ-файла).
- `KPPDF_MCP_HOST_DIR` (import.meta.env с envPrefix `KPPDF_` / process.env) имеет приоритет над resourceDir walk; `package.json name ≠ @kppdf/desktop-mcp` → RU status error, процесс не спавнится.
- Docs: MCP.md (healthz-схема, «после git pull → Restart MCP», Env-таблица) + INSTALL.md (раздел обновления dev Desktop).

## Gates

- desktop/mcp `pnpm test`: 74/74 PASS (incl. new suites `MCP tool registry (TZD-31)` + `MCP healthz payload (TZD-31)`)
- desktop/mcp `pnpm exec tsc --noEmit`: PASS
- desktop zone `pnpm typecheck` (mcpHost.ts changed): PASS
- Deploy: NO

## Files

- `desktop/mcp/src/tools.ts` — `listRegisteredToolNames()`, `toolsSample()`, `buildHealthzPayload()` + `McpHealthzPayload`.
- `desktop/mcp/src/http-server.ts` — /healthz payload + startup log hostDir/toolCount.
- `desktop/mcp/src/tools-registry.test.ts` — new smoke suite (registry count, key tools, sample, payload).
- `desktop/src/core/mcpHost.ts` — `envMcpHostDir()`, `MCP_PACKAGE_NAME`, `MCP_HOST_DIR_ENV`, package.json validation in `start()`.
- `desktop/vite.config.ts` — envPrefix `['VITE_', 'KPPDF_']`.
- `desktop/docs/MCP.md`, `desktop/docs/INSTALL.md` — restart-after-pull + KPPDF_MCP_HOST_DIR.
- `tasks/TZD-31-mcp-runtime-sync.md` — AC toolCount факт 51.
- checklist `docs/agent-checklists/TZD-31.md`; marker `tasks/_active/TZD-31.md` removed; lock `.mimocode/locks/TZD-31-mcp-runtime-sync.lock`.

## known_limitation

- MSI/packaged Desktop без бандла Node/MCP — dev-limitation (не AC «полный MSI sidecar»).
- Cursor Reload MCP — ручной шаг PO после рестарта host.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10
closed_by: buffy
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: N/A (no lint script in desktop/mcp; tsc strict PASS)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
