# TZ-NX-MODULE-LIST-POPULATE-PHOTOS: витрина «Модули» — фото не приходят с findAll

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (3/3)
  - typecheck: PASS (BE tsc)
  - tests: PASS (BE 135 suites / 1344 tests, was 1342 — +2 new)
  - lint: PASS (0 errors, 2 scoped files)
  - architecture:check: PASS
  - live browser evidence: PASS (negative path: 0 broken/0×404 on a
    photo-less dataset; positive path: temporary real-photo PATCH renders
    correctly, reverted after)
  - checklist: `docs/agent-checklists/TZ-NX-MODULE-LIST-POPULATE-PHOTOS.md` + evidence/
  - status synchronization: PASS (WAVE-2026-09-13-SUCCESSORS.md updated)

## Root cause / finding

`ProductModuleService.findAll()` never populated `photoIds`/`mainPhotoId` —
a missing-populate bug (not the orphan-reference class WAVE3.1 already
fixed for product/material). The vitrina's "Модули" tab always showed the
empty placeholder regardless of whether a module actually had a photo.

## Fix

`findAll()` (both branches) now populates `photoIds`/`mainPhotoId`, uses
`.lean()` (list endpoint, no internal caller needs Document methods), and
runs the existing `blankMissingUploadUrls` helper (from WAVE3.1's
`document-render.utils.ts`) so an orphan reference still degrades to an
empty placeholder rather than a 404 broken icon.

`findById`/`findByIds` deliberately untouched — used internally for
mutate-then-save flows, and the vitrina doesn't call them.

## Files changed

- `backend/src/modules/product-module/product-module.service.ts` (+ `.spec.ts`)
- `docs/agent-checklists/TZ-NX-MODULE-LIST-POPULATE-PHOTOS.md` + `evidence/TZ-NX-MODULE-LIST-POPULATE-PHOTOS.txt` (new)
