# TZD-30 checklist

> Status: **READY** · Wave: DESKTOP-DOC-TEXTS  
> Source: `tasks/_backlog/desktop/TZD-30-text-block-mcp-drafts.md`

## Claim slot
- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0 main

## Acceptance
- [ ] MCP: categories list, blocks list, category create, create_draft
- [ ] Draft: isActive=false, tags ai-draft, name «Черновик ИИ — …»
- [ ] Todo href `/doc-constructor/texts?editId=<id>` or explicit todoError
- [ ] No notes field; no overwrite; 409/pre-check on slug/name
- [ ] Tests + audit note; mcp-runtime not edited as peer

## Gates
- [ ] `cd desktop/mcp && pnpm test`
- [ ] `cd desktop/mcp && pnpm exec tsc --noEmit`

## Closeout
- [ ] Archive + lock + progress + wave checkpoint
- [ ] Commit/push; deploy NO
