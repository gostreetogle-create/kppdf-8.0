# TZ-PHOTO-302 — catalogue lists use lightweight thumbnails

**Outcome:** DONE
**Closed:** 2026-08-09
**Agent:** agent-3e757640b7

## Delivered

- Added shared `photoListUrl()` selection in the frontend photo service.
- Direct thumb photos are used as-is; original photos resolve a linked thumb through either `parentPhotoId` or `linkedPhotoId`; legacy photos fall back to their original `storageUrl`.
- `/products` table and grid/showcase images use the shared selector.
- `/materials` list images use the shared selector with the existing photo lookup.
- Production read-facade order/catalogue thumbnail extraction uses the selector where populated photo data is available.
- Audited `/modules`: the module list has no list/grid photo surface. Detail pages, form dialogs and photo pickers intentionally retain original URLs for large/editing previews.
- Product and material page docs record the thumbnail URL contract.

## Protected scope

- Frontend URL selection only.
- Pickers, upload pipeline, Product/Material payloads and business logic, layout, PAGE_SIZE, backend and deploy were not changed.

## Verification

- Frontend TypeScript: PASS.
- Focused Jest: PASS — 5 suites / 33 tests.
- Changed-file ESLint: PASS.
- Prettier: PASS.
- `git diff --check`: PASS.
- `verify-status.sh`: pre-existing FAIL for 72 legacy kit-era entries outside this TZ.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T01:50:47Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - focused tests: PASS
  - lint: PASS
  - prettier: PASS
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: UPDATED
  - page docs: UPDATED
  - lock file: CREATED
known_limitations:
  - legacy original rows without a thumb intentionally fall back to original until TZ-PHOTO-303 backfill
  - module list has no photo surface to migrate
  - detail/form/lightbox/photo-picker surfaces intentionally retain original URLs
  - global legacy kit-era verify-status drift remains pre-existing
