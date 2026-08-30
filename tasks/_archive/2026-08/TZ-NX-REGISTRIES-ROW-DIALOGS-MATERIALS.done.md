# TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS — DONE

## Outcome

**PASS** — toolbar create + row edit/copy/archive for Materials and Details registries via unified `MaterialFormDialogComponent` and existing Materials API.

## Changed files

```
frontend-nx/libs/data-access/src/lib/catalog/
  material.types.ts          (+ CreateMaterialPayload / UpdateMaterialPayload)
  pi-materials.service.ts    (+ create/update/duplicate/archive)
  pi-materials.service.spec.ts

frontend-nx/apps/kppdf-web/src/app/pages/registries/
  model/registry.types.ts    (+ createAction)
  registry-detail-panel.component.ts (+ toolbar create button)
  dialogs/material-form-dialog.component.ts
  dialogs/material-form-dialog.component.spec.ts
  data/material-registry-dialog-host.ts
  data/material-registry-actions.ts
  data/materials.registry.ts
  data/details.registry.ts
  data/registries.catalog.ts
  data/material-row-dialogs.spec.ts
  data/registries.catalog.spec.ts
  data/materials-registries.spec.ts
  registries.routes.spec.ts
  registry-detail-panel.component.spec.ts

docs/pages/registries.page.md
docs/agent-checklists/TZ-NX-REGISTRIES-ROW-DIALOGS-MATERIALS.md
```

Untouched: `backend/**`, `frontend/**`, `libs/ui/**` (except data-access), shell/rails, modules/products dialogs, composition tree, `/constructor` route.

## Features

| Area | Implementation |
|------|----------------|
| Toolbar | `RegistryDefinition.createAction` → `[data-test="registry-create"]` |
| Create/Edit | `MaterialFormDialogComponent` (`PiDialogComponent`, max-width 1120px) |
| Copy | `POST /materials/:id/duplicate` + toast + reload |
| Archive | `DELETE /materials/:id` + confirm + toast + reload |
| Materials | `materialKind=raw` locked |
| Details | kind select part/fastener/purchased/other |
| Errors | inline dialog error + row-action notify |

## Gates

- `pnpm exec nx build kppdf-web --skip-nx-cache`: **PASS**
- `pnpm exec nx test kppdf-web --skip-nx-cache`: **PASS** (167 tests)
- `pnpm exec nx test data-access --skip-nx-cache`: **PASS** (26 tests)
- `pnpm exec nx run-many -t lint --all --skip-nx-cache`: **PASS** (0 errors)
- `pnpm run architecture:check:nx`: **PASS** (230 files)
- `pnpm run ui:tokens:nx`: **PASS**

## Executor report

- Implemented `createAction` contract and panel toolbar button.
- Wired Materials/Details registries with shared dialog host and row actions (edit/copy/archive + open-constructor preserved).
- Extended `PiMaterialsService` with write methods matching existing backend endpoints.
- Added focused specs: create button, create/edit dialog, copy, archive confirm/error, kind filters, catalog regression for units/modules/products/departments.
- Updated `registries.page.md`.

---

ARCHIVE_MARKER
outcome: PASS
closed_at: 2026-08-29
closed_by: cursor
verification:
  - toolbar create materials/details: PASS
  - material form create/edit: PASS
  - copy duplicate API: PASS
  - archive confirm: PASS
  - API error state: PASS
  - reload after success: PASS
  - existing registries unchanged: PASS
