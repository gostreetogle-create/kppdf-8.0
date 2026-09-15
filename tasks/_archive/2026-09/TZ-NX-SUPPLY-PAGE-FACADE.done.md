# TZ-NX-SUPPLY-PAGE-FACADE: /supply page → SupplyFacade

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (2/2)
  - typecheck: PASS
  - tests: PASS (supply.page.spec.ts 21/21; kppdf-web supply|warehouse pattern 110/110 suites, 756/763, 7 skipped, 0 failed; backend SUPPLY-GATE pre-commit hook 6/6 suites, 80/80)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-SUPPLY-PAGE-FACADE.md
  - commit: 7e68240c
  - status synchronization: PASS (tracker updated)

## Root cause

`supply.page.ts` (~627 LOC) owned all list/filter/create/status-transition
state and ~8 injected services directly on the component.

## Fix

Mechanical extract, no behavior change: created `supply.facade.ts`
(`@Injectable()`, component-scoped) holding every signal, the 4 mutable
inline-create fields, and every method verbatim. Signals aliased on the
page as readonly live references; the 4 mutable plain fields (which can't
alias the same way — copying a primitive's value once at construction
would silently decouple page from facade) required the template's 4
`[(ngModel)]` targets to switch to `facade.xxx` (Angular supports dotted
paths in two-way bindings natively) — the only template change. Fixed 2
`supply.page.spec.ts` tests that wrote directly into now-relocated
page-instance fields, redirecting them through `component.facade.xxx`.

Inline create-form dumb-UI extraction (optional per the TZ's own wording)
PARKed — reset-on-success timing and disabled-state wiring for a two-way
bound form carried more regression risk than benefit at this size; can
revisit in S3 once the page moves to `libs/features`.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts` (627 → 434 LOC, thin host)
- `frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.facade.ts` (new, 281 LOC)
- `frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.spec.ts` (2 tests updated for the relocated fields)
- `docs/agent-checklists/TZ-NX-SUPPLY-PAGE-FACADE.md` (new)

## Successor

`TZ-NX-SUPPLY-REQUESTS-FACADE` (S2).
