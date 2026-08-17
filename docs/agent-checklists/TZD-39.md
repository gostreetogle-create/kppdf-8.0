# TZD-39 checklist

> Status: **DONE**
> Marker: archive-only closeout (code pre-landed on main)
> Commit/push: docs-only closeout; no product diff

## Claim slot

- agent_id: executor-subagent
- claimed_at: 2026-08-16T23:45:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (archive-only verify)

## Acceptance

- [x] Nest: pairing key from `X-Access-Token` or Bearer
- [x] Desktop api: `X-Access-Token` + optional Basic; подъезд fields in UI
- [x] MCP backend: `X-Access-Token` + `KPPDF_HTTP_BASIC_USER/PASS`
- [x] mcpHost прокидывает Basic в env
- [x] revoke = hard delete; list только active
- [x] Copy рядом с «Выпустить ключ»
- [x] Warm deploy — deferred PO swarm (satisfied-by-upcoming-swarm-deploy)
- [x] Prod smoke Basic+X-Access-Token — deferred PO swarm warm

## Integrity slot

- Тип: MCP + desktop + backend guard (pre-landed)
- FIC: N/A — no product edits this session
- page.md: N/A — no new routes
- Coupling map: N/A

## Gates (факт)

| Gate | Result |
|------|--------|
| `backend` tsc --noEmit | PASS |
| `backend` jest desktop-pairing | 7/7 PASS |
| `frontend` jest pairing-dialog | 7/7 PASS |
| `desktop` typecheck + mcp:check | 114/114 PASS |

## Executor report

Verify-only closeout. All AC code paths present on main @ fd31ab5. Archive + lock + specs-dup-root hygiene. No gantt/deploy/wipe.

## Closeout

- [x] archive `tasks/_archive/2026-08/TZD-39.done.md`
- [x] lock `.mimocode/locks/TZD-39-desktop-basic-auth-coexist.lock`
- [x] backlog → `tasks/_archive/2026-08/specs-dup-root/`
- [x] `_NOW.md` updated
- closed_at: 2026-08-16T23:50:00+03:00
