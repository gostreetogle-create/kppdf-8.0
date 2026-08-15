# TZ-UI-PHOTO-343 — checklist
- [x] CLAIM — `tasks/_active/TZ-UI-PHOTO-343.md`; owner Buffy
- [x] grep sweep + migrate leftovers — product/material primary controls now use shared dropzone; module/QC paths verified
- [x] audit After table + WAVE DONE — intentional org/builder asset uploaders documented as non-catalog
- [x] archive

## Conflict keys
- `frontend/src/app/pages/products/product-form-dialog.component.ts`
- `frontend/src/app/pages/materials/material-form-dialog.component.ts`
- `frontend/src/app/pages/modules/module-detail.page.ts` (already migrated in TZ-341; verify only)
- `docs/audits/2026-08-15-compose-create-and-photo-upload-audit.md`
- `docs/agent-checklists/WAVE-COMPOSE-CREATE-PHOTO.md`
- `progress.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Executor report
- Product and material forms now render `app-pi-photo-dropzone`; parent keeps PhotosService upload/delete and material `mainPhotoId` behavior.
- Sweep result: catalog product/module/material primary photo entry points provide file + drag-and-drop + Ctrl+V; module detail URL remains collapsed secondary only.
- Intentional limitations documented: organization logo/signature assets and document-constructor background/assets are not catalog entity photos and retain dedicated workflows.
- Gates: frontend `tsc -p tsconfig.app.json --noEmit` PASS; targeted Jest product/material/dropzone **3 suites / 77 tests PASS**; module-detail + QuickCreate **2 suites / 19 tests PASS**; lint PASS with 18 existing architecture warnings; owned Prettier PASS; `git diff --check` PASS. Docs Prettier reports pre-existing markdown drift; no broad reformat.
