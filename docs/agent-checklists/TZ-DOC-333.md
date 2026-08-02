# Checklist TZ-DOC-333 — Persist template-block photos

**Task:** `tasks/TZ-DOC-333-persist-template-block-photos.md`
**Status:** DONE — implementation and automated gates verified 2026-08-02

## Acceptance evidence

- Upload endpoint: `POST /api/template-blocks/:id/image` with PNG/JPEG/WebP, 5 MB limit, disk storage under `uploads/template-blocks/{blockId}/`.
- Mongo stores only `/uploads/...` image URLs; create/update reject `blob:`, `data:`, traversal, and other non-canonical URLs.
- Builder palette creates the block without a blob URL, uploads after persistence, swaps to the canonical URL, and revokes the object URL.
- Inspector replacement uses the same upload endpoint and requires a persisted block id.
- Existing template-background upload flow was not changed.

## Gates

| Gate | Result | Exit |
|---|---|---:|
| Backend tsc | PASS | 0 |
| Backend template-block Jest | PASS — 1 suite / 7 tests | 0 |
| Upload-image E2E | PASS — 1 suite / 10 tests | 0 |
| Frontend tsc | PASS | 0 |
| Frontend targeted Jest | PASS — 2 suites / 29 tests | 0 |
| Angular development build | PASS | 0 |
| DOC-333 diff-check | PASS; shared deploy docs retain unrelated trailing-space warnings | 0* |

## Manual AC

Automated E2E proves the persisted `/uploads/template-blocks/...` contract, replacement, validation, and reload-visible Mongo URL. A real browser leave/reopen smoke with the running authenticated dev stack remains `MANUAL_BROWSER_CHECK_REQUIRED`; it was not falsely claimed as executed.

## Changed scope

- Backend template-block controller/service/schema/DTO and upload E2E.
- Frontend template-block service spec, builder palette/inspector upload flow, renderer blob guard, and regression specs.
- Photo architecture, page index, and deploy volume documentation.

## Known limitations

HEIC/Live Photo, CDN URLs, existing-blob migration, and changing wipe semantics remain out of scope. The current worktree contains a separate deploy-preparation cluster; no commit or push was made.

## Executor report (auto)

- **status:** DONE
- **commit:** not created; PO did not request commit/push
- **gates:** backend tsc; template-block Jest 7/7; upload E2E 10/10; frontend tsc; targeted Jest 29/29; ng build — PASS
- **manual:** browser persistence smoke remains required when authenticated dev stack is available
- **known:** HEIC/CDN/legacy blob cleanup are successors; shared deploy docs have unrelated whitespace warnings
- **ask:** split this scope from DEPLOY-301 dirty files before any atomic commit
