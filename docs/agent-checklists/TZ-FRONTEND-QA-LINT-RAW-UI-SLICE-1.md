# Checklist: TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-1

**TZ:** `tasks/TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-1.md`
**Status:** DONE

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-03T09:42:00Z
- workspace: `D:\kppdf-8.0`
- branch: `main`
- baseline_sha: `df6d62cd`
- team_room_claim: unavailable (no Team Room CLI in this workspace)

## Preflight Check Output

- **Context read:** `docs/how-to-connect-ai.md`, `GEMINI.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/AGENT-TASK-MODES.md`, `docs/DOCS-INTEGRITY.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md`, `docs/GIT-POLICY.md`, `docs/agent-checklists/_NOW.md`, `tasks/_active/`, `tasks/TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-1.md`, `docs/paper-and-ink.md`, `docs/ui-density-canon.md`, `frontend/src/styles.css`, `frontend/eslint/rules/no-raw-ui-values.cjs`, `docs/audits/2026-09-03-qa-deep-test-audit.md`
- **Key Constraints:** TZ-exec; legacy `frontend/**` only; capped batch of 15 files; use existing CSS variables/utilities; do not change lint rules; do not touch `OnInit` warnings; never touch `frontend-nx/**`; preserve unrelated dirty WIP.
- **Planned Deliverable:** tokenize raw values in the selected files; run frontend lint and strict app typecheck; run relevant tests; perform legacy frontend DOM/style verification; archive with remaining error count noted for Slice-2.
- **Validation Path:** FIC §A–E N/A (no route, permission, module, API, or MCP changes); Integrity slot; frontend lint, typecheck, focused/full tests, browser smoke, and diff review.

## File batch (15 files — selected from highest-density lint diagnostics)

1. `frontend/src/app/pages/doc-constructor/tables/table-template-dialog.component.ts`
2. `frontend/src/app/pages/doc-constructor/texts/text-block-editor.component.ts`
3. `frontend/src/app/pages/doc-constructor/texts/data-field-picker-dialog.component.ts`
4. `frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts`
5. `frontend/src/app/pages/doc-constructor/builder/builder.page.ts`
6. `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
7. `frontend/src/app/shared/ui/card/pi-showcase-card.component.ts`
8. `frontend/src/app/pages/commercial/proposals/proposal-create-table-editor.component.ts`
9. `frontend/src/app/pages/commercial/proposals/proposal-product-rail.component.ts`
10. `frontend/src/app/pages/commercial/proposals/proposal-create-inspector.component.ts`
11. `frontend/src/app/pages/commercial/proposals/proposal-create-recipient.component.ts`
12. `frontend/src/app/pages/commercial/proposals/proposal-create-template-center.component.ts`
13. `frontend/src/app/pages/commercial/proposals/proposal-create-template-picker.component.ts`
14. `frontend/src/app/pages/commercial/proposals/proposal-create-terms.component.ts`
15. `frontend/src/app/pages/desk/manager-desk.page.ts`

## Acceptance

- [x] All 15 files use existing Paper & Ink spacing/color tokens; focused lint reports 0 errors and 0 warnings.
- [x] Full legacy frontend lint improved from 200 raw-UI errors in the audit baseline to 35 errors / 17 parked lifecycle warnings; all remaining errors are outside this 15-file batch and are successor Slice-2 scope.
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS.
- [x] `cd frontend && pnpm test` — PASS, 196 suites / 2091 tests.
- [x] Read-only browser smoke PASS on `/doc-constructor/tables`, `/proposals/create`, `/production`, and `/desk`; substantive DOM rendered and 0 console errors on each route.
- [x] `frontend-nx/**` remained untouched.
- [x] Before/after lint counts and known limitation recorded in the archive.

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: other (CSS token hygiene; no route/API/capability change).
- [x] FIC §A–E: N/A — no page, permission, module, MCP capability, catalog, or user-flow contract changed.
- [x] page.md / PAGE-TZ-INDEX: N/A (no route or user-flow change).
- [x] SECTION-READINESS: N/A (no user-visible section status change).
- [x] Чужой WIP не в коммите; conflict keys ограничены listed batch plus QA records.
- [x] Coupling map: N/A (no shared field/status/filter/FK changed).
- [x] Канон: `docs/DOCS-INTEGRITY.md`, `docs/paper-and-ink.md`, `docs/ui-density-canon.md`.

## Gates

- `cd frontend && pnpm exec eslint <15-file batch>`: PASS, 0 errors / 0 warnings.
- `cd frontend && pnpm lint`: FAIL as expected for remaining out-of-scope legacy files, 35 errors / 17 warnings; no diagnostics in the claimed batch.
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`: PASS.
- `cd frontend && pnpm test`: PASS, 196/196 suites and 2091/2091 tests.
- Read-only browser smoke against existing local services: PASS, 4 routes rendered with 0 console errors each.
- `git diff --check -- <claimed frontend files>`: PASS.
- `frontend-nx/**` and deploy paths: untouched.

## Executor report

Q4b replaced raw spacing literals and raw hex fallbacks in the 15-file legacy frontend batch with existing Paper & Ink CSS variables and equivalent token calculations. The visual surface was preserved, including fixed canvas dimensions and control geometry; same-token fallback nesting introduced by the mechanical pass was normalized to direct variables, while distinct semantic aliases remain intentional. No business behavior, route, API, capability, or lifecycle warning was changed.

Known limitation: full legacy frontend lint is not green because 35 raw-UI errors remain outside this slice and 17 existing page lifecycle warnings remain parked. Successor work belongs to `TZ-FRONTEND-QA-LINT-RAW-UI-SLICE-2` or the next frontend lint slice; Q4b is intentionally capped at 15 files.

The repository's `scripts/with_server.py` helper was absent and the tool environment could not keep a new background server process, but existing local services were available. A direct Puppeteer read-only smoke verified the four affected route families with substantive DOM and no console errors.

Root `progress.md` and `STATUS.md` are redirect-only journals; live status is maintained in `docs/agent-checklists/_NOW.md` and the wave checklist.

## Closeout

- [x] Archive marker created after green in-scope gates.
- [x] Lock file created for DONE.
- [x] Active task removed after archive.
- [x] Root task removed after archive.
- [x] Wave and `_NOW.md` synchronized.
- [x] Status = DONE.
- closed_at: 2026-09-03T14:05:00Z
- commit_sha: pending Q4b commit
