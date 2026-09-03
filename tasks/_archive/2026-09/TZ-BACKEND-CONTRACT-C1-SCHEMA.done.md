# TZ-BACKEND-CONTRACT-C1-SCHEMA

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`, exit 0)
  - tests: N/A (schema-only; focused behavior specs belong to C4)
  - lint: PASS (targeted contract schema eslint, exit 0)
  - checklist: ADDED and completed
  - progress.md: N/A (live state is `_NOW.md`)
  - status synchronization: PASS

## Delivered

- Added `ContractAttachmentStatus = 'none' | 'file_attached' | 'generated'`.
- Added indexed `contractStatus` with default `none`.
- Added optional string `attachmentFileId` and `attachmentUrl` fields.
- Preserved the existing `ContractStatus` lifecycle enum and signing/activation fields.

## Integrity

Backend schema/module change only; FIC §C route/API surface is N/A for C1. No `frontend-nx/**`, quotation, Order, or UI files were changed or staged. Existing unrelated dirty WIP remains outside this commit.
