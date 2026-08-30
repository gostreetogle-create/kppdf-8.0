# TZ-NX-REGISTRIES-COMPOSITION-PARITY-WAVE-1 — DONE

## Outcome

**PASS** — P1 parity fixes from composition + catalog reviews: nested composition add target, focusComposition scroll, page-scoped dialog lifetime, honest Details filter, getById-before-edit, materialKind lock + dimension aria-label, docs.

## Deltas (2026-08-29)

1. **Composition add:** `resolveAddTarget()` / `canAddIntoNode()` — add posts to selected nested module/product parent endpoint, not root when nested parent selected.
2. **focusComposition:** `composition-focus-scroll.ts` — `scrollIntoView` + focus on composition block in module/product dialogs.
3. **Dialog lifetime:** `provideRegistriesCatalog()` on `RegistriesPage` — page-scoped `DestroyRef` for material/catalog dialog hosts (`parentDestroyRef`).
4. **Details filter:** `emptyOptionLabel` on `RegistryFilter`; Details default honestly labeled as `part` only (backend unchanged).
5. **Material dialog:** `patchMaterial` preserves locked `materialKind`; remove-dimension button `aria-label`.
6. **Edit loading:** `getById` before opening module/product/material edit dialogs; error → notify, no dialog.
7. **Docs:** `docs/pages/registries.page.md` — filters/actions/limitations.

## Changed files

```
frontend-nx/apps/kppdf-web/src/app/pages/composition/
  composition-focus-scroll.ts (+ spec)
  composition-panel.component.ts (+ spec)
  composition-tree.contract.ts (+ canAddIntoNode, spec)

frontend-nx/apps/kppdf-web/src/app/pages/registries/
  registries-page.ts (provideRegistriesCatalog)
  data/registries.catalog.ts (page-scoped factory)
  data/catalog-registry-dialog-host.ts (+ spec, getById)
  data/material-registry-dialog-host.ts (getById)
  data/details.registry.ts (emptyOptionLabel, description)
  model/registry.types.ts (emptyOptionLabel)
  registry-detail-panel.component.ts
  dialogs/module-form-dialog.component.ts (+ spec scroll)
  dialogs/product-form-dialog.component.ts
  dialogs/material-form-dialog.component.ts (+ spec kind lock)
  registries-page.spec.ts, registries.routes.spec.ts, registries-a11y.spec.ts (overrideComponent)

docs/pages/registries.page.md
docs/agent-checklists/TZ-NX-REGISTRIES-COMPOSITION-PARITY-WAVE-1.md
```

Untouched: `backend/**`, `frontend/**`, `libs/ui/**` source, `/constructor`.

## Gates

- `pnpm exec nx build kppdf-web --skip-nx-cache`: **PASS**
- `pnpm exec nx test kppdf-web --skip-nx-cache`: **PASS** (202 tests)
- `pnpm exec nx test data-access --skip-nx-cache`: **PASS** (30 tests)
- `pnpm exec nx run-many -t lint --all --skip-nx-cache`: **PASS** (0 errors)
- `pnpm run architecture:check:nx`: **PASS** (244 files)
- `pnpm run ui:tokens:nx`: **PASS**

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
