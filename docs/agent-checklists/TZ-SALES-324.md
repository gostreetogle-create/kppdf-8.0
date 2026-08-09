# TZ-SALES-324 checklist

> Status: **DONE**
> Marker: archived; `tasks/_active/TZ-SALES-324.md` removed after closeout
> Commit/push: scoped closeout committed and pushed

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T12:10:00Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable for task registry; READY FOR REVIEW message sent successfully

## Preflight

- [x] Canonical `D:\kppdf-8.0` checked; worktree synced/rebased to current `origin/main` before claim.
- [x] TZ, wave audit, prompt, Spec §0, GEMINI, AI-Agent Guide, and PO-DIARY §1–§4 read.
- [x] `_active-map.md` and canonical active markers scanned.
- [x] DOC-344 builder keys and DOC-TABLES-305 dialog keys did not overlap; canonical dirty shared `document-template.service.ts` WIP was preserved.
- [x] Claim marker and checklist existed before code changes.

## Acceptance

- [x] `preview()` with columns and empty sample rows returns `<table>` with thead labels and exactly one empty tbody row with N empty td cells.
- [x] Empty table preview does not contain `Нет данных` paragraph content.
- [x] Document build e2e confirms the table-template source produces the same skeleton.
- [x] No builder rewrite; builder empty-cell copy remains a documented known limitation.
- [x] No 325 draftLines/live bind, 322, 320, DOC-344, or deploy changes.

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- `cd backend && pnpm test:e2e test/e2e/table-templates.e2e-spec.ts` — PASS, 8/8
- `cd backend && pnpm test:e2e test/e2e/document-templates-build.e2e-spec.ts` — PASS, 9/9
- ESLint changed source — PASS; e2e files are ignored by repository ESLint config (warnings only, no errors)
- `git diff --check` — PASS

## Executor report (auto)

- implementation: `TableTemplateService.preview()` now preserves table geometry for empty rows: existing column headers plus exactly one row of empty cells; zero declared columns keeps the short no-columns message.
- verification: table preview and document build e2e cover the skeleton and explicitly reject `Нет данных` for tables with columns.
- docs: Create КП page documents the empty skeleton contract.
- conflict disclosure: `document-template.service.ts` was not edited because canonical contains foreign dirty WIP; DOC-344, DOC-TABLES-305, Builder, 325, 322/320, and deploy untouched.
- known limitation: builder canvas may still show its own «Нет данных» cell copy; this is explicitly out of scope.

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-09T12:10:52Z`
