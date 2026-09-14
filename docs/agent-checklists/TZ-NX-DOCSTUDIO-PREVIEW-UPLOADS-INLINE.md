# TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T04:12:01Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на conflict keys (studio-output.service.ts / .spec.ts / document-render.utils.ts / document-studio.page.md)
- [x] TZ + audit `docs/audits/2026-09-13-docstudio-preview-uploads-inline.md` прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-PREVIEW-UPLOADS-INLINE.md` на месте

## Acceptance

- [x] `StudioOutputService.preview()` inlines local `/uploads/*` to `data:` URIs (reuse `inlineLocalUploadsForPdf`), same as PDF path
- [x] Spec: preview result contains `data:image` for a fixture upload path that exists on disk; leaves bare `/uploads/...` when file is missing (existing behavior preserved)
- [x] `docs/pages/document-studio.page.md` — Просмотр = same inlined uploads as PDF
- [x] Gates: BE tsc + `pnpm test` studio-output green

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (backend bugfix, no new page/permission/module/MCP)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, pure output-pipeline bugfix
- [x] page.md: `docs/pages/document-studio.page.md` — updated (Просмотр note)
- [x] DOMAIN-MAP: N/A — no module/route/page contour change
- [x] SECTION-READINESS: N/A — no user-contour change
- [x] Чужой WIP не в коммите; conflict keys соблюдены (docs/PO-CANON.md, docs/PO-SHARED-UNDERSTANDING.md, docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md are pre-existing modified/untracked from another agent — left untouched, not staged)
- [x] Coupling map: N/A — no shared status/FK field touched
- [x] Канон: `docs/DOCS-INTEGRITY.md` — followed

## Build integrity (frontend-nx / kppdf-web)

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (2026-09-14, before Claim)
- [x] Нет другого `tasks/_active/*` c `apps/kppdf-web/src/**` (BE-only change, no FE touch)
- [ ] N/A — BE-only, no FE change; nx build not required to re-run at close (per TZ IMPLICIT CONFLICT note: "nx build only if FE touched")

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0, no output
- `cd backend && pnpm test` → 136 suites / 1366 tests passed (full suite, not scoped) — includes `studio-output.service.spec.ts` (9/9) and `document-render.utils.spec.ts`
- `cd backend && pnpm exec eslint src/modules/studio-document/studio-output.service.ts src/modules/studio-document/studio-output.service.spec.ts` → 0 problems
- `cd backend && pnpm lint` (full) → 0 errors, 202 pre-existing `no-explicit-any` warnings unrelated to this change
- `pnpm architecture:check` (root) → passed (1487 files; baseline 17)
- Baseline `nx build kppdf-web` (before Claim) → exit 0; BE-only change, no FE re-run required per TZ IMPLICIT CONFLICT note

## Executor report

- Root cause (per audit): `StudioOutputService.preview()` returned raw HTML with path-absolute `/uploads/…` `<img src>`, which the `[srcdoc]` iframe (origin `about:srcdoc`) does not reliably resolve — broken image icon in Просмотр on documents where the PDF (which already ran `inlineLocalUploadsForPdf`) showed photos fine.
- Fix: `backend/src/modules/studio-document/studio-output.service.ts` — `preview()` now pipes the rendered HTML through the existing `inlineLocalUploadsForPdf` (`document-render.utils.ts`) before returning, same helper the PDF path already uses via `QuotationOutputService.renderHtmlToPdf`. Did not rename the helper (TZ offered it as optional "или") — no second call site needed, kept the diff minimal.
- Tests added to `studio-output.service.spec.ts`: preview inlines an on-disk upload to `data:image/png;base64,…` and drops the bare URL; preview leaves a genuinely missing upload's bare `/uploads/...` URL untouched (mirrors existing `inlineLocalUploadsForPdf` missing-file behavior — no new "Нет фото" placeholder logic invented here, out of scope per TZ "НЕ" list).
- Docs: `docs/pages/document-studio.page.md` §4 — added a note that Просмотр and PDF now share the same uploads-inlining pipeline.
- Known limits: does not touch `PHOTO-EMPTY` blank-cell text or `UNSCOPED-ORG` scope (both explicitly out of scope / separate TZs in this same wave, queued next).
- Conflict disclosure: pre-existing uncommitted changes to `docs/PO-CANON.md`, `docs/PO-SHARED-UNDERSTANDING.md`, `docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md` from another agent were left untouched and not staged.

## Review handoff

- [x] READY FOR REVIEW — N/A for this TZ (no explicit review-inbox requirement stated); DoD gates are the acceptance signal for this S-size backend fix

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14
