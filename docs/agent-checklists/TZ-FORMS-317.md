# TZ-FORMS-317 checklist

> Status: **DONE**
> Marker: removed after archive
> Conflict keys: five create DTOs + work-type/product-module service specs only

## Claim slot

- agent_id: Buffy/openai-gpt-5.6-luna
- claimed_at: 2026-08-18T18:50:43+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (claim CLI unavailable)

## Preflight

- [x] Get-Location / repo root → D:\kppdf-8.0
- [x] branch → main
- [x] TZ прочитан целиком
- [x] TZ-FORMS-314, 315, 316 archives/locks verified on main
- [x] `_active/` was empty before claim
- [x] Conflict keys clean before claim
- [x] Active marker created
- [x] `main.ts` ValidationPipe reviewed; no implicit conversion added

## Acceptance

- [x] WorkType numeric fields have `@Type(() => Number)`
- [x] ProductModule numeric fields and nested dimensions have `@Type(() => Number)`
- [x] Counterparty and Organization payment/VAT fields have `@Type(() => Number)`
- [x] Quotation discount percent/amount have `@Type(() => Number)` only
- [x] Transform regression test accepts string `hourlyRate` as number
- [x] Backend tsc + focused specs PASS

## Integrity slot

- [x] Type: backend DTO validation boundary
- [x] FIC/docs integrity: N/A — no UI route or page contract change
- [x] Coupling map: N/A — no shared status/field semantics changed
- [x] Foreign WIP excluded; conflict keys restricted to TZ paths
- [x] `enableImplicitConversion` remains absent from `main.ts`

## Gates (fact)

- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS, exit 0
- [x] `cd backend && pnpm exec jest --config jest.config.ts --runInBand --testPathPattern=work-type.service` — PASS, 9/9, exit 0
- [x] `cd backend && pnpm exec jest --config jest.config.ts --runInBand --testPathPattern=product-module.service` — PASS, 10/10, exit 0
- [x] `cd backend && pnpm exec eslint` on seven conflict-key TS files — exit 0 (15 pre-existing `no-explicit-any` warnings in product-module service spec)
- [x] `git diff --check` — PASS

## Executor report

- Added narrow `@Type(() => Number)` transforms to the listed work-type, module, counterparty, organization, and quotation DTO fields.
- Added a real `plainToInstance` + `validate` regression proving string `hourlyRate` becomes number 150.
- `backend/src/main.ts` and global `enableImplicitConversion` remain untouched; no unrelated DTOs or frontend files changed.

## Closeout

- [x] Archive and lock prepared
- [x] `_active/TZ-FORMS-317.md` removed after archive
- [x] Root task removed after archive
- [x] `_NOW.md` updated with final wave DONE and no active TZ
