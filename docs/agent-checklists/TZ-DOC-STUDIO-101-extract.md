# TZ-DOC-STUDIO-101-extract checklist

> Status: **DONE**
> Marker: archived Wave 1

## Claim slot

- agent_id: cursor-orchestrator
- claimed_at: 2026-08-28T20:58:00+03:00
- workspace: D:\kppdf-8.0

## Acceptance

- [x] DocumentRenderService extracted; KP build parity (79 tests PASS)
- [x] FE BlockType sync (spacer, parentType?, parentId?)
- [x] Layout parity tests PASS
- [x] builder.page.md updated

## Gates

- backend tsc: PASS
- frontend tsc: PASS
- pnpm test document-template: PASS (79)
- pnpm test template-block-layout: PASS (20)

## Executor report (auto)

- `backend/src/modules/document-render/` — DocumentRenderService + utils + studio adapter (2c)
- `document-template.service.ts` delegates render to DocumentRenderService
- FE `template-block.types.ts` synced
- `template-block-layout-parity.spec.ts` inventory
