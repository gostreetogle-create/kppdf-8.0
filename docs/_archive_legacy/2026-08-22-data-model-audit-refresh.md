# Data-model audit refresh — kppdf-8.0

**Дата:** 2026-08-22  
**Роль:** read-only auditor (Freebuff)  
**Источники:** `docs/data-model-audit.md` (2026-07-04), `docs/data-model.md`, живые `backend/src/modules/**/*.schema.ts` и соседние module/service-файлы только для проверки использования.  
**Граница:** product-код не менялся; Synology/deploy не запускались.

## 0. Важная поправка к объёму старого аудита

Старый файл внутренне не совпадает с формулировкой задачи: в Executive Summary указано 20 entity без `id` и `~30` избыточностей, §4.1 перечисляет 20 entity, а §3.1 содержит 43 строки/повтора избыточных полей. В таблице дубликатов 18 нумерованных строк (номер 18 повторён), плюс 4 скрытых дубля A–D. Поэтому ниже разобраны все явно перечисленные строки старого файла, а не только числа 16/11/24 из краткого запроса.

Для Mongo/Mongoose все корневые `@Schema({ collection: ... })` ниже получают неявный `_id`; отсутствие декларации `id` в классе не означает отсутствие первичного ключа. Это отдельно отмечено в §3.

## 1. Дубликаты entity

Статус по 22 строкам старого раздела (18 нумерованных + A–D): **STILL VALID 2, FIXED 13, STALE/WRONG 7**.

| Старый пункт | Статус | Проверка живой схемы и вывод |
|---|---|---|
| 1. `DocType` / `DocTypeDef` | **FIXED** | Есть только `DocType` (`backend/src/modules/doc-type/doc-type.schema.ts:6-19`); `DocTypeDef` schema/class не найден. |
| 2. `Proposal` / `Quotation` / `CommercialProposal` | **FIXED** | Есть только корневой `Quotation` (`backend/src/modules/quotation/quotation.schema.ts:172-315`); строки КП — embedded `QuotationItem`, не отдельный `ProposalItem`. В коде ещё встречается историческое слово `proposalId`, но отдельной Proposal schema нет. |
| 3. `Rpp` / `RppEntry` | **FIXED** | Есть `Rpp` (`backend/src/modules/rpp/rpp.schema.ts:6-43`); `RppEntry` schema не найден. Кэш `productName/productSku` внутри Rpp остался — см. §4. |
| 4. `PurchaseOrder` / `SupplierOrder` | **FIXED на уровне entity, частично не дожато по полям** | Есть `PurchaseOrder` (`backend/src/modules/purchase-order/purchase-order.schema.ts:40-77`), `SupplierOrder` schema не найден. В канонической схеме всё ещё есть `supplierOrgId` (`:50`) наряду с `supplierId` — отдельная STILL VALID находка §4. |
| 5. `IncomingInvoice` / `Invoice` | **FIXED** | Есть единая `Invoice` (`backend/src/modules/invoice/invoice.schema.ts:8-57`), `IncomingInvoice` schema не найден; timestamps включены. Историю миграции Mongo-данных статически подтвердить нельзя — **UNCERTAIN** только для фактических legacy-документов. |
| 6. `Role` / `Roles` | **FIXED** | Есть `Role` (`backend/src/modules/role/role.schema.ts:6-37`), `Roles` schema/class не найден. |
| 7. `Employees` / `Worker` | **FIXED в коде** | Есть расширенный `Worker` (`backend/src/modules/worker/worker.schema.ts:23-92`), `Employees` schema не найден; `position`, `email`, `deletedAt`, `organizationId` добавлены. Legacy-данные без миграционного отчёта — **UNCERTAIN**. |
| 8. `Operation` / `WorkType` | **STALE/WRONG** | В живом коде `Operation` отсутствует; вместо него есть отдельный `RoutingStep` с `workTypeId` (`backend/src/modules/routing-step/routing-step.schema.ts:6-30`) и каталог `WorkType` (`backend/src/modules/work-type/work-type.schema.ts:6-52`). Сама рекомендация «не мерджить функционально разные сущности» уже отражена. |
| 9. `ProductModule` / `Modules` | **FIXED** | Есть `ProductModule` (`backend/src/modules/product-module/product-module.schema.ts:48-69`), `Modules` schema не найден. Legacy embedded arrays явно помечены в схеме; см. новое замечание N4. |
| 10. `InventoryMovement` / `StockMovement` | **FIXED на уровне entity** | Есть `StockMovement` (`backend/src/modules/stock-movement/stock-movement.schema.ts:7-37`), `InventoryMovement` schema не найден. В текущем StockMovement уже есть `toWarehouseId`, `zoneName/toZoneName`, `productId/materialId`, но `qty` сохранён — см. §4. |
| 11. `MaterialCategory` / `ProductCategory` / `Category` | **FIXED** | Есть универсальная `Category` с `type`, `slug`, `skuPrefix` (`backend/src/modules/category/category.schema.ts:6-50`); отдельные MaterialCategory/ProductCategory schema не найдены. |
| 12. `StorageItem` / `InventoryItem` | **FIXED** | Есть `StorageItem` (`backend/src/modules/storage-item/storage-item.schema.ts:16-59`); `InventoryItem` schema не найден. Inventory dashboard использует StorageItem (`backend/src/modules/inventory/inventory.controller.ts:42-66`). |
| 13. Повтор `Quotation` / `Proposal` | **STALE/WRONG** | Это повтор пункта 2 внутри самого старого аудита, отдельной новой проблемы не добавляет. |
| 14. `Warehouse.roleIds` / новая `WarehouseAccess` | **STILL VALID — medium** | `Warehouse.roleIds` остаётся (`backend/src/modules/warehouse/warehouse.schema.ts:28-30`), отдельная `WarehouseAccess` schema не найдена. M2M по-прежнему хранится inline. |
| 15. `OrderHistory` / `UserActivity` / `Comment` / `AuditLog` | **FIXED на уровне схем** | Есть `AuditLog` (`backend/src/modules/audit/audit-log.schema.ts:6-37`) и отдельный `Comment` (`backend/src/modules/comment/comment.schema.ts:6-24`); `OrderHistory`/`UserActivity` schema не найдены. Фактическую миграцию старых коллекций статически подтвердить нельзя — **UNCERTAIN** для данных. |
| 16. `Client` / `Counterparty` | **FIXED в коде, данные UNCERTAIN** | `Client` schema не найден; `Counterparty` — живая сущность (`backend/src/modules/counterparty/counterparty.schema.ts:6-115`). Наличие/полнота миграции legacy Client-документов не подтверждены. |
| 17. Повтор `Operation` / `WorkType` | **STALE/WRONG** | Дублирует пункт 8; живой `RoutingStep` отделён от `WorkType` и имеет FK (`backend/src/modules/routing-step/routing-step.schema.ts:26-30`). |
| 18a. `Organization` / `Counterparty` | **STALE/WRONG как дубль entity** | Обе схемы живы и имеют разные роли/границы: `Organization` (`backend/src/modules/organization/organization.schema.ts:49-174`) и `Counterparty` (`backend/src/modules/counterparty/counterparty.schema.ts:6-115`). Общие реквизиты — отдельный cross-entity debt, не доказательство слияния. |
| 18b. `Reservation` / `StockMovement` | **STALE/WRONG как дубль** | `Reservation` имеет самостоятельные `productId`, `warehouseId`, `qty`, `status`, `expiresAt` (`backend/src/modules/reservation/reservation.schema.ts:7-37`), а `StockMovement` — журнал движения. Старое замечание о «слишком бедной Reservation» в основном закрыто; `reservedFromAt` не добавлен, но это отдельное продуктовое решение. |
| A. `Product.material` / `Product.materials` | **STALE/WRONG** | В живом `Product` нет ни `material`, ни `materials`; есть `composition` и legacy `productModuleIds` (`backend/src/modules/product/product.schema.ts:38-58`). |
| B. `OrderTask.componentId/componentName` / `ProductionOrder.productId` | **STILL VALID — high** | Все поля остаются: `OrderTask.componentId/componentName` (`backend/src/modules/order-task/order-task.schema.ts:18-21`) и `ProductionOrder.productId` (`backend/src/modules/production-order/production-order.schema.ts:27-30`). `componentId` ссылается на `Product`, но отсутствие типизированной связи с конкретной линией/модулем сохраняет риск семантического дубля. |
| C. `Bom.components` / `ProductComponent` | **STALE/WRONG** | Отдельной `ProductComponent` schema нет; `Product` использует embedded `CompositionLine` (`backend/src/modules/product/product.schema.ts:4-5,55-58`), а `Bom` — embedded `BomComponent` с ref `ProductModule` (`backend/src/modules/bom/bom.schema.ts:4-28,43-47`). Старый pair в текущей модели не существует в заявленном виде. |
| D. `Product.photos` / `Product.photoIds` | **FIXED** | `Product.photos` отсутствует, `photoIds` остаётся (`backend/src/modules/product/product.schema.ts:38`). |

## 2. M2M и generic FK из старого аудита

### 2.1 M2M (`*Ids`)

| Entity/поле | Статус | Evidence |
|---|---|---|
| `Worker.workTypeIds[]` | **STILL VALID — medium** | Inline M2M остаётся: `backend/src/modules/worker/worker.schema.ts:40-42`; `WorkerWorkType` schema не найден. |
| `Product.productModuleIds[]` | **STILL VALID — medium** | Legacy inline M2M остаётся: `backend/src/modules/product/product.schema.ts:53-55`; сервис также dual-reads его вместе с `composition` (`backend/src/modules/catalog-graph/catalog-graph.service.ts:206-207,246-273`). |
| `OrderTask.dependsOnTaskIds[]` | **STILL VALID — medium** | `backend/src/modules/order-task/order-task.schema.ts:70`; `TaskDependency` schema не найден. |
| `Certificate.productIds[]` | **STILL VALID — low/medium** | `backend/src/modules/certificate/certificate.schema.ts:10-15`; `CertificateProduct` schema не найден. Дополнительно остаётся `productNames[]` cache — §4. |
| `Warehouse.roleIds[]` | **STILL VALID — medium** | `backend/src/modules/warehouse/warehouse.schema.ts:28-30`; `WarehouseAccess` отсутствует. |
| `Organization.counterpartyRoleIds[]` | **STALE/WRONG** | В живой `Organization` такого поля нет; вместо него `type`/`partyTypes` (`backend/src/modules/organization/organization.schema.ts:103-116`). |
| `Product.photoIds[]` | **STILL VALID как осознанная связь** | `backend/src/modules/product/product.schema.ts:38`; это FK-массив на `Photo`, но рядом существует второй ProductPhoto write-path — N3. |
| `User.permissions[]` | **STILL VALID — medium** | `backend/src/modules/user/user.schema.ts:21-22`; одновременно `role` — строка (`:17-19`), `roleId` отсутствует, отдельного UserPermissionOverride нет. |
| `Role.permissions[]` | **STALE/WRONG как дефект** | Поле остаётся (`backend/src/modules/role/role.schema.ts:16-17`), но для каталога роли это явно разрешённый inline список, как и указано в старом аудите. |
| `Role.sectionIds[]` | **STALE/WRONG как дефект** | Поле остаётся (`backend/src/modules/role/role.schema.ts:25-29`) и является строковым UI-каталогом, а не доказанным relational M2M. |

### 2.2 Полиморфные ссылки

| Старое замечание | Статус | Evidence |
|---|---|---|
| `PurchaseRequest.entityType/entityId` + name/SKU/unit cache | **STILL VALID — high** | `backend/src/modules/purchase-request/purchase-request.schema.ts:58-69`; `entityId` даже типизирован как `string`, а три cache-поля всё ещё хранятся. |
| `InventoryMovement` generic FK | **FIXED на уровне schema** | `InventoryMovement` отсутствует; текущий `StockMovement` использует типизированные `productId/materialId` (`backend/src/modules/stock-movement/stock-movement.schema.ts:18-22`). |
| `OrderHistory` → AuditLog | **FIXED на уровне schema** | `AuditLog.entityType/entityId` живы (`backend/src/modules/audit/audit-log.schema.ts:9-16`); старой OrderHistory schema нет. |
| `UserActivity` → AuditLog | **FIXED на уровне schema** | То же: единая `AuditLog` (`backend/src/modules/audit/audit-log.schema.ts:6-37`); UserActivity schema нет. |
| `OrderTask.componentId/componentName` | **STILL VALID — high** | `backend/src/modules/order-task/order-task.schema.ts:18-21`; поля и DTO остаются. |
| `Tender.companyId` → `organizationId` | **STILL VALID — medium** | В `Tender` остаётся `companyId` с ref `Organization`, отдельного `organizationId` нет (`backend/src/modules/tender/tender.schema.ts:18-23`). |
| `Tender.customerOrgId + customerName` | **STILL VALID — medium** | Оба поля остаются (`backend/src/modules/tender/tender.schema.ts:23-27`); `customerName` — denormalized cache без явной snapshot-документации. |

## 3. Entity без PK (`id`)

Старый §4.1 перечисляет 20 позиций, хотя краткая постановка говорит 11. Для каждой корневой живой схемы `@Schema({ collection: ... })` Mongoose создаёт `_id` автоматически. Поэтому исходная формулировка «нет PK» **не подтверждается** как проблема Mongo-модели. Отсутствие явного поля `id` в API DTO/serializer отдельно не проверялось — **UNCERTAIN** для этого внешнего контракта.

| Старый список | Статус | Evidence |
|---|---|---|
| `Bom` | **STALE/WRONG** | Корневая schema с `_id`: `backend/src/modules/bom/bom.schema.ts:32-56`. |
| `CostCalculation` | **STALE/WRONG** | Корневая schema с `_id`: `backend/src/modules/cost-calculation/cost-calculation.schema.ts:75-132`. |
| `DocTypeDef` | **FIXED** | Отдельной entity нет; канон `DocType`: `backend/src/modules/doc-type/doc-type.schema.ts:6-19`. |
| `DocumentTableType` | **STALE/WRONG** | Корневая schema с `_id`: `backend/src/modules/document-table-type/document-table-type.schema.ts:20-53`. |
| `EntityAttributeValue` | **STALE/WRONG** | Корневая schema с `_id`: `backend/src/modules/entity-attribute-value/entity-attribute-value.schema.ts:6-23`. |
| `Invoice` | **STALE/WRONG** | Корневая `Invoice` с timestamps: `backend/src/modules/invoice/invoice.schema.ts:8-57`. |
| `Photos` | **FIXED** | Legacy plural entity заменена корневой `Photo` с timestamps: `backend/src/modules/photos/photo.schema.ts:21-64`. |
| `Quotation` | **STALE/WRONG** | Корневая schema с timestamps: `backend/src/modules/quotation/quotation.schema.ts:172-315`. |
| `ShippingDoc` | **FIXED** | Это embedded subdocument `@Schema({ _id: false })`, не отдельная entity: `backend/src/modules/shipment/shipment.schema.ts:4-49`. |
| `TechProcess` | **STALE/WRONG** | Корневая schema с timestamps: `backend/src/modules/tech-process/tech-process.schema.ts:23-38`. |
| `WorkOrderOperation` | **STALE/WRONG** | Корневая schema с timestamps: `backend/src/modules/work-order-operation/work-order-operation.schema.ts:7-47`. |
| `AttributeDefinition` | **STALE/WRONG** | Корневая schema с timestamps: `backend/src/modules/attribute-definition/attribute-definition.schema.ts:7-47`. |
| `ComplianceRule` | **STALE/WRONG** | Корневая schema с timestamps: `backend/src/modules/compliance-rule/compliance-rule.schema.ts:17-62`. |
| `ProductPassport` | **STALE/WRONG** | Корневая schema с timestamps: `backend/src/modules/product-passport/product-passport.schema.ts:6-60`. |
| `WorkOrder` | **STALE/WRONG** | Корневая schema с timestamps: `backend/src/modules/work-order/work-order.schema.ts:7-40`. |
| `StockMovement` | **STALE/WRONG** | Корневая schema с timestamps: `backend/src/modules/stock-movement/stock-movement.schema.ts:7-37`. |
| `EntityStatus` | **STALE/WRONG** | Корневая schema с timestamps: `backend/src/modules/status/entity-status.schema.ts:6-33`. |
| `Setting` | **STALE/WRONG** | Корневая schema с timestamps: `backend/src/modules/setting/setting.schema.ts:6-35`. |
| `Client` | **FIXED** | Отдельной Client schema нет; живой контактный канон — `Counterparty`/`Person`. |
| `Order` | **STALE/WRONG** | Корневая schema с timestamps: `backend/src/modules/order/order.schema.ts:149-235`. |

**Итог §3:** **FIXED 4, STALE/WRONG 16, STILL VALID 0**. Реального «entity без первичного ключа» в проверенных root schemas не найдено; есть только отсутствие явного `id`-декларатора при наличии стандартного Mongoose `_id`.

## 4. Избыточные поля из старого §3.1

Ниже сохранены все 43 строки старой таблицы, включая повтор `ProductionOrder.productName/productSku`. Статус: **STILL VALID 19, FIXED 21, STALE/WRONG 3**.

| Старое поле/пара | Статус | Evidence и вывод |
|---|---|---|
| `User.passwordHash` / `password` | **FIXED** | В User есть только `passwordHash` (`backend/src/modules/user/user.schema.ts:21-23`), `password` отсутствует. |
| `User.role` / `permissions` | **STILL VALID — medium** | Оба остаются (`backend/src/modules/user/user.schema.ts:17-29`); `roleId` нет. Возможно, permissions — намеренный per-user override, но это не зафиксировано схемой. |
| `Material.category` / `categoryId` | **FIXED** | Есть только `categoryId` (`backend/src/modules/material/material.schema.ts:58-60`); legacy `category` отсутствует. |
| `Material.price` / `pricePerUnit` | **FIXED** | Есть только `pricePerUnit` (`backend/src/modules/material/material.schema.ts:63-65`). |
| `Product.cost` / `costPrice` | **FIXED** | `cost` отсутствует, `costPrice` остаётся (`backend/src/modules/product/product.schema.ts:31-33`). |
| `Product.weight` / `weightKg` | **FIXED** | `weight` отсутствует, `weightKg` остаётся (`backend/src/modules/product/product.schema.ts:40`). |
| `Product.listPrice` / `basePrice` | **STALE/WRONG как подтверждённый дубль** | Оба живы (`backend/src/modules/product/product.schema.ts:31-32`), но старый аудит сам фиксировал разную коммерческую семантику; schema не доказывает дублирование. |
| `Product.photos` / `photoIds` | **FIXED** | `photos` отсутствует, `photoIds` остаётся (`backend/src/modules/product/product.schema.ts:38`). |
| `Product.productType` / `kind` | **FIXED** | `productType` отсутствует, `kind` остаётся (`backend/src/modules/product/product.schema.ts:26`). |
| `ProductionOrder.plannedStart` / `plannedStartDate` | **FIXED частично** | Старое двойное хранение устранено: живёт только `plannedStartDate` (`backend/src/modules/production-order/production-order.schema.ts:64`). Naming debt `*Date` вместо `*At` остаётся. |
| `ProductionOrder.plannedEnd` / `plannedEndDate` | **FIXED частично** | Живёт только `plannedEndDate` (`backend/src/modules/production-order/production-order.schema.ts:67`); naming debt остаётся. |
| `ProductionOrder.productName` / `productSku` | **STILL VALID — high** | Оба cache-поля остаются рядом с `productId` (`backend/src/modules/production-order/production-order.schema.ts:27-36`). |
| `OrderTask.orderId` / `productionOrderId` | **FIXED** | Живёт только `productionOrderId` (`backend/src/modules/order-task/order-task.schema.ts:13-15`). |
| `OrderTask.estimatedHours` / `plannedHours` | **FIXED** | Живёт только `estimatedHours` (`backend/src/modules/order-task/order-task.schema.ts:51-53`). |
| `OrderTask.workTypeId` / `workTypeName` | **STILL VALID — high** | Оба остаются (`backend/src/modules/order-task/order-task.schema.ts:24-27`). |
| `OrderTask.componentName` | **STILL VALID — high** | Cache-поле остаётся (`backend/src/modules/order-task/order-task.schema.ts:18-21`), вместе с `componentId`. |
| `OrderTask.actualStartDate` / `actualEndDate` | **STILL VALID — medium** | Оба остаются (`backend/src/modules/order-task/order-task.schema.ts:64-67`); это не дубль, а старое naming замечание. |
| `OrderClosing.amount` / `totalAmount` | **STILL VALID — high** | Оба поля остаются (`backend/src/modules/order-closing/order-closing.schema.ts:26-30`), service заполняет оба (`backend/src/modules/order-closing/order-closing.service.ts:45-46`). |
| `Certificate.issuedBy` / `issuer` | **FIXED** | Живёт только canonical `issuedBy` (`backend/src/modules/certificate/certificate.schema.ts:24-27`). |
| `Certificate.expiryDate` / `expiresAt` | **FIXED** | Живёт только `expiresAt` (`backend/src/modules/certificate/certificate.schema.ts:30-33`). |
| `Certificate.notes` / `title` | **STALE/WRONG** | `title` отсутствует, `notes` остаётся (`backend/src/modules/certificate/certificate.schema.ts:36-39`); это не две живые копии. |
| `Contract.customerId` / `clientId` | **FIXED частично** | `clientId` отсутствует, `customerId` остаётся (`backend/src/modules/contract/contract.schema.ts:43-46`). Предложенное старым аудитом имя `counterpartyId` не внедрено. |
| `DocumentTemplate.docType` / `docTypeId` | **FIXED** | Есть только `docTypeId` (`backend/src/modules/document-template/document-template.schema.ts:19-21`). |
| `backgroundImage` / `backgroundImages` | **FIXED по duplicate** | Есть одно поле `backgroundImage: string[]`, `backgroundImages` отсутствует (`backend/src/modules/document-template/document-template.schema.ts:45-47`). Название singular для массива — отдельный naming debt. |
| `PurchaseRequest.statusId` / `status` | **STILL VALID — high** | Оба поля остаются (`backend/src/modules/purchase-request/purchase-request.schema.ts:42,87`). |
| `Shipment.statusId` / `status` | **STILL VALID — high** | Оба поля остаются (`backend/src/modules/shipment/shipment.schema.ts:79,86`). |
| `StatusWorkflow.entityType` / `entity` | **FIXED** | Есть только `entityType` (`backend/src/modules/status/status-workflow.schema.ts:26-28`). |
| `PurchaseOrder.supplierOrgId` / `supplierId` | **STILL VALID — high** | Оба поля остаются (`backend/src/modules/purchase-order/purchase-order.schema.ts:48-51`). |
| `SupplierOrder.expectedDate` / `deliveryDate` | **FIXED на canonical schema** | `SupplierOrder` schema отсутствует; в `PurchaseOrder` есть только `deliveryDate` (`backend/src/modules/purchase-order/purchase-order.schema.ts:67`). |
| `Tender.statusId` / `status` | **STILL VALID — high** | Оба поля остаются (`backend/src/modules/tender/tender.schema.ts:56,96`). |
| `Tender.attachments` / `documents` | **FIXED по duplicate** | Живёт только `attachments: string[]` (`backend/src/modules/tender/tender.schema.ts:44`), `documents` отсутствует; старое предложение структурировать documents не реализовано. |
| `Tender.subject` / `productName` | **STILL VALID — medium** | Оба остаются (`backend/src/modules/tender/tender.schema.ts:32-35`); в Tender нет items, поэтому derivability не доказана. |
| `Counterparty.checkingAccount` / `Organization.bankAccount` | **FIXED по naming duplicate** | `Counterparty` теперь использует `bankAccount` (`backend/src/modules/counterparty/counterparty.schema.ts:43-45`), как и Organization (`backend/src/modules/organization/organization.schema.ts:88-90`). Cross-entity повтор реквизитов сохраняется — N2. |
| `ReconciliationAct.ourDebt + theirDebt` / `balance` | **STILL VALID — high** | Все три поля остаются (`backend/src/modules/reconciliation-act/reconciliation-act.schema.ts:29-38`); service вычисляет `balance` (`backend/src/modules/reconciliation-act/reconciliation-act.service.ts:70-84`). |
| `ReconciliationAct.organizationName` | **STILL VALID — medium** | Cache остаётся рядом с `organizationId` (`backend/src/modules/reconciliation-act/reconciliation-act.schema.ts:10-14`), service его специально кэширует (`backend/src/modules/reconciliation-act/reconciliation-act.service.ts:30-34`). |
| `FinancialReport.netProfit` / income+expense | **STILL VALID — medium** | Все поля остаются (`backend/src/modules/financial-report/financial-report.schema.ts:29-38`), service вычисляет `netProfit` (`backend/src/modules/financial-report/financial-report.service.ts:61-63`). Возможный snapshot отчёта не доказан. |
| `CostCalculation.totalCost` / component totals | **STILL VALID — medium** | `totalMaterialCost`, `totalLaborCost`, `overheadCost`, `totalCost` живы (`backend/src/modules/cost-calculation/cost-calculation.schema.ts:88-121`); возможная роль immutable calculation snapshot не описана в schema. |
| `InventoryItem` caches | **FIXED** | `InventoryItem` schema отсутствует вместе с entity; runtime dashboard использует StorageItem (`backend/src/modules/inventory/inventory.controller.ts:42-66`). |
| `ProductPassport.name/category/article` / `productId` | **STILL VALID — medium** | Все четыре поля остаются (`backend/src/modules/product-passport/product-passport.schema.ts:10-34`). |
| `InventorFile.productName/productSku` / `productId` | **STILL VALID — medium** | Cache-поля остаются (`backend/src/modules/inventor-file/inventor-file.schema.ts:8-16`). |
| `Rpp.productName/productSku` / `productId` | **STILL VALID — medium** | Cache-поля остаются (`backend/src/modules/rpp/rpp.schema.ts:16-24`). |
| Повтор `ProductionOrder.productName/productSku` | **STILL VALID** | Это повтор строки выше; evidence тот же: `backend/src/modules/production-order/production-order.schema.ts:27-36`. |
| `CartItem.priceSnapshot` / product price | **STALE/WRONG** | В живой CartItem есть `priceSnapshot` как отдельное обязательное поле (`backend/src/modules/cart-item/cart-item.schema.ts:24-26`); это snapshot сделки, не ошибка нормализации.

## 5. Дополнительные старые замечания, сверенные по live schema

- **FSM:** старый аудит считал `Quotation` и `Order` корректными из-за `statusId`, но текущие схемы имеют оба поля: `Quotation.statusId/status` (`backend/src/modules/quotation/quotation.schema.ts:240-247`), `Contract.statusId/status` (`backend/src/modules/contract/contract.schema.ts:48-55`), `Order.statusId/status` (`backend/src/modules/order/order.schema.ts:174-181`), а также PurchaseRequest/Shipment/Tender выше. Это обновлённая **STILL VALID — high** проблема, см. N1.
- **Currency:** старое замечание о неполном multi-currency не может трактоваться как `Material.priceCurrency`: такого поля в Material нет, цена — `pricePerUnit` (`backend/src/modules/material/material.schema.ts:63-65`). При этом отдельная Currency schema и API реально живы (`backend/src/modules/currency/currency.schema.ts:6-42`, `backend/src/modules/currency/currency.controller.ts:19-69`).
- **Version:** корневые схемы используют стандартный Mongoose `__v`, но явное поле `version` есть только в отдельных бизнес-моделях/embedded snapshots; наличие полноценного optimistic locking для всех редактируемых entity этим аудитом не подтверждено. Для Product/Material/Category/Organization подключён plugin (`backend/src/modules/product/product.schema.ts:63-64`, `backend/src/modules/material/material.schema.ts:105-106`, `backend/src/modules/organization/organization.schema.ts:174`), для многих остальных — нет. **STILL VALID — medium, но граница plugin/`__v` требует отдельного runtime-аудита.**
- **createdBy:** часть старого замечания остаётся: `PurchaseRequest.createdBy` (`backend/src/modules/purchase-request/purchase-request.schema.ts:39-40`) и `ActualCost.createdBy` (`backend/src/modules/actual-cost/actual-cost.schema.ts:25-27`) есть, общего обязательного поля на всех entity нет. **STILL VALID — medium**, scope шире текущего schema-only списка.
- **tenant/organization scope:** `organizationId` уже появился в User/Worker/Material/Product/Category/Shipment и других моделях, но не является единым обязательным полем всех entity. **STILL VALID / UNCERTAIN**: on-premise vs SaaS policy не устанавливается schemas.

## 6. Naming consistency из старого §5

| Старое замечание | Статус | Evidence |
|---|---|---|
| Boolean `Invoice.paid` вместо `isPaid` | **STILL VALID — medium** | `paid` остаётся в `backend/src/modules/invoice/invoice.schema.ts:42-43`; рядом есть `paidAmount/paidAt`, поэтому переименование требует контрактного решения. |
| Boolean `Employees.active` | **FIXED** | `Employees` schema отсутствует; живой Worker использует `isActive` (`backend/src/modules/worker/worker.schema.ts:44-46`). |
| Boolean `Material.fixedDimensions` | **FIXED** | Поле отсутствует; текущая семантика размеров — embedded `Dimension.isImmutable` (`backend/src/modules/material/material.schema.ts:10-26`). |
| Date `signDate` | **STILL VALID — medium** | `ReconciliationAct.signDate` остаётся (`backend/src/modules/reconciliation-act/reconciliation-act.schema.ts:41-42`). |
| Date `date` в PurchaseRequest/StockMovement/OrderClosing/Tender | **STILL VALID — medium** | `PurchaseRequest.date` (`backend/src/modules/purchase-request/purchase-request.schema.ts:34-36`), `StockMovement.date` (`backend/src/modules/stock-movement/stock-movement.schema.ts:12-14`), `OrderClosing.date` (`backend/src/modules/order-closing/order-closing.schema.ts:23-24`), `Tender.date` (`backend/src/modules/tender/tender.schema.ts:16-17`) остаются. |
| Date `date` в FinancialReport | **STALE/WRONG** | В FinancialReport отдельного `date` нет; используются `periodStart/periodEnd` (`backend/src/modules/financial-report/financial-report.schema.ts:19-24`). |
| `ProductionOrder.plannedStart/End`, `actualStart/End` без `At` | **STILL VALID — medium** | Дубли старых имён удалены, но `plannedStartDate`, `plannedEndDate`, `actualStartDate`, `actualEndDate` остаются (`backend/src/modules/production-order/production-order.schema.ts:64-73`). |
| `validUntil` | **STALE/WRONG как нарушение** | Термин остаётся в Quotation (`backend/src/modules/quotation/quotation.schema.ts:229-230`) и по канону старого аудита допустим. |
| `WorkOrder.startDate/endDate` | **STILL VALID — medium** | Оба поля остаются (`backend/src/modules/work-order/work-order.schema.ts:25-28`). |
| `Certificate.expiryDate` | **FIXED** | В Certificate остался только `expiresAt` (`backend/src/modules/certificate/certificate.schema.ts:30-33`). |
| `Certificate.issueDate` | **STILL VALID — medium** | `issueDate` остаётся (`backend/src/modules/certificate/certificate.schema.ts:27-28`). |
| `Organization.registrationDate` / `Rpp.registrationDate` | **STILL VALID — medium** | Поля остаются в `backend/src/modules/organization/organization.schema.ts:119-120` и `backend/src/modules/rpp/rpp.schema.ts:35-36`. |
| `Rpp.expiryDate` | **STILL VALID — high** | `expiryDate` остаётся (`backend/src/modules/rpp/rpp.schema.ts:38-39`), `expiresAt` не используется. |
| `Tender.publishDate/resultDate` | **STILL VALID — medium** | Оба поля остаются (`backend/src/modules/tender/tender.schema.ts:77-83`). |
| `CostCalculation.calculatedAt` | **STALE/WRONG как нарушение** | Поле уже соответствует `*At` (`backend/src/modules/cost-calculation/cost-calculation.schema.ts:124-125`). |
| `FinancialReport.generatedAt` | **FIXED** | В текущей schema отдельного `generatedAt` нет. |
| `qty` вместо `quantity` | **STILL VALID — high** | `WorkOrder.qty` (`backend/src/modules/work-order/work-order.schema.ts:19-21`) и `StockMovement.qty` (`backend/src/modules/stock-movement/stock-movement.schema.ts:32-33`) остаются. |
| `total` вместо `totalAmount` | **STILL VALID — medium** | `Quotation.total` (`backend/src/modules/quotation/quotation.schema.ts:250-252`) и `Order.total` (`backend/src/modules/order/order.schema.ts:183-185`) остаются. `PurchaseOrder` уже использует `totalAmount` (`backend/src/modules/purchase-order/purchase-order.schema.ts:65`). |
| `amount` как универсальный итог | **STALE/WRONG частично** | В Invoice старого `amount` нет, а `ActualCost.amount` — конкретная строка затрат (`backend/src/modules/actual-cost/actual-cost.schema.ts:14-17`); в OrderClosing `amount` и `totalAmount` действительно дублируются (§4). |
| `priceCurrency` / `currency` naming | **FIXED для Material, UNCERTAIN для будущих полей** | `Material.priceCurrency` отсутствует; проектный runtime форматирует денежные поля как RUB (`backend/src/modules/material/material.schema.ts:63-65`, `backend/src/modules/registry/registry.service.ts:90-95`).

## 7. Новое замечено

### N1 — дублирование `statusId` и string `status` расширилось — high

Старый аудит явно перечислял не все живые случаи. В текущих schemas обе формы одновременно присутствуют минимум в `Quotation`, `Contract`, `Order`, `PurchaseRequest`, `Shipment`, `Tender`:

- `Quotation`: `backend/src/modules/quotation/quotation.schema.ts:240-247`
- `Contract`: `backend/src/modules/contract/contract.schema.ts:48-55`
- `Order`: `backend/src/modules/order/order.schema.ts:174-181`
- `PurchaseRequest`: `backend/src/modules/purchase-request/purchase-request.schema.ts:42,87`
- `Shipment`: `backend/src/modules/shipment/shipment.schema.ts:79,86`
- `Tender`: `backend/src/modules/tender/tender.schema.ts:56,96`

Сервисные фильтры используют string `status`, поэтому это не только документационный шум: возможен split-brain источника статуса.

### N2 — общие банковские реквизиты остаются в двух root schemas — medium

После переименования `Counterparty.checkingAccount` → `bankAccount` старое имя-расхождение исчезло, но одинаковый набор `bankName/bankBik/bankAccount/bankCorrAccount` всё ещё живёт отдельно в `Organization` (`backend/src/modules/organization/organization.schema.ts:80-94`) и `Counterparty` (`backend/src/modules/counterparty/counterparty.schema.ts:36-49`). `BankDetail` не найден. Это подтверждает только cross-entity duplication, не необходимость слияния Organization и Counterparty.

### N3 — два активных photo write-path для Product и ProductModule — medium

- Product хранит `photoIds` (`backend/src/modules/product/product.schema.ts:38`) и одновременно имеет `ProductPhoto` entity/module (`backend/src/modules/product-photo/product-photo.schema.ts:6-28`, `backend/src/modules/product-photo/product-photo.module.ts:3-15`).
- ProductModule хранит `photoIds/mainPhotoId` (`backend/src/modules/product-module/product-module.schema.ts:59-61`) и одновременно имеет `ProductModulePhoto`; сервис обновляет оба места (`backend/src/modules/product-module-photo/product-module-photo.service.ts:13-19,30-34`).

Это не мёртвые файлы: оба модуля зарегистрированы в `backend/src/app.module.ts:37-40,219-220`. Но единый SoT для галереи не очевиден.

### N4 — canonical composition и legacy arrays читаются одновременно — medium

`Product` хранит `composition` и `productModuleIds` (`backend/src/modules/product/product.schema.ts:53-58`), `ProductModule` — `composition`, а также legacy `materials`/`workTypes` (`backend/src/modules/product-module/product-module.schema.ts:61-67`). `catalog-graph.service.ts` явно читает оба формата (`backend/src/modules/catalog-graph/catalog-graph.service.ts:206-207,246-273`). Это выглядит как незавершённый dual-read/migration path; не исправлялось в рамках аудита.

### N5 — `WorkOrderOperation.operationId` типизирован как WorkType при наличии RoutingStep — medium

`WorkOrderOperation.operationId` имеет `ref: 'WorkType'` (`backend/src/modules/work-order-operation/work-order-operation.schema.ts:17-19`), тогда как отдельный `RoutingStep` существует и сам ссылается на `WorkType` (`backend/src/modules/routing-step/routing-step.schema.ts:6-30`). Имя поля говорит Operation, фактический ref — WorkType; это потенциальная semantic FK ошибка.

### N6 — документация о модели расходится с живым backend — medium

`docs/data-model.md` утверждает, что Currency-модуль удалён, но живые `CurrencyModule`, `Currency` и `CurrenciesSeed` зарегистрированы (`backend/src/app.module.ts:57,118,220,304`). Документ также описывает уже отсутствующие поля `Material.category/price`, `Product.photos/materials` и отдельные legacy entities. Схема побеждает; после этого audit нужен отдельный docs-sync.

## 8. Мёртвый код / неиспользуемые файлы

**Явно мёртвых schema/module-файлов по статическим evidence не подтверждено.**

- `CurrencyModule` реально зарегистрирован и имеет controller/service (`backend/src/app.module.ts:57,220`, `backend/src/modules/currency/currency.module.ts:3-15`), поэтому не считать его dead code только из-за устаревшего `data-model.md`.
- `InventoryModule` — controller-only aggregation без собственной schema/service (`backend/src/modules/inventory/inventory.module.ts:1-13`, `backend/src/modules/inventory/inventory.controller.ts:1-16`); это намеренная фасадная роль, не доказанный orphan.
- `ProductPhoto` и `ProductModulePhoto` используются и зарегистрированы; замечание — N3 про два write-path, не dead file.

## 9. Сводка

| Группа | STILL VALID | FIXED | STALE/WRONG |
|---|---:|---:|---:|
| Дубликаты entity, включая A–D | 2 | 13 | 7 |
| Entity без явного `id` из старого списка (20 строк) | 0 | 4 | 16 |
| Избыточные поля §3.1 (43 строки, с повтором) | 19 | 21 | 3 |
| M2M §2.1 (10 строк) | 7 | 0 | 3 |
| Generic FK §2.2 (7 строк) | 4 | 3 | 0 |
| Naming consistency §5 (20 строк) | 11 | 5 | 4 |
| **Всего строковых проверок, без dedupe между разделами** | **43** | **46** | **33** |

**Новых сгруппированных находок:** 6 (N1–N6).  
**UNCERTAIN:** фактическая миграция legacy-документов и внешний `id`-serialization/API contract; по schemas подтверждается только текущая форма кода.  
**Проверки:** кодовые typecheck/tests/lint не запускались — задача read-only документационная, продуктовый код запрещено менять; выполнена статическая сверка schemas/modules и review diff отчёта.
