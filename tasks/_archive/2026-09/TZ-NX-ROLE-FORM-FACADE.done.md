# TZ-NX-ROLE-FORM-FACADE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (role/admin specs green, tsc, build)
  - typecheck: PASS
  - tests: PASS (admin-roles.page.spec.ts 4/4; kppdf-web role|admin pattern 106/106 suites, 741/748, 7 skipped, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-ROLE-FORM-FACADE.md
  - commit: a2859085
  - status synchronization: PASS (tracker updated)

## Root cause

`role-form-dialog.component.ts` (~925 LOC) owned the entire permissions/
pages matrix, catalog loading, and submit orchestration directly on the
dialog component.

## Fix

Mechanical extract, no behavior change: created `role-form.facade.ts`
(`@Injectable()`, component-scoped) holding every signal, method, and the
two exported pure regroup helpers verbatim. Since this component is a
dialog (inputs via `PI_DIALOG_DATA`/`PI_DIALOG_REF` DI tokens, not
`@Input()`), the facade injects them directly with no host-bind workaround
needed. `data` aliased back onto the component since the template reads
`data.mode` directly. Manually cross-checked every template
method-call/property against the component's aliases/delegates, since no
dedicated spec exercises this dialog's internals (the only referencing
spec, `admin-roles.page.spec.ts`, mocks `dialog.open` and never renders it
— a pre-existing gap, flagged not fixed).

Caught and fixed one self-inflicted mid-edit slip: a replacement meant to
remove the class body + two trailing exported functions matched short,
leaving dangling code referencing moved-away identifiers. Caught by
inspection before any gate ran.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/role-form-dialog.component.ts` (925 → 674 LOC, thin host)
- `frontend-nx/apps/kppdf-web/src/app/pages/role-form.facade.ts` (new, 386 LOC)
- `docs/agent-checklists/TZ-NX-ROLE-FORM-FACADE.md` (new)

## Successor

`TZ-NX-ROLE-FORM-TO-FEATURES` (R2).
