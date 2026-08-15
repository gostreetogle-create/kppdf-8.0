═══════════════════════════════════════════════════════════════
TZ-UI-PHOTO-342 — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16
closed_by: Buffy

summary:
- Added document-level paste support scoped to a hovered or focused photo dropzone.
- Extracted image files from clipboard items, with a `clipboardData.files` fallback.
- Ignored text/non-image clipboard data and kept the uploading guard.
- Replaced the hint with «Файл с диска · перетащить · Ctrl+V».
- Kept PhotosService and parent-owned upload/delete paths unchanged.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`frontend` app tsc, exit 0)
  - tests: PASS (dropzone + QuickCreate + product/material forms, 4 suites / 91 tests)
  - lint: PASS (18 pre-existing architecture warnings, 0 errors)
  - prettier: PASS (owned photo TS/spec)
  - diff-check: PASS (owned changes)
  - checklist: ADDED and integrity slot filled
  - progress.md: UPDATED
  - status synchronization: PASS

files:
- `frontend/src/app/shared/ui/photo/photo-dropzone.component.ts`
- `frontend/src/app/shared/ui/photo/photo-dropzone.component.spec.ts`
- `docs/agent-checklists/TZ-UI-PHOTO-342.md`
- `docs/agent-checklists/WAVE-COMPOSE-CREATE-PHOTO.md`
- `docs/agent-checklists/_NOW.md`

known_limits:
- Paste is intentionally scoped to hovered/focused dropzone instances; text clipboard does not prevent the browser default.
- No browser server smoke was available/required for this shared component TZ.

conflict_disclosure:
- `data/paspots/`, `data/products/`, `docs/PO-DIARY.md`, and unrelated untracked WIP were not staged.
