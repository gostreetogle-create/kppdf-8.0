# TZ-NX-PROPOSALS-LIST-FACADE: /proposals list → ProposalsListFacade

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (2/2)
  - typecheck: PASS
  - tests: PASS (proposals-list.page.spec.ts + proposal-attach-orgs.dialog.spec.ts 2/2 suites, 33/33 tests; kppdf-web proposals-pattern run 107/107 suites, 745/752, 7 skipped, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-PROPOSALS-LIST-FACADE.md
  - commit: 93eec886
  - status synchronization: PASS (tracker updated)

## Root cause

`proposals-list.page.ts` (~420 LOC, ~9 injected services) owned list state,
family-expand caching, attach-orgs/sync-from-master orchestration, and the
studio-bridge/convert-to-order flows directly on the component.

## Fix

Mechanical extract, no behavior change: created `proposals-list.facade.ts`
(`@Injectable()`, component-scoped) holding every signal, computed, and
method verbatim. No mutable `[(ngModel)]` fields on this page (all state is
Signals), so every alias is a live reference and the template needed zero
changes. The 1213-line spec needed zero changes either — its direct
`fixture.componentInstance.familyByRow.set(...)` / `.familyByRow()` calls
hit the same aliased signal, and its `convertToOrder(row)` call resolves
through the delegate method. No legacy KP workspace ported (hard rule
respected); convert-to-order and studio-bridge semantics unchanged.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts` (420 → 201 LOC, thin host)
- `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.facade.ts` (new, 291 LOC)
- `docs/agent-checklists/TZ-NX-PROPOSALS-LIST-FACADE.md` (new)

## Successor

`TZ-NX-PROPOSALS-TO-FEATURES` (P2, final TZ of the DECOMP B1→B3 batch).
