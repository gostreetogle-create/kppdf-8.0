═══════════════════════════════════════════════════════════════
TZ-MODULES-341 — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16
closed_by: Buffy

summary:
- Module form exposes shared photo dropzone, uploads through PhotosService, and links Photo ids through ProductModulePhotosService after module save.
- Module detail makes file/drag/paste upload primary, creates ProductModulePhoto `{ photoId }` links, and keeps URL entry in a collapsed secondary path.
- QuickCreate module L exposes the shared dropzone and links uploaded photos before showing the composition panel.
- Product and material photo paths remain unchanged.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`frontend` app tsc, exit 0)
  - tests: PASS (module form/detail + QuickCreate + dropzone + product/material forms, 6 suites / 101 tests)
  - lint: PASS (18 pre-existing architecture warnings, 0 errors)
  - prettier: PASS (owned module/QC/photo TS/spec)
  - diff-check: PASS (owned changes)
  - checklist: ADDED and integrity slot filled
  - progress.md: UPDATED
  - status synchronization: PASS

files:
- `frontend/src/app/pages/modules/module-form-dialog.component.ts`
- `frontend/src/app/pages/modules/module-form-dialog.component.spec.ts`
- `frontend/src/app/pages/modules/module-detail.page.ts`
- `frontend/src/app/pages/modules/module-detail.page.spec.ts`
- `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts`
- `frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts`
- `docs/agent-checklists/TZ-MODULES-341.md`
- `docs/agent-checklists/WAVE-COMPOSE-CREATE-PHOTO.md`
- `docs/agent-checklists/_NOW.md`
- `docs/pages/PAGE-TZ-INDEX.md`

known_limits:
- Existing module URL entry remains available as an explicitly collapsed secondary path.
- Module edit form shows newly uploaded session photos; existing module gallery remains owned by module detail.
- No browser server smoke was available/required for this component/page gate.

conflict_disclosure:
- `data/paspots/`, `data/products/`, `docs/PO-DIARY.md`, and unrelated untracked WIP were not staged.
