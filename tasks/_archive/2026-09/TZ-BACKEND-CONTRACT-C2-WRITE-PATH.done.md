# TZ-BACKEND-CONTRACT-C2-WRITE-PATH

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`, exit 0)
  - tests: PASS (`create-contract.dto.spec.ts`, 4 tests)
  - lint: PASS (targeted Contract DTO/service/spec eslint, exit 0)
  - checklist: ADDED and completed
  - progress.md: N/A (live state is `_NOW.md`)
  - status synchronization: PASS

## Delivered

- Extended `CreateContractDto`/`UpdateContractDto` with optional `contractStatus`, `attachmentFileId`, and `attachmentUrl` fields.
- Added conditional validation: `contractStatus=file_attached` requires a non-empty file id or URL; `generated` remains file-optional.
- `ContractService.create()` persists the attachment state and references, inferring `file_attached` when a reference is supplied and defaulting to `none` otherwise.
- `ContractService.update()` supports attachment changes; explicit `contractStatus=none` clears both attachment fields. The existing lifecycle `status`/sign/activate paths remain unchanged.
- Added focused DTO regression spec covering create, update, valid file attachment, and generated-without-file cases.

## Integrity

Backend Contract write path only; no frontend-nx, quotation, Order, UI, or multipart attachment files changed. The shared `_NOW.md` contains parallel executor WIP and remains unstaged by design.
