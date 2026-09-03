# TZ-NX-DOCSTUDIO-S28-PUT-DATASET-HYDRATE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S28-PUT-DATASET-HYDRATE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-03T20:39:29Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-NX-DOCSTUDIO-S28
- team_room_claim: unavailable (prefilled by Cursor orch to unblock, verified against tasks/_active before code)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → worktree `.worktrees/TZ-NX-DOCSTUDIO-S28`, branch `claude/docstudio-s28`, baseline b9137a30
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (S27 worktree — отдельная ветка/задача)
- [x] TZ / канон / deps прочитаны (TZ file, document-studio.page.md §2.3, studio-data-resolver.ts, studio-document.service.ts)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DOCSTUDIO-S28-PUT-DATASET-HYDRATE.md` на месте

## Acceptance

- [x] putDataSet response содержит непустые rows при непустом catalogSelections + catalog source
- [x] Empty selection → rows: []
- [x] Не меняет finalize/PDF контракт (bakeSnapshot/PDF path нетронуты — resolveDataSets/bakeSnapshot вызовы в studio-output.service.ts не тронуты)
- [x] `cd backend && pnpm test -- studio-data-resolver` и/или studio-document putDataSet specs PASS
- [x] `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: module (backend service, no schema/route/permission change)
- [x] FIC §A–E: N/A — no new page/permission/module/MCP, pure service-logic change behind existing route
- [x] page.md / PAGE-TZ-INDEX: N/A — document-studio.page.md §2.3 already describes this contract; no page text change needed
- [x] SECTION-READINESS: N/A — no user-contour change
- [x] Чужой WIP не в коммите; conflict keys соблюдены (только файлы из CONFLICT KEYS этого TZ)
- [x] Coupling map: N/A — no shared status/FK field touched
- [x] Канон: docs/DOCS-INTEGRITY.md — учтён

## Gates (факт)

- `cd backend && pnpm install --frozen-lockfile` — OK (node_modules отсутствовал в worktree)
- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — exit 0, PASS
- `cd backend && pnpm test -- studio-data-resolver studio-document.service` — 2 suites, 44 tests, PASS
- `cd backend && pnpm test -- studio-document studio-output studio-quotation-lifecycle` — 6 suites, 62 tests, PASS (regression check по всему studio-document module)
- `cd backend && pnpm exec eslint src/modules/studio-document/studio-document.service.ts src/modules/studio-document/studio-document.service.spec.ts` — no output, PASS
- root `pnpm architecture:check` — N/A: root node_modules отсутствует в этом worktree; изменение не пересекает shared↔pages/frontend import boundaries (чисто backend intra-module DI, StudioDataResolverService уже был provider в studio-document.module.ts) — раздувать baseline полной установкой ради BE-only TZ не стал

## Executor report

- Изменён `backend/src/modules/studio-document/studio-document.service.ts`:
  - `StudioDocumentService` теперь инжектит `StudioDataResolverService` (уже был provider в модуле, только не использовался этим сервисом).
  - `putDataSet` после upsert+bumpRevision вызывает новый приватный `hydrateLiveDataSetRows(saved, trimmedKey)`: если source.type upserted-энтри ∈ `quotation-items|order-items|catalog-products|catalog-modules|catalog-parts|catalog-materials`, подгружает блоки (`blockService.findAllByStudioDocument`) и живые rows через `dataResolver.resolveDataSets(doc, blocks, true)`, подставляя resolved rows **только в возвращаемый объект** (не пересохраняет документ повторно — `manual` и prefetched rows в БД остаются как прислал FE).
  - `manual` источник и любые другие ключи не запускают resolver (no-op fast path).
  - finalize/PDF контракт не тронут: `bakeSnapshot`/`resolveDataSets` вызовы в `studio-output.service.ts` не менялись.
- Обновлён `backend/src/modules/studio-document/studio-document.service.spec.ts`: добавлен `dataResolver` mock + `blockService.findAllByStudioDocument` mock в `createService()`; 3 новых теста (catalog-products hydrate непустые/пустые rows, manual source не вызывает resolver).
- Conflict disclosure: правил только файлы из CONFLICT KEYS TZ (`studio-document.service.ts`, `studio-document.service.spec.ts`); `studio-data-resolver.ts`/`studio-data-resolver.spec.ts` не менялись — существующий `resolveDataSets` уже покрывал catalog/quotation/order логику, переиспользован as-is.
- Known limits: hydration синхронный live-read при каждом `putDataSet` для catalog/КП/заказ источников — те же org-scope/ForbiddenException правила, что и в Preview/PDF (переиспользован тот же resolver).

## Review handoff

- [x] Одиночный BE TZ без wave inbox зависимости — self-gates по acceptance criteria TZ пройдены выше
- [x] Archive выполнен после зелёных gates

## Closeout (после PASS)

- [x] archive + progress (progress.md — redirect-only, запись не требуется) + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-03T21:10:00Z
