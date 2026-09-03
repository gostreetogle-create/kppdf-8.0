# TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH.md` (removed after archive)
> Commit/push: per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-04T00:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this worktree)

## Preflight

- [x] `git status` / `git branch --show-current` → worktree `D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S33`, branch `claude/docstudio-s33`
- [x] `_NOW.md` + `tasks/_active/` read — no other CLAIM on `studio-list.page.ts` / `proposals-list.page.ts` / `nx build kppdf-web`
- [x] TZ read; S32 dependency already merged (docTypeId field, ensureLinkedQuotation, isKpDoc already exist in `studio-editor.page.ts`)
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH.md` on место (copied from `_ready`)

## Acceptance

- [x] «Новое КП» button on `/studio` list → `create()` with КП `docTypeId` (resolved via `PiDocTypesService`, `slug==='proposal' || name==='КП'`)
- [x] `/proposals` «Создать в студии» → same КП creation path (create with docTypeId, navigate straight to the new doc)
- [x] `ensureLinkedQuotation` contract unchanged — reused via existing `studio-editor.page.ts` effect (fires on load once `isKpDoc()` is true and no `quotationId` yet)
- [x] Generic «Создать документ» stays docType-less (`docTypeId: undefined`)

## Integrity slot

- [x] Тип изменения: page (frontend-nx `apps/kppdf-web`) + shared `libs/data-access` type
- [x] FIC §A–E: N/A — no new permission/module/MCP surface; pure client-side create-flow wiring against an existing, unmodified backend contract (`docTypeId` already accepted by `CreateStudioDocumentDto`)
- [x] page.md / PAGE-TZ-INDEX: N/A — no new route, no page-level contract change (button added to existing document-studio / proposals pages)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys (`studio-list.page.ts`, `proposals-list.page.ts` CTA only) соблюдены — не трогал `studio-editor.page.ts` behavior, только вынес дублирующийся `isKpDocType` check в общий хелпер
- [x] Coupling map: N/A — no shared-field/status contract changed
- [x] docs/DOCS-INTEGRITY.md: канон соблюдён

## Build integrity

- [x] Baseline `nx build kppdf-web` перед кодом — см. Gates
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` implicit conflict — только `TZ-NX-DOCSTUDIO-S33-CREATE-KP-PATH.md` в `_active`
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

```text
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
  → PASS, exit 0

cd frontend-nx && pnpm exec jest --config apps/kppdf-web/jest.config.ts studio-list.page.spec.ts proposals-list.page.spec.ts
  → PASS, exit 0 (2 suites, 31 tests, 0 failed)

cd frontend-nx && pnpm exec nx test kppdf-web (full suite, baseline check)
  → FAIL: 2 failing (registries.catalog.spec.ts) — ПРЕДСУЩЕСТВУЮЩИЙ baseline,
    не связан с этим TZ (файл не в diff); идентично документированному в S32/S31
    (350 passed / 7 skipped / 359 total)

cd frontend-nx && pnpm exec eslint <изменённые файлы этого TZ>
  → PASS, exit 0, 0 problems (studio-list.page.ts, studio-list.page.spec.ts,
    studio-kp-doc-type.ts, proposals-list.page.ts, proposals-list.page.spec.ts,
    studio-document.types.ts)

cd frontend-nx && pnpm exec nx lint kppdf-web (full project, baseline check)
  → FAIL: 21 errors / 75 warnings — идентично baseline S32 (96 problems),
    все ошибки в файлах вне diff этого TZ (studio-blocks-canvas.component.ts,
    studio-properties-panel.component.ts, studio-table-properties.component.ts,
    studio-text-properties.component.ts, studio-workspace-shell.component.html,
    studio-layers-panel.component.ts + 1 pre-existing error в studio-editor.page.ts:220,
    вне мест правки S33)

pnpm architecture:check
  → PASS: "Architecture check passed (1398 files; baseline 17; resolved since baseline: 2)."

cd frontend-nx && pnpm exec nx build kppdf-web
  → PASS, exit 0 (Successfully ran target build for project kppdf-web and 4 tasks it depends on)
```

## Executor report

**Изменено:**
- `frontend-nx/libs/data-access/src/lib/doc-studio/studio-document.types.ts` — `CreateStudioDocumentPayload.docTypeId?: string`
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-kp-doc-type.ts` (new) — `isKpDocType` / `findKpDocType` shared helper (slug==='proposal' || name==='КП')
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` — reuse `isKpDocType` instead of two inline duplicated checks (no behavior change)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.ts` — new «Новое КП» button + `createKp()`, `create()` refactored into shared private `createDocument(docTypeId?)`
- `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.ts` — `createInStudio()` now resolves the КП doc type and creates+opens the studio document directly (was: bare `navigate(['/studio'])`)
- `frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-list.page.spec.ts` (new)
- `frontend-nx/apps/kppdf-web/src/app/pages/proposals/proposals-list.page.spec.ts` — added `PiDocTypesService` mock to all describe blocks + new `TZ-NX-DOCSTUDIO-S33` describe block

**Known limits:** doc type lookup happens client-side per click (extra `GET /doc-types` call); acceptable — list is small and cached server-side/HTTP-cache is out of scope for this TZ.

## Review handoff

- [x] Self-reviewed diff; no wave inbox review required by TZ (no CATALOG/DICT review gate referenced)

## Closeout

- [x] archive + удалить `_active`
- Status = DONE
- closed_at: 2026-09-04
