═══════════════════════════════════════════════════════════════
TZ-MATERIALS-304: Материалы — отделить остатки от карточки
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Domain Model Analyst / Backend Engineer / Frontend Engineer

ЗАВИСИМОСТИ: Нет. Выполнять после продуктового подтверждения доменной модели; TZ-MATERIALS-303 можно выполнять независимо.

LAYER: 4 (затрагивает API/domain boundary; frontend-only removal без проверки контракта запрещён)

CONFLICT KEYS:
frontend/src/app/pages/materials/material-form-dialog.component.ts;frontend/src/app/pages/materials/materials.page.ts;frontend/src/app/shared/services/materials.service.ts;backend/src/modules/material/dto/create-material.dto.ts;backend/src/modules/material/material.schema.ts;backend/src/modules/material/material.service.ts;backend/src/modules/storage-item/storage-item.schema.ts;backend/src/modules/storage-item/storage-item.service.ts;backend/src/modules/stock-movement/stock-movement.service.ts;docs/data-model.md;docs/pages/materials.page.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Material form принимает `stockQty` и отправляет его при POST/PATCH. Material schema/DTO также содержат `stockQty`.

2. Отдельный складской контур уже использует `StorageItem.quantity`, `minQuantity`, stock movements и операции изменения количества. Это создаёт риск двух источников истины: `Material.stockQty` и складской `StorageItem.quantity`.

3. Пользователь считает остаток складским состоянием, которое не должно вводиться при создании материала. Нужно подтвердить ссылки/legacy import/reporting до удаления поля.

4. Важное ограничение: текущий `StorageItem` связан с `productId`, а не напрямую с `materialId`. Поэтому удаление `stockQty` само по себе не подключит материал к складскому контуру; при отсутствии material-to-stock связи нужно оформить отдельный domain successor, а не скрытую UI-правку.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Найти все consumers `Material.stockQty` и `StorageItem.quantity`: create/update, list columns, imports, cost calculations, inventory pages, reports and product/module flows. Составить matrix источника истины.

ШАГ 2: Если подтверждено, что склад — canonical owner, убрать stock input из material create/edit и убрать его из material create payload. На странице материалов оставить только ссылку/индикатор «Склад» без ручного изменения количества.

ШАГ 3: Проверить backward compatibility старых records/API. Не удалять schema/DTO поле и не мигрировать данные молча; оформить отдельный migration/deprecation successor, если поле нельзя безопасно вывести.

ШАГ 4: Добавить tests, что создание материала не создаёт/не меняет складской остаток, а складские операции изменяют только canonical storage item и отображаются в inventory.

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- frontend material form/list files;
- backend material DTO/schema/service — только после consumer audit;
- storage/inventory integration — только если доказана связка или оформлен отдельный successor;
- relevant tests and docs.

НЕ ИЗМЕНЯТЬ:
- quantity/stock movements без теста транзакций;
- database data or migrations in this TZ;
- unrelated product `stockQty` semantics;
- API поле без documented deprecation/compatibility plan.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. В create/edit material dialog нет ручного поля «Остаток на складе».
2. POST/PATCH material не меняет количество в складе.
3. После создания материала складской quantity остаётся неизменным; его изменение выполняется только через inventory/stock movement flow.
4. Existing material records открываются без ошибки; старый `stockQty` либо read-only legacy отображён с понятной пометкой, либо безопасно выведен по утверждённому плану.
5. Materials list не представляет устаревший `stockQty` как canonical inventory balance.
6. Tests покрывают boundary и backward compatibility; frontend/backend typechecks и relevant Jest проходят.
7. Browser-check подтверждает создание материала и отдельное изменение остатка в складе.

РУЧНОЙ СЦЕНАРИЙ: создать/отредактировать материал; убедиться, что количество не спрашивается; открыть склад, выбрать material и провести приход/изменение; проверить отражение остатка.

ОГРАНИЧЕНИЯ: не реализовывать полноценный складской приход/расход в этой задаче.
