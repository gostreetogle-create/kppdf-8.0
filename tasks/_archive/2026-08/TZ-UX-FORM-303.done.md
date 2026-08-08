# TZ-UX-FORM-303 — QuickCreate L photo

═══════════════════════════════════════════════════════════════
ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: Buffy / agent-acfffc1331
protected_files:
  - frontend/src/app/shared/ui/photo/photo-dropzone.component.ts
  - frontend/src/app/shared/ui/photo/photo-dropzone.component.spec.ts
  - frontend/src/app/shared/ui/photo/index.ts
  - frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts
  - frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts
verification:
  - acceptance criteria: PASS
  - tsc: PASS
  - Angular development build: PASS
  - targeted Jest: PASS (2 suites, 14 tests)
  - scoped ESLint: PASS
  - diff check: PASS
  - checklist: UPDATED
  - progress.md: UPDATED
  - lock file: CREATED
notes:
  - Product QuickCreate L only exposes the shared photo dropzone; M/S and module profiles do not.
  - Drag/drop and file picker upload through PhotosService; previews/removal and photoIds are wired.
  - Newly uploaded IDs are cleaned up on dialog destroy unless product create succeeded.
known_limitations:
  - Product FullEditor was not migrated to the shared dropzone because that file is a Layer-3 conflict key; its existing upload behavior remains unchanged. A later successor can consolidate it.
  - Photo removal in the shared dropzone calls the existing PhotosService remove immediately; QuickCreate photos are create-only.
═══════════════════════════════════════════════════════════════
