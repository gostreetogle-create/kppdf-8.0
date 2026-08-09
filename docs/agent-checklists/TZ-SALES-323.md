# TZ-SALES-323 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-SALES-323.md` (must exist until archive)
> Commit/push: scoped only after review/closeout

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T11:38:09Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room registry does not contain TZ-SALES-323

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel checked; canonical repository is `D:\kppdf-8.0`, isolated worktree is the execution workspace.
- [x] `git status` clean before claim; `git pull --ff-only origin main` completed: already up to date.
- [x] Read `_active-map.md` + all relevant `tasks/_active/` markers; no foreign claim overlaps these keys.
- [x] TZ, wave audit, PROMPT, Spec §0, GEMINI.md, AI-AGENT-GUIDE.md, and PO-DIARY §1–§4 read.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS.
- [x] `tasks/_active/TZ-SALES-323.md` created before product-code edits.
- [x] DOC-344 builder FE is absent from active markers; its keys remain untouched.

## Conflict keys

- `frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create.page.ts`
- `frontend/src/app/pages/commercial/proposals/proposal-create.page.spec.ts`
- `backend/src/modules/document-template/document-template.service.ts`
- `backend/test/e2e/document-templates-build.e2e-spec.ts`
- `docs/pages/proposals-create.page.md`
- `docs/ux/kp-create-studio-spec.md`

## Acceptance

- [x] A4 preview sheet/stage/iframe use hidden overflow; visual scroll PASS remains required.
- [ ] iframe document scrollWidth <= clientWidth + 1px and scrollHeight <= clientHeight + 1px — requires Cursor/PO visual/browser measurement.
- [x] Portrait and landscape build HTML use a single fixed page box with html/body overflow hidden.
- [x] FE contain scale remains proportional, top-aligned/top-centered, ResizeObserver-backed, and may be < 1 on small sheets.
- [x] Background/absolute layout and frozen 317 shell do not regress in focused tests.
- [x] No 324/325, snapshot/print, Builder/DOC-344, or deploy work included.

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS
- `cd backend && pnpm test -- --testPathPattern=document-templates-build` — command shape yields Jest no-tests because backend config excludes `test/e2e`; equivalent direct e2e command with imported main env — PASS, 8/8.
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm test -- --testPathPattern=proposal-create` — command shape yields Jest no-tests because pnpm forwards `--`; equivalent `pnpm test --testPathPattern=proposal-create --runInBand` — PASS, 9/9.
- `cd frontend && pnpm exec jest --config jest.config.js --runInBand src/app/pages/commercial/proposals/proposal-create.page.spec.ts` — PASS, 9/9.
- Visual scroll verification + iframe scrollWidth/Height measurement — pending Cursor/PO PASS.

## Executor report (auto)

- implementation: FE contain scale now uses a 2px safety inset; build HTML is one fixed portrait/landscape A4 page box with hidden document overflow and bounded content/table wrapping.
- tests/gates: backend/FE typechecks PASS; focused FE 9/9 PASS; direct backend build e2e 8/8 PASS with portrait + landscape CSS contract. Visual measurement remains pending.
- conflict disclosure: only listed conflict keys; DOC-344 and frozen 317 shell untouched
- known limits: bit-identical print PDF (320), empty table skeleton (324), live products (325)
- commit: pending until Cursor/PO visual PASS and archive closeout
- full SHA: pending

## Review handoff

- [x] READY FOR REVIEW sent to Team Room / recorded in active map.
- [ ] Do not archive before Cursor/PO visual PASS on scroll

## Closeout

- [ ] archive + lock + progress + remove `_active`
- [ ] Status = DONE
- closed_at: pending
