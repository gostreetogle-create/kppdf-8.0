═══════════════════════════════════════════════════════════════
TZ-DOC-315: TextBlockCategory — доменный контракт (backend)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Developer (NestJS / Mongoose / DTO)

ЗАВИСИМОСТИ:
- TZ-DOC-307 уже закрыт (используется как архитектурный референс).
- TZ-DOC-268 уже закрыт (никаких UI-диалогов здесь нет).
- Не запускать параллельно с Tasks из /tasks/: TZ-DOC-316 и TZ-DOC-317
  (общий frontend-bundle, общий TextBlock-контекст).

LAYER: 4 (только backend; никаких frontend-правок).

CONFLICT KEYS:
backend/src/modules/text-block/text-block.schema.ts;
backend/src/modules/text-block/text-block.service.ts;
backend/src/modules/text-block/text-block.service.spec.ts;
backend/src/modules/text-block/text-block.controller.ts;
backend/src/modules/text-block/dto/create-text-block.dto.ts;
backend/src/modules/text-block/dto/update-text-block.dto.ts;
backend/src/modules/app.module.ts;
backend/src/seed/* (новый файл);
backend/test/e2e/text-blocks.e2e-spec.ts;
backend/test/e2e/text-block-categories.e2e-spec.ts (новый).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. TextBlock (backend/src/modules/text-block/text-block.schema.ts, строки
   24-39) хранит только фиксированный enum
   `category: 'legal' | 'intro' | 'outro' | 'custom'`
   (default 'custom'). Нет FK на пользовательский справочник, нет slug,
   нет org-scope, нет default.

2. Frontend `TextBlocksService.list({ category?: 'legal'|...|'custom' })`
   (frontend/src/app/shared/services/pi-text-blocks.service.ts:36-46)
   использует именно этот enum — это не настоящий справочник.

3. В builder панель инструментов «Тексты» подгружает ВСЕ активные блоки
   одним GET, без фильтра:
   - frontend/src/app/pages/doc-constructor/builder/builder-tool-pane.component.ts:444
     `httpResource('/api/text-blocks?isActive=true')`
   - frontend/src/app/pages/doc-constructor/builder/builder.page.ts:704
     `<...>('/api/text-blocks?isActive=true')`
   Фильтр по пользовательской «Категории» отсутствует.

4. Архитектурный референс для исправления:
   TZ-DOC-307 ввёл сущность DocumentTemplateCategory с паттерном,
   который мы зеркалим:
   - sparse-unique `{organizationId, slug}`;
   - system-категория с `isSystem: true` и `isDefault: true` (slug
     `obshchee`) — server-side default для новых Templates;
   - серверная проверка org-scope и `assertAssignable`;
   - удаление используемой/системной категории → 409.

5. Бизнес-требование пользователя: «когда будем выбирать тексты в
   шаблонах, там будет фильтр по категории… чтобы в будущем, когда
   разрастется текстовые поля, чтобы они хотя бы были по категориям».

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1. Создать новый модуль
        `backend/src/modules/text-block-category/`.

   Схема DocumentTemplateCategory-аналог (отдельная сущность, НЕ
   переиспользовать generic Category из-за skuPrefix):

   - `organizationId: Types.ObjectId?` sparse index (TZ-240 convention:
     undefined = system/global).
   - `name: string` required, length 1..128.
   - `slug: string` required, length 1..64, regex `[a-z0-9-]+`.
     Если клиент прислал невалидный → 400. Если отсутствует —
     сгенерировать серверно (kebab-case + кириллица→транслит, как в
     `DocumentTemplateCategoryService.slugify`).
   - `isActive: boolean` default true, index.
   - `isSystem: boolean` default false, index — только для seed-created
     системных строк.
   - `isDefault: boolean` default false, index — серверный default.
   - `sortOrder: number` default 0, int >= 0.
   - `description?: string` 0..512.

   Индексы:
   - `{ organizationId: 1, slug: 1 }` UNIQUE sparse
     (зеркало TZ-DOC-307; org-изоляция slug).
   - `{ organizationId: 1, isActive: 1, sortOrder: 1 }`
     (picker listing).
   - `{ isSystem: 1, isDefault: 1 }` (system-default lookup).

ШАГ 2. DTOs (whitelist-only; `organizationId` НИКОГДА не приходит от
        клиента — derive from `req.user.organizationId` в контроллере).

   - `CreateTextBlockCategoryDto`:
     name (required), slug? (optional), description?, isActive?,
     isDefault?, sortOrder?.
   - `UpdateTextBlockCategoryDto extends PartialType(Create…)`.

   Комментарий-маркер: «TZ-DOC-315 — whitelist; добавление нового поля
   требует явного расширения DTO».

ШАГ 3. `TextBlockCategoryService` (по образцу
        `DocumentTemplateCategoryService`):

   Публичные методы:
   - `findAll(scope)`: org + system rows, sorted by sortOrder + name.
   - `findOne(id, scope)`: org-scope validation, throw 404 on cross-org.
   - `create(dto, user)`: derive organizationId из req.user.
   - `update(id, dto, user)`: same scope check.
   - `remove(id, user)`: reject if any TextBlock references this
     `categoryId` → 409 `{ reason: 'in_use', count }`; если `isSystem`
     → 409 `{ reason: 'system' }`.
   - `resolveDefault(orgId)`: org-scoped active `isDefault` →
     system «Общее» → `throw BadRequestException` если ни того, ни
     другого нет.
   - `assertAssignable(categoryId, orgId)`: exists + active + same org.
   - `slugify(name)`: идентично TZ-DOC-307.

ШАГ 4. Расширить `TextBlock` schema:

   Добавить ровно ОДНО новое поле; ничего не удалять:

   ```
   @Prop({ type: Types.ObjectId, ref: 'TextBlockCategory',
            index: true, sparse: true })
   categoryId?: Types.ObjectId;
   ```

   Legacy `category: 'legal'|'intro'|'outro'|'custom'` сохранить для
   backward compatibility; миграция enum-значений в categoryId —
   отдельный successor-TZ (см. KHAN 10).

ШАГ 5. Расширить TextBlockService:

   - `create(dto, user)`:
     если `dto.categoryId` задано — `assertAssignable(dto.categoryId,
     user.organizationId)` (конфликт → 409 inactive / 403 cross-org);
     если НЕ задано — `resolveDefault(user.organizationId)` →
     сохранение с найденным categoryId; если ни один default не
     доступен → сервер сам упадёт 400 «default category unavailable».
   - `update(id, dto, user)`: то же `assertAssignable`, если
     `dto.categoryId` присутствует; null/undefined не трогает.
   - `findAll({ categoryId?, category?, isActive?, orgId })`: новый
     filter `categoryId` (строка; Types.ObjectId.isValid; else 400).
     Legacy `category` enum-фильтр оставить как есть.

ШАГ 6. Расширить `TextBlockController.findAll`:

   Новые query-параметры:
   - `categoryId` (ObjectId string) → фильтр в шаге 5.
   - `activeOnly` (alias для isActive=true, без регресса).

   Legacy: `category=` (enum) и `isActive=` работают как раньше.

ШАГ 7. Новый `TextBlockCategoryController`:

   Маршруты (зеркало DocumentTemplateCategoryController):
   - `GET    /text-block-categories`         list (org + system)
   - `GET    /text-block-categories?activeOnly=true`
   - `GET    /text-block-categories/:id`
   - `POST   /text-block-categories`         Roles: admin, manager
   - `PATCH  /text-block-categories/:id`     Roles: admin, manager
   - `DELETE /text-block-categories/:id`     Roles: admin → 409 при used
   - `PATCH  /text-block-categories/:id/activate` toggle active

   AuditAction:
   - create / update / remove / activate — все идут через
     AuditInterceptor (entityType = 'TextBlockCategory').

ШАГ 8. Зарегистрировать `TextBlockCategoryModule` в `app.module.ts`:

   Импортировать ПОСЛЕ `TextBlockModule` (зависимости через ref).
   Экспортировать модель НЕ глобально; только через
   `MongooseModule.forFeature([{ name: TextBlockCategory.name,
   schema: TextBlockCategorySchema }])`.

ШАГ 9. Seed системной категории «Общее»:

   Новый файл
   `backend/src/seed/text-block-categories.seed.ts`.

   Идемпотентно:
   если есть system-строка со slug `obshchee` → skip;
   иначе insert `{ organizationId: undefined, name: 'Общее',
   slug: 'obshchee', isSystem: true, isActive: true,
   isDefault: true, sortOrder: 0 }`.

   Подключить к существующему bootstrap; НЕ запускать автоматически в
   production — только manual/dev (соответствует TZ-DOC-307 seed).

ШАГ 10. SUCCESSOR-TZ (не выполнять в этой задаче):

   Миграция legacy `category` enum в `categoryId` — отдельный
   кандидат (предлагаю `TZ-DOC-318`). Сюда не включать.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

СОЗДАТЬ (новый модуль):
- backend/src/modules/text-block-category/text-block-category.module.ts
- backend/src/modules/text-block-category/text-block-category.schema.ts
- backend/src/modules/text-block-category/text-block-category.service.ts
- backend/src/modules/text-block-category/text-block-category.controller.ts
- backend/src/modules/text-block-category/text-block-category.service.spec.ts
- backend/src/modules/text-block-category/dto/create-text-block-category.dto.ts
- backend/src/modules/text-block-category/dto/update-text-block-category.dto.ts
- backend/src/seed/text-block-categories.seed.ts
- backend/test/e2e/text-block-categories.e2e-spec.ts (CRUD + scope + 409
  in-use + 409 system + default resolution + cross-org 403)

ИЗМЕНИТЬ (минимально, только под провод `categoryId`):
- backend/src/modules/text-block/text-block.schema.ts
  (+ ровно ОДНО Prop `categoryId`).
- backend/src/modules/text-block/text-block.service.ts
  (assertAssignable + resolveDefault + новый filter branch).
- backend/src/modules/text-block/text-block.service.spec.ts
  (новые ветки: validId, crossOrgId, inactiveId, defaultResolved).
- backend/src/modules/text-block/text-block.controller.ts
  (+ query param `categoryId` + `activeOnly` alias).
- backend/src/modules/text-block/dto/create-text-block.dto.ts
  (optional `categoryId`).
- backend/src/modules/text-block/dto/update-text-block.dto.ts
  (optional `categoryId`).
- backend/src/modules/app.module.ts
  (+ import TextBlockCategoryModule).
- backend/src/seed/* (вызов seed-функции в bootstrap).

НЕ ИЗМЕНЯТЬ:
- backend/src/modules/category/* (generic Category — другая сущность).
- backend/src/modules/document-template-category/* (другая сущность —
  не пытаться объединить).
- backend/src/modules/table-template/* (пользователь сказал «таблицы
  пока не трогать», это относится и к категориям таблиц).
- frontend/ (TZ-DOC-316 и TZ-DOC-317).
- sanitize-html, Materials, Admin/RBAC, TZ-278, Z-backlog, TZ-MATERIALS-*,
  TZ-BACKEND-E2E-HARNESS.
- package.json и lock-файлы без прямого требования task-файла.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `POST /api/text-block-categories { name: 'Описания' }` → 201,
   `slug='opisaniya'`, `organizationId` из `req.user` (НЕ из body).
2. `POST` с тем же slug в той же org → 409 (sparse unique).
3. `PATCH /:id { isActive: false }` → 200; в `GET ?activeOnly=true`
   строка отсутствует.
4. `DELETE /:id` когда ≥ 1 TextBlock имеет этот `categoryId` → 409
   `{ reason: 'in_use', count: N }`.
5. `DELETE` на `isSystem: true` → 409 `{ reason: 'system' }`.
6. `POST /api/text-blocks { name, content, … }` БЕЗ `categoryId` → 201,
   `categoryId` резолвится серверно в активный системный «Общее»
   (после seed).
7. `POST /api/text-blocks { categoryId: '<valid org-scoped active>' }`
   → 201, persisted.
8. `POST /api/text-blocks { categoryId: '<otherOrgCategory>' }` →
   403/404 c explicit message («Cannot reference category from
   different organization»).
9. `POST /api/text-blocks { categoryId: '<inactive>' }` → 409.
10. `GET /api/text-blocks?categoryId=<id>&isActive=true` → только
    блоки этой категории (sorted по sortOrder + name), legacy
    soft-delete plugin исключает удалённые.
11. `GET /api/text-blocks` (без фильтра) → все блоки; legacy `category`
    enum-блоки без `categoryId` остаются видны (backward compat).
12. Audit-trail: все мутации `TextBlockCategory` фиксируются в audit-log.
13. Backend tsc (tsc -p tsconfig.build.json --noEmit) — exit 0.
14. Backend Jest (targeted: text-block-category + новые ветки
    text-block) — 100% PASS; полный прогон без регрессии (315+
    существующих тестов PASS).
15. Code review PASS. Production data НЕ изменены автоматически.

═══════════════════════════════════════════════════════════════
РУЧНОЙ СЦЕНАРИЙ
═══════════════════════════════════════════════════════════════

1. Запустить seed; убедиться, что в Mongo появилась system-категория
   «Общее» (slug `obshchee`, isSystem, isDefault).
2. Admin `POST /text-block-categories { name: 'Описания' }` → 201.
   Admin `POST /text-block-categories { name: 'Реквизиты' }` → 201.
3. `POST /text-blocks { categoryId: <описания>, … }` → 201.
4. `POST /text-blocks { … }` (без categoryId) → 201, categoryId=«Общее».
5. `GET /text-blocks?categoryId=<описания>` → только этот блок.
6. `GET /text-blocks` → все блоки, в т.ч. legacy enum-only.
7. Админ пытается `DELETE /text-block-categories/<описания>` →
   409 in_use.
8. Сначала `PATCH /:id { isActive: false }`, потом мягко удалить legacy
   блок через soft-delete-плагин → тогда DELETE категории → 200.
9. Проверить AUDIT-лог: 4 события по `TextBlockCategory`, sub-resource
   `TextBlock.create` в одном из них.

═══════════════════════════════════════════════════════════════
DEFINITION OF DONE
═══════════════════════════════════════════════════════════════

- Conventional commit: `feat(text-block): add TextBlockCategory domain` (или аналог по конвенции репо).
- `docs/RBAC-CONTRACT.md` — endpoint-таблица расширена
  `/text-block-categories` (admin/manager write, everyone read).
- `docs/data-model.md` — добавить TextBlockCategory в entity-map,
  sparse-unique пометить.
- `docs/pages/categories.page.md` (или новый
  `docs/pages/text-block-categories.page.md`) — поверхностный шаблон
  для UI-словаря.
- `STATUS.md` переведён в DONE для этой задачи в archive marker;
  check-list создан.
- `progress.md` — запись о выполнении.
- Archive marker `tasks/_archive/2026-08/TZ-DOC-315.done.md` создан
  по конвенции репо.
- `.mimocode/locks/TZ-DOC-315-text-block-category.lock` создан.
- `HEAD == origin/main` после push (только с явного разрешения
  владельца, по умолчанию push НЕ выполнять).

═══════════════════════════════════════════════════════════════
ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ
═══════════════════════════════════════════════════════════════

- Legacy-блоки без `categoryId` будут автоматически резолвиться в
  системный «Общее» при чтении — UX-эффект минимален, документируется.
- `isSystem` категории не удаляются и не деактивируются клиентами,
  только seed.
- Без per-row permissions: admin/manager пишут, все (read role) читают
  активные. RBAC-CONTRACT фиксирует.
- УСПЕХ-кандидат на миграцию legacy enum → categoryId: `TZ-DOC-318`.
- Без UI; визуальный UX даёт TZ-DOC-316.
- Дата таблиц и `document-table-type` НЕ затрагивается — пользователь
  явно сказал «таблицы не трогаем».
