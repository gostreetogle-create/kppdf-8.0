# TZ-NX-GANTT-G15-LEGEND-FOOTER

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff

## Outcome

Removed the obsolete lower `data-test="gantt-legend"` explanatory footer from the NX Gantt. The upper `data-test="gantt-worktype-legend"` Work Type color legend remains intact; Gantt calculations, assignment behavior, and the rest of the production template were not changed.

## Verification

- acceptance criteria: PASS
- focused tests: PASS (direct Jest, 1 suite / 9 tests, exit 0)
- typecheck: PASS (`pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`, exit 0)
- lint: PASS on changed Gantt files, 0 errors; 17 existing warnings
- diff check: PASS
- final build: PASS (`pnpm exec nx build kppdf-web`, exit 0; known existing warnings only)
- checklist: ADDED and completed
- page docs: N/A; no lower-footer contract was documented
- status synchronization: PASS in task checklist; WAVE-S S1 update follows wave closeout
- integrity: PASS; no route, permission, capability, or shared coupling changes

## Changed scope

- `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `docs/agent-checklists/TZ-NX-GANTT-G15-LEGEND-FOOTER.md`

## Known limits

- Browser smoke was not run; DOM-backed Angular Jest coverage and the production build passed.
- Existing G14 backend assignment work and unrelated workspace changes were not staged.

## Commit

7e283595
