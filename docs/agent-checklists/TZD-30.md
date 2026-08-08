# TZD-30 checklist

> Status: **DONE** · Wave: DESKTOP-DOC-TEXTS
> Source: `tasks/_archive/2026-08/TZD-30.done.md`

## Claim slot
- agent_id: agent-d782972d63
- claimed_at: 2026-08-08T18:25:54+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Team Room task registry does not contain TZD-30)

## Acceptance
- [x] MCP: categories list, blocks list, category create, create_draft
- [x] Draft: isActive=false, tags ai-draft, name «Черновик ИИ — …»
- [x] Todo href `/doc-constructor/texts?editId=<id>` or explicit todoError
- [x] No notes field; no overwrite; 409/pre-check on slug/name
- [x] Tests + audit note; mcp-runtime not edited as peer

## Gates
- [x] `cd desktop/mcp && pnpm test` — PASS (69 tests)
- [x] `cd desktop/mcp && pnpm exec tsc --noEmit` — PASS
- [x] `git diff --check` — PASS

## Closeout
- [x] Archive `tasks/_archive/2026-08/TZD-30.done.md` + lock + progress + wave checkpoint
- [x] Commit `b76c7ebe` / push to `origin/main`; deploy NO

## Evidence
- `desktop/mcp/src/text-block-tools.ts` registers four tools and sends only TextBlock contract fields.
- `desktop/mcp/src/text-block-tools.test.ts` covers happy path, inactive/tag/name rules, todoError, duplicate pre-check, 409, and missing inputs.
- `docs/audits/2026-08-09-org-assets-vs-ai-text-bootstrap.md` records the manager flow and asset-vault boundary.
- `desktop/mcp-runtime` was not edited.
