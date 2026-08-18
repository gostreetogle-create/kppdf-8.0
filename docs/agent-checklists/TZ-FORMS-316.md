# TZ-FORMS-316 checklist

> Status: **DONE**
> Marker: removed after archive
> Conflict keys: counterparty/org/proposal form files + CP/org specs only

## Claim slot

- agent_id: Buffy/openai-gpt-5.6-luna
- claimed_at: 2026-08-18T18:46:52+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (claim CLI unavailable)

## Preflight

- [x] Get-Location / repo root → D:\kppdf-8.0
- [x] branch → main
- [x] TZ прочитан целиком
- [x] TZ-FORMS-314 and TZ-FORMS-315 archives/locks verified on main
- [x] `_active/` was empty before claim
- [x] Conflict keys clean before claim
- [x] Active marker created

## Acceptance

- [x] Counterparty payment terms and VAT submit as numbers
- [x] Organization payment terms and VAT submit as numbers
- [x] Proposal discount percent and amount submit through `toOptionalNumber`
- [x] Undefined optional numeric values are omitted
- [x] Focused tsc + CP/org specs PASS

## Integrity slot

- [x] Type: other (frontend form payload boundary)
- [x] FIC/docs integrity: N/A — no route/page contract or shared status change
- [x] Coupling map: N/A — no semantic status/field coupling change
- [x] Foreign WIP excluded; conflict keys restricted to TZ paths
- [x] `app-pi-input` CVA, backend, party schema, proposal table/inspector unchanged

## Gates (fact)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS, exit 0
- [x] `cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern=counterparty-full-editor-dialog` — PASS, 10/10, exit 0
- [x] `cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern=organization-full-editor-dialog` — PASS, 14/14, exit 0
- [x] `cd frontend && pnpm exec eslint` on all five conflict-key TS files — PASS, exit 0
- [x] `git diff --check` — PASS

## Executor report

- Counterparty and organization payment-term/VAT fields now coerce at submit and omit undefined values.
- Proposal discount percent/amount now use the shared helper; existing item `Number(...)` conversion is unchanged.
- Added focused counterparty regression coverage for string VAT and payment terms.
- No `pi-input` CVA, backend, party schema, proposal inspector/table editor, deploy, or foreign WIP changes.

## Closeout

- [x] Archive and lock prepared
- [x] `_active/TZ-FORMS-316.md` removed after archive
- [x] Root task removed after archive
- [x] `_NOW.md` updated with DONE and next TZ-FORMS-317
