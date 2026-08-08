# TZD-23 checklist

> Status: **PARK** (unpark on PO «делай TZD-23»)
> Source: `tasks/_park/desktop/TZD-23-ai-import-matching-hitl.md`
> Audit: `docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md`

## Claim slot

- agent_id:
- claimed_at:
- workspace:

## Preflight

- [ ] Conflict keys vs `_active/`
- [ ] TZD-22 archive present
- [ ] Claim + move/copy to `_active` per project rules

## Acceptance

- [ ] Report PATCH persists `aiReport` + `awaiting_user`
- [ ] MCP `set_report` / `apply_plan` (userOk gate)
- [ ] Fixture: 2 new + 1 update + skip/doubt → 3 proposes
- [ ] MCP.md Variant C protocol
- [ ] Gates PASS (backend tsc, import-task tests, mcp tests)
- [ ] Archive + lock + park README

## Gates (заполнить при close)

```
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
cd backend && pnpm test -- import-task
cd desktop/mcp && pnpm test
```

## Closeout

- [ ] Status = DONE
- closed_at:
