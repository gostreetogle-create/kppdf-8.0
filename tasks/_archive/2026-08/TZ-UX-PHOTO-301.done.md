# TZ-UX-PHOTO-301 DONE — visible photo upload progress

```
ARCHIVE_MARKER
task: TZ-UX-PHOTO-301
outcome: DONE
closed_at: 2026-08-15T16:30:00Z
closed_by: Buffy executor (photo upload progress)
workspace: D:\kppdf-8.0
cursor_verdict: N/A (TZ does not require Cursor Verdict; PO AC gates)
verification:
  - cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit → PASS
  - Jest photo-dropzone + product/material/quick-create form specs → 88/88 PASS
  - git diff --check → PASS
  - deploy: NOT EXECUTED
protected:
  - frontend/src/app/shared/services/photos.service.ts
  - frontend/src/app/shared/ui/photo/photo-dropzone.component.ts
  - frontend/src/app/shared/ui/photo/photo-dropzone.component.spec.ts
  - frontend/src/app/pages/products/product-form-dialog.component.ts
  - frontend/src/app/pages/materials/material-form-dialog.component.ts
  - frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts
  - docs/agent-checklists/TZ-UX-PHOTO-301.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/pages/product-detail.page.md
  - progress.md
known_limitation: exact upload % depends on browser/proxy Content-Length; when unavailable UI shows indeterminate bar (never silent)
```

## Delivered

- `PhotosService.uploadWithProgress` + `uploadPhotosWithProgress` helper; legacy `upload()` kept
- Dropzone: `aria-busy`, disabled picker while uploading, h-2 progress bar, RU status + optional %, `data-test="photo-upload-progress"`
- Product + material form dialogs: same progress UI; Save remains disabled while uploading
- QuickCreate: passes `progressPercent` into dropzone

## Spec

`tasks/TZ-UX-PHOTO-301-upload-progress.md`
