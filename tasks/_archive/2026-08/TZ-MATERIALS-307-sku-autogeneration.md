═══════════════════════════════════════════════════════════════
TZ-MATERIALS-307: Материалы — серверная генерация внутреннего кода (Layer 4)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Engineer / API Contract Engineer

ЗАВИСИМОСТИ: TZ-MATERIALS-303 (решение + DTO-декларация `sku` + 409 collision)
— выполнено. Данный TZ — Layer 4 successor, создан по правилу TZ-MATERIALS-303:
«Если генерация требует backend counter/transaction — отдельный successor».

LAYER: 4 (backend counter-based generation)

CONFLICT KEYS:
backend/src/modules/material/material.service.ts;backend/src/modules/material/material.module.ts;backend/src/modules/category/category.schema.ts;backend/src/modules/counter/counter.service.ts;frontend/src/app/pages/materials/material-form-dialog.component.ts;frontend/src/app/pages/materials/material-form-dialog.component.spec.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. TZ-MATERIALS-303 задекларировал `sku` в `CreateMaterialDto` (ранее поле
   отсутствовало → `forbidNonWhitelisted` давал 400) и добавил маппинг
   E11000 → 409 Conflict в `MaterialService.create/update`. Уникальность —
   на уровне Mongo `unique: true, sparse: true`.

2. `sku` пока создаётся вручную (опционально). Продукты уже генерируют SKU
   серверно: `ProductService.create` → `CounterService.next('Product', cat.skuPrefix)`
   → «PRODUCT-2026-001» (атомарно, в Mongo-транзакции, Replica Set).

3. Категории материалов имеют `skuPrefix` (схема + DTO `@Matches(/^[A-Z0-9-]+$/)`),
   но `MaterialService` его не использует — связь категория → префикс → код
   для материалов не реализована.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Подключить `CounterService` и `CategoryModel` в `MaterialModule` /
`MaterialService` (аналогично `ProductService`).

ШАГ 2: В `MaterialService.create`: если `!dto.sku && dto.categoryId` — найти
категорию, взять `cat.skuPrefix`, вызвать `counter.next('Material', cat.skuPrefix)`,
записать результат в `sku` перед `model.create`. Если категория не найдена —
`BadRequestException` (как в ProductService). Если prefix отсутствует — упасть
с понятной ошибкой или оставить `sku` пустым (зафиксировать решение).

ШАГ 3: Отдельная бизнес-операция «перегенерировать код» (для материалов,
созданных до внедрения) — НЕ обязательна в этом TZ; при необходимости отдельный
TZ на backfill/миграцию. Существующие записи не трогать.

ШАГ 4: Tests:
- create без sku с categoryId → код вида `PREFIX-YYYY-NNN`, уникальный;
- create с ручным sku → ручной код сохраняется (генерация не перебивает);
- create с categoryId и без prefix → понятная ошибка, документ не создан;
- E11000 collision → 409 (уже в TZ-303, регрессия в этом TZ);
- повторный create в одной транзакции — уникальность counter (mock/unit).

ШАГ 5: UI: убрать/адаптировать hint «заполняется вручную или будет
генерироваться сервером» — теперь генерация реальна. Показать label
«Внутренний код материала» + hint «создаётся автоматически при выборе
категории» (если категория выбрана и код не заполнен вручную).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Код генерируется ТОЛЬКО на сервере (никогда на клиенте).
2. Уникальность: counter-последовательность + unique index; collision → 409.
3. Ручной sku всегда приоритетнее генерации.
4. Existing records/edit compatibility сохранены.
5. Backend typecheck/build + Jest (включая новые тесты) проходят;
   frontend typecheck/Jest проходят; git diff --check PASS.
6. Verify-status.sh PASS; lock/archive/progress/STATUS обновлены.

ОГРАНИЧЕНИЯ: не генерировать код на клиенте; не менять contract без
доказательства; не трогать существующие записи без отдельной миграции.
