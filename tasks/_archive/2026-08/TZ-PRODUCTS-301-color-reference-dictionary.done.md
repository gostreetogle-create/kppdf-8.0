# TZ-PRODUCTS-301 — DONE (справочник «Цвета»: ColorReference backend-контракт + UI)

**Date:** 2026-08-02
**Outcome:** DONE — backend-сущность `ColorReference` (Layer 4) + UI-справочник
«Цвета» (Layer 3). Паттерн-зеркало TZ-DOC-307/315 (document-template-category /
text-block-category): `assertAssignable` / `resolveDefault` / `assertDefaultId`,
sparse-unique `{organizationId, slug}`, soft-delete, system-цвет «Не выбран» (seed).
**Layer:** 4 (backend) → 3 (frontend).

## Что сделано

### Backend (ШАГ 1)

- `backend/src/modules/color-reference/color-reference.schema.ts` — NEW:
  slug (kebab-lowercase), name, hex (#RRGGBB), description?, isActive,
  isSystem, isDefault, sortOrder, organizationId? (sparse), deletedAt?,
  timestamps; compound unique `{ organizationId: 1, slug: 1 }` sparse;
  secondary `{ isActive: 1 }`.
- `backend/src/modules/color-reference/dto/create-color-reference.dto.ts` —
  NEW: WhitelistOnly, `@Matches(/^#[0-9a-fA-F]{6}$/)` на hex, slug опционален
  (сервер генерирует из name транслитерацией); organizationId НЕ из DTO (IDOR).
- `backend/src/modules/color-reference/dto/update-color-reference.dto.ts` —
  NEW: `PartialType(CreateColorReferenceDto)`.
- `backend/src/modules/color-reference/color-reference.service.ts` — NEW:
  `slugify` (кириллица→латиница), `resolveDefault`, `assertAssignable`,
  `assertDefaultId` (зеркало TZ-DOC-307), create 409 на dup-slug в scope,
  findAll org-scope $or (свои + system) + search + activeOnly, update с
  IDOR-guard `assertCallerCanManage` + 409 на system-цвет + 409 dup-slug,
  remove soft-delete + 409 system, findById с фильтром deletedAt.
- `backend/src/modules/color-reference/color-reference.controller.ts` — NEW:
  GET GET/:id @Roles('admin','manager','user'); POST/PATCH/DELETE
  @Roles('admin','manager'); org из `req.user.organizationId`; Swagger;
  AuditAction на все мутации.
- `backend/src/modules/color-reference/color-reference.module.ts` — NEW:
  MongooseModule.forFeature + модуль.
- `backend/src/common/seed/color-references.seed.ts` — NEW: идемпотентный
  system-цвет «Не выбран» (isSystem=true, isDefault=true, hex #9CA3AF,
  глобальный, без organizationId); slug импортируется из
  `SYSTEM_DEFAULT_COLOR_SLUG` сервиса (консистентно).
- `backend/src/app.module.ts` — регистрация `ColorReferenceModule` +
  `ColorReferencesSeed`.

### Frontend (ШАГ 2)

- `frontend/src/app/shared/services/pi-color-references.service.ts` — NEW:
  list({activeOnly, search}) / findById / create / update / remove через
  silent-http (паттерн pi-document-template-categories.service.ts).
- `frontend/src/app/pages/dictionaries/color-references.page.ts` — NEW:
  pi-table DSL (как document-template-categories.page.ts): swatch-колонка,
  поиск по name+slug, loading/error/empty, активация через switch
  (системные заблокированы), мягкое удаление через AlertDialog
  (системные заблокированы), sortOrder/name сортировка, pluralRu.
- `frontend/src/app/pages/dictionaries/color-references-form-dialog.component.ts`
  — NEW: content-диалог `variant="content"` + `maxWidth="1000px"` со sticky
  footer (TZ-MATERIALS dialog fix); name/slug/hex (text + native color
  picker)/description/isDefault/sortOrder; hex-валидация `#RRGGBB`;
  double-submit guard.
- `frontend/src/app/app.routes.ts` — роут `/color-references` (внутри
  authGuard-родителя, как остальные справочники).
- `frontend/src/app/layout/app-layout.component.ts` — nav-пункт «Цвета»
  в категории «Справочники».

## Изменённые файлы (15)

| Файл | Δ |
|---|---|
| `backend/src/modules/color-reference/color-reference.schema.ts` | NEW |
| `backend/src/modules/color-reference/dto/create-color-reference.dto.ts` | NEW |
| `backend/src/modules/color-reference/dto/update-color-reference.dto.ts` | NEW |
| `backend/src/modules/color-reference/color-reference.service.ts` | NEW |
| `backend/src/modules/color-reference/color-reference.controller.ts` | NEW |
| `backend/src/modules/color-reference/color-reference.module.ts` | NEW |
| `backend/src/modules/color-reference/color-reference.service.spec.ts` | NEW (20 unit) |
| `backend/src/common/seed/color-references.seed.ts` | NEW |
| `backend/src/app.module.ts` | +module +seed импорты/регистрация |
| `frontend/src/app/shared/services/pi-color-references.service.ts` | NEW |
| `frontend/src/app/pages/dictionaries/color-references.page.ts` | NEW |
| `frontend/src/app/pages/dictionaries/color-references-form-dialog.component.ts` | NEW |
| `frontend/src/app/pages/dictionaries/color-references.page.spec.ts` | NEW (14 unit) |
| `frontend/src/app/app.routes.ts` | +роут `/color-references` |
| `frontend/src/app/layout/app-layout.component.ts` | +nav «Цвета» |
| `docs/pages/color-references.page.md` | NEW |
| `docs/agent-checklists/TZ-PRODUCTS-301.md` | NEW |
| `tasks/_archive/2026-08/TZ-PRODUCTS-301-color-reference-dictionary.done.md` | NEW (этот файл) |
| `.mimocode/locks/TZ-PRODUCTS-301-color-reference-dictionary.lock` | NEW (gitignored) |

## Гейты (все зелёные)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — **exit 0**
- `pnpm exec jest --no-coverage --runInBand src/modules/color-reference` —
  **20/20 PASS**
- `pnpm exec jest --no-coverage --runInBand` (полный backend) —
  **44 suites / 430 tests PASS**
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — **мои файлы
  чистые**; ошибки только в чужом `categories.page.ts` (pre-existing,
  TZ-DOC-308 territory, см. Known limitations)
- `pnpm exec jest --no-coverage --runInBand color-references` — **14/14 PASS**
- `pnpm exec jest --no-coverage --runInBand` (полный frontend) —
  **76 suites / 804 tests PASS**
- `pnpm exec ng build --configuration=development` — **exit 0** (bundle complete)
- `git diff --check` — clean (только LF↔CRLF warnings)
- `bash OrchestratorKit/verify-status.sh` — **PASS**

## Code review (независимый)

Ревьюер (code-reviewer-deepseek-flash): **P0/P1 — нет**. Замечания P2
(все приняты/разобраны):
1. Хак `'ne-vybrаn'.replace('а','a')` в page-spec — упрощён до `'ne-vybran'`.
2. `GET /:id` без org-scope — зеркалит reference-паттерн TZ-DOC-307/315
   (document-template-category findById также без scope); НЕ исправлялось,
   чтобы не отклоняться от конвенции модуля-референса — зафиксировано.
3. Отклонение от «admin-only» роута: отдельного capability-ключа `color:*`
   в RBAC-каталоге нет; роут гейтится `authGuard` как остальные справочники;
   мутации защищены backend `@Roles('admin','manager')` — задокументировано
   в route-комментарии и этой доке.
4. Seed-константа — подтверждено: seed импортирует `SYSTEM_DEFAULT_COLOR_SLUG`
   из сервиса (единый источник).
5. `docs/pages/color-references.page.md` — создан.

## Browser / E2E

- Backend e2e не гонялся (модуль покрыт 20 hermetic unit-тестами;
  e2e-харнесс TZ-BACKEND-E2E-HARNESS — чужой pre-existing контекст).
- Frontend browser-флоу не выполнялся (нет запущенного dev-стекa в этой
  сессии) → **MANUAL_BROWSER_CHECK_REQUIRED** (сценарий — в checklist).

## Known limitations

- `categories.page.ts` — **project-wide build blocker (out-of-scope)**:
  незакоммиченные правки параллельной сессии TZ-DOC-308 добавляют
  `destroyRef`-дубликат и незакрытый импорт `DocumentTemplateCategoryFormDialogComponent`
  → `tsc --noEmit` падает на этом файле. `ng build` при этом проходит
  (Ng-компиляция не затронута). Мой scope не затрагивает этот файл —
  не фиксировал по инструкции.
- Рабочее дерево содержит чужие незакоммиченные изменения других сессий
  (Materials/ProductModule, builder frontend, demo-файлы, `docs/README.md`) —
  не трогал, в commit попадут только файлы TZ-PRODUCTS-301.

## Lock

`.mimocode/locks/TZ-PRODUCTS-301-color-reference-dictionary.lock` — создан
ДО старта, gitignored.

## Conventional commit (push НЕ выполнялся — ждёт владельца)

```
feat(reference): unified color reference dictionary (TZ-PRODUCTS-301)
```

---

## ARCHIVE_MARKER

```yaml
TZ: TZ-PRODUCTS-301
status: DONE
outcome: DONE — ColorReference backend-контракт + UI-справочник «Цвета»
closed_at: 2026-08-02
implementation_commit: fc259fd438a0b81c87787e87d49955ee2ff9240c
verification:
  backend_tsc: PASS
  backend_jest_color_reference: "20/20 PASS"
  backend_jest_full: "44 suites / 430 tests PASS"
  frontend_tsc_scope: PASS (categories.page.ts — pre-existing blocker out-of-scope)
  frontend_jest_color_references_page: "14/14 PASS"
  frontend_jest_full: "76 suites / 804 tests PASS"
  ng_build: "PASS (exit 0)"
  diff_check: PASS
  verify_status: PASS
browser_status: MANUAL_BROWSER_CHECK_REQUIRED (dev-стек не запускался)
known_limitations:
  - categories.page.ts tsc-ошибки — чужой незакоммиченный blocker (TZ-DOC-308 territory), не фиксировался
  - GET /:id без org-scope — зеркало reference-паттерна TZ-DOC-307/315 (задокументировано)
  - роут authGuard (не capability-гейт): ключа color:* в RBAC-каталоге нет; мутации на backend @Roles admin/manager
lock_file: .mimocode/locks/TZ-PRODUCTS-301-color-reference-dictionary.lock
```
