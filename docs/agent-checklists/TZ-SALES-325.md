# TZ-SALES-325 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-SALES-325.md` (retain until visual PASS/archive)
> Commit/push: scoped implementation ready; closeout deferred until visual PASS

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T12:56:32Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room registry reports unknown task

## Preflight

- [x] Current `origin/main` fetched/rebased at `557c8f73` before code.
- [x] TZ-SALES-325, wave audit §C, Spec §0, GEMINI, AI-Agent Guide, and PO-DIARY §1–§4 read.
- [x] 323/324/326/327/329 and DOC-344 are DONE; DOC-TABLES-305 has no overlapping key.
- [x] `pi-document-templates.service.ts` is free; foreign dirty `document-template.service.ts` orientation WIP is disclosed and will not be mixed.
- [x] Claim marker exists before code changes.

## Acceptance

- [x] Optional request-only `previewLines` reaches the build preview.
- [x] Draft fields map by canonical column-key aliases only.
- [x] Target selection is explicit `settings.kpLineItems` / line-items role, otherwise one live table only.
- [x] Snapshot-mode and non-target tables are unchanged; empty lines use the 324 skeleton.
- [x] No preview payload is persisted to Mongo/Quotation.
- [x] FE rebuild follows in-memory `draftLines` updates without painting a duplicate bullet list.
- [x] No 323 scroll regression and no `Нет данных` regression in automated coverage.

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- `cd backend && pnpm exec jest --config ./test/jest-e2e.json --runInBand test/e2e/document-templates-build.e2e-spec.ts` — PASS, 10/10
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm exec jest --config jest.config.js --runInBand src/app/pages/commercial/proposals/proposal-create.page.spec.ts` — PASS, 11/11
- `git diff --check` — PASS
- `pnpm test -- --testPathPattern=proposal-create --runInBand` — runner rejected the extra `--` and found no tests; direct Jest gate above is the equivalent passing focused command.

## Executor report

- implementation: build accepts optional request-only `previewLines`; target selection honors explicit `kpLineItems`/`line-items`, otherwise exactly one live table.
- mapping: canonical case-insensitive `column.key` aliases populate name, quantity, unit price, total, SKU, and unit; unknown keys stay blank.
- empty/safety: explicit empty preview lines render the 324 skeleton; snapshot and unassigned live tables are not filled with draft rows.
- FE: every selected-template rebuild sends mapped in-memory draft lines; product add triggers the existing debounced rebuild; no duplicate list is painted on A4.
- conflict disclosure: foreign DOC-343 backend/docs WIP and dirty `document-template.service.ts` orientation line remain excluded.

## Review handoff

- [x] READY FOR REVIEW after gates
- [ ] Visual PASS required: added products appear in the assigned table, empty state remains skeleton, and A4 has no H/V scroll

## Closeout

- [ ] archive + lock + progress + remove `_active`
- [ ] Status = DONE
- closed_at: pending visual PASS
