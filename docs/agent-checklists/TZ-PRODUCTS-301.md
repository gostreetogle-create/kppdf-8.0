# TZ-PRODUCTS-301 — Checklist (Справочник «Цвета»)

**Status:** DONE (2026-08-02)
**Owner:** autonomous backend+frontend agent (Codebuff)

## Scope

- Backend (Layer 4): модуль `color-reference` (schema, DTO, service,
  controller, module), seed `color-references.seed.ts`, регистрация в
  `app.module.ts`.
- Frontend (Layer 3): `pi-color-references.service.ts`, страница
  `color-references.page.ts`, диалог `color-references-form-dialog.component.ts`,
  роут `/color-references`, nav-пункт «Цвета», spec страницы, page-дока.

## Dependencies

- Паттерн-зеркало: TZ-DOC-307/315 (document-template-category /
  text-block-category) — assertAssignable / resolveDefault / assertDefaultId.
- seed-механизм: `app.module.ts` imports → `ColorReferencesSeed` (OnModuleInit).

## Conflict keys / Protected paths

- НЕ трогать: TZ-DOC-309..320, TZ-MATERIALS-*, TZ-BACKEND-E2E-HARNESS,
  TZ-278, `categories.page.ts` (TZ-DOC-308 parallel), Z-backlog, desktop,
  sanitize-html, package.json/lock-файлы.

## Cache / invalidation design

Не применимо (справочник без кэша; TZ-DOC-309 кэш — только для категорий
шаблонов и НЕ затрагивался).

## Acceptance criteria

1. ✅ `pageNumbering`/TZ-DOC-311 поведение не регрессировало (справочник отдельный).
2. ✅ Backend: create/update/find/remove через `/color-references` с RBAC.
3. ✅ `hex` валидируется `#RRGGBB` (backend DTO + frontend pattern).
4. ✅ System-цвет «Не выбран» (isSystem, seed) заблокирован в UI и 409 на backend.
5. ✅ Sparse-unique `{organizationId, slug}`; soft-delete через `deletedAt`.
6. ✅ Frontend page: pi-table DSL, активация, loading/error/empty, поиск по name/slug.
7. ✅ Роут `/color-references` + nav «Цвета» (authGuard родителя; мутации
   защищены backend `@Roles('admin','manager')`).

## Tests

- Backend: `color-reference.service.spec.ts` — 20 unit (create/dup/409,
  findAll/org-scope/search, update/IDOR/system/dup-slug, remove/soft-delete,
  resolveDefault, assertAssignable/assertDefaultId, legacy compat).
- Frontend: `color-references.page.spec.ts` — 14 unit (loading/error/empty,
  search name+slug, sort, toggle active + system-locked, delete success/fail +
  system-locked, reload on dialog close).

## Browser scenario (MANUAL_BROWSER_CHECK_REQUIRED)

1. Открыть `/color-references` (admin/manager) → таблица со swatch-колонкой.
2. «+ Создать цвет» → content-диалог 1000px, ввести имя + hex через палитру →
   Сохранить → строка появилась.
3. Системный «Не выбран» — переключатель и действия отключены.
4. Удалить используемый цвет → snackbar с ошибкой (409).
5. Поиск по name и slug.
6. Viewport 375px — таблица скроллится по горизонтали.

## Known limitations

- `categories.page.ts` — pre-existing tsc-ошибки чужой сессии (TZ-DOC-308
  territory): `pnpm exec tsc -p tsconfig.app.json --noEmit` падает на нём
  (NG-компиляция не затронута: `ng build` проходит). Зафиксировано как
  project-wide blocker вне scope TZ-PRODUCTS-301.
- `findById` без org-scope — зеркалит reference-паттерн TZ-DOC-307/315
  (осознанно, зафиксировано в archive marker).
- Роут гейтится `authGuard` (как остальные справочники): отдельного
  capability-ключа `color:*` в RBAC-каталоге нет; admin-защита мутаций —
  на backend. Отклонение от формулировки «admin-only» задокументировано.
