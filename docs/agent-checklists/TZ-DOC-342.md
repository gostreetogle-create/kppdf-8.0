# TZ-DOC-342 checklist

> Status: **DONE**
> TZ: `tasks/_backlog/TZ-DOC-342-upload-background-null-file-400.md`
> Archive: `tasks/_archive/2026-08/TZ-DOC-342.done.md`

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-09T03:17:11Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-DOC-342)

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0
- [x] `_active/` has TZ-SALES-317 (FE proposals) — **no key overlap** with DOC-342 backend upload
- [x] Claim slot filled before code

## Acceptance

- [x] Missing `file` on upload-background → 400 RU (not 500)
- [x] Valid PNG still 201
- [x] template-block uploadImage missing file → 400 (controller + service guard)
- [x] e2e covers missing-file case
- [x] tsc backend PASS

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm test:e2e -- test/e2e/document-templates-upload-background.e2e-spec.ts` → PASS 6/6
  (incl. missing file → 400; valid PNG → 201)
- `git diff --check` → PASS

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor/PO evidence verdict: PASS
- [x] Executor report (auto)
- [x] Archive + DONE lock created
- [x] Active marker removed

## Executor report (auto)

- CLAIM agent-3e757640b7 @ 2026-08-09T03:17:11Z; peer SALES-317 FE untouched
- Guard `if (!file) BadRequestException('Файл не получен…')` in document-template and template-block controller/service upload paths
- e2e: POST multipart without `file` → 400 + message contains «Файл не получен»
- Valid PNG remains 201; existing MIME/5MB/cap=5 behavior unchanged
- Docs: upload-background contract recorded in `docs/pages/builder.page.md`
- Cursor/PO evidence: PASS; closeout archived
