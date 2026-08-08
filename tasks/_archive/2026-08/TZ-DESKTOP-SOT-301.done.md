═══════════════════════════════════════════════════════════════
TZ-DESKTOP-SOT-301: Desktop MCP SoT (mcp vs mcp-runtime)
═══════════════════════════════════════════════════════════════

STATUS: DONE · WAVE-PARTY-DOCS #7
DEPENDS ON: TZ-ORG-ASSETS-302 DONE
LAYER: 2–3
CHECKLIST: docs/agent-checklists/TZ-DESKTOP-SOT-301.md
PAGES: n/a (desktop)

РОЛЬ: Desktop maintainer

CONFLICT KEYS:
desktop/mcp/**;
desktop/mcp-runtime/**;
desktop/package.json;
docs/agent-checklists/TZ-DESKTOP-SOT-301.md;

---

## OUTCOME

`desktop/mcp/` is the single MCP source of truth and the only tracked runtime tree.
The Desktop host resolves and starts `desktop/mcp`, package scripts expose
`mcp:typecheck`, `mcp:test`, and `mcp:check`, and the README/MCP/INSTALL docs no longer
present `desktop/mcp-runtime/` as a second source tree. The runtime staging path is absent
from the canonical worktree; installer/sidecar packaging remains an explicit follow-up,
not an untracked duplicate to reconstruct. A stale Desktop shell check was repaired
minimally (`onPortChosen` was removed from the unsupported start options and the inbox
refresh call uses the existing `refreshInbox` function); no MCP tool behavior changed.

## ACCEPTANCE

1. One canonical MCP runtime path: PASS (`desktop/mcp`).
2. Package scripts and host entrypoint point to the canonical path: PASS.
3. TZD-30 tools remain intact: PASS (69 tests).
4. Build/test desktop MCP green: PASS.
5. Installer/sidecar caveat documented without touching foreign runtime WIP: PASS.

## VERIFICATION

- `cd desktop && pnpm mcp:check`: PASS, typecheck + 69/69 tests.
- `cd desktop && pnpm typecheck`: PASS.
- `cd desktop && pnpm check`: PASS, 0 errors and 0 warnings.
- `cd desktop && pnpm build`: PASS (Vite production build; existing dynamic-import warnings only).
- `git diff --check`: PASS.
- Foreign `desktop/mcp-runtime/**`: not present in this worktree; not reconstructed or committed.

## NOT TOUCHED

- No new MCP tools.
- No foreign worktree runtime or generated installer binaries.
- No deploy.

ARCHIVE_MARKER:
outcome: DONE
closed_at: 2026-08-08
closed_by: agent-3e757640b7 (Freebuff executor)
archive: tasks/_archive/2026-08/TZ-DESKTOP-SOT-301.done.md
lock: .mimocode/locks/TZ-DESKTOP-SOT-301-mcp-sot.lock
deploy: NO
