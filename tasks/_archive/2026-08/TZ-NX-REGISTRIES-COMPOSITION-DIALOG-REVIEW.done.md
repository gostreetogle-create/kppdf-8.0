# TZ-NX-REGISTRIES-COMPOSITION-DIALOG-REVIEW — DONE

ARCHIVE_MARKER
outcome: PASS_WITH_P1_FOLLOWUPS
closed_at: 2026-08-29
closed_by: cursor
mode: analysis-only — no product code changed

## Verdict

Phase 2 Registry Composition Dialog is **functionally shippable** for Module root composition and Product root composition CRUD. **Not legacy-parity complete** for Product nested-module adds, tree canon, browser smoke, or list-scale picker.

## PASS (highlights)

- Allowed-child matrix aligned client (`composition-tree.contract.ts`) + backend (`composition-line.service.ts`)
- lineId fix via `composition-line-resolve.ts` + `composition-panel.withLine`
- Canonical `composition[]` endpoints only (`pi-composition.service.ts`)
- Registry actions: modules (edit/composition/archive/create, no copy); products (+copy, constructor optional)
- Dirty passport: `confirmDirtyClose` + `dismissOnEscape/backdropClick: false` on catalog dialogs
- Derived «Комплекс» in dialog via `treeHasProductChild`
- Gates PASS per Phase 2 archive

## BLOCKER

None for “dialog + root-level composition works.”

## P1 (fix next)

| ID | Issue | File:lines |
|----|-------|------------|
| P1-1 | Add always targets root `entityId`, not selected nested module/product | `composition-panel.component.ts:247-274` vs legacy `product-bom-panel.component.ts:431-462` |
| P1-2 | `focusComposition` = data-test only, no scroll | `module-form-dialog.component.ts:90`, `product-form-dialog.component.ts:132` |
| P1-3 | No browser smoke evidence | `docs/pages/registries.page.md:171-180` |
| P1-4 | Picker materials/products `limit: 100` | `composition-picker-dialog.component.ts:187-189` |
| P1-5 | Edit opens list row without `getById` | `catalog-registry-dialog-host.ts:59-84` |

## P2 (defer / polish)

- Tree canon: no photo thumb, edit pencil, arrow keys (`composition-tree.component.ts`)
- ESC/backdrop always disabled even when pristine (`catalog-registry-dialog-host.ts:54-55`)
- No `unitPriceOverride` in picker (legacy has it)
- No QuickCreate in picker
- Missing cycle/depth integration tests
- Passport field reduction vs legacy forms

## Next executor TZ

`TZ-NX-REGISTRIES-COMPOSITION-PARITY-WAVE-1` — P1-1, P1-2, tests, optional getById.

Full report: same content as archived active review (see git history / `tasks/_active/` snapshot before delete).
