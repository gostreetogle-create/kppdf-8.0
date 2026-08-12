# TZD-43 DONE — product proposal category/status contract

- **Closed:** 2026-08-12T00:31:42Z
- **Executor:** Buffy
- **Deploy:** NO
- **Scope:** Desktop/MCP + backend mutation-journal DTO/mapping only

## Root cause

The live Product DTO/schema already supported optional `categoryId` and status
`new|active|archived|draft`, with omitted status defaulting to `new`. The drift was
in `kppdf_propose_product_create`: MCP input and journal payload stopped at
`name/kind/unit/sku/notes`, so category/status never reached the backend.

## Change

- Added optional `categoryId` and the backend status whitelist to
  `ProposeProductCreateDto`.
- Preserved both fields in mutation-journal `product.create` payload mapping, so
  confirm passes them through to `ProductService.create`.
- Added MCP product input validation, payload builder coverage, product domain
  schema fields/status list, and `kppdf_validate_product` checks.
- Updated `desktop/docs/MCP.md` Product path and write-tool contract.
- Kept omitted category/status backward-compatible; no category API or backfill.
- Updated Feature Integration Checklist §E and TZD-43 checklist.

## Gates

- `cd desktop/mcp && pnpm test` — 31 suites / 105 tests PASS
- `cd desktop/mcp && pnpm exec tsc --noEmit` — PASS
- `cd backend && pnpm test -- mutation-journal` — 2 suites / 26 tests PASS
- `cd backend && pnpm exec tsc --noEmit` — PASS
- `git diff --check` — PASS
- Prettier — N/A: no Prettier binary declared/installed in backend or desktop/mcp

## Integrity / scope

- FIC §E updated for TZD-43.
- No frontend product forms, category API, mass backfill, TZD-44/45, production
  cleanup, or deploy changes.
