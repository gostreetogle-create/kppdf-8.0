# TZD-43 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZD-43.md`
> Commit/push: **required by continuous executor; deploy NO**

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-12T03:36:00Z
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable — Team Room CLI previously reported unknown task; sync tasks first

## Preflight

- [x] Current branch is at `c3071855` and equals `origin/main` after TZD-42
- [x] `_active-map.md` and `tasks/_active/` checked — no conflicting active claim
- [x] TZD-43, audit copies, executor rules, product DTO/schema, domain schema, and MCP docs read
- [x] Claim slot filled before code; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZD-43.md` is present
- [x] Dependency bootstrap is available from the previous Desktop/MCP wave

## Acceptance

- [x] `kppdf_propose_product_create` accepts optional `categoryId` and status whitelist from backend DTO
- [x] Product journal payload preserves categoryId/status through confirm mapping
- [x] Without categoryId/status, propose remains backward-compatible
- [x] Product domain schema and `kppdf_validate_product` reflect the fields
- [x] MCP.md documents the product category/status contract
- [x] MCP tests and typecheck pass
- [x] Deploy НЕ; no frontend/category API/mass backfill/TZD-44/45 changes

## Investigation result

The live Product DTO already defines `categoryId?: string | null` and status as
`new|active|archived|draft`; ProductSchema defaults omitted status to `new`. The
MCP product proposal was the drift point: its input and journal payload stopped at
`name/kind/unit/sku/notes`. TZD-43 adds the DTO fields to the proposal whitelist,
passes them through the journal payload into `ProductService.create`, validates
Mongo-id/status shape in MCP, and leaves the omitted-field path unchanged.

## Conflict keys

- `desktop/mcp/src/write-tools.ts`
- `desktop/mcp/src/write-tools.test.ts`
- `desktop/mcp/src/domain-tools.ts`
- `backend/src/modules/mutation-journal/mutation-journal.service.ts`
- `desktop/docs/MCP.md`
- `desktop/mcp/src/tools-registry.test.ts`

## Integrity slot (до READY / archive)

- [x] Тип изменения: MCP product journal payload/schema contract
- [x] FIC §E updated: TZD-43 product passport category/status row added
- [x] page.md / PAGE-TZ-INDEX: N/A — no UI route
- [x] SECTION-READINESS: N/A — no user-contour change
- [x] Foreign WIP excluded; conflict keys respected
- [x] Canon: `docs/DOCS-INTEGRITY.md`

## Gates (fact)

- [x] `cd desktop/mcp && pnpm test` — 31 suites / 105 tests PASS
- [x] `cd desktop/mcp && pnpm exec tsc --noEmit` — PASS
- [x] `cd backend && pnpm test -- mutation-journal` — 2 suites / 26 tests PASS
- [x] `cd backend && pnpm exec tsc --noEmit` — PASS
- [x] `git diff --check` — PASS
- [x] Prettier — N/A: no Prettier binary declared/installed in backend or desktop/mcp

## Primary / secondary signal

- Primary: payload builder + journal mapping preserve optional categoryId/status; DTO accepts the same status whitelist — PASS.
- Secondary: MCP full suite, backend focused journal suite, both typechecks, and diff-check — PASS.

## Executor report

- Product category/status drift fixed only at the MCP proposal/domain contract and journal mapping.
- Scope guard: no frontend, category API, mass backfill, TZD-44/45, production cleanup, or deploy.

## Closeout

- [x] archive + lock + progress + status synchronization
- [x] remove `_active/TZD-43.md` after archive
- [ ] commit and push `main`
- closed_at: 2026-08-12T00:31:42Z
