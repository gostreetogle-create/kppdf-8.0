# TZ-CATALOG-311 — Unified CompositionTree + CompositionEditor

> Active execution marker. Source of truth: `tasks/_backlog/catalog/TZ-CATALOG-311.md`.
> Canon: `tasks/TZ-CATALOG-300.md` §3 depth/cycles, §4 CompositionLine.

## Status
CLAIMED / IN PROGRESS

## Claim slot

- agent_id: `agent-796e2f8bba` / Buffy `openai/gpt-5.6-luna`
- claimed_at: `2026-08-06T16:51:25Z`
- workspace: `D:\kppdf-8.0` (Freebuff execution worktree rebased onto `origin/main` `407b0de`)
- team_room_claim: unavailable — local Team Room task index does not expose TZ-CATALOG-311

## Scope

Shared CompositionTree + CompositionEditor for `/products/:id` and `/modules/:id`, including tree API client, depth-refetch expansion, permitted composition writes, depth/cycle messages, and page docs.

## Conflict guard

- TZ-CATALOG-320 is DONE on canonical `origin/main` (`07ced5f` + closeout `407b0de`).
- No `tasks/_active/` marker or active-map claim currently overlaps product/module composition keys.
- No parallel product/module owner is claimed in the local active map.

## Acceptance

- Tree API methods `getProductTree` / `getModuleTree` call `GET /:id/tree` with optional `maxDepth`.
- Shared tree/editor renders nested module/product/material nodes with RU labels and materialKind.
- Lazy expand is supported without introducing a second write path.
- Product parents permit module, non-raw material, and product lines; module parents permit module and material only.
- Quantity edit/removal/addition uses existing composition API methods.
- Depth >5 warning; depth >=9 and cycle/self-reference errors are clear in Russian.
- Product root with product child derives and shows `Комплекс`.
- Focused Jest covers tree HTTP methods and component/editor smoke behavior.
- Product/module page docs updated with tree behavior and successor limitations.

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- `cd frontend && pnpm test -- --testPathPattern="composition|product-detail|module-detail|pi-product-modules"`

## Closeout

No archive, lock, commit, push, or active marker removal in this turn unless separately requested after review and PASS.
