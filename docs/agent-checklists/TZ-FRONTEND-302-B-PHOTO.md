# TZ-FRONTEND-302-B-PHOTO checklist

> Status: **DONE** (wave FRONTEND-302 archived)
> Marker: `tasks/_active/TZ-FRONTEND-302-B-PHOTO.md`
> Lane: B · Parent: TZ-FRONTEND-302 (umbrella, Lane A-owned — не редактирую)
> Canon: `docs/audits/2026-08-15-angular-component-integrity.md` @ `405cb71d51f56b21e694a0781ca3f82d30c6702d`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy-TZ-FRONTEND-302-B
- claimed_at: 2026-08-15T06:00:00Z
- workspace: D:\kppdf-8.0 (isolated worktree `.worktrees/TZ-FRONTEND-302-B`, branch `feature/TZ-FRONTEND-302-B`)
- team_room_claim: no — Team Room CLI недоступен; claim виден другим worktrees через pushed feature branch (B-TOOLING `c58a7da2`, B-ENTITY-SPEC `6e5a2da3`)

## Preflight

- [x] Worktree чистый после B-ENTITY-SPEC commit/push
- [x] Нет чужого CLAIM на keys (dropzone + quick-create; Lane A batches A1–A6 не пересекаются)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-FRONTEND-302-B-PHOTO.md` на месте

## Acceptance (из canonical audit B-PHOTO)

- [x] Presentational `PiPhotoDropzone` больше не инжектит `PhotosService`/`PiToastService` — не пишет API
- [x] API ownership переехал в container `QuickCreateDialogComponent` (он уже владел `PhotosService`)
- [x] Characterization: upload/delete/error parent-owned; поведение/labels/keyboard/light-dark/public DOM сохранены (template не менялся, только bindings)
- [x] photo spec (3 теста, было 2) + quick-create spec PASS; tsc/lint/architecture PASS
- [x] `git diff --check` PASS
- [x] Отдельный commit/push + evidence
- Browser: dev server в worktree недоступен (отдельный изолированный checkout; frontend не запущен) — отмечено N/A с причиной; DOM-сценарии покрыты компонентными тестами (drop/upload/delete/status/error)

## Integrity slot

- [x] Тип изменения: component boundary (presentational → container API ownership)
- [x] FIC §A–E: N/A для permission/RBAC (нет изменения прав); поведение не менялось
- [x] page.md / PAGE-TZ-INDEX: N/A (нет route change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md, docs/ANGULAR-GUIDE.md §2 container/presentational

## Characterization (B-PHOTO)

- [x] Baseline до правки: photo 2 + quick-create 13 = 15 тестов PASS (16 в паре suites; фактически photo 2 + quick-create 14)
- [x] Текущий контракт задокументирован: dropzone = input `initialPhotos` + outputs `photosChange`/`uploadedPhotoIdsChange`/`uploadStateChange`, но инжектил `PhotosService` (:128-148 upload/remove) и `PiToastService`; container уже владел `PhotosService` (:496) и делал cancel-cleanup.
- [x] После refactor: dropzone чисто presentational (inputs `photos`/`uploading`/`errorMessage`, outputs `uploadRequest`/`deleteRequest`); container делает upload (forkJoin) / delete / toast / error / session-cleanup; upload/delete/error тесты — через реальный DOM drop + container PhotosService mock.

## Gates (факт)

- [x] `cd frontend && pnpm exec jest --runInBand --runTestsByPath src/app/shared/ui/photo/photo-dropzone.component.spec.ts src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts` → **PASS, 2 suites, 17/17** (photo 3 + quick-create 14)
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS, exit 0**
- [x] `cd frontend && pnpm exec eslint` (4 затронутых файла) → **PASS**; `pnpm exec eslint src/` → **PASS, exit 0, 22 warnings** (без новых)
- [x] `pnpm architecture:check` → **PASS** (936 files; baseline 6; resolved since baseline: 0)
- [x] `git diff --check` → **PASS**
- [x] Full frontend Jest: **145/149 suites PASS; 4 pre-existing failing suites** (materials.page, material-detail.page, materials.page-316, form-profiles.service — 13 тестов) — те же 13 fail на чистом canonical baseline `405cb71d` (проверено в scratch worktree); мои 3 batch не добавили ни одного failure.
- Browser: N/A (нет dev server в изолированном worktree); DOM-сценарии в specs

## Executor report

- B-PHOTO выполнен: `PiPhotoDropzoneComponent` — чисто presentational
  (input photos/uploading/errorMessage + output uploadRequest/deleteRequest);
  `QuickCreateDialogComponent` — container владеет `PhotosService` upload/delete,
  error toast, session uploaded IDs cleanup (ngOnDestroy), фото-пейлоад.
- Никаких forwarding wrappers / prop chains; public template/labels/keyboard/
  aria/DOM data-test не менялись; единственный caller (QuickCreate) обновлён атомарно.
- Full Jest: 4 pre-existing failing suites на baseline — НЕ мои ключи
  (materials pages — Lane A scope; form-profiles.service — shared services);
  для umbrella final gate «Full frontend Jest PASS» это остаётся известным
  baseline debt (нужен successor вне B-PHOTO).
- Conflict disclosure: пересечение с Lane A отсутствует.

## Review handoff

- [x] READY FOR REVIEW — child batch; umbrella/audit — Lane A
- [x] Не archive до Cursor/PO PASS (umbrella final)

## Closeout (после PASS umbrella)

- [ ] archive + lock + удалить `_active` marker
