═══════════════════════════════════════════════════════════════
TZ-MATERIALS-308: Материалы — доменная связка материал → склад (Layer 4)
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Domain Model Analyst / Backend Engineer

ЗАВИСИМОСТИ: TZ-MATERIALS-304 (stock boundary — выполнено). Данный TZ —
Layer 4 domain successor по правилу TZ-304: «при отсутствии material-to-stock
связи оформить отдельный domain successor, а не скрытую UI-правку».

LAYER: 4 (domain/API)

CONFLICT KEYS:
backend/src/modules/storage-item/storage-item.schema.ts;backend/src/modules/storage-item/storage-item.service.ts;backend/src/modules/stock-movement/stock-movement.service.ts;backend/src/modules/material/material.service.ts;frontend/src/app/pages/inventory/*;docs/data-model.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. TZ-MATERIALS-304 убрал `stockQty` из create/edit формы материала и payload,
   убрал колонку «Остаток» из списка. `Material.stockQty` объявлен legacy
   (schema/DTO сохранены для backward compatibility).

2. Складской контур (`StorageItem`) существует, но `StorageItem.productId`
   ссылается на **Product** (`ref: 'Product'`, required, index). Для материалов
   складская позиция невозможна — материал не подключается к складу.

3. Пользовательский сценарий (TZ-304): «открыть склад, выбрать material и
   провести приход/изменение; проверить отражение остатка» — сегодня
   невыполним для материалов.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ (предлагаемый scope — уточнить с PO перед реализацией)
═══════════════════════════════════════════════════════════════

ШАГ 1: Решение о модели ссылки: (A) добавить опциональный
`StorageItem.materialId` (nullable, index) — позиция склада ссылается на
материал ИЛИ продукт, ровно один обязателен (productId XOR materialId,
validate при create/update); либо (B) отдельная коллекция
`MaterialStockItem` по образцу StorageItem. Рекомендация — (A): меньше кода,
один flow приходов/расходов, единый inventory-dashboard.

ШАГ 2: Backend:
- storage-item.schema: `materialId?: Types.ObjectId` (ref 'Material', sparse index);
  серверная валидация «XOR productId/materialId».
- storage-item.service: create/update принимают materialId; find по materialId.
- stock-movement.service: операции прихода/расхода/изменения для material-позиций;
  транзакция остаётся на StorageItem.quantity.
- inventory-dashboard: учитывать material-позиции в общих метриках.

ШАГ 3: Frontend:
- inventory/storage-items.page: возможность выбрать тип позиции (Продукт/Материал)
  и materialId; колонки «Код материала» и т.п.
- materials.page: индикатор/ссылка «Склад» (без ручного изменения) — количество
  меняется только в складе.

ШАГ 4: Tests:
- create StorageItem с productId И materialId → 400 (XOR);
- create с materialId → позиция создаётся, quantity меняется через stock movement;
- material create НЕ создаёт складскую позицию автоматически (boundary);
- inventory-dashboard метрики включают material-позиции.
- Backend typecheck/build + Jest; frontend typecheck/Jest; git diff --check; verify-status.sh.

ОГРАНИЧЕНИЯ: не менять существующие product-позиции; не мигрировать данные без
отдельного TZ; приход/расход остаётся в рамках уже существующих операций
(не реализовывать новый складской функционал, кроме связки material→склад).
