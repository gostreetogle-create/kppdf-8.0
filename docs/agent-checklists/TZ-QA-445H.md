# TZ-QA-445H checklist

> Status: **DONE** (no code change — diagnosis only)
> Marker: pending archive — `tasks/_archive/2026-08/TZ-QA-445H.done.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-27T18:39:05Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight Check Output

- **Context read:** `desktop/src/core/mcpHost.ts` (`resolveMcpHostDir`,
  `readPackageNameAt`, `McpHostController.start`), `desktop/mcp/package.json`,
  `desktop/src-tauri/capabilities/default.json` (`fs:scope`),
  `desktop/docs/INSTALL.md`, `desktop/docs/MCP.md`
- **Key Constraints:** diagnose first, do not invent installer product; do
  not change `KPPDF_MCP_HOST_DIR` resolution mechanics if the cause is a
  local/known-setup gap
- **Planned Deliverable:** diagnosis + confirmation whether existing docs
  already cover the fix
- **Validation Path:** read of detection code + capabilities scope + both
  MCP docs; cross-check against the fix commit that introduced this exact
  error path

## Diagnosis

- `desktop/mcp/package.json` on `main` is well-formed: `name` is exactly
  `@kppdf/desktop-mcp` (the value `McpHostController.start()` checks for).
  No package/path corruption on this checkout.
- `desktop/src-tauri/capabilities/default.json` already whitelists exactly
  `D:/kppdf-8.0/desktop/mcp` (+ `/**`) in `fs:scope`, alongside `$RESOURCE`.
  This entry (and the whole "package.json name must match" guard in
  `mcpHost.ts`) was added by `ca035847` (2026-08-11) — **before** the PO's
  screenshot batch (2026-08-26 evening). So the guard/scope were not new or
  half-applied at the time of the report.
- `resolveMcpHostDir()` walks up from `resourceDir()` and, in a `tauri dev`
  session started from `D:\kppdf-8.0\desktop`, will hit
  `D:\kppdf-8.0\desktop\mcp` a few levels up (`target/debug` → `target` →
  `src-tauri` → `desktop`); combined with the fs scope entry and the correct
  `package.json` name, that path resolves cleanly in dev today — the error
  is **not reproducible** for a `tauri dev` session on this checkout.
- The error text PO saw (`Каталог MCP «D:\kppdf-8.0\desktop\mcp» — не пакет
  ...`) matches the exact wording `mcpHost.ts` emits when
  `resolveMcpHostDir()`'s walk finds nothing and falls back to the "legacy"
  path built from `resourceDir()`'s NSIS-install ancestry
  (`resource → parent1 → parent2 → desktopDir` + `mcp`). That fallback path
  only happens to equal `D:\kppdf-8.0\desktop\mcp` when the app being run is
  an **installed NSIS build**, not `tauri dev` — and per `INSTALL.md`/`MCP.md`,
  installed builds do **not** bundle an MCP resource yet (`sidecar пока не
  поставляется`), so they can never find a valid `desktop/mcp` package
  on-disk unless `KPPDF_MCP_HOST_DIR` is set explicitly.
- Conclusion: this is expected, by-design behavior for a locally-installed
  KPPDF Desktop.exe run against a dev repo, not a system bug in path/package
  resolution. `desktop/docs/MCP.md` (Env table, `KPPDF_MCP_HOST_DIR` row) and
  `desktop/docs/INSTALL.md` (lines ~102-112, "Если Desktop стартует host не
  из ожидаемой папки") **already** document the exact same canonical value
  (`KPPDF_MCP_HOST_DIR=D:\kppdf-8.0\desktop\mcp`) as the fix, i.e. the AC's
  "setup-шаг documented" branch was already satisfied before this ticket.
- Secondary (unrelated to the reported error) observation: `desktop/mcp/`
  has no installed `node_modules` on this checkout (`pnpm install` was never
  run inside `desktop/mcp` specifically — `desktop`'s own `pnpm install`
  does not cascade into it, it's not a pnpm workspace). This would surface
  as a **different** failure (spawn/module-not-found once host dir
  detection passes), not the "not a package" error reported here. Not in
  scope per TZ (`НЕ: не менять механику, если проблема локальная`) — flagged
  for whoever next runs MCP host in dev on a fresh clone.

## Acceptance

- [x] Reproduced/explained: error is the documented NSIS-installed-build
      limitation (no MCP sidecar yet), not a path/package resolution bug —
      confirmed by capabilities scope, package.json content, and detection
      code all matching the fallback-path branch, not the "corrupt package"
      branch.
- [x] Setup step already documented (`INSTALL.md` + `MCP.md`,
      `KPPDF_MCP_HOST_DIR=D:\kppdf-8.0\desktop\mcp`) matching the error's own
      suggested workaround verbatim — no doc gap to fill.
- [x] `KPPDF_MCP_HOST_DIR` resolution mechanics untouched, per TZ "НЕ".

## Integrity slot (до READY / archive)

- [x] Тип изменения: diagnosis-only, no product code change
- [x] FIC §A–E N/A (нет нового route/permission/module/MCP behavior change); §F N/A
- [x] docs/pages N/A — no behavior changed, docs already correct
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только чтение
      `desktop/src-tauri/**`, `desktop/mcp`)
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates / Executor report

- No code changed → no new tsc/jest run required.
- Archive: `tasks/_archive/2026-08/TZ-QA-445H.done.md`
- Lock: `.mimocode/locks/TZ-QA-445H-desktop-mcp-package-error.lock`
- Deploy: NO

## Executor report (auto)

- Outcome: **DONE** — no code change; confirmed known/documented limitation,
  not a bug
- Diagnosis: reported error only occurs for an **installed NSIS** Desktop
  build (which has no MCP sidecar yet), not for `tauri dev`; on this
  checkout `desktop/mcp/package.json` is correct and `fs:scope` already
  whitelists the exact path, so dev resolution works. The fallback error
  path is what PO saw, and its suggested fix (`KPPDF_MCP_HOST_DIR=D:\kppdf-8.0\desktop\mcp`)
  is already documented in `INSTALL.md`/`MCP.md`.
- closed_at: 2026-08-27T19:05:00Z
- Archive: tasks/_archive/2026-08/TZ-QA-445H.done.md
- Deploy: NO
