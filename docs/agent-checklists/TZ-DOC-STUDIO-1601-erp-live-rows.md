# TZ-DOC-STUDIO-1601 checklist

> Status: **DONE**

## Claim slot

- agent_id: gemini-executor
- claimed_at: 2026-08-29T01:12:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Acceptance

- [x] quotation-items live-read in preview for draft + context.quotationId
- [x] Finalize bakes snapshot rows into dataSets
- [x] BE + FE tsc PASS; studio tests PASS

## Gates

```bash
cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test studio-document
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
```
