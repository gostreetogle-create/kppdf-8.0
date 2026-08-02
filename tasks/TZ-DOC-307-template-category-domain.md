═══════════════════════════════════════════════════════════════
TZ-DOC-307: Категории шаблонов — доменный контракт
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Domain Model Architect / NestJS Backend Engineer / API Contract Engineer

ЗАВИСИМОСТИ: Нет. Выполнять первым; TZ-DOC-308 зависит от утверждённого контракта.

LAYER: 4

CONFLICT KEYS:
backend/src/modules/document-template/document-template.schema.ts;backend/src/modules/document-template/document-template.service.ts;backend/src/modules/document-template/document-template.controller.ts;backend/src/modules/document-template/dto/create-document-template.dto.ts;backend/src/modules/document-template/dto/update-document-template.dto.ts;backend/src/modules/category/category.schema.ts;backend/src/modules/category/category.service.ts;backend/src/modules/category/category.controller.ts;backend/src/modules/category/dto/create-category.dto.ts;backend/src/modules/category/dto/update-category.dto.ts;backend/src/app.module.ts;backend/src/common/seed;backend/src/database/migrations;docs/data-model.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `DocumentTemplate` не имеет `categoryId`. Create/Update DTO также не принимают категорию. `DocumentTemplateService.findAll()` фильтрует только organizationId, docTypeId и isDefault.

2. В проекте уже есть generic `Category`, но его текущий контракт ограничен типами `material | product | general` и требует уникальный `skuPrefix`, который не является естественным свойством категории шаблона документа.

3. Пользователь требует: категория обязательна для нового шаблона, default-категория подставляется автоматически, категории можно создавать/переименовывать/редактировать в справочнике, а старые шаблоны не должны сломаться.

4. Доказательство: `backend/src/modules/document-template/{document-template.schema.ts,document-template.service.ts,document-template.controller.ts,dto/*}` и `backend/src/modules/category/{category.schema.ts,category.service.ts,category.controller.ts,dto/*}`.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Провести и записать contract decision: переиспользовать Category с новым `document` type только если `skuPrefix` и существующие material/product ограничения можно сделать backward-compatible; иначе создать отдельную `DocumentTemplateCategory` сущность. Не маскировать document category под material/product и не требовать фиктивный SKU-префикс.

ШАГ 2: Реализовать выбранную модель с полями минимум: `_id`, `organizationId` (или документированное решение о global/system scope), `name`, стабильный `slug`/ключ, `isActive`, `isSystem`, `sortOrder`, timestamps. Имя можно менять, ID/slug должны оставаться стабильными для сохранённых шаблонов. Уникальность должна быть scoped одновременно по области владения и типу document categories; системная default-категория должна иметь явно описанное поведение для организаций.

ШАГ 3: Добавить безопасный API CRUD/list для категорий с RBAC, whitelist DTO, duplicate/invalid-name handling и защитой от удаления категории, используемой шаблонами. При удалении — отклонить операцию с понятным 409 либо предложить заранее определённое reassign, но не оставлять dangling reference.

ШАГ 4: Добавить `categoryId` в DocumentTemplate schema, Create/Update DTO, service create/update/duplicate/findAll. Новый шаблон обязан получить активную категорию; duplicate должен сохранить категорию источника. Для legacy templates без categoryId выполнить безопасный backfill к системной категории «Общее» либо предусмотреть read-compatible fallback и отдельный migration, доказав результат тестами.

ШАГ 5: Добавить индекс/фильтр по categoryId, проверить organization/ownership/RBAC границы и обновить docs/data-model.md. Не менять существующие шаблоны напрямую без миграционного плана.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- backend/src/modules/document-template/document-template.schema.ts;
- backend/src/modules/document-template/document-template.service.ts;
- backend/src/modules/document-template/document-template.controller.ts;
- backend/src/modules/document-template/dto/create-document-template.dto.ts;
- backend/src/modules/document-template/dto/update-document-template.dto.ts;
- выбранные category module/schema/service/controller/DTO или новые document-template-category files;
- backend/src/app.module.ts / seed / migration — только в рамках выбранного контракта;
- backend tests;
- docs/data-model.md и docs/pages/templates.page.md при изменении API.

НЕ ИЗМЕНЯТЬ:
- frontend UI до фиксации API-контракта;
- template blocks, generated-document render и unrelated Category types;
- production database вручную;
- package/lock files без доказанной необходимости;
- другие TZ-файлы.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. API и schema имеют документированный способ хранения категории шаблона; category reference валиден и индексирован.
2. POST нового шаблона без categoryId получает на сервере активную default-категорию в той же organization/ownership scope; клиентский default не является единственной защитой. Если default невозможно разрешить, сервер возвращает проверяемый 4xx и не создаёт шаблон.
3. Нельзя сохранить ссылку на несуществующую или неактивную категорию.
4. PATCH/rename категории не меняет categoryId у шаблонов; список по ID продолжает работать.
5. Нельзя удалить категорию, на которую ссылаются шаблоны в той же organization/ownership scope, без проверенного reassign/409 поведения; cross-organization references невозможны.
6. Duplicate сохраняет категорию исходного шаблона.
7. GET templates поддерживает фильтр categoryId и не нарушает существующие organization/docType/ownership ограничения.
8. Legacy templates покрыты тестом: backfill или fallback явно доказан, dangling references отсутствуют.
9. Backend typecheck и targeted/full Jest проходят; DTO whitelist и RBAC tests добавлены.

РУЧНОЙ СЦЕНАРИЙ: создать категорию «Коммерческие предложения», создать шаблон с ней, переименовать категорию, открыть шаблон, продублировать, попробовать удалить используемую категорию и проверить фильтр API.

ОГРАНИЧЕНИЯ: не вводить свободное текстовое поле category в DocumentTemplate и не считать `docTypeId` заменой категории — тип документа и пользовательская группировка являются разными понятиями.
