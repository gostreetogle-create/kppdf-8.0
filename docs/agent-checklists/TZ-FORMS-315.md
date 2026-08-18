# TZ-FORMS-315 checklist

> Status: **DONE**
> Marker: removed after archive
> Conflict keys: module form + module form spec only

## Claim slot

- agent_id: Buffy/openai-gpt-5.6-luna
- claimed_at: 2026-08-18T18:42:12+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (claim CLI unavailable)

## Preflight

- [x] Get-Location / repo root → D:\kppdf-8.0
- [x] branch → main
- [x] TZ прочитан целиком
- [x] TZ-FORMS-314 archive and lock verified on main
- [x] `_active/` was empty before claim
- [x] Active marker created
- [x] Module conflict keys clean before claim

## Acceptance

- [x] Module dimensions, weight, estimatedHours and sortOrder submit through `toOptionalNumber`
- [x] Undefined optional numeric values are omitted, never `""` or `NaN`
- [x] Existing module spec asserts a numeric payload for string width and weight
- [x] Focused tsc + spec PASS

## Integrity slot

- [x] Type: other (frontend form payload boundary)
- [x] FIC/docs integrity: N/A — no route/page contract or shared status change
- [x] Coupling map: N/A — no semantic status/field coupling change
- [x] Foreign WIP excluded; conflict keys restricted to TZ paths
- [x] `app-pi-input` CVA unchanged; backend and photo attach paths unchanged

## Gates (fact)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS, exit 0
- [x] `cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern=module-form-dialog` — PASS, 6/6, exit 0
- [x] `cd frontend && pnpm exec eslint src/app/pages/modules/module-form-dialog.component.ts src/app/pages/modules/module-form-dialog.component.spec.ts` — PASS, exit 0
- [x] `git diff --check` — PASS

## Executor report

- Module payload now converts dimensions, weight, estimated hours, and sort order at submit time.
- Optional converted values are omitted as object keys; article trim, photo upload/attach, and workTypeId behavior are unchanged.
- Added focused regression coverage for string width `"100"` and weight `"1.5"`.
- No `pi-input` CVA, backend DTO, Gantt, deploy, or foreign WIP changes.

## Closeout

- [x] Archive and lock prepared
- [x] `_active/TZ-FORMS-315.md` removed after archive
- [x] Root task removed after archive
- [x] `_NOW.md` updated with DONE and next TZ-FORMS-316
