# Checklist TZ-CATALOG-371 — Безопасная копия изделия

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-CATALOG-371.done.md`
> Commit/push: canonical `main`; implementation pushed; deploy НЕ
> Implementation SHA: `bd23a4d10273c8a412c9d665d1f3f59200163ac8` (full)
> Closeout SHA: `fc065b7ee345cd0939cf67a698d044a4f997c874` (full)

## Claim slot

- agent_id: Buffy / predeploy executor
- claimed_at: 2026-08-13T23:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no — orchestration limitation: `Unknown task: TZ-CATALOG-371; sync tasks first`
- conflict keys checked: Product service/controller/DTO/spec + ProductsService/spec + products page doc

## Preflight

- [x] `origin/main` contains TZ-CATALOG-371 and TZ-SALES-370 closeout.
- [x] `_NOW.md` and all `tasks/_active/` markers read; only AUTH-305 is active and keys do not overlap.
- [x] Organization scope, unique `(organizationId, sku)`, EAV, composition and photo reference contracts inspected.
- [x] Claim marker and claim slot created before product code.
- [x] Team Room best-effort claim attempted; task is not registered, no claim slot was skipped.

## Acceptance

- [x] `POST /products/:id/duplicate` creates a new scoped Product.
- [x] Name/SKU suffix generation is collision-safe with bounded duplicate retry.
- [x] `copiedFromProductId` is set and source is not mutated.
- [x] Passport, composition, EAV and photo refs are copied by domain contract.
- [x] `stockQty=0`, draft/new status, active non-system defaults; audit fields are not copied.
- [x] Archived/deleted/cross-organization source is not disclosed.
- [x] `expectedVersion` update gives 409 on stale source and remains optional for old callers.
- [x] Typed FE duplicate client and typed `version` response are available.

## Integrity slot

- [x] Type: module/API + typed FE client.
- [x] FIC §C/§D checked: ProductModule already registered, RBAC/Swagger/focused tests present; catalog page doc updated; SECTION-READINESS unchanged (N/A).
- [x] No foreign dirty WIP staged; conflict keys respected.
- [x] Canon: `docs/DOCS-INTEGRITY.md`.

## Gates

- [x] backend tsc + ProductService focused Jest PASS (16/16).
- [x] frontend tsc + ProductsService focused Jest PASS (2/2).
- [x] architecture:check + git diff --check PASS.
- [x] Security/diff review PASS: strict org source filter, DTO whitelist, no system/stock/audit override, bounded SKU retry.

## Executor report

- implementation: duplicate endpoint, independent composition/EAV clone, scoped SKU/name generation, expectedVersion 409, typed FE client.
- known limits: EAV copy runs after Product create (same existing EAV transaction helper); binary photos are shared refs by contract; no UI button in this TZ.

## Closeout

- [x] archive + lock + progress + remove active marker
- [x] commit/push SHA recorded: `bd23a4d10273c8a412c9d665d1f3f59200163ac8`
- [x] no deploy
