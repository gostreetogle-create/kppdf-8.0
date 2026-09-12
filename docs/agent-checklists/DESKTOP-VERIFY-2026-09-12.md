# DESKTOP FULL VERIFY — 2026-09-12

updated_at: 2026-09-12T15:15:00+03:00  
agent_id: claude  
status: READY  
TZ: `tasks/TZ-DESKTOP-FULL-VERIFY-2026-09-12.md`

## Claim slot

- agent_id:
- claimed_at:
- workspace:

## Gates

- [ ] `cd desktop && pnpm run typecheck`
- [ ] `cd desktop && pnpm run check`
- [ ] `cd desktop && npx tsx --test src/core/*.test.ts src/core/ai/*.test.ts src/importers/*.test.ts src/ai-runner/*.test.ts`
- [ ] `cd desktop && pnpm run build`
- [ ] `cd desktop && pnpm run mcp:check`
- [ ] Backend health (if up) documented
- [ ] Live Ollama/model: PASS or SKIP (honest)
- [ ] desktop_zip status in DEPLOY-READY.md
- [ ] Audit `docs/audits/2026-09-12-desktop-full-verify.md`
- [ ] No release-installer / no deploy

## Integrity

- [ ] Archive TZ
- [ ] Commit + push
- [ ] `_NOW` updated
