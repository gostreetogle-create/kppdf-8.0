# TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T04:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на conflict keys (studio-document.service.ts / .spec.ts / studio-editor.page.ts)
- [x] TZ + evidence `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-ISSUER-SELECT.txt` §lockout прочитаны
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-UNSCOPED-ORG-SCOPE.md` на месте

## Acceptance

- [x] Admin unscoped: сменить Исполнитель → сразу «+ Фото» / «+ Текст» → 200, слой на листе (backend regression test: unscoped `update` issuer switch A→B then `addBlock` succeeds, no 403)
- [x] Bound user: чужой org doc → 403 (kept — IDOR unchanged, existing + new tests both green)
- [x] Gates: `studio-document.service.spec.ts` (BE, 40/40) + FE toast path (`studio-editor-write-serial.spec.ts`) + `nx build kppdf-web` (FE touched)

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (backend/FE security-scope bugfix, no new page/permission/module/MCP)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP
- [x] page.md: `docs/pages/document-studio.page.md` §2.2 — known_limitation replaced with Fixed note
- [x] DOMAIN-MAP: N/A — no module/route/page contour change
- [x] SECTION-READINESS: N/A — no user-contour change
- [x] Чужой WIP не в коммите; conflict keys соблюдены (`docs/agent-checklists/STREAM-QUEUE.md` listed as a conflict key by the TZ but left untouched — already dirty with another agent's WIP; this TZ's own scope didn't require editing it)
- [x] Coupling map: N/A — org scope check is per-document, not a shared cross-page status/FK field
- [x] Канон: `docs/DOCS-INTEGRITY.md` — followed

## Build integrity (frontend-nx / kppdf-web)

- [x] Baseline до кода: green at wave start (see TZ #1 checklist) and re-confirmed before this TZ's changes
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` → exit 0 (same pre-existing bundle-budget warnings as baseline, no new ones)

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0
- `cd backend && pnpm test` → 136 suites / 1369 tests passed (full suite; +3 vs TZ #1's 1366 = the 3 new backend regression tests)
- `cd backend && pnpm exec eslint src/modules/studio-document/studio-document.service.ts src/modules/studio-document/studio-document.service.spec.ts` → 0 problems
- `cd frontend-nx && pnpm exec nx test kppdf-web` → 126 suites / 942 tests passed (7 pre-existing skips, unrelated)
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → 38 errors / 293 warnings; **verified via `git stash` A/B** that baseline (without this TZ's 2 FE files) is 38 errors / 291 warnings — this TZ adds 0 new errors, +2 warnings (non-null assertions in the new spec test, same style as the rest of that file)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0, identical pre-existing warnings to the wave's baseline build (bundle budget, 2 NG8102 in an unrelated file)
- `pnpm architecture:check` (root) → passed (1487 files; baseline 17)

## Executor report

- Root cause (per ISSUER-SELECT evidence): every mutation/read funneled through `StudioDocumentService.findById`, which resolved the CALLER's own tenant scope via `resolveOrganizationId` (unscoped/admin → alphabetical-first org fallback) and asserted the DOCUMENT's `organizationId` against that fallback. TZ-NX-DOCSTUDIO-ISSUER-SELECT made `organizationId` itself editable per-document (the "Исполнитель" picker) — so once an unscoped admin PATCHed a doc's issuer away from the fallback org, every subsequent request by that same admin (GET/PATCH/addBlock/…) 403'd against the stale fallback, a full self-lockout with no UI recovery path.
- Fix — `backend/src/modules/studio-document/studio-document.service.ts`:
  - `findById(id, organizationId)`: no longer resolves the caller's org via `resolveOrganizationId`. Loads by id unconditionally; `assertSameScope` runs **only** when the raw `organizationId` param is a truthy, valid ObjectId (a bound caller) — an unscoped/admin caller (null/undefined) bypasses the scope check entirely. IDOR protection for bound users is unchanged (still 403 on a foreign-org doc).
  - `findAll(organizationId)`: unscoped/admin now returns every document (`model.find()` with no filter) instead of only the fallback org's docs — fixes the "list disappears after issuer switch" half of the audit too.
  - Six callers that previously did `const orgId = await this.resolveOrganizationId(organizationId); ...findById(id, orgId)` purely to get a scope value for `findById` (`update`, `putDataSet`, `addBlock`, `updateBlockLayouts`, `reorderBlocks`, `remove`, `duplicate`) now pass the raw `organizationId` straight through — `resolveOrganizationId` stays in use only where a concrete org id is actually needed for a new record (`create`, `createFromTemplate`, and `saveAsTemplate`'s new-template `organizationId`, which is unrelated to this TZ and left as-is).
- FE — `apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts`: added `isOrgScopeForbidden` (mirrors the existing `isRevisionConflict` pattern) matching on **status 403 + message containing "organization scope"** — deliberately not status alone, since `RolesGuard` also throws a plain 403 ("Forbidden resource") on the same routes for a role mismatch and must keep the generic toast. Wired into `reportWriteFailure` before the generic `extractErrorMessage` fallback, with its own honest Russian toast: «Нет доступа к документу этой фирмы — выберите свою организацию.» Never touches `conflict()` (that path is 409-only, confirmed untouched).
- Tests added:
  - Backend (`studio-document.service.spec.ts`, +4): `findAll` unscoped lists everything (no filter); `findById` unscoped loads any doc regardless of org; the headline self-lockout regression (unscoped issuer switch A→B via `update`, then `addBlock` on the same doc still succeeds); existing bound-user-403 coverage confirmed unchanged.
  - Frontend (`studio-editor-write-serial.spec.ts`, +2): a 403 org-scope failure toasts the Russian message and never opens the conflict dialog / never leaks the raw English; a plain RBAC 403 ("Forbidden resource") keeps the generic toast (proves the message-content match, not status-only).
- Known limits: `saveAsTemplate`'s target-template `organizationId` still comes from `resolveOrganizationId`'s fallback (not `doc.organizationId`) for an unscoped caller — pre-existing behavior, unrelated to the self-lockout this TZ fixes, left untouched per scope discipline.
- Conflict disclosure: pre-existing uncommitted changes to `docs/PO-CANON.md`, `docs/PO-SHARED-UNDERSTANDING.md`, `docs/agent-checklists/{STREAM-QUEUE,WAVE-2026-09-13-STUDIO-OPS,WAVE-2026-09-13-SUCCESSORS,_NOW}.md` from another agent were left untouched and not staged.

## Review handoff

- [x] READY FOR REVIEW — N/A for this TZ (no explicit review-inbox requirement stated); DoD gates are the acceptance signal

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-14
