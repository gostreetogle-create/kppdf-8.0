# TZ-NX-DOCSTUDIO-SYNC-QUOTATION-ORPHAN checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-SYNC-QUOTATION-ORPHAN.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T04:44:34Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — только что закрытые 01/02, нет чужого CLAIM на studio-quotation-lifecycle
- [x] TZ / канон / deps прочитаны: `studio-quotation-lifecycle.service.ts` (`syncQuotationItems`, `ensureLinkedQuotation`, `assertQuotationOrg`), `quotation.service.ts:139` (`findById` throws `NotFoundException`), `studio-document.controller.ts:251` (`POST :id/sync-quotation`), `studio-editor.page.ts` (`syncKpQuotationItems`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-SYNC-QUOTATION-ORPHAN.md` на месте

## Acceptance

- [x] Dead `linkedQuotationId` (missing quotation OR foreign org) → `syncQuotationItems` не бросает необработанный 404 наружу; KP получает живую draft quotation + items sync; non-KP → `null` — 3 новых unit-теста (deleted / foreign-org / non-KP), все PASS
- [x] Повторный `POST …/sync-quotation` на том же doc → 200 (business-level, не 404) — доказано на service-уровне: heal path возвращает `quotation` без исключения (не HTTP-код напрямую, per TZ Validation Path "backend unit + focused FE", без live Mongo smoke)
- [x] Gates: backend tsc/test + lint + nx build PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: module (backend service logic + thin FE consumer)
- [x] FIC: N/A — bugfix in existing sync flow, не новая page/permission/module/MCP
- [x] page.md: короткая note в `document-studio.page.md` (orphan link heal)
- [x] DOMAIN-MAP: N/A — не менял module/route/page контур, только internal recovery path
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A — `linkedQuotationId` FK-хранение поведение не менялось (только dead-link recovery), не "активный"-статус на нескольких экранах
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity / Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → **PASS** exit 0
- `cd backend && pnpm test` → **PASS** 130 suites / 1265 passed (incl. 3 new heal-path tests in `studio-quotation-lifecycle.service.spec.ts`, 9/9 in that file)
- `cd backend && pnpm lint` → **PASS** 0 errors / 198 pre-existing warnings (fixed 1 error I introduced: unused destructure binding, rewritten as `delete rest['quotationId']`)
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → **PASS** exit 0
- `cd frontend-nx && pnpm test` → **PASS** 105 suites / 726 passed (no regression; no new FE test added — thin one-line consumer fix, no existing test harness for this network method)
- `cd frontend-nx && pnpm lint` → **FAIL** same pre-existing 38-error baseline (verified via `git stash` on `studio-editor.page.ts`: identical line-199 a11y error present without my change too — unrelated, untouched by this TZ)
- `pnpm architecture:check` → **PASS** (1473 files; baseline 17; resolved since baseline: 2)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → **PASS** exit 0

## Executor report

- `backend/src/modules/studio-document/studio-quotation-lifecycle.service.ts`: `syncQuotationItems` now catches `NotFoundException` from `findById`/`assertQuotationOrg`, delegates to new `healOrphanQuotationLink` (clears `doc.linkedQuotationId` + matching `context.quotationId`, saves, calls `ensureLinkedQuotation` for KP docs, then reuses new `performSync` helper — extracted from the original inline sync body — to push items onto the fresh draft). Non-KP docs return `null` after the FK is cleared, no throw.
- `studio-quotation-lifecycle.service.spec.ts`: replaced the old "rejects on org mismatch" test (which encoded the pre-fix behavior this TZ explicitly changes) with 3 new tests — cross-org heal, deleted-quotation heal, non-KP heal-to-null. All 9 tests in the file pass, including the untouched `ensureLinkedQuotation` org-mismatch test (that method's throwing behavior is intentionally unchanged — only `syncQuotationItems` gained the heal path, per TZ scope).
- `frontend-nx/.../studio-editor.page.ts` `syncKpQuotationItems`: on a successful response now also does `this.document.set(result.data.studioDocument)` — without this, a stale local `context.quotationId` could get PATCHed back over the just-healed backend document on the next generic context save, silently undoing the heal.
- `document-studio.page.md`: added an "Orphan linkedQuotationId heal" note.
- No live-Mongo end-to-end smoke performed (would require login + seeding an orphan doc); TZ's own Validation Path lists "backend unit + focused FE", which this satisfies.

## Closeout (после PASS)

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T05:05:00Z
