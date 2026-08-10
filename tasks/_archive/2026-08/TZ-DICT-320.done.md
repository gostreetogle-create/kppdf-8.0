# TZ-DICT-320 — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10T17:51:30.8247358Z
closed_by: Buffy / continuous executor
workspace: `D:\kppdf-8.0` (host-managed Freebuff worktree)

## Scope

Wired the backend kind-label API into the frontend without changing catalog keys. Added a shared `PiDictionaryLabelsService` with active-label caching, mutation invalidation, and one-time RU seed fallback warning. Added `/dictionaries/kind-labels` for admin/manager label editing with product/material tabs. Added navigation/chips and replaced hardcoded kind-label maps in Product/Material FullEditors, QuickCreate, catalog filters/rails, detail pages, BOM legend/inspector, and composition picker.

## Acceptance evidence

- Renaming `service` through the management page updates PATCH payload `{ label, isActive }` while the stable `service` key remains unchanged.
- Product kind selectors and QuickCreate consume `GET /dictionary-labels?scope=productKind`; material selectors/filter and display rails consume `materialKind` from the same cache.
- API errors show seed labels and emit one warning per scope; fallback requests remain retryable.
- The new page is reachable through the Справочники classification chip and top navigation.

## Gates

- frontend tsc: PASS
- focused Jest: PASS (6 suites, 103/103)
- changed-file ESLint: PASS
- new-file Prettier: PASS; legacy edited files retain repository CRLF baseline warnings
- frontend development build: PASS
- `git diff --check`: PASS (line-ending warnings only)
- backend TZ-319: dependency commit already passed backend tsc and 9/9 Jest; no backend files modified in this TZ
- live browser smoke: NOT RUN; isolated session did not have a dedicated FE/BE runtime
- deploy: NO (`deploy.ps1` not run)

## Files

- `frontend/src/app/shared/services/pi-dictionary-labels.service.ts`
- `frontend/src/app/shared/services/pi-dictionary-labels.service.spec.ts`
- `frontend/src/app/pages/dictionaries/kind-labels.page.ts`
- `frontend/src/app/pages/dictionaries/kind-labels.page.spec.ts`
- `frontend/src/app/app.routes.ts`
- `frontend/src/app/layout/app-layout.component.ts`
- `frontend/src/app/pages/dictionaries/dictionary-group-chips.ts`
- `frontend/src/app/pages/products/product-form-dialog.component.ts`
- `frontend/src/app/pages/materials/material-form-dialog.component.ts`
- `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts`
- `frontend/src/app/pages/products/products.page.ts`
- `frontend/src/app/pages/materials/materials.page.ts`
- `frontend/src/app/pages/products/product-detail.page.ts`
- `frontend/src/app/pages/materials/material-detail.page.ts`
- `frontend/src/app/pages/products/product-bom-panel.component.ts`
- `frontend/src/app/pages/products/product-composition-picker-dialog.component.ts`
- `frontend/src/app/shared/services/materials.service.ts`
- `frontend/src/app/shared/services/materials.service.spec.ts`
- `docs/pages/dictionaries.page.md`
- `docs/pages/products.page.md`
- `docs/pages/materials.page.md`
- `docs/agent-checklists/TZ-DICT-320.md`
- `docs/agent-checklists/_active-map.md`
- `.mimocode/locks/TZ-DICT-320-kind-labels-fe-nav.lock`
