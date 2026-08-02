═══════════════════════════════════════════════════════════════
TZ-DOC-320: TextBlock legacy enum → categoryId migration
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Developer (NestJS / Mongoose / DTO)

ЗАВИСИМОСТИ:
- TZ-DOC-315 уже закрыт: новая сущность TextBlockCategory +
  TextBlockCategoryService { resolveDefault, assertAssignable } +
  опциональная categoryId Prop в TextBlock.
- TZ-DOC-316/317/318/319 НЕ обязательны для этой задачи — мы НЕ
  трогаем UI (TZ-DOC-316/317) и НЕ делаем окончательную миграцию
  enum→categoryId (TZ-DOC-318).

LAYER: 4 (только backend; никаких frontend-правок, никаких правок
        text-block-category/**).

CONFLICT KEYS:
backend/src/modules/text-block/text-block.service.ts;
backend/src/modules/text-block/text-block.service.spec.ts (new);
backend/test/e2e/text-blocks.e2e-spec.ts (read-only verification).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. После закрытия TZ-DOC-315: `TextBlockService.create()` имеет 2
   ветви разрешения categoryId:
     (a) `dto.categoryId` задан → assertAssignable.
     (b) Не задан → `resolveDefault(organizationId)`. Если вернёт
         null — `BadRequestException` «Default text-block category
         unavailable. Run text-block-categories seed or set a default
         in the dictionary.»

2. КЛЮЧЕВОЕ РАСХОЖДЕНИЕ С TZ-DOC-315 КОНТРАКТОМ:

   `TextBlockCategoriesSeed` (`backend/src/common/seed/text-block-
   categories.seed.ts`) НЕ зарегистрирован в providers
   `backend/src/app.module.ts` (ближайшие providers —
   `DocumentTemplateCategoriesSeed` + `BomComponentResolveService` —
   строка TextBlockCategoriesSeed отсутствует).

   Файл сида ЧИТАЕТСЯ из CP1251 (Windows-1251): `name: 'Общее'`
   записан как байты `CE E1 F9 E5 E5`, а не как UTF-8. Это побочный
   дефект (на query-логику не влияет, поскольку slug=`obshchee`
   ASCII-only), но фиксить сид мы НЕ будем — это TZ-DOC-315
   territory.

   Net effect в этой сессии (probe-результат):
     - `text_block_categories` коллекция создана (через MongooseModule
       forFeature в TextBlockCategoryModule).
     - `text_block_categories.countDocuments() === 0` сразу после
       `app.init()` в test-bootstrap (kppdf-test DB).
     - System admin (`req.user.organizationId === null`) →
       `resolveDefault(null)` → null →
       `BadRequestException 'Default text-block category unavailable…'`.

3. E2E-следствие: `backend/test/e2e/text-blocks.e2e-spec.ts`
   `POST /api/text-blocks { name, content, category: 'legal' }`
   возвращает 400 (тестов было 9, 6 фейлят: 5 POST + 1 PATCH,
   оставшиеся GET работают).

4. Targeted unit: `text-block-category.service.spec.ts` (TZ-DOC-315)
   проходит 12/12, поскольку тесты мокают модель напрямую и не
   зависят от seed'а.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1. Расширить `TextBlockService.create()` лестницей
        service-side fallback. Никаких изменений schema, controller,
        DTO. Никаких изменений в `text-block-category/**`.

   Шаги разрешения (по убыванию приоритета), все варианты пишут в
   `categoryId`:

   1. `dto.categoryId` задан → `assertAssignable(dto.categoryId,
      organizationId ?? '')` через `TextBlockCategoryService`.
   2. Иначе, если `dto.category` ∈ {'legal','intro','outro','custom'}:
        - lookup `{ slug: LEGACY_CATEGORY_SLUG[dto.category],
                     isSystem: true }` напрямую через
        `@InjectModel(TextBlockCategory.name)`.
        - если найден — используем.
   3. Иначе (legacy-miss или нет legacy enum):
        `resolveDefault(organizationId)`.
   4. Else (всё ещё null): вызвать `ensureSystemDefault()` —
      лениво upsert «Общее» (slug `obshchee`, isSystem true,
      isDefault true, isActive true). Лог WARN при первом insert.

   Все операции idempotent; повторный ensureSystemDefault только
   логирует WARN (потому что findOne сначала находит существующий).

ШАГ 2. Helper-метод `ensureSystemDefault()` (private) в
        `TextBlockService` — НЕ в seed, НЕ в TextBlockCategoryService.
        Использует уже инжектированный `Model<TextBlockCategoryDocument>`
        через `@InjectModel('TextBlockCategory')`.

ШАГ 3. Константа `LEGACY_CATEGORY_SLUG`:
        `{ legal: 'legal', intro: 'intro', outro: 'outro',
          custom: 'custom' }` (1:1 тождество для MVP; будущий TZ
          сможет переопределить mapping).

ШАГ 4. Unit spec `backend/src/modules/text-block/text-block.service
        .spec.ts` (новый файл, 8 тестов):

  - «honors a caller-supplied categoryId via assertAssignable»
  - «legacy legal enum → resolves through slug-map to system
    category»
  - «legacy enum without system match → resolveDefault»
  - «no categoryId, no legacy enum, resolveDefault null → lazily
    upserts «Общее»»
  - «upserted default has categoryId and category attributes back
    on the block»
  - «rejects a duplicated slug with ConflictException (11000)»
  - «propagates an unknown Mongoose error untouched»

  Mock strategy:
  - `@nestjs/mongoose getModelToken(TextBlock.name)` →
    { create, find, findById, deleteOne }.
  - `@nestjs/mongoose getModelToken('TextBlockCategory')` →
    { findOne (chainable .exec()), create }.
  - `TextBlockCategoryService` → { assertAssignable, resolveDefault }.

ШАГ 5. Прогон gates (определение готовности):

  - `pnpm exec tsc -p tsconfig.build.json --noEmit` → exit 0.
  - `pnpm exec jest --no-coverage text-block` → 2 suites / 20 tests
    PASS (TZ-DOC-315 category-spec 12 + new spec 8).
  - `pnpm exec jest --config test/jest-e2e.json --runInBand
    text-blocks` → 9/9 PASS.
  - Regression `pnpm exec jest --testPathPattern='is-object-id'`
    → 4/4 PASS.
  - Regression `pnpm exec jest --config test/jest-e2e.json
    --runInBand user-organizationId production` → 12/12 PASS.
  - `git diff --check` (staged) → clean.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНИТЬ (минимум):
- backend/src/modules/text-block/text-block.service.ts
  (добавить LEGACY_CATEGORY_SLUG, второй @InjectModel на
  TextBlockCategory, новый branch в create(), helper
  ensureSystemDefault()).
- backend/src/modules/text-block/text-block.service.spec.ts (новый).

НЕ ИЗМЕНЯТЬ (запреты из задачи):
- backend/src/common/decorators/is-object-id.decorator.ts
  (TZ-BACKEND-E2E-HARNESS territory — НЕ ломать).
- backend/src/common/validators/is-object-id.pipe.ts.
- backend/src/modules/text-block-category/** (TZ-DOC-315 territory).
- backend/test/e2e/integration.e2e-spec.ts (order-dependent flake
  подтверждён в TZ-BACKEND-E2E-HARNESS — не моя епархия).
- backend/src/common/seed/text-block-categories.seed.ts (не фиксим
  encoding и не подключаем к providers — это TZ-DOC-315 territory).
- frontend/, sanitize-html, Materials, Admin/RBAC, TZ-278,
  Z-backlog, TZ-MATERIALS-*, TZ-BACKEND-E2E-HARNESS,
  document-table-type.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `POST /api/text-blocks { name, category: 'legal', content }`
   → 201, `categoryId` заполнен (либо system «legal», либо «Общее»).
2. `POST /api/text-blocks { name, content }` (без legacy enum) →
   201, `categoryId` — система «Общее».
3. `POST /api/text-blocks { name, categoryId: <valid org-scoped
   active> }` → 201, как раньше.
4. `POST /api/text-blocks { name, categoryId: <otherOrgCategory> }`
   → 400 (assertAssignable), без 500.
5. E2E `backend/test/e2e/text-blocks.e2e-spec.ts`: 9/9 PASS.
6. Unit `text-block.service.spec.ts`: 8/8 PASS (TZ-DOC-320
   regressions) AND `text-block-category.service.spec.ts`: 12/12
   PASS (regression).
7. tsc clean. git diff --check clean.

═══════════════════════════════════════════════════════════════
РУЧНОЙ СЦЕНАРИЙ
═══════════════════════════════════════════════════════════════

1. `pnpm exec jest --config test/jest-e2e.json text-blocks`.
2. `pnpm exec jest --no-coverage text-block`.
3. `pnpm exec tsc -p tsconfig.build.json --noEmit`.

═══════════════════════════════════════════════════════════════
DEFINITION OF DONE
═══════════════════════════════════════════════════════════════

- Conventional commit:
  `feat(text-block): migrate legacy enum → categoryId with default-resolve — TZ-DOC-320`.
- `tasks/_archive/2026-08/TZ-DOC-320-text-block-enum-resolution-fallback.done.md`
  маркер DONE с фактическим commit-hash.
- `.mimocode/locks/TZ-DOC-320-text-block-enum-resolution-fallback.lock`
  создан (gitignored, даже одна строка).
- `STATUS.md` DONE-секция с commit-hash + verification-log.
- `progress.md` одна строка с датой и результатом.
- `git push` НЕ делать.

═══════════════════════════════════════════════════════════════
ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ
═══════════════════════════════════════════════════════════════

- `TextBlockCategoriesSeed` остаётся не-wired (TZ-DOC-315 territory).
  Service-side fallback покрывает оба сценария: seed-not-run (наш
  случай) и seed-run-but-deleted (будущий TZ-DOC-321+).
- `name: 'Общее'` в моём `ensureSystemDefault()` сохраняется как
  ASCII Unicode-escape (`\u041e\u0431\u0449\u0435\u0435`), чтобы
  не зависеть от encoding файла (CP1251/UTF-8 уже встречалось
  в сид-файле TZ-DOC-315).
- TZ-DOC-318 (окончательная миграция enum→categoryId, удаление
  legacy поля `category`) остаётся отдельной задачей.
- `integration.e2e-spec.ts` order-dependent flake — не моя епархия.
