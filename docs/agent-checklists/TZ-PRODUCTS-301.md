# TZ-PRODUCTS-301 — «Цвета»: справочник цветов (RAL) — backend контракт + UI справочника

> Checklist (конвенция GEMINI.md / AI-AGENT-GUIDE). Создан до финализации, обновлён по результатам.

## Scope

Layer 4 → 3 (backend entity + dictionaries UI). Первый в цепочке Products (301 → 302 → 303 → 304).

- `backend/src/modules/color-reference/**` (NEW): schema (organizationId sparse, slug, name, hex, description?, isSystem, isActive, isDefault, deletedAt soft-delete), DTO create/update (whitelist-only, @IsHexColor), service (assertAssignable + resolveDefault + assertDefaultId, IDOR, soft-delete), controller (RBAC + AuditAction), module.
- `backend/src/common/seed/color-references.seed.ts` (NEW): системный default «Не выбран» (slug `ne_vybran`, hex `#9CA3AF`, isDefault) — идемпотентный, UTF-8 (БЕЗ CP1251-bug).
- `backend/src/app.module.ts` — регистрация ColorReferenceModule + ColorReferencesSeed.
- `frontend/src/app/shared/services/pi-color-references.service.ts` (NEW) + spec — кэш активного каталога (TZ-DOC-309 паттерн), инвалидация на CRUD.
- `frontend/src/app/pages/dictionaries/color-references.page.ts` (NEW) + spec — pi-table (name/slug/hex swatch/isActive switch + Copy/Edit/Delete), поиск, пагинация N>100.
- `frontend/src/app/pages/dictionaries/color-reference-form-dialog.component.ts` (NEW) — content-диалог 1000px, sticky footer (PiDialog contract), hex-пикер.
- `frontend/src/app/app.routes.ts` — `/dictionaries/color-references` + `adminOnlyRouteGuard`.
- `frontend/src/app/layout/app-layout.component.ts` + `pi-nav-dropdown.component.ts` — пункт «Цвета» (Palette icon).
- `docs/pages/color-references.page.md` (NEW).

## Dependencies

- Референсы: TZ-DOC-307/315 (sparse-unique `{organizationId, slug}`, system default, IDOR, 409 on used/system), TZ-DOC-321 (seed wiring), TZ-MATERIALS dialog fix (sticky footer), TZ-MATERIALS-310 (copy slot).
- Фундамент для TZ-PRODUCTS-302 (RAL dropdown в диалоге товара).

## Conflict keys

- `backend/src/modules/color-reference/*` (NEW)
- `backend/src/app.module.ts` (модуль + seed; TZ-DOC-321 text-block seed — НЕ трогать)
- `frontend/src/app/pages/dictionaries/*` (color-references page/dialog NEW)
- `frontend/src/app/shared/services/pi-color-references.service.ts` (NEW)
- `frontend/src/app/app.routes.ts`
- `frontend/src/app/layout/app-layout.component.ts`
- `frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts` (optional item icon)

## Protected paths

- TZ-DOC-* (doc-constructor, template-block), TZ-MATERIALS-* (materials, material), TZ-MODULES-*, TZ-WORKERS/WORKTYPES, TZ-BACKEND-E2E-HARNESS (is-object-id), TZ-278, TZ-DOC-308 categories.page.ts (PRE-EXISTING BLOCKER), Z-backlog, desktop/, sanitize-html, TZ-DOC-321 (text-block seed — parallel agent).
- package.json / lock-файлы без доказанной необходимости.

## Решения (зафиксированы)

1. **Schema-ключ slug, НЕ code**: стабильный `slug` (kebab) — значение, которое 302-диалог кладёт в `Product.ralCode`. Системный seed «Не выбран» = `ne_vybran`.
2. **RBAC**: read `@Roles('user','admin','manager')` (RAL-dropdown в 302 доступен любому авторизованному), мутации `@Roles('admin','manager')` + AuditAction.
3. **IDOR**: organizationId ВСЕГДА из req.user (контроллер → сервис), НЕ из DTO (TZ-DOC-315 паттерн).
4. **Soft-delete**: `deletedAt` (worker/counterparty паттерн); findAll/findById исключают удалённые; remove 409 на system/default.
5. **Фронт guard**: `adminOnlyRouteGuard` = admin|manager (страница — management surface; чтение API открыто user).
6. **Копия цвета**: НЕ переносит `isDefault` (иначе второй default ломает resolveDefault); slug перегенерируется из «(копия)».

## Acceptance criteria (все выполнены)

1. `/dictionaries/color-references` открывается: swatch, name, slug, isActive, Copy/Edit/Delete; system-записи нельзя удалить/переименовать (409 + UI disable). ✅
2. Дубликат slug → 409; невалидный hex → 400 (DTO + service backstop). ✅
3. `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — exit 0. ✅
4. `cd backend && pnpm exec jest color-reference --no-coverage --runInBand` — 34/34 PASS; полный backend jest 43 suites / 441 PASS. ✅
5. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — exit 0. ✅
6. `cd frontend && pnpm exec jest color-reference pi-color-references --no-coverage --runInBand` — 24/24 PASS. ✅
7. `cd frontend && pnpm exec ng build --configuration=development` — exit 0 (categories.page.ts blocker отсутствует в этом билде). ✅
8. `git diff --check` — clean. ✅
9. Code review (code-reviewer-deepseek-flash): P1 — пагинация N>100 не работала (total = sliced length → pager скрыт); исправлено: `filtered` (total) vs `visible` (slice). P2 — copy не переносил isDefault; добавлен guard. ✅

## Тесты

- `color-reference.service.spec.ts` (NEW, 34 tests): create (валидный, slug-генерация из кириллицы, невалидный hex 400, slug-collision 409, другой org разрешён), findAll (org-scope + system, activeOnly, search name/slug $and, regex-escape), update (rename id stable, slug-collision 409, IDOR 403, system 409, hex 400), resolveDefault (org → system → null), assertDefaultId (valid, system, non-default 400, malformed 400), assertAssignable (same org, system, 404, inactive 400, foreign 400, malformed 400), remove (system 409, default 409, IDOR 403, soft-delete), controller RBAC + AuditAction metadata.
- `pi-color-references.service.spec.ts` (NEW, 10 tests): cache share/in-flight, error-no-cache, dictionary no-cache, search fresh, invalidation create/update/remove, stale-response guard, failed-mutation keeps cache, findById.
- `color-references.page.spec.ts` (NEW, 14 tests): loading/error/empty, search name/slug, sort ru-collation, system toggle blocked, optimistic toggle + rollback, delete blocked/system, remove used → snackbar, delete success, reload on close, copy prefill.

## Browser-сценарий

MANUAL_BROWSER_CHECK_REQUIRED — live authenticated flow не запускался (dev-stack не поднимался); контракт доказан unit-тестами (TestBed + pi-table template compile) + ng build.

## Known limitations

- TZ-DOC-308 categories.page.ts — пре-экзистинг блокер из основного worktree; в этом билде ng build прошёл (не зафиксирован как blocker, но и не fix-force'ился).
- `frontend` полный jest: 1 pre-existing failure в `button.component.spec.ts` (click stopPropagation) — воспроизводится на чистом baseline (stash проверен), НЕ регрессия этой задачи (мои файлы не затронуты).
- E2E (backend/test/e2e) не запускался — unit-контракт доказан (TZ-файл допускает unit gates).
