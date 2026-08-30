# TZ-NX-REGISTRIES-COMPOSITION-DIALOG — DONE (Phase A+B + Phase 2)

## Outcome

**PASS** — Module/Product edit+composition dialogs in registries; lineId fix; derived Комплекс; dirty guard (ESC/backdrop via dismiss flags); tests + gates.

## Phase 2 deltas (2026-08-29)

- **lineId resolution:** `composition-line-resolve.ts` — PATCH/DELETE use composition line `_id` (match `refId`+`lineType`), not tree node `_id` (entity refId). Nested product/module parents fetch their own composition.
- **Комплекс badge:** derived from tree (`treeHasProductChild`) OR API `isComplex`.
- **Dirty passport guard:** `dismissOnEscape: false`, `dismissOnBackdropClick: false` on module/product registry dialogs; close only via Cancel/X → `confirmDirtyClose`.
- **Toast:** add/remove/qty errors and success feedback in composition panel.
- **Tests:** composition-line-resolve, composition-panel, composition-tree, composition-picker, dirty-dialog.guard, module/product form dialogs; registry action matrix.

## Changed files

```
frontend-nx/apps/kppdf-web/src/app/pages/composition/
  composition-line-resolve.ts (+ spec)
  composition-panel.component.ts (+ spec)
  composition-tree.component.ts (+ spec, Event type fix)
  composition-tree.contract.ts (+ treeHasProductChild re-export)
  composition-picker-dialog.component.ts (+ spec)
  dirty-dialog.guard.ts (+ spec)
  composition-registries.spec.ts

frontend-nx/apps/kppdf-web/src/app/pages/registries/
  data/catalog-registry-dialog-host.ts (dismiss flags)
  dialogs/module-form-dialog.component.ts (+ spec)
  dialogs/product-form-dialog.component.ts (+ spec)

docs/agent-checklists/TZ-NX-REGISTRIES-COMPOSITION-DIALOG.md
```

Untouched: `backend/**`, `frontend/**`, `libs/ui/**` source, `/constructor` route.

## Gates

- `pnpm exec nx build kppdf-web --skip-nx-cache`: **PASS**
- `pnpm exec nx test kppdf-web --skip-nx-cache`: **PASS** (194 tests)
- `pnpm exec nx test data-access --skip-nx-cache`: **PASS** (30 tests)
- `pnpm exec nx run-many -t lint --all --skip-nx-cache`: **PASS** (0 errors)
- `pnpm run architecture:check:nx`: **PASS** (243 files)
- `pnpm run ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
phase: 2
