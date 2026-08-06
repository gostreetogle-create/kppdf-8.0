# TZD-16 — Web pairing download installer

STATUS: CLAIMED / IN PROGRESS
LAYER: 2

## Scope

Add the installer download action to the existing web pairing dialog, document the download/install/pair flow, and verify the local desktop bundle build without committing binaries.

## Claim slot

- agent_id: `agent-796e2f8bba` / Buffy `openai/gpt-5.6-luna`
- claimed_at: `2026-08-06T17:54:46Z`
- workspace: `D:\\kppdf-8.0\\.freebuff\\worktrees\\4e0737af-9c57-4b50-8947-647df49ab6ee`
- team_room_claim: `unavailable` — shared Team Room contains stale TZD-15 owner; no TZD-16 task registered yet

## Conflict keys

- `frontend/src/app/pages/desktop/pairing-dialog.component.ts`
- `frontend/src/app/pages/desktop/pairing-dialog.component.spec.ts`
- `desktop/.gitignore`
- `desktop/docs/PAIRING.md`
- `desktop/README.md`
- `deploy/synology/README.md` (static path/config injection note)
- `deploy/synology/deploy.py` (runtime URL injection)
- `deploy/synology/config.env.example` (optional DESKTOP_DOWNLOAD_URL)
- `frontend/src/index.html` (runtime marker)
- `tasks/_active/TZD-16.md`
- `docs/agent-checklists/TZD-16.md`
- `progress.md`
- `tasks/_archive/2026-08/TZD-16.done.md`
- `.mimocode/locks/TZD-16-*.lock`
- `deploy/synology/config.env.example`

## Explicit exclusions

- No `desktop/src/**` inbox/MCP changes; TZD-15 is landed on `origin/main`.
- No installer binaries in git.
- No production, catalog, warehouse, or SoT write changes.
