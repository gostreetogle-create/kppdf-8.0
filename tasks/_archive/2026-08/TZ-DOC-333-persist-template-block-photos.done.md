# TZ-DOC-333 — Persist template-block photos

<!-- ARCHIVE_MARKER -->

## Outcome

**DONE.** Template-block photos now persist as files under `uploads/template-blocks/{blockId}/` with relative `/uploads/...` URLs in Mongo. The builder palette and inspector use upload-first flows; ephemeral `blob:`/`data:` URLs are rejected from persistence.

## Implementation

- Backend multipart endpoint `POST /api/template-blocks/:id/image` with PNG/JPEG/WebP allowlist, 5 MB limit, replacement cleanup, and audit metadata.
- Backend create/update URL validation, including traversal protection.
- Frontend `TemplateBlocksService.uploadImage()` multipart contract.
- Builder palette: persist block first, upload second, replace preview URL, revoke object URL, and toast failures.
- Inspector: persisted-id guard, upload-first replacement, race-safe update, and preview cleanup.
- Renderer soft-guard for legacy broken `blob:`/`data:` values.
- Architecture, page index, and deploy-volume documentation updated.

## Verification

- Backend tsc: PASS.
- Backend template-block Jest: PASS, 7 tests.
- Upload-image E2E: PASS, 10 tests.
- Frontend tsc: PASS.
- Targeted frontend Jest: PASS, 29 tests.
- Angular development build: PASS, exit 0.
- DOC-333 scope diff-check: PASS; shared deploy documentation still has unrelated trailing-space warnings.

## Manual acceptance

Automated E2E proves the persisted URL/Mongo contract, replacement, validation, and reload-visible data. Authenticated browser leave/reopen smoke remains `MANUAL_BROWSER_CHECK_REQUIRED` and was not claimed as executed.

## Known limitations

HEIC/Live Photo, CDN URLs, migration of pre-existing blob records, and changing wipe semantics are out of scope. The worktree also contains a separate TZ-DEPLOY-301 cluster; this closeout was not committed or pushed because the PO did not request it.

## Related artifacts

- Checklist: `docs/agent-checklists/TZ-DOC-333.md`
- Audit: `docs/audits/DOC-333-photo-persist-audit.md`
- Source task: `tasks/TZ-DOC-333-persist-template-block-photos.md`
