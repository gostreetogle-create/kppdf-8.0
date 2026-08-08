# TZ-DESKTOP-SOT-301 checklist

> Status: **DONE** · Wave: PARTY-DOCS #7 · Depends: TZ-ORG-ASSETS-302
> Source: `tasks/_backlog/party-docs/TZ-DESKTOP-SOT-301.md`
> Marker: archived in `tasks/_archive/2026-08/TZ-DESKTOP-SOT-301.done.md`
> Commit/push: **REQUIRED** per continuous executor canon.

## Claim slot
- agent_id: agent-3e757640b7
- claimed_at: 2026-08-08T17:22:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — Team Room registry does not contain backlog-only TZ IDs

## Preflight
- [x] Previous TZ-ORG-ASSETS-302 archive, lock, checkpoint, commit and push verified
- [x] `_active/` was empty before this claim
- [x] Foreign `desktop/mcp-runtime/**` is excluded and must not be reconstructed
- [x] TZ-DESKTOP-SOT-301 claim marker created before code/docs changes

## Acceptance
- [x] Audit `desktop/mcp` versus any `mcp-runtime` staging path: only `desktop/mcp` is tracked; runtime staging is absent
- [x] One canonical MCP runtime path is explicit and documented
- [x] Desktop package scripts/host entrypoint point to the canonical path
- [x] TZD-30 tools remain intact
- [x] Desktop MCP build/typecheck/tests pass

## Gates
- [x] Desktop MCP typecheck + tests: 69/69
- [x] Desktop app typecheck/build/check: PASS
- [x] `git diff --check`

## Scope guard
- Do not add new MCP tools.
- Do not touch `desktop/mcp-runtime/**` from another worktree.
- Do not deploy.

## Closeout
- [x] Archive + lock + progress + checkpoint
- [x] Commit/push; deploy NO
