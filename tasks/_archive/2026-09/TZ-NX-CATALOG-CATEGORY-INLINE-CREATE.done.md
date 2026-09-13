# TZ-NX-CATALOG-CATEGORY-INLINE-CREATE: категория в форме модуля/изделия/детали — select + «+»

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (6/6)
  - typecheck: PASS (FE tsc)
  - tests: PASS (FE 125 suites / 892 passed + 7 skipped, was 885 — +7 new tests)
  - lint: PASS (0 problems, 8 scoped files)
  - architecture:check: PASS
  - nx build kppdf-web: PASS (last gate)
  - live browser evidence: PASS (module full round-trip; product/material "+" + locked type)
  - checklist: `docs/agent-checklists/TZ-NX-CATALOG-CATEGORY-INLINE-CREATE.md` + evidence/
  - status synchronization: PASS (WAVE-2026-09-13-STUDIO-OPS.md updated)

## Root cause / finding

Module and material forms' invalid-Save was completely silent (`markAllAsTouched()` only),
same symptom product already had before an earlier `TZ-NX-PO-SWEEP-01` fix. Category
creation was reachable only via the separate «Категории» registry, forcing a context
switch mid-form.

## Fix

1. `category-form-dialog.component.ts` — new optional `lockType?: CategoryType` on
   `CategoryFormDialogData`; when set, the `type` select is disabled and locked (submitted
   via `getRawValue()`, same pattern as the existing locked `materialKind`).
2. `module-form-dialog.component.ts` / `product-form-dialog.component.ts` /
   `material-form-dialog.component.ts` — accent "+" (`pi-registry-create-button`) next to
   the category select; opens `CategoryFormDialogComponent` locked to that form's own
   catalog type; on close with a created category, appends it to the local list, selects
   it, marks the form dirty. Same nested-dialog pattern as
   `supply-request-form-dialog.component.ts`'s `openCreateMaterial`.
3. `module-form-dialog.component.ts` / `material-form-dialog.component.ts` — invalid Save
   now sets a visible summary alert + focuses/scrolls the first invalid field, mirroring
   product's existing mechanism; module's version also covers invalid work-type rows.

## Out-of-scope finding (documented, not fixed)

`category.service.ts create()` returns a raw 500 (not a clean 409) on a duplicate `slug`
collision (Mongo unique-index violation) — discovered live via `suggestSkuPrefix()`'s
16-char truncation colliding with leftover test data from an earlier verification run.
`Category` schema/DTO/service are outside this TZ's conflict keys and explicitly listed
under "НЕ ИЗМЕНЯТЬ" — left for a separate TZ.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/category-form-dialog.component.ts` (+ `.spec.ts`)
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.ts` (+ `.spec.ts`)
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.ts` (+ `.spec.ts`)
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/material-form-dialog.component.ts` (+ `.spec.ts`)
- `docs/pages/registries.page.md` (new section)
- `docs/agent-checklists/TZ-NX-CATALOG-CATEGORY-INLINE-CREATE.md` + `evidence/TZ-NX-CATALOG-CATEGORY-INLINE-CREATE.txt` (new)
