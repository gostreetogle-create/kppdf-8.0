# TZ-PHOTO-301 — upload original plus lightweight thumbnail

**Outcome:** DONE
**Closed:** 2026-08-09
**Agent:** agent-3e757640b7

## Delivered

- Added `sharp` to the backend through pnpm.
- `POST /photos/upload` persists the original file and Photo record first.
- Generates a separate WebP `thumb` with long side ≤320px, quality 80, and no enlargement of small images.
- Stores the thumb as a child Photo with `parentPhotoId`, dimensions, MIME and byte-size metadata.
- Returns the legacy original Photo shape plus `variants.thumb`.
- If Sharp cannot decode/generate the thumb, the original remains available, a WARN is logged, and upload does not fail with 500.
- Added focused service and controller tests.

## Protected scope

- Backend photo pipeline only.
- UI, pickers, Product/Material business logic, existing original files, and deploy were not changed.

## Verification

- Backend TypeScript: PASS.
- Focused photo Jest: PASS — 2 suites / 4 tests.
- Changed photo ESLint: PASS.
- Full backend Jest: 72 suites / 694 tests PASS; one pre-existing failure remains in `text-block-category.service.spec.ts`.
- `git diff --check`: PASS.
- `verify-status.sh`: pre-existing FAIL for 72 legacy kit-era archive/STATUS mismatches outside this TZ.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T01:45:02Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - focused tests: PASS
  - lint: PASS
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: UPDATED
  - architecture note: UPDATED
  - lock file: CREATED
known_limitations:
  - medium variant is intentionally deferred; 301 creates thumb only
  - old original Photo rows are handled by TZ-PHOTO-303
  - global legacy kit-era verify-status drift remains pre-existing
