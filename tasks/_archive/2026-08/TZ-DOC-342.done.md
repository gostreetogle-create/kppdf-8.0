# TZ-DOC-342 — upload-background missing file → 400

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-09
closed_by: Buffy closeout / agent-ccee39fec2
verification:
  - acceptance criteria: PASS
  - missing multipart file: 400 with RU message
  - valid PNG: 201 with background URL
  - template-block missing file: 400 guards in controller and service
  - backend typecheck: PASS
  - e2e: PASS — document-templates-upload-background 6/6
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PASS
  - Cursor/PO evidence verdict: PASS
  - git diff --check: PASS

## Delivered

- Added a defensive missing-file `BadRequestException` to document-template background upload in both controller and service.
- Added the same guard to template-block image upload in both controller and service.
- Added e2e coverage for a multipart request without `file`; valid PNG, MIME, size, not-found, and five-image-cap coverage remains green.
- Documented the upload contract in `docs/pages/builder.page.md`.

## Gates

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — PASS.
- `cd backend && pnpm test:e2e -- test/e2e/document-templates-upload-background.e2e-spec.ts` — PASS, 6/6.
- Existing MIME whitelist, 5 MB limit, five-image cap, ownership, roles, and storage path unchanged.

No SALES-317, proposal-create, KP, builder-inspector, deploy, or unrelated WIP changes.
