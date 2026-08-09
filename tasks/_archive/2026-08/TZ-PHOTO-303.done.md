# TZ-PHOTO-303 — backfill thumbnails for legacy photos

**Outcome:** DONE
**Closed:** 2026-08-09
**Agent:** agent-3e757640b7

## Delivered

- Added `backend/scripts/tz-photo-303-backfill-thumbs.ts` and the `backend` package command `pnpm photos:backfill-thumbs`.
- Scans existing `variant: original` Photo records and creates one WebP thumb child for each safe local `/uploads/...` source file.
- Uses the TZ-PHOTO-301 Sharp contract: max long side 320px, `fit: inside`, no enlargement, WebP quality 80, metadata persisted, and `parentPhotoId` link.
- Idempotency checks both `parentPhotoId` and `linkedPhotoId` thumb relations before generating anything; re-running creates zero duplicates.
- Missing, unsupported and unreadable files are logged and skipped per record; a generated file is removed if the Photo insert fails.
- Originals and their source files are never removed or rewritten.
- Added focused tests for creation, original preservation, idempotency and missing-file continuation.

## Run instructions

From `backend/`, after confirming the target MongoDB and `UPLOAD_DIR`:

```text
pnpm photos:backfill-thumbs
```

The command reads `MONGO_URI`, `MONGO_DB` and `UPLOAD_DIR` when provided, otherwise uses the repository defaults. It has not been run against a live database in this task; run it once in the intended environment and review the final JSON report.

## Protected scope

- Backend script and focused test only.
- No frontend, picker, Product/Material business logic, original deletion, upload-path rewrite or deploy changes.

## Verification

- Backend TypeScript: PASS (`tsc --noEmit` and build config).
- Focused photo Jest: PASS — 3 suites / 6 tests.
- Changed-file ESLint: PASS.
- `git diff --check`: PASS.
- `verify-status.sh`: pre-existing FAIL for 72 legacy kit-era entries outside this TZ.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09T01:55:10Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - focused tests: PASS
  - lint: PASS
  - run instructions: UPDATED
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: UPDATED
  - lock file: CREATED
known_limitations:
  - live MongoDB backfill was intentionally not run; PO/operator must execute the documented command
  - global legacy kit-era verify-status drift remains pre-existing
