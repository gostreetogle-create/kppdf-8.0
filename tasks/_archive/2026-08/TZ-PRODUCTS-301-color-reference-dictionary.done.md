# TZ-PRODUCTS-301 — DONE (Справочник «Цвета» RAL — backend контракт + UI справочника)

**Date:** 2026-08-02
**Outcome:** DONE — новая справочная сущность `ColorReference` (Layer 4) + страница справочника (Layer 3). Фундамент для TZ-PRODUCTS-302 (RAL dropdown в диалоге товара).
**Layer:** 4 → 3.

## Что сделано

**Backend (Layer 4) — `backend/src/modules/color-reference/`:**
- schema: `organizationId` (sparse, TZ-240 конвенция: undefined = system), `slug` (стабильный kebab-ключ), `name`, `hex` (#RRGGBB), `description?`, `isActive`, `isSystem`, `isDefault`, `deletedAt` (soft-delete), timestamps; sparse-unique `{organizationId, slug}` (TZ-DOC-307/315 mirror).
- DTO create: whitelist-only, `@IsHexColor` на hex, `@IsString`+`@Length`+`@Matches` на name/slug; organizationId НЕ из DTO (IDOR — всегда из req.user). Update = PartialType.
- service: `create` (slug-генерация из кириллицы, 409 на дубликат slug, 400 на hex), `findAll` (org-scope $or + system, activeOnly, search по name/slug через $and, regex-escape, исключает deletedAt), `findById` (404 на deleted), `update` (IDOR 403, system 409, slug-collision 409, hex 400), `remove` (soft-delete; 409 на system и isDefault), `resolveDefault` (org → system → null), `assertDefaultId`, `assertAssignable` (TZ-DOC-307/315 mirror).
- controller: read `@Roles('user','admin','manager')`, мутации `@Roles('admin','manager')` + AuditAction на все мутации.
- module: `MongooseModule.forFeature`, экспорт service+MongooseModule.
- seed: `backend/src/common/seed/color-references.seed.ts` (NEW) — системный default «Не выбран» (slug `ne_vybran`, hex `#9CA3AF`, isDefault=true), идемпотентный, **UTF-8** (БЕЗ CP1251-bug из text-block-categories.seed.ts).
- `backend/src/app.module.ts` — ColorReferenceModule в imports[] + ColorReferencesSeed в providers[] (между DocumentTemplateCategoriesSeed и BomComponentResolveService; TZ-DOC-321 text-block seed НЕ тронут — parallel agent).

**Frontend (Layer 3):**
- `pi-color-references.service.ts` (NEW) + spec — кэш активного каталога (TZ-DOC-309 паттерн), инвалидация на успешные CRUD.
- `color-references.page.ts` (NEW) + spec — pi-table (name + system badge + default ★, slug, hex swatch, isActive switch disabled для system, row actions Copy/Edit/Delete), поиск по name/slug, сортировка, пагинация N>100 (filtered для total, visible для slice).
- `color-reference-form-dialog.component.ts` (NEW) — content-диалог 1000px, sticky footer (PiDialog contract `flex flex-col max-h-[90vh] min-h-0` panel + `flex-1 min-h-0 overflow-y-auto` body + `shrink-0 sticky bottom-0 bg-paper` footer), hex-пикер + text input, isDefault switch.
- `app.routes.ts` — `/dictionaries/color-references` + `adminOnlyRouteGuard` (admin|manager).
- `app-layout.component.ts` + `pi-nav-dropdown.component.ts` — пункт «Цвета» (Palette icon, optional per-item icon, backward-compatible).
- `docs/pages/color-references.page.md` (NEW).

## Гейты (все зелёные)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — **exit 0**
- `cd backend && pnpm exec jest color-reference --no-coverage --runInBand` — **34/34 PASS**
- `cd backend && pnpm exec jest --no-coverage --runInBand` (полный) — **43 suites / 441 PASS**
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — **exit 0**
- `cd frontend && pnpm exec jest color-reference pi-color-references --no-coverage --runInBand` — **24/24 PASS**
- `cd frontend && pnpm exec ng build --configuration=development` — **exit 0**
- `git diff --check` — clean

## Code review (независимый)

Ревьюер (code-reviewer-deepseek-flash). P1 + P2 исправлены:
- **P1: пагинация N>100 не работала** — `visible()` слайсил данные И его длина передавалась в `[total]` → pager никогда не появлялся (total ≤ pageSize). Исправлено: `filtered()` (полный отфильтрованный+отсортированный список) для `[total]` и счётчика, `visible()` (page slice) для `[data]`.
- **P2: copy переносил `isDefault`** — копия системного default-цвета создала бы второй default (ломает resolveDefault). Исправлено: `onCopy` — guard `isSystem` + `isDefault: false` при префилле.
- Прочие замечания: hex-валидация (DTO @IsHexColor принимает 3/4/8-digit, service backstop строго 6) — задокументировано, сервис строже; `adminOnlyRouteGuard` называние vs поведение (admin|manager — defensible, задокументировано).

## Что НЕ изменялось намеренно

- TZ-DOC-* (doc-constructor, template-block), TZ-MATERIALS-* (materials, material), TZ-MODULES-*, TZ-WORKERS/WORKTYPES, TZ-BACKEND-E2E-HARNESS (is-object-id), TZ-278, TZ-DOC-308 categories.page.ts (pre-existing), Z-backlog, desktop/, sanitize-html, TZ-DOC-321 (text-block seed — parallel agent).
- `Product.ralCode` и product-form-dialog — TZ-PRODUCTS-302.
- package.json / lock-файлы.

## Lock

`.mimocode/locks/TZ-PRODUCTS-301-color-reference-dictionary.lock` — создан до старта, финализирован (gitignored).

## Conventional commit (push НЕ выполнялся — ждёт владельца)

`feat(reference): unified color reference dictionary (TZ-PRODUCTS-301)`

## ARCHIVE_MARKER

```yaml
outcome: DONE
closed_at: 2026-08-02
closed_by: autonomous-backend+frontend-agent (Buffy)
source_task: tasks/TZ-PRODUCTS-301-color-reference-dictionary.md
implementation_commit: 610fd4b
verification:
  - backend_tsc: PASS
  - jest_color_reference: 34/34 PASS
  - jest_backend_full: 43 suites / 441 tests PASS
  - frontend_tsc: PASS
  - jest_frontend_color: 24/24 PASS
  - ng_build_dev: PASS (exit 0)
  - git_diff_check: clean
browser_status: MANUAL_BROWSER_CHECK_REQUIRED (dev-stack не поднимался; контракт доказан unit-тестами)
known_limitations:
  - frontend полный jest: 1 pre-existing failure в button.component.spec.ts (click stopPropagation) — воспроизводится на чистом baseline (stash проверен), НЕ регрессия (мои файлы не затронуты)
  - E2E backend не запускался (unit-контракт доказан; TZ-файл допускает unit gates)
  - TZ-DOC-308 categories.page.ts — pre-existing blocker из основного worktree (в этом билде ng build прошёл; не fix-force)
  - hex-валидация: DTO @IsHexColor принимает 3/4/6/8-digit, service backstop строго #RRGGBB (сервис строже — задокументировано)
protected_files:
  - backend/src/modules/color-reference/* (schema, dto, service, controller, module, spec)
  - backend/src/common/seed/color-references.seed.ts
  - backend/src/app.module.ts
  - frontend/src/app/shared/services/pi-color-references.service.ts (+ spec)
  - frontend/src/app/pages/dictionaries/color-references.page.ts (+ spec)
  - frontend/src/app/pages/dictionaries/color-reference-form-dialog.component.ts
  - frontend/src/app/app.routes.ts
  - frontend/src/app/layout/app-layout.component.ts
  - frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts
  - docs/pages/color-references.page.md
not_changed:
  - TZ-DOC-321 text-block seed (parallel agent)
  - product-form-dialog + Product.ralCode (TZ-PRODUCTS-302)
  - TZ-MATERIALS-*, TZ-MODULES-*, TZ-DOC-*, TZ-WORKERS/WORKTYPES, Admin/RBAC, Z-backlog
  - package.json / lock-файлы
lock_file: .mimocode/locks/TZ-PRODUCTS-301-color-reference-dictionary.lock
```
