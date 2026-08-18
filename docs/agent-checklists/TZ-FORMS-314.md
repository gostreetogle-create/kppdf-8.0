# TZ-FORMS-314 checklist

> Status: **DONE**
> Marker: removed after archive
> Conflict keys: helper + work-type form + work-type form spec only

## Claim slot

- agent_id: Buffy/openai-gpt-5.6-luna
- claimed_at: 2026-08-18T18:35:56+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (claim CLI unavailable)

## Preflight

- [x] Get-Location / repo root → D:\kppdf-8.0
- [x] branch → main
- [x] TZ прочитан целиком
- [x] `_NOW.md` + `tasks/_active/` проверены; чужого active claim на эти keys нет
- [x] Active marker создан

## Acceptance

- [x] helper `to-optional-number.ts`
- [x] work-type hourlyRate string → number
- [x] optional numeric fields omit `undefined` and preserve `days === 0 → null`
- [x] focused tsc + spec PASS

## Integrity slot

- [x] Type: other (frontend form payload boundary)
- [x] FIC/docs integrity: N/A — no route/page contract or shared status change
- [x] Coupling map: N/A — no semantic status/field coupling change
- [x] Foreign WIP excluded; conflict keys restricted to TZ paths
- [x] `app-pi-input` CVA unchanged; global ValidationPipe unchanged

## Gates (fact)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS, exit 0
- [x] `cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern=work-type-form-dialog` — PASS, 3/3, exit 0
- [x] `cd frontend && pnpm exec eslint src/app/pages/work-types/work-type-form-dialog.component.ts src/app/pages/work-types/work-type-form-dialog.component.spec.ts src/app/shared/forms/to-optional-number.ts` — PASS, exit 0
- [x] `git diff --check` — PASS

## Executor report

- Added the optional numeric submit helper and used it only at the work-type payload boundary.
- Required `hourlyRate` blocks submission when coercion produces `undefined`; empty optional fields are omitted and `days` keeps the existing empty/zero → `null` contract.
- Added focused component/helper coverage for string-to-number conversion and empty duration omission.
- Initial task wrapper `pnpm test -- --testPathPattern=...` forwarded an extra `--` and found no tests; the equivalent direct Jest command above passed. No product correction was needed for that runner invocation.
- No backend, `pi-input` CVA, ValidationPipe, deploy, or foreign WIP changes.

## Closeout

- [x] Archive and lock prepared
- [x] `_active/TZ-FORMS-314.md` removed after archive
- [x] Root task removed after archive
- [x] `_NOW.md` updated with DONE and next TZ-FORMS-315
