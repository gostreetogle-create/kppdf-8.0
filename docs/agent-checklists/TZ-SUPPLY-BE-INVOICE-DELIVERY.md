# TZ-SUPPLY-BE-INVOICE-DELIVERY checklist

> Status: **DONE**
> Marker: removed (`tasks/_active/TZ-SUPPLY-BE-INVOICE-DELIVERY.md` deleted at closeout)
> Wave: `WAVE-NX-SUPPLY-OPS` (1/7)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-07T20:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this executor)

## Preflight

- [x] `docs/agent-checklists/_NOW.md`, `tasks/_active/` (empty) checked — no competing claim
- [x] `WAVE-NX-SUPPLY-OPS.md`, audit `docs/audits/2026-09-06-supply-google-sheets-to-nx-audit.md` §6 (PO locks) read
- [x] TZ read; existing `SupplyRequest` schema/DTO/service/controller/spec read
- [x] Precedent for `createdBy` conventions checked (`stock-movement`, `document-template` schemas)

### Preflight Check Output

- **Context read:** WAVE-NX-SUPPLY-OPS.md, audit §6 PO locks, TZ-SUPPLY-BE-INVOICE-DELIVERY.md, supply-request.{schema,dto,service,controller,spec}.ts, kit-reserve.service.ts (only other `.create()` caller), current-user.decorator.ts
- **Key Constraints:** supplier = Organization; `orderId` XOR `orderLabel`; `paid` independent of `status`; `createdBy` server-set only, never client-writable
- **Planned Deliverable:** schema fields (`invoiceNo`, `deliveryNote`, `paid`+`paidAt`, `orderLabel`, `createdBy`) + DTO + service create/update logic + controller wiring + service spec coverage
- **Validation Path:** `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test -- supply-request`

## Acceptance

- [x] Поля в schema+DTO; create пишет createdBy
- [x] paid независим от status
- [x] gates backend green; archive

## Integrity slot (before READY / archive)

- [x] Type: other (BE fields only; no new route/permission/module/MCP)
- [x] FIC §A–E: N/A — no route/permission/module/MCP change
- [x] page.md: `docs/pages/supply.page.md` one-line field note
- [x] DOMAIN-MAP: N/A — no module/route contour changed
- [x] Coupling map: N/A — new fields on existing entity, no FK/status coupling change
- [x] No unrelated dirty WIP staged

## Gates (fact)

- PASS: `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
- PASS: `pnpm test -- supply-request` — 17/17 (8 new for this TZ)
- PASS: `pnpm test -- kit-reserve` — 10/10 (other `SupplyRequestService.create()` caller, unaffected by new optional param)
- PASS: `pnpm exec eslint` changed files — 0 issues
- PASS: full `pnpm test` — 129 suites / 1246 tests

## Executor report

- Added `invoiceNo`, `deliveryNote`, `paid`+`paidAt`, `orderLabel`, `createdBy` to `SupplyRequest` schema/DTO/service/controller. `orderId` XOR `orderLabel` enforced in both create and update (order always wins, clears stale label). `paid` toggle is independent of `status` and auto-stamps/clears `paidAt`; not exposed as a separate endpoint — travels through the existing PATCH `update()`. `createdBy` is only ever set server-side from `@CurrentUser()` on create; the DTO has no `createdBy` field so a client cannot set/override it. `kit-reserve.service.ts`'s system-spawned `create()` call is untouched (new `createdByUserId` param is optional/trailing) — such auto-generated requests stay `createdBy: undefined`, which is correct (no human actor).
- conflict disclosure: unrelated dirty WIP in the tree (docker-compose.yml, start.mjs, build-info.ts, data/, reports/, nx-supply TZ files for later waves) — none staged.
- known limitation: none for this TZ's scope; FE journal (S3) will surface these fields next.

## Closeout

- [x] archive + DONE lock + remove `_active` marker
- closed_at: 2026-09-07T20:30:00+03:00
