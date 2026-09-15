# TZ-NX-REGISTRY-FORMS-FACADE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (material/module/product dialog specs green; registries specs green)
  - typecheck: PASS (kppdf-web app tsconfig, clean on first run)
  - architecture check: PASS (1524 files; baseline 17; 2 resolved since baseline)
  - tests: PASS (3 dialog suites 41/41; registries pattern 36/36 suites 236/243, 7 skipped; full kppdf-web 106/106 suites 741/748, 7 skipped, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-REGISTRY-FORMS-FACADE.md
  - commit: 20ae8800
  - status synchronization: PASS (tracker updated)

## Root cause

The TZ asked for one facade per fat registry dialog (material/module/
product, 538–734 LOC each) — domain signals/submit/photos/lookups moved
as-is, `providers` on each dialog, no mega-facade, CompositionPanel import
pattern kept unchanged.

## Fix

Extracted `MaterialFormFacade`, `ModuleFormFacade`, `ProductFormFacade` —
same DI-token pattern as `RoleFormFacade` (R1): each facade injects
`PI_DIALOG_DATA`/`PI_DIALOG_REF` directly. New complication vs. R1: all
three dialogs use `@ViewChild` for DOM focus/scroll on invalid submit,
which cannot move to a facade — bridged via an optional callback
parameter on `facade.onSubmit(onInvalid?)`, with each facade exposing a
small "which field is invalid" lookup so the component's
`focusFirstInvalidField` stays pure DOM work. All original member names
were kept as aliases/delegates on each component (not rewritten to
`facade.xxx` in templates) because all three dialogs have dedicated specs
that poke internals via `fixture.componentInstance['form']` bracket
access — verified safe since `form` is an object reference, not a
primitive (unlike B2's `[(ngModel)]` case).

## Files changed

- `material-form-dialog.component.ts` (734 → 258 LOC) + new `material-form.facade.ts`
- `module-form-dialog.component.ts` (604 → 231 LOC) + new `module-form.facade.ts`
- `product-form-dialog.component.ts` (538 → 200 LOC) + new `product-form.facade.ts`
- `docs/agent-checklists/TZ-NX-REGISTRY-FORMS-FACADE.md` (new)

## Successor

`TZ-NX-REGISTRY-FORMS-TO-FEATURES` (F2) — move the three facades (+ dialog
UI where no illegal app dependency blocks it) into
`libs/features/src/lib/registry-forms/`.
