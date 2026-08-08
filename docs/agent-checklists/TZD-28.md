# TZD-28 checklist

> Status: **DONE** (archived 2026-08-08)
> Claim: agent_id buffy-desktop-ex · workspace D:\kppdf-8.0 (worktree) · team_room unavailable
> Preflight: `_active/` empty; endpoints verified (/api/doc-types, /api/document-template-categories, /api/document-templates; create has notes + isActive/isDefault).

## Executor report

- NEW doc-tools.ts (4 tools) + register в tools.ts; draft create безопасен (isActive/isDefault=false,
  notes [AI-DRAFT], без set-default); MCP.md doc-draft protocol. Gates: MCP tsc; MCP test 60/60.
- Known limits: наполнение блоков — руками менеджера (TZD-29 todo).

> Status: **READY** · Source: `tasks/_backlog/desktop/TZD-28-doc-constructor-mcp.md`

## Claim slot
- agent_id:
- claimed_at:
- workspace:

## Acceptance
- [ ] doc list/create_draft MCP tools
- [ ] draft not isDefault
- [ ] MCP.md protocol
- [ ] Gates PASS → archive
