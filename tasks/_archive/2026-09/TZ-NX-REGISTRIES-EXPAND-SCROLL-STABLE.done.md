# TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff

## Outcome

Master-row expand/collapse now captures the `.shell-main` scrollTop before route navigation and restores it after two render frames. The URL-driven `/registries/:key` single-expand model is unchanged, and no `scrollIntoView` is used for master expansion. Measurement confirmed that the registry page wrapper and shared `px-panel-inset` have no vertical min-height or bottom padding defect; no speculative layout change was introduced.

## Verification

- acceptance criteria: PASS
- focused tests: PASS (direct Jest, 1 suite / 13 tests, exit 0)
- typecheck: PASS (`pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`, exit 0)
- lint: PASS on changed registry page/spec, 0 errors
- diff check: PASS
- final build: PASS (`pnpm exec nx build kppdf-web`, exit 0; known existing warnings only)
- checklist: ADDED and completed
- page docs: UPDATED (`docs/pages/registries.page.md`)
- status synchronization: PASS in task checklist; WAVE-S board remains live coordination state
- integrity: PASS; no route, permission, capability, or shared coupling changes

## Changed scope

- `frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.spec.ts`
- `docs/pages/registries.page.md`
- `docs/agent-checklists/TZ-NX-REGISTRIES-EXPAND-SCROLL-STABLE.md`

## Known limits

- Browser smoke was not run; deterministic DOM-backed Angular Jest coverage and the production build passed.
- No CSS/layout redesign was made because inspection found no page-owned hidden trailing height.
- Existing unrelated workspace changes, live coordination files, and active G14 backend work were not staged.

## Commit

e1a6451c
