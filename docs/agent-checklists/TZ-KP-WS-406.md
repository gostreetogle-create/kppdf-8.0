# TZ-KP-WS-406 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-KP-WS-406.md`
> Commit/push: после gates

## Claim slot

- agent_id: freebuff-1
- claimed_at: 2026-08-23T16:34:26+0300
- workspace: D:\kppdf-8.0
- team_room_claim: yes

## Preflight

- [x] git rev-parse --show-toplevel → D:\kppdf-8.0
- [x] `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (406, geometry, rail-ia, mcp-supplier-audit)
- [x] Claim slot заполнен; `tasks/_active/TZ-KP-WS-406.md` на месте

## Acceptance (из TZ-406)

- [ ] MCP draft creates template + import todo with workspace href
- [ ] Workspace shows AI-draft templates in picker (filter/badge)
- [ ] Pairing CTA reachable from workspace
- [ ] BE unit for new fields PASS
- [ ] `cd backend && pnpm exec tsc && pnpm test -- document-template` PASS
- [ ] FE tsc + lint PASS

## Integrity slot

- [ ] Тип: module + MCP
- [ ] page.md / PAGE-TZ-INDEX обновлены (kp-workspace.page.md § template-from-file)
- [ ] desktop/docs/MCP.md patched (template-from-file workflow, MVP no parser)

## Gates (факт)

- команды + PASS/FAIL (заполнить)

## Executor report

- что сделано / conflict disclosure / known limits (заполнить)

## Closeout

- [ ] archive + remove `_active`
- [ ] commit+push
- closed_at: _(ISO)_
