# TZ-PRODUCTS-307 checklist

> Status: **DONE** · Wave: CATALOG-UX-C
> Source: `tasks/TZ-PRODUCTS-307-products-list-hierarchy-preview.md`
> Conflict keys: `products.page.ts`, `products.page.spec.ts`, `docs/pages/products.page.md`

## Claim slot
- agent_id: Buffy (openai/gpt-5.6-luna)
- claimed_at: 2026-08-08T15:35:00Z
- workspace: D:\\kppdf-8.0 main
- team_room_claim: unavailable (task was not synced in CLI)

## Acceptance
- [x] Expand loads `GET /products/:id/tree?maxDepth=2` lazily and caches by product id.
- [x] Preview shows module on the left and direct children with kind badges on the right.
- [x] Nested module/product children can expand locally without leaving `/products`.
- [x] Existing links, row actions, tray styling and table/grid behavior remain intact.

## Gates
- [x] Frontend typecheck: `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit`
- [x] Products page Jest: `pnpm --dir frontend exec jest src/app/pages/products/products.page.spec.ts --runInBand --no-coverage` (21 passed)
- [x] TypeScript lint/format and staged diff review; lint and `git diff --check` passed.

## Closeout
- [x] Archive: `tasks/_archive/2026-08/TZ-PRODUCTS-307.done.md`
- [x] Lock/checkpoint recorded for closeout.
- [x] Commit and push main.

## Note

The list preview remains read-only and capped at depth 2; full composition editing stays on detail pages.
