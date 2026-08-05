# TZ-CATALOG-312 checklist

> Status: **DONE**
> Source: `tasks/_backlog/catalog/TZ-CATALOG-312.md`

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-05T21:00:00Z
- closed_at: 2026-08-05T21:45:00Z
- workspace: D:\kppdf-8.0

## Acceptance

- [x] Material detail page at `/materials/:id` following product/module detail pattern
- [x] Stock link to `/storage-items?materialId=:id`
- [x] Where-used backlinks section (API 310)
- [x] RU UI, empty states, back-to-list navigation
- [x] FE tsc + focused tests PASS

## Gates (fact)

- [x] `cd frontend && pnpm exec tsc --noEmit --project tsconfig.app.json` — PASS
- [x] `cd frontend && npx jest -- material-detail` — 6/6 PASS
