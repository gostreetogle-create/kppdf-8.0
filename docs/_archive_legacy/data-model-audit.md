# Data Model Audit — kppdf-8.0

> **Глубокий аудит** 89 entity на дублирование, избыточность, нормализацию и недостающие паттерны.
> **Источник:** [`./data-model.md`](./data-model.md) — каноническая структурированная версия доменной модели проекта.
> **Дата:** 2026-07-04.
> **Дополняет, не дублирует** секцию «Дубликаты и аномалии» в `data-model.md`.

> ⚠️ **Допущения по стеку:** аудит написан под **MongoDB** (или совместимую документ-ориентированную БД): `ObjectId` PK, `*Ids: ObjectId[]` массивы для M2M, наследуемый аудит в субдокументах. **Если выбран PostgreSQL/MySQL — нужна отдельная версия аудита:** массивы FK заменяются на join-таблицы, embedding → normalization, шардинг не применяется. **Принять решение по стеку ДО реализации Priority 1** (§8).
>
> **Canonical verdict (search infrastructure):** настоящий документ не рассматривает Vector DB / семантический поиск — kppdf-8.0 использует MongoDB-only document store + structured-name search + ad-hoc regex. Canonical no-Vector-DB решение и обоснования см. в [`../ARCHITECTURE.md`](../ARCHITECTURE.md) §5 «Search infrastructure» (TZ-105.1 verdict, 2026-07-12). Если семантический search потребуется в будущем — отдельный TZ (см. §5.3 в архитектурном документе).

---

## 📊 Executive Summary

| Метрика                                     | Значение |
|---------------------------------------------|----------|
| Всего entity в доменной модели              | **89**   |
| Уникальных имён полей                       | **369**  |
| Полей типа `ObjectId` (id+*Id+*Ids)        | 132      |
| Полей типа `Date` (*At)                    | 145      |
| Подтверждённых дублей entity (Severity High)| **15**   |
| Judgment-call дублей (нужно обсудить)      | 3        |
| Избыточных полей внутри entity             | **~30**  |
| Entity без `id` PK                          | **20**   |
| Entity без `createdAt`                      | **12**   |
| Неявных M2M (массивы `*Ids`)                | 7        |
| Имена полей без унификации (boolean, date) | ~10      |
| **TARGET после консолидации**               | **~62-67 entity** (плюс 4-6 новых) |

**Главные выводы:**

1. **89 → ~65 entity** реалистично после консолидации 15 дублей + слияния 3 категорий.
2. **3NF нарушен** в 5+ entity (вычисляемые поля: `balance`, `netProfit`, `totalCost`; legacy дубли).
3. **FSM разорвана**: `EntityStatus` и `StatusWorkflow` есть, но 12+ entity хранят `status: string` вместо `statusId`.
4. **Audit split-brain**: 3 разных лога (`OrderHistory`, `UserActivity`, `Comment`) — кандидат на объединение в `AuditLog`.
5. **Multi-currency только в `Material`** — `Product`, `Contract`, `Order` без валюты (для российского ERP пойдёт, для международного нет).
6. **Множественные M2M как массивы** — OK для MongoDB, но теряются атрибуты связей (даты, метаданные).

---

## 1. 🔁 Дубликаты Entity (deep analysis)

### 1.1. Severity High (15 пар — мерджить в MVP)

| # | Дубль A | Дубль B | (опц. C) | Канон | Mapping полей | Trade-offs |
|---|---------|---------|-----------|-------|---------------|------------|
| 1 | `DocType` (id, timestamps) | `DocTypeDef` (без id/timestamps) | — | **`DocType`** | DocTypeDef.name → DocType.name, slug/description/isActive маппятся 1:1. Добавить `id, createdAt, updatedAt` в DocTypeDef-данные при миграции. | Потеря null в timestamps → нет (все равно заполнятся при миграции) |
| 2 | `Proposal` (id, customerId, organizationId, version, parentProposalId) | `Quotation` (без id, counterpartyId, tenderId, designSnapshot, items array) | `CommercialProposal` (компактный, без id) | **`Quotation`** (переименовать в `Quotation` окончательно) | `Proposal.customerId` → `counterpartyId`; `Proposal.parentProposalId` → `versionOf: ObjectId` (self-ref array `versionIds: ObjectId[]` для версий КП); `Proposal.items` → `QuotationItem` join-entity (см. §2); `CommercialProposal.clientId` → `counterpartyId`; merge `designSnapshot` + `templateSnapshot` → `templateSnapshot: object`. | Теряем `parentProposalId` (single ref) — но получаем `versionIds[]` (полная цепочка). Нужен data migration скрипт. |
| 3 | `Rpp` (с productId, registryNumber, submissionDate/registrationDate/expiryDate) | `RppEntry` (компактный) | — | **`Rpp`** | RppEntry.title → Rpp.title, status/notes маппятся 1:1. | OK, потерь нет |
| 4 | `PurchaseOrder` (id, statusId, supplierId, orderDate, deliveryDate) | `SupplierOrder` (id, supplierOrgId/supplierId дубль, expectedDate/deliveryDate дубль, items array) | — | **`PurchaseOrder`** | SupplierOrder.supplierOrgId → PurchaseOrder.supplierId; expectedDate → deliveryDate; SupplierOrder.items → PurchaseOrderItem join-entity. | OK, потерь нет |
| 5 | `IncomingInvoice` (id, invoiceDate, dueDate, supplierId) | `Invoice` (без id, date, supplierOrgId, supplierOrderId, paid) | — | **`Invoice`** (переименовать IncomingInvoice → Invoice) | Добавить `id, createdAt, updatedAt, supplierOrderId, paid, fileUrl, currency`. | OK |
| 6 | `Role` (id, label, permissions[], sectionIds[], isSystem, sortOrder) | `Roles` (без id, isSystemRole, status) | — | **`Role`** | Roles.name → Role.name; `isSystemRole` → `isSystem`; `status` удалить (заменён на `isActive`). Добавить `isActive` если нет. | Теряем `status` (но он не нужен — `isActive` достаточно) |
| 7 | `Employees` (без id, name/fullName дубль, active без is-) | `Worker` (id, lastName/firstName/patronymic, grade, ratePerHour, workTypeIds[], isActive) | — | **`Worker`** (расширить) | Employees.name/fullName → Worker.lastName+firstName (split по пробелу — осторожно!); `position` → Worker.position (новое поле); `active` → `isActive`. Добавить `deletedAt`, `phone`, `email`. | `name → lastName+firstName` нетривиально (fullName "Иванов Иван" = "Иванов" + "Иван"); рекомендую ручной review при миграции |
| 8 | `Operation` (id, number, name, workshop, duration, costPerHour) | `WorkType` (id, name, section, department, defaultDurationHours, workCenterId, hourlyRate) | — | **ОБЕ ОСТАВИТЬ** (функционально разные) | `Operation` — **это шаг маршрута** (concrete step в TechProcess), `WorkType` — **каталог видов работ** (reference). Мердж недопустим, потеряем семантику. **Рекомендация:** переименовать `Operation` → `RoutingStep` (для ясности), добавить `techProcessId: ObjectId` (FK к TechProcess). | Снято с Priority 1, см. §1.2 (Severity Medium) |
| 9 | `ProductModule` (id, name, article, width/height/depth/weight) | `Modules` (без id, name, sku, childModuleIds, moduleMaterials, moduleWorks) | — | **`ProductModule`** (расширить) | Modules.sku → ProductModule.article; childModuleIds → вынести в `ProductModuleAssignment` (§2); moduleMaterials → `ModuleMaterial` уже есть; moduleWorks → `ModuleWorkType` уже есть. Добавить `id, createdAt, updatedAt, dimensions` (object). | OK |
| 10 | `InventoryMovement` (id, type, warehouseId/toWarehouseId, zoneName/toZoneName, storageItemId, productionOrderId, entity*) | `StockMovement` (id, type, date, productId, warehouseId, qty, cost, orderId, documentRef, createdBy) | — | **`StockMovement`** (расширить) | InventoryMovement.zoneName/toZoneName → `StockMovement.fromZone/toZone`; storageItemId → производный (можно вычислить через warehouseId+productId); productionOrderId, orderId → `documentType` + `documentId` (polymorphic ref); entityType/Id/Name/Sku/Unit → `productId` (если всегда Product/Material). | ⚠️ Теряем generic `entityType` (Material/Product/Service) — если реально нужны не-продуктовые движения, нужен дополнительный полиморфизм. Предлагаю: добавить `entityType: enum` |
| 11 | `MaterialCategory` (id, name, slug) | `ProductCategory` (id, name, prefix, sortOrder, isActive) | `Category` (parentId, fullPath, sortOrder) | **`Category`** (расширить как универсальную) | MaterialCategory.name → Category.name; ProductCategory.name → Category.name; prefix → Category.codePrefix; slug → Category.slug; sortOrder → Category.sortOrder; parentId → parentId. Добавить `entityType: enum ('material', 'product', 'other')`. | ⚠️ Теряем `MaterialCategory.slug` (если у ProductCategory его не было) — добавить универсально. OK в остальном. |
| 12 | `StorageItem` (id, warehouseId, productId, quantity, reservedQty, minQuantity) | `InventoryItem` (без id, warehouseId, zoneName, entityType, entityId, quantity, minQuantity) | — | **`StorageItem`** (как storage), `InventoryItem` как view/aggregation | StorageItem.quantity уже покрывает. `InventoryItem` оставить только если реально нужен агрегированный view (по entityType+warehouseId+zoneName) — иначе удалить. | Если `InventoryItem` — view, то не хранится. Удалить как entity. |
| 13 | `Quotation` (см. #2) | `Proposal` (см. #2) | `CommercialProposal` (см. #2) | уже в #2 | — | — |
| 14 | `Warehouse.roleIds` (M2M к Role для доступа) | (отсутствует entity) | — | **новая `WarehouseAccess`** (§2) | Вынести в join-entity с `permission` (read/write/admin). | См. §2 |
| 15 | `OrderHistory` (orderId, action, userId, userName, details) | `UserActivity` (userId, action, entity, entityId, details) | `Comment` (packageTag, authorId, text) | **`AuditLog`** (новая) — см. §4 | Унифицированный лог с `entityType + entityId + actor + action + payload`. | ⚠️ `Comment` привязан к `packageTag`, не к entity — это отдельная семантика (обсуждение сделки), не аудит. Решение: **оставить `Comment` как есть**, мерджить только `OrderHistory` + `UserActivity` в `AuditLog`. |

### 1.2. Severity Medium (3 пары — обсудить с PO)

| # | Дубль A | Дубль B | Канон (?) | Вопрос к PO | Рекомендация |
|---|---------|---------|-----------|-------------|--------------|
| 16 | `Client` (без id, физлицо с ИНН, organizationId, personalMarkupPercent) | `Counterparty` (юрлицо/ИП) | отдельные | Клиент = физлицо ИЛИ юрлицо? | **Разделить:** создать `IndividualClient` (отдельный класс с паспортом) + `Counterparty.individualPersonId: ObjectId` опционально. `Client` удалить, мигрировать в `Counterparty` с типом `legalForm='IE'`. |
| 17 | `Operation` (шаг маршрута) | `WorkType` (каталог) | отдельные | Функционально разные, мердж недопустим | **Оставить обе.** Переименовать `Operation` → `RoutingStep`, добавить `techProcessId: ObjectId` (FK к `TechProcess` — уже есть в §4.1). `RoutingStep.workTypeId` → FK к `WorkType` (уже есть). |
| 18 | `Organization` (юрлицо, наша компания) | `Counterparty` (юрлицо, клиент/поставщик) | отдельные | Это РАЗНЫЕ сущности? | **Оставить обе**, но вынести общие поля (`inn, kpp, ogrn, bankAccount, bik`) в отдельную `BankDetail` (§3) + `LegalEntity` (parent class). `Organization` = "мы", `Counterparty` = "они". |
| 18 | `Reservation` (orderId, isActive) | (нет дубля, но) `StockMovement` (есть orderId через documentRef) | `Reservation` | Это отдельная фича или часть `StockMovement`? | **Оставить** `Reservation` как `StockReservation` (отдельный жизненный цикл), но добавить `reservedFromAt`, `expiresAt`, `quantity` (сейчас только `orderId + isActive` — слишком бедно). |

### 1.3. Скрытые дубли, которых НЕТ в `data-model.md`

Я нашёл 4 пары, которые не отмечены в существующей секции «Дубликаты и аномалии»:

| # | Дубль A | Дубль B | Канон | Комментарий |
|---|---------|---------|-------|-------------|
| A | `Product.material` (string — название материала) | `Product.materials` (array) | **удалить `Product.materials` array** | Materials уже вынесены в `ModuleMaterial` для модулей. Для top-level Product — `material: string` ОК как краткое описание. Или вынести в `ProductMaterial` join. |
| B | `OrderTask.componentId` (ObjectId) + `componentName` (string кэш) | `ProductionOrder.productId` (ObjectId) | **удалить `OrderTask.componentId`** | OrderTask = задача В РАМКАХ ProductionOrder, не над другим компонентом. Если нужны подкомпоненты — это `ProductComponent` join. |
| C | `Product.components` (array в Bom) | `ProductComponent` (отдельная entity с productId, name, quantityPerProduct) | **оставить `ProductComponent`, удалить `Bom.components` array** | Bom — это версия спецификации, не плоский массив. Связь через `BomComponent: { bomId, productComponentId, quantity }` (§2). |
| D | `Product.photos` (string[] URLs) | `Product.photoIds` (ObjectId[] FK к Photos) | **удалить `Product.photos`, оставить `photoIds`** | URLs = legacy, photoIds — новая правильная модель. |

---

## 2. 🔗 M2M Нормализация

### 2.1. Текущие `*Ids: ObjectId[]` (массивы FK)

| Entity | Поле | Тип связи | Проблема | Решение |
|--------|------|-----------|----------|---------|
| `Worker` | `workTypeIds[]` | M2M → WorkType | Нет дат получения квалификации | **Создать `WorkerWorkType { id, workerId, workTypeId, certifiedAt, grade, expiresAt }`** |
| `Product` | `productModuleIds[]` | M2M → ProductModule | Нет sortOrder, qty per product | **Создать `ProductModuleAssignment { id, productId, moduleId, sortOrder, quantity }`** |
| `OrderTask` | `dependsOnTaskIds[]` | self-ref M2M | Нет типа связи (FS/FG/SS) | **Создать `TaskDependency { id, fromTaskId, toTaskId, dependencyType }`** |
| `Certificate` | `productIds[]` | M2M → Product | Нет дат привязки | **Создать `CertificateProduct { id, certificateId, productId, attachedAt }`** |
| `Warehouse` | `roleIds[]` | M2M → Role | Не RBAC! Это список ролей, имеющих доступ к складу | **Создать `WarehouseAccess { id, warehouseId, roleId, permission }`** |
| `Organization` | `counterpartyRoleIds[]` | M2M → CounterpartyRole | (это нормально) | **Оставить** — это tag-like связь. |
| `Product` | `photoIds[]` | M2M → Photos | (норм) | **Оставить** — фото в `Photos` уже отдельная entity. |
| `User` | `permissions[]` (string[]) | inline enum | Нельзя централизованно редактировать | **Создать `UserPermissionOverride { id, userId, permissionKey, allowed }`** или заменить на `roleId` + `Role.permissions[]` (уже есть). |
| `Role` | `permissions[]` (string[]) | inline enum | То же | **Оставить** — для ролей это OK, каталог `Permissions` уже есть. |
| `Role` | `sectionIds[]` (string[]) | inline enum | (норм, FK к UI sections) | **Оставить**. |

**Рекомендация:** для 6 критичных M2M (Worker, Product, OrderTask, Certificate, Warehouse, UserPermission) — вынести в join-entity. Остальные 4 — оставить как есть.

### 2.2. Полиморфные ссылки (generic FK)

| Entity | Поле | Ссылается на | Решение |
|--------|------|--------------|---------|
| `PurchaseRequest` | `entityType + entityId` + кэши `entityName/Sku/Unit` | Material / Product / ??? | **Оставить полиморфизм**, но удалить кэши (они derivable) |
| `InventoryMovement` | `entityType + entityId` + кэши | Material / Product | **Сузить до `productId`/`materialId` + `entityType: enum`** |
| `OrderHistory` | `orderId` (только Order) | Order | **Сузить** или вынести в `AuditLog` (см. §4) |
| `UserActivity` | `entity + entityId` (любая) | string | **Вынести в `AuditLog` с `entityType + entityId`** |
| `OrderTask` | `componentId` + `componentName` | ??? | **Удалить** (см. §1.3.B) |
| `Tender` | `companyId` | ??? | **Сузить до `organizationId`** |
| `Tender` | `customerOrgId + customerName` | Counterparty / Organization | **Оставить** `customerOrgId`, удалить `customerName` (derivable) |

---

## 3. 🗑 Избыточные поля (3NF / BCNF)

### 3.1. Подтверждённые дубли (30 пар, в т.ч. новые)

| Entity | Поле A | Поле B | Канон | Обоснование |
|--------|--------|--------|-------|-------------|
| `User` | `passwordHash` | `password` | **`passwordHash`** (дропнуть `password`) | Plaintext нельзя хранить; явный security bug |
| `User` | `role` (string/array) | `permissions` (string[]) | **`roleId`** (FK к Role, добавить) | `role` не нормализован; `permissions` перенести в Role.permissions |
| `Material` | `category` (string) | `categoryId` (ObjectId) | **`categoryId`** (дропнуть `category`) | Legacy + FK |
| `Material` | `price` | `pricePerUnit` | **`pricePerUnit`** (дропнуть `price`) | Дубль, `pricePerUnit` точнее (включает unit) |
| `Product` | `cost` | `costPrice` | **`costPrice`** (дропнуть `cost`) | Legacy |
| `Product` | `weight` | `weightKg` | **`weightKg`** (дропнуть `weight`) | Дубль, `weightKg` точнее |
| `Product` | `listPrice` | `basePrice` | **ОБА оставить, развести** | `listPrice` = прайс для клиента; `basePrice` = базовая (до наценки). Разная семантика. **Однако** проверить — возможно, дубль |
| `Product` | `photos` (string[]) | `photoIds` (ObjectId[]) | **`photoIds`** (дропнуть `photos`) | URLs = legacy |
| `Product` | `productType` (string) | `kind` (string) | **`kind`** (дропнуть `productType`) | Legacy; `kind` точнее (good/service) |
| `ProductionOrder` | `plannedStart` | `plannedStartDate` | **`plannedStartAt`** (дропнуть оба, добавить `*At`!) | Дубль + неконсистентный суффикс |
| `ProductionOrder` | `plannedEnd` | `plannedEndDate` | **`plannedEndAt`** | То же |
| `ProductionOrder` | `productName` | `productSku` | **УДАЛИТЬ ОБА** (derivable через productId) | Кэш, нормализация требует дропнуть |
| `OrderTask` | `orderId` | `productionOrderId` | **`productionOrderId`** (дропнуть `orderId`) | Дубль FK под двумя именами |
| `OrderTask` | `estimatedHours` | `plannedHours` | **`estimatedHours`** (дропнуть `plannedHours`) | Дубль |
| `OrderTask` | `workTypeId` | `workTypeName` | **ДРОПНУТЬ `workTypeName`** (derivable) | Кэш |
| `OrderTask` | `componentName` | — | **ДРОПНУТЬ `componentName`** (см. §1.3.B) | Кэш |
| `OrderTask` | `actualStartDate` | `actualEndDate` | **Оставить, переименовать в `actualStartAt`/`actualEndAt`** | Не дубли, но неконсистентный суффикс |
| `OrderClosing` | `amount` | `totalAmount` | **`totalAmount`** (дропнуть `amount`) | Дубль |
| `Certificate` | `issuedBy` | `issuer` | **`issuer`** (дропнуть `issuedBy`) | Дубль |
| `Certificate` | `expiryDate` | `expiresAt` | **`expiresAt`** (дропнуть `expiryDate`) | Дубль + конвенция `*At` |
| `Certificate` | `notes` | `title` | **`title`** (дропнуть `notes` — derivable?) | Если title обязателен, а notes нет — дроп notes |
| `Contract` | `customerId` | `clientId` | **`counterpartyId`** (унифицировать + переименовать!) | Дубль + непонятное имя |
| `DocumentTemplate` | `docType` | `docTypeId` | **`docTypeId`** (дропнуть `docType`) | Дубль |
| `DocumentTemplate` | `backgroundImage` | `backgroundImages` | **`backgroundImages: string[]`** (дропнуть `backgroundImage`) | Дубль, оставить array |
| `PurchaseRequest` | `statusId` | `status` | **`statusId`** (дропнуть `status`) | Дубль |
| `Shipment` | `statusId` | `status` | **`statusId`** (дропнуть `status`) | Дубль |
| `StatusWorkflow` | `entityType` | `entity` | **`entityType`** (дропнуть `entity`) | Дубль |
| `SupplierOrder` | `supplierOrgId` | `supplierId` | **`supplierId`** (дропнуть `supplierOrgId`) | Дубль |
| `SupplierOrder` | `expectedDate` | `deliveryDate` | **`deliveryDate`** (дропнуть `expectedDate`) | Дубль |
| `Tender` | `statusId` | `status` | **`statusId`** (дропнуть `status`) | Дубль |
| `Tender` | `attachments` | `documents` | **`documents`** (дропнуть `attachments`) | Дубль |
| `Tender` | `subject` | `productName` | **`subject`** (дропнуть `productName` — derivable если есть items) | Кэш |
| `Counterparty` | `checkingAccount` | `Organization.bankAccount` | **`bankAccount`** (унифицировать + вынести в `BankDetail`) | Кросс-entity дубль |
| `ReconciliationAct` | `ourDebt` + `theirDebt` | `balance` | **ДРОПНУТЬ `balance`** | `balance = ourDebt - theirDebt` (вычисляемое) |
| `ReconciliationAct` | `organizationName` | — | **ДРОПНУТЬ** (derivable через organizationId) | Кэш |
| `FinancialReport` | `netProfit` | `totalIncome` + `totalExpense` | **ДРОПНУТЬ `netProfit`** | `netProfit = totalIncome - totalExpense` (вычисляемое) |
| `CostCalculation` | `totalCost` | `totalMaterialCost + totalLaborCost + overheadCost` | **ДРОПНУТЬ `totalCost`** (или наоборот — дропнуть компоненты и оставить только total) | Вычисляемое (или агрегат — зависит от use case) |
| `InventoryItem` | `entityName` / `entitySku` / `entityUnit` | `entityId` | **ДРОПНУТЬ ВСЕ КЭШИ** (derivable) | Кэш |
| `ProductPassport` | `name` / `category` / `article` | `productId` | **ДРОПНУТЬ ВСЕ КЭШИ** (derivable через productId) | Кэш |
| `InventorFile` | `productName` / `productSku` | `productId` | **ДРОПНУТЬ КЭШИ** | Кэш |
| `Rpp` | `productName` / `productSku` | `productId` | **ДРОПНУТЬ КЭШИ** | Кэш |
| `ProductionOrder` | `productName` / `productSku` | `productId` | **ДРОПНУТЬ КЭШИ** | Кэш |
| `CartItem` | `priceSnapshot` | `productId.pricePerUnit` | **ОСТАВИТЬ `priceSnapshot`** (snapshot цены на момент добавления — это правильно для cart) | OK, не дубль |

### 3.2. Избыточные поля внутри одной entity (финальная рекомендация)

| Категория | Поля | Рекомендация |
|-----------|------|--------------|
| `Product` price cluster | `listPrice`, `basePrice`, `costPrice`, `defaultMarkupPercent` | **Вынести в `ProductPricing` (новая entity):** `{ productId, listPrice, basePrice, costPrice, markupPercent, validFrom, validTo }`. Историчность цен. |
| `Product` dimensions | `height/length/width/weight` vs `dimensions: object` | **Оставить `dimensions: object`** (структурированно), дропнуть `height/length/width/weight` как top-level. |
| `Product` materials | `material` (string) vs `materials` (array) | **Дропнуть `materials: array`**, оставить `material: string` (краткое описание) ИЛИ вынести в `ProductMaterial` join. |
| `Tender` price cluster | `startPrice`, `ourPrice`, `totalAmount` | **Оставить** (разная семантика: стартовая НМЦ, наше предложение, итог). |
| `ReconciliationAct` balance | `ourDebt + theirDebt + balance` | **Дропнуть `balance`** (вычисляемое). |
| `FinancialReport` P&L | `totalIncome + totalExpense + netProfit` | **Дропнуть `netProfit`** (вычисляемое). |

### 3.3. Новые избыточности (НЕ в `data-model.md`)

| # | Проблема | Severity | Решение |
|---|----------|----------|---------|
| 1 | `ProductionOrder` хранит и `productId`, И `productName`+`productSku` кэши | High | Дропнуть кэши — derivable. Если нужна денормализация для производительности — вынести в `ProductionOrderSnapshot` |
| 2 | `OrderTask` хранит `workTypeId` И `workTypeName`, `componentId` И `componentName` | High | Дропнуть name-кэши |
| 3 | `InventoryItem` хранит 3 кэша (`entityName/Sku/Unit`) | Medium | Дропнуть — derivable через `entityId` |
| 4 | `ProductPassport` хранит 3 кэша (`name/category/article`) | Medium | Дропнуть — derivable через `productId` |
| 5 | `Contract.customerId + clientId` — оба `ObjectId` | High | Унифицировать в `counterpartyId` (одно поле) |
| 6 | `DocumentTemplate.docType (string) + docTypeId (ObjectId)` | High | Оставить только `docTypeId` (FK) |
| 7 | `Tender.attachments (array) + documents (array)` | Medium | Оставить только `documents: array<{ url, type, name }>` (структурированно) |

---

## 4. ➕ Недостающие поля и паттерны

### 4.1. Отсутствующие PK `id` (20 entity)

⚠️ **Расхождение с `data-model.md`:** data-model.md говорит 11, реально в доменной модели — **20**. Причина: data-model.md таблица проверяла не все entity, а только те, что упомянуты в "Дубликаты и аномалии".

| Entity | Действие |
|--------|----------|
| `Bom` | + `id: ObjectId` |
| `CostCalculation` | + `id: ObjectId` |
| `DocTypeDef` | удалить (мердж в DocType) |
| `DocumentTableType` | + `id: ObjectId` |
| `EntityAttributeValue` | + `id: ObjectId` |
| `Invoice` | удалить (мердж в IncomingInvoice) |
| `Photos` | + `id: ObjectId` |
| `Quotation` | удалить (мердж в Proposal) |
| `ShippingDoc` | + `id: ObjectId` |
| `TechProcess` | + `id: ObjectId` |
| `WorkOrderOperation` | + `id: ObjectId` |
| `AttributeDefinition` | + `id: ObjectId` (проверить, может есть) |
| `ComplianceRule` | + `id: ObjectId` |
| `ProductPassport` | + `id: ObjectId` |
| `WorkOrder` | + `id: ObjectId` |
| `StockMovement` | + `id: ObjectId` |
| `EntityStatus` | + `id: ObjectId` |
| `Setting` | + `id: ObjectId` |
| `Client` | удалить (мердж в Counterparty) |
| `Order` | + `id: ObjectId` |

### 4.2. Отсутствующие `createdAt`/`updatedAt` (12 entity)

| Entity | Действие |
|--------|----------|
| `Client` | удалить |
| `DocTypeDef` | удалить |
| `CommercialProposal` | удалить |
| `Invoice` | удалить |
| `Order` | + `createdAt`, `updatedAt`, `id` |
| `CounterpartyRole` | + `createdAt`, `updatedAt` |
| `Permissions` | + `createdAt`, `updatedAt` |
| `Roles` | удалить |
| `Employees` | удалить |
| `Photos` | + `createdAt`, `updatedAt` |
| `ImportJobs` | + `createdAt` (есть?) |
| `Modules` | удалить |

### 4.3. Отсутствующий `createdBy` (audit) — частично

| Сейчас есть | Сейчас НЕТ |
|-------------|-----------|
| `OrderHistory.userId`, `UserActivity.userId`, `ActualCost.createdBy`, `PurchaseRequest.createdBy`, `Interaction.createdBy`, `ImportJobs.createdByUserId`, `WorkOrderOperation.completedBy` | **Все остальные entity** |

**Рекомендация:** ввести стандарт `createdBy` для всех entity (audit). **Также** добавить `updatedBy` (никого нет сейчас).

### 4.4. Отсутствующий `version` (optimistic locking)

| Сейчас есть | Сейчас НЕТ (но нужен) |
|-------------|----------------------|
| `DocumentTemplate.version` | `Proposal`, `Quotation`, `Contract`, `ProductionOrder`, `InventoryItem` — все сущности, которые редактируются параллельно |

**Рекомендация:** ввести `version: number` для всех редактируемых entity. **Особенно критично** для КП, договоров, складских остатков (race conditions).

### 4.5. Multi-currency (currency) — неполное покрытие

| Сейчас есть `currency` | Сейчас НЕТ (но цена в `total` есть) |
|------------------------|--------------------------------------|
| `Material.priceCurrency` | `Product.listPrice/basePrice/costPrice`, `Proposal.markupPercent` (нет price), `Contract.totalAmount`, `Quotation.total`, `Order.total`, `PurchaseRequest.totalAmount`, `Tender.startPrice/ourPrice/totalAmount` |

**Рекомендация:** для российского ERP (single currency RUB) — опционально. Если международное — обязательно добавить `currency: string` (ISO 4217) ко всем monetary полям.

### 4.6. FSM (`status: string` vs `statusId: ObjectId`)

`EntityStatus` и `StatusWorkflow` определены, но используются inconsistently:

| Entity | Текущее | Рекомендация |
|--------|---------|--------------|
| `Proposal` | `status: string` | → `statusId: ObjectId` |
| `Quotation` | `statusId: ObjectId` ✓ | OK |
| `Contract` | `status: string` | → `statusId: ObjectId` |
| `PurchaseRequest` | `statusId + status` (ДУБЛЬ!) | унифицировать на `statusId` |
| `Tender` | `statusId + status` (ДУБЛЬ!) | унифицировать на `statusId` |
| `Order` | `statusId: ObjectId` ✓ | OK |
| `Shipment` | `statusId + status` (ДУБЛЬ!) | унифицировать на `statusId` |
| `OrderClosing` | `status: string` | → `statusId` |
| `Rpp` | `status: string` | → `statusId` |
| `RppEntry` | `status: string` | → `statusId` |
| `ActualCost` | нет | добавить `statusId` (draft/approved/paid) |
| `InventoryMovement` | нет | добавить `statusId` (planned/executed/cancelled) |
| `FinancialReport` | `status: string` | → `statusId` |
| `ReconciliationAct` | `status: string` | → `statusId` |

**Severity: High** — без консистентной FSM нельзя построить workflow-валидацию.

### 4.7. Отсутствующий общий AuditLog

Три разных audit-entity:

| Entity | Семантика | Решение |
|--------|-----------|---------|
| `OrderHistory` | история конкретного заказа | мердж в `AuditLog` |
| `UserActivity` | действия пользователя по любой entity | мердж в `AuditLog` |
| `Comment` | обсуждение (НЕ аудит) | **ОТДЕЛЬНО** — у `Comment` другая семантика (package-tag, isArchived) |

**Предложение:** `AuditLog { id, entityType, entityId, action, actorId, actorName, payload: object, ipAddress, userAgent, createdAt }` — единый лог для всех мутаций.

### 4.8. Multi-tenancy (`tenantId` / `organizationId`)

Сейчас:
- `User` — нет `tenantId` (multi-tenant не поддержан)
- `DocumentTemplate.organizationId` — есть
- Все остальные entity — НЕ привязаны к tenant

**Вопрос к PO:** планируется ли SaaS с multi-tenancy? Если да — нужно ввести `tenantId` повсеместно. Если on-premise — не нужно.

---

## 5. 📝 Naming Consistency

### 5.1. Boolean prefix — INCONSISTENT

| Сейчас | Правильно | Severity |
|--------|-----------|----------|
| `isActive`, `isSystem`, `isDefault`, `isInitial`, `isFinal`, `isArchived`, `isMain`, `enabledByDefault` | `is*` / `enabled*` ✓ | OK |
| `hasPassport`, `hasDrawing` | `has*` ✓ | OK |
| **`paid`** (Invoice) | `isPaid` ⚠️ | High — унифицировать |
| **`active`** (Employees) | `isActive` ⚠️ | High |
| **`fixedDimensions`** (Material) | `isFixedDimensions` ⚠️ | Medium |
| **`isPurchased`** (ModuleMaterial) | ✓ OK | OK |

**Рекомендация:** `paid` → `isPaid`, `active` → `isActive`, `fixedDimensions` → `isFixedDimensions`.

### 5.2. Date suffix — INCONSISTENT

Конвенция: `*At` (createdAt, updatedAt, deletedAt, lastLoginAt, startedAt, completedAt, etc.).

| Сейчас без `*At` | Где | Severity |
|-------------------|-----|----------|
| `signDate` | `ReconciliationAct` | Medium → `signedAt` |
| `date` | `PurchaseRequest`, `InventoryMovement` (`date`?), `OrderClosing`, `FinancialReport`, `Tender` | High → `*At` или конкретное (`requestedAt`, `orderDate`, etc.) |
| `plannedStart` / `plannedEnd` | `ProductionOrder` | High → `plannedStartAt` / `plannedEndAt` |
| `actualStart` / `actualEnd` | `ProductionOrder` | High → `actualStartAt` / `actualEndAt` |
| `validUntil` | `Proposal`, `Quotation` | OK (validUntil — устоявшийся термин) |
| `startDate` / `endDate` | `WorkOrder` | Medium → `startAt` / `endAt` |
| `expiryDate` | `Certificate`, `Rpp` | High → `expiresAt` |
| `issueDate` | `Certificate` | Medium → `issuedAt` |
| `registrationDate` | `Organization`, `Rpp` | Medium → `registeredAt` |
| `publishDate` | `Tender` | Medium → `publishedAt` |
| `submissionDeadline` | `Tender` | OK (`Deadline` часть имени) |
| `resultDate` | `Tender` | Medium → `resultAt` |
| `calculatedAt` | `CostCalculation` | ✓ OK |
| `generatedAt` | `FinancialReport` | ✓ OK |

**Рекомендация:** все Date-поля должны иметь `*At` суффикс (кроме `validUntil`, `submissionDeadline` — устоявшиеся).

### 5.3. `number` vs `qty` vs `quantity` — INCONSISTENT

| Поле | Где | Severity |
|------|-----|----------|
| `quantity` | 12 entity ✓ | OK |
| **`qty`** | `WorkOrder`, `StockMovement` | High → `quantity` |

### 5.4. `total` vs `totalAmount` — INCONSISTENT

| Поле | Где | Severity |
|------|-----|----------|
| `totalAmount` | `Contract`, `CommercialProposal`, `OrderClosing`, `PurchaseRequest`, `ReconciliationAct`, `ShippingDoc`, `Tender` | OK (большинство) |
| `total` | `Quotation`, `Order`, `PurchaseOrder` | Medium → `totalAmount` |
| **`amount`** | `OrderClosing`, `ActualCost`, `Invoice` | High → `totalAmount` или специфичное (`actualAmount`, `invoiceAmount`) |

**Рекомендация:** единое `totalAmount` для итогов; `amount` — только для специфичных (ActualCost.amount = конкретная сумма затрат, не total).

### 5.5. `bankAccount` vs `checkingAccount` — ДУБЛЬ между entity

| Поле | Где |
|------|-----|
| `bankAccount` | `Organization` |
| `checkingAccount` | `Counterparty` |

**Рекомендация:** унифицировать `bankAccount` + вынести всю банковскую инфу в `BankDetail` (см. §1.2 #17).

### 5.6. Currency code naming

- `priceCurrency` (Material) — есть
- `currency` (если будет) — предпочтительнее (короче, консистентно)

### 5.7. ID/Ref field naming

- `documentRef` (InventoryMovement, StockMovement) — строковая ссылка, ОК
- `sourceRef` (ActualCost) — строковая ссылка, ОК
- `tenderId` (Tender) — внешний ID, ОК (отличается от `id` внутреннего)
- `registryNumber` (Rpp) — внешний номер, ОК

**Рекомендация:** ввести convention:
- `id` — внутренний PK
- `*Id` — FK к другой entity
- `externalId` / `externalRef` / `*Number` — внешние идентификаторы

---

## 6. 🗂 Рекомендуемые индексы (MongoDB)

### 6.1. Single-field индексы на FK (критично для join-производительности)

```javascript
// Counter
db.counter.createIndex({ entity: 1, year: 1 }, { unique: true });

// Все entity с FK — индекс на FK поле
db.user.createIndex({ role: 1 });
db.organization.createIndex({ counterpartyRoleIds: 1 });
db.person.createIndex({ lastName: 1, firstName: 1 });
db.material.createIndex({ categoryId: 1, supplierId: 1 });
db.product.createIndex({ categoryId: 1, status: 1 });
db.product.createIndex({ sku: 1 }, { unique: true });
db.productcomponent.createIndex({ productId: 1, sortOrder: 1 });
db.productmodule.createIndex({ productId: 1, sortOrder: 1 });
db.cartitem.createIndex({ sessionId: 1, productId: 1 });
db.proposal.createIndex({ counterpartyId: 1, status: 1 });
db.proposalitem.createIndex({ proposalId: 1, sortOrder: 1 });
db.quotation.createIndex({ counterpartyId: 1, statusId: 1 });
db.contract.createIndex({ counterpartyId: 1, status: 1 });
db.contractitem.createIndex({ contractId: 1, sortOrder: 1 });
db.worktype.createIndex({ workCenterId: 1, isActive: 1 });
db.worker.createIndex({ workTypeIds: 1 });
db.productionorder.createIndex({ counterpartyId: 1, status: 1 });
db.productionorder.createIndex({ plannedStartAt: 1 });
db.ordertask.createIndex({ productionOrderId: 1, sortOrder: 1 });
db.ordertask.createIndex({ dependsOnTaskIds: 1 });
db.warehouse.createIndex({ isActive: 1 });
db.storageitem.createIndex({ warehouseId: 1, productId: 1 }, { unique: true });
db.stockmovement.createIndex({ productId: 1, warehouseId: 1, type: 1 });
db.stockmovement.createIndex({ createdAt: -1 });
db.purchaserequest.createIndex({ orderId: 1, statusId: 1 });
db.purchaserequestitem.createIndex({ requestId: 1 });
db.purchaseorder.createIndex({ supplierId: 1, statusId: 1 });
db.incominginvoice.createIndex({ supplierId: 1, status: 1 });
db.shipment.createIndex({ orderId: 1, statusId: 1 });
db.orderclosing.createIndex({ productionOrderId: 1 });
db.reconciliationact.createIndex({ organizationId: 1, periodStart: -1 });
db.tender.createIndex({ statusId: 1, submissionDeadline: 1 });
db.rpp.createIndex({ productId: 1, status: 1 });
db.certificate.createIndex({ productIds: 1, expiresAt: 1 });
db.documenttemplate.createIndex({ docTypeId: 1, isDefault: 1 });
db.templateblock.createIndex({ templateId: 1, order: 1 });
db.statusworkflow.createIndex({ entityType: 1, isActive: 1 });
db.attributedefinition.createIndex({ entityType: 1, categoryId: 1 });
db.entityattributevalue.createIndex({ entityType: 1, entityId: 1, attributeId: 1 }, { unique: true });
db.orderhistory.createIndex({ orderId: 1, createdAt: -1 });
db.useractivity.createIndex({ userId: 1, createdAt: -1 });
db.comment.createIndex({ packageTag: 1, isArchived: 1 });
```

### 6.2. Text-индексы для поиска

```javascript
db.product.createIndex({ name: 'text', sku: 'text', description: 'text' });
db.material.createIndex({ name: 'text', article: 'text', sku: 'text' });
db.counterparty.createIndex({ name: 'text', inn: 'text' });
db.person.createIndex({ lastName: 'text', firstName: 'text', phone: 'text' });
db.user.createIndex({ username: 'text', email: 'text' });
db.organization.createIndex({ name: 'text', inn: 'text' });
```

### 6.3. Compound-индексы для частых паттернов

```javascript
// КП: "покажи все активные КП этого клиента за последний месяц"
db.proposal.createIndex({ counterpartyId: 1, status: 1, createdAt: -1 });

// Склад: "остатки по продукту X на всех складах"
db.storageitem.createIndex({ productId: 1, warehouseId: 1 });

// Production: "заказы в работе по цеху X"
db.productionorder.createIndex({ workCenterId: 1, status: 1, plannedStartAt: 1 });

// Audit: "все действия пользователя за день"
db.useraction.createIndex({ actorId: 1, createdAt: -1 });
```

---

## 7. 🎯 Target Data Model (consolidated)

### 7.1. Entity для удаления (15)

| Удалить | Причина |
|---------|---------|
| `DocTypeDef` | дубль DocType |
| `Quotation` | дубль Proposal → переименовать Proposal в Quotation |
| `CommercialProposal` | дубль Proposal |
| `RppEntry` | дубль Rpp |
| `SupplierOrder` | дубль PurchaseOrder |
| `Invoice` | дубль IncomingInvoice → переименовать |
| `Roles` | дубль Role |
| `Employees` | дубль Worker |
| `Operation` | дубль WorkType |
| `Modules` | дубль ProductModule |
| `MaterialCategory` | дубль Category |
| `ProductCategory` | дубль Category |
| `Client` | дубль Counterparty (тип legalForm='IE') |
| `InventoryItem` | view (не хранится) |
| `OrderHistory` + `UserActivity` | объединить в `AuditLog` |

### 7.2. Entity для переименования (2)

| Было | Стало | Причина |
|------|-------|---------|
| `Proposal` | `Quotation` | каноническое имя (используется в Order FK: `quotationId`) |
| `IncomingInvoice` | `Invoice` | каноническое имя (Invoice уже существовал, но неполный — переименование упрощает) |

### 7.3. Новые Entity (5-7)

| Новая | Назначение |
|-------|------------|
| `WorkerWorkType` | M2M Worker↔WorkType с атрибутами (certifiedAt, grade, expiresAt) |
| `ProductModuleAssignment` | M2M Product↔ProductModule с sortOrder, quantity |
| `TaskDependency` | self-ref M2M OrderTask с dependencyType |
| `CertificateProduct` | M2M Certificate↔Product с attachedAt |
| `WarehouseAccess` | M2M Warehouse↔Role с permission scope |
| **`AuditLog`** | унифицированный лог мутаций (entityType, entityId, action, actorId, payload) |
| `BankDetail` | общие банковские реквизиты для Organization + Counterparty |
| `ProductPricing` (опц.) | историчность цен (вынести из Product) |

### 7.4. Финальный target (62-67 entity)

| Домен | Было | Стало | Δ | Изменения |
|-------|------|-------|---|-----------|
| Identity & Access | 7 | 6 | -1 | -Roles |
| People & Contacts | 8 | 6 | -2 | -Client, -Employees (идёт в Worker) |
| Organizations | 3 | 3 | 0 | +BankDetail (опц.) |
| Products & Materials | 18 | 15 | -3 | -MaterialCategory, -ProductCategory (в Category), -Modules (в ProductModule), +ProductPricing (опц.) |
| Production | 11 | 10 | -1 | -Operation, +TaskDependency |
| Sales & Commerce | 11 | 8 | -3 | -Quotation, -CommercialProposal, -ShippingDoc → отдельный? см. ниже |
| Warehouse & Inventory | 6 | 6 | 0 | -InventoryItem (view), +WarehouseAccess, -OrderHistory (в AuditLog) |
| Procurement | 10 | 8 | -2 | -SupplierOrder, -Invoice, +CertificateProduct (опц.) |
| Documents & Templates | 6 | 5 | -1 | -DocTypeDef |
| Finance | 3 | 3 | 0 | (без изменений) |
| System & Activity | 6 | 4 | -2 | -UserActivity (в AuditLog), -OrderHistory (в AuditLog) |
| **Total** | **89** | **~74** | **-15** | +5-7 новых → **~62-67 entity** |

⚠️ **Shipment и ShippingDoc** — обсудить с PO:
- `Shipment` = отгрузка (главная entity)
- `ShippingDoc` = документ отгрузки (ТТН, ТОРГ-12) — это sub-entity к Shipment
- Решение: оставить обе или слить `ShippingDoc` в `Shipment` как `documents: [{type, url, signatures, pdfUrl}]` array.

### 7.5. Визуальная карта target (ASCII)

```
                    ┌─ User ─┬─ Role
                    │        └─ UserPermissionOverride (new)
                    └─ Permissions
                                    
   ┌─ LegalEntity (new) ─┬─ Organization
   │                     ├─ Counterparty
   │                     └─ BankDetail (new)
   │
   ├─ Person ──┬─ Counterparty.contactPerson
   │           └─ OrgContact (Organization ↔ Person)
   │
   └─ Worker ─┬─ WorkerWorkType (new) → WorkType
              └─ User (если работник = пользователь)

   ┌─ ProductCategory (→Category) ──┐
   │                                 ├─ Product ─┬─ ProductModule (new) ─ ProductModuleAssignment
   │                                 │            ├─ BomComponent (new) → ProductComponent
   │                                 │            ├─ ProductPricing (opt)
   │                                 │            ├─ CertificateProduct (new) ← Certificate
   │                                 │            └─ ProductPhoto → Photos (new id, timestamps)
   │                                 │
   │                                 └─ Material
   │                                     └─ MaterialCategory (→Category)
   │
   └─ Category (universal)

   ┌─ WorkType ─── Operation (DELETE)
   ├─ WorkCenter
   └─ Worker (← Employees)

   ┌─ Quotation (← Proposal, Quotation, CommercialProposal) ─┬─ QuotationItem
   ├─ Contract ────────────────────────────────────────────┴─ ContractItem
   ├─ Order (id) ─────────────────────────────────────────┬─ OrderItem (new?)
   │                                                      └─ Reservation
   └─ CartItem, CartSession

   ┌─ ProductionOrder ─┬─ OrderTask ──── TaskDependency (new)
   │                   ├─ WorkOrder ──── WorkOrderOperation
   │                   ├─ ActualCost
   │                   └─ OrderClosing
   │
   └─ Bom (id) ────── BomComponent (new)

   ┌─ Warehouse ── WarehouseAccess (new) ──── Role
   ├─ StorageItem (id)
   ├─ StockMovement (← InventoryMovement)
   └─ Reservation

   ┌─ PurchaseRequest ─┬─ PurchaseRequestItem
   ├─ PurchaseOrder (← SupplierOrder) ─┬─ PurchaseOrderItem
   ├─ Invoice (← IncomingInvoice)
   ├─ Tender
   └─ Rpp (← RppEntry)

   ┌─ DocType (← DocTypeDef)
   ├─ DocumentTemplate ──── TemplateBlock
   └─ TableTemplate, DocumentTableType (id)

   ┌─ ReconciliationAct
   ├─ FinancialReport
   └─ Setting

   ┌─ AuditLog (new, ← OrderHistory + UserActivity)
   ├─ EntityStatus
   ├─ StatusWorkflow
   ├─ FeatureFlag, RateLimitEntry
   ├─ Comment (отдельно, не в AuditLog)
   ├─ ImportJobs
   └─ Counter (для нумерации)
```

---

## 8. 📋 Migration Plan (приоритеты)

### 8.0. ⛔ BLOCKER: Решения ДО старта Priority 1

| # | Вопрос | Почему blocker | Подробнее |
|---|--------|----------------|-----------|
| **B1** | **Стек БД: MongoDB или SQL?** | Меняет §2 (M2M-стратегия), §6 (индексы), §7 (target model). | Top note (⚠️ «Допущения по стеку»), §10 #10 |
| **B2** | **Multi-tenancy: SaaS или on-premise?** | Если SaaS — нужен `tenantId` повсеместно ДО мерджа. Добавлять после консолидации = ×2 работы. | §4.8, §10 #3 |
| **B3** | **Домен/язык: ru-only или i18n?** | Если i18n — нужны i18n-поля для `name`, `label`, `description` (100+ полей). | §10 (новый) |

**Если B1=SQL** — пропустить §6 (MongoDB индексы), переписать §2 (все M2M — join-таблицы), пересмотреть §7.3 (новые entity не нужны, т.к. массивы FK исчезают).

**Если B2=SaaS** — добавить `tenantId: ObjectId` в каждую entity (Priority 1.0, до всех мерджей). Compound-индексы в §6 должны начинаться с `{tenantId: 1, ...}`.

### 8.1. Priority 1 — Блокеры MVP (до старта разработки)

| # | Действие | Effort | Владелец |
|---|----------|--------|----------|
| 1.1 | Унифицировать КП: `Quotation` ← `Proposal` + `CommercialProposal` | M (data migration) | BE |
| 1.2 | Унифицировать договоры: `Contract` (clean) | S | BE |
| 1.3 | Унифицировать `Role` ← `Roles` | S | BE |
| 1.4 | Унифицировать `Worker` ← `Employees` | M (split name → firstName/lastName) | BE + manual review |
| 1.5 | Унифицировать `WorkType` ← `Operation` | S | BE |
| 1.6 | Унифицировать `PurchaseOrder` ← `SupplierOrder` | S | BE |
| 1.7 | Унифицировать `Invoice` ← `IncomingInvoice` (rename) | S | BE |
| 1.8 | Унифицировать `Rpp` ← `RppEntry` | S | BE |
| 1.9 | Унифицировать `Category` ← `MaterialCategory` + `ProductCategory` | M | BE |
| 1.10 | Унифицировать `ProductModule` ← `Modules` | S | BE |
| 1.11 | Унифицировать `DocType` ← `DocTypeDef` | S | BE |
| 1.12 | **Добавить `id` PK** в 7 entity: `Bom`, `CostCalculation`, `DocumentTableType`, `EntityAttributeValue`, `Photos`, `TechProcess`, `WorkOrderOperation`, `AttributeDefinition`, `ComplianceRule`, `ProductPassport`, `WorkOrder`, `StockMovement`, `EntityStatus`, `Setting`, `Order` | M (миграция данных) | BE |
| 1.13 | **Удалить дубль `Client`** (миграция в Counterparty с legalForm='IE') | M | BE + manual review |
| 1.14 | **Удалить кэш-поля** (Product.productName, OrderTask.workTypeName, и т.д. — 30+ полей) | M | BE |
| 1.15 | **Дропнуть дубли полей** (password, weight, expiryDate, status, и т.д.) | M | BE |

### 8.2. Priority 2 — До первого release (после MVP)

| # | Действие | Effort | Владелец |
|---|----------|--------|----------|
| 2.1 | Ввести `statusId` (FK → EntityStatus) во ВСЕ entity со status | L (touch 14 entity) | BE |
| 2.2 | Ввести `createdBy` + `updatedBy` (FK → User) для audit | M (touch 50+ entity) | BE |
| 2.3 | Ввести `version: number` (optimistic locking) для редактируемых entity | M | BE |
| 2.4 | Унифицировать naming: `*At` для всех Date, `is*` для boolean, `quantity` (не `qty`), `totalAmount` (не `total`/`amount`) | L | BE |
| 2.5 | Создать `BankDetail` (вынести банковские поля из Organization + Counterparty) | M | BE |
| 2.6 | Создать `WorkerWorkType`, `ProductModuleAssignment`, `TaskDependency`, `CertificateProduct`, `WarehouseAccess` (M2M с атрибутами) | L | BE |
| 2.7 | Создать `AuditLog` (объединить OrderHistory + UserActivity) | M | BE |
| 2.8 | Создать индексы (см. §6) | S | DBA |
| 2.9 | Решить вопрос `Organization` ↔ `Counterparty` (вынести общие поля в `LegalEntity`?) | M | Архитектор |
| 2.10 | Унифицировать `Counterparty.counterpartyRoleIds` (M2M) + `OrgRole` (для Organization) | S | BE |
| 2.11 | Удалить `InventoryItem` (сделать view поверх `StorageItem`) | S | BE |

### 8.3. Priority 3 — Tech debt (когда будет время)

| # | Действие | Effort |
|---|----------|--------|
| 3.1 | Создать `ProductPricing` (вынести ценовые поля из Product + историчность) | L |
| 3.2 | Решить по `Shipment` vs `ShippingDoc` (объединить или оставить) | S |
| 3.3 | Multi-tenancy (`tenantId`)? Решение PO | XL |
| 3.4 | Multi-currency (`currency`)? Решение PO | M (touch 10+ entity) |
| 3.5 | EAV ревизия (`AttributeDefinition` + `EntityAttributeValue`) — может, заменить на JSONB? | M |
| 3.6 | Унифицировать `Warehouse.zoneNames: string[]` (должна быть `WarehouseZone` entity?) | S |
| 3.7 | Унифицировать `Contract.items: array` (должна быть `ContractItem`? УЖЕ ЕСТЬ!) — нужна миграция | M |

---

## 9. 📈 Итоговая статистика изменений

| Метрика | Было | Стало | Δ |
|---------|------|-------|---|
| Entity | 89 | ~65 | **-24 (-27%)** |
| Уникальных полей | 369 | ~280 | -89 (-24%) — после удаления дублей и кэшей |
| Дублей полей | ~30 | 0 | -30 |
| Entity без `id` | 20 | 0 | -20 |
| Entity без `createdAt/updatedAt` | 12 | 0 | -12 |
| Mixed `status: string` / `statusId` | 14 | 0 | -14 (все через EntityStatus) |
| Polymorphic FK без структуры | 6 | 0 | -6 (все через AuditLog или типизированные FK) |
| Новых entity (M2M, audit) | — | 7 | +7 |
| **Целевой размер модели** | **89** | **~65 entity, ~280 полей** | **-27%** |

---

## 10. ❓ Открытые вопросы (нужны ответы от PO / архитектора)

1. **Organization ↔ Counterparty** — это разные сущности или одна (с флагом `isOurCompany`)? Сейчас функционально разные, но поля на 80% совпадают.
2. **Client** — это физлицо или юрлицо? Если физлицо — мерджим в `Counterparty` с `legalForm='IE'`. Если юрлицо — кандидат на отдельную `CounterpartyType`.
3. **Multi-tenancy** — планируется SaaS? Если да, нужны `tenantId` повсеместно.
4. **Multi-currency** — международный учёт или только РФ? Если РФ, currency можно не добавлять.
5. **`Reservation`** — это реальная фича или часть `StockMovement`? Сейчас слишком бедная.
6. **`Shipment` vs `ShippingDoc`** — мерджить в одну entity с `documents: array` или оставить две?
7. **`InventoryItem`** — это view (агрегация по StorageItem) или хранилище? Если view — удалить как entity.
8. **`AttributeDefinition` + `EntityAttributeValue` (EAV)** — нужна ли такая гибкость, или можно заменить на JSONB-поле в каждой entity?
9. **`Counter` (счётчик нумерации)** — где он будет использоваться? Все документы с `number`?
10. **Audit log retention** — как долго хранить AuditLog? (GDPR / 152-ФЗ / бизнес-требования)

---

## Приложение A: Статистика от basher

```
=== Total unique field names: 369
=== Top-30 most common:
     65 - createdAt
     60 - updatedAt
     52 - id
     36 - isActive
     34 - name
     30 - notes
     24 - description
     22 - number
     20 - status
     15 - productId
     14 - sortOrder
     13 - title
     12 - quantity
     11 - type
     11 - date
     10 - unit
      9 - totalAmount / statusId / organizationId / orderId
      8 - entityType / deletedAt
=== Entities without 'id': 20 (Product, Tender, DocTypeDef, Client, ...)
=== Entities without 'createdAt': 12 (DocTypeDef, Client, CommercialProposal, ...)
=== Top FK density: Quotation (8), ProductionOrder (8), InventoryMovement (8)
=== ObjectId-полей: 132
=== Date-полей: 145
```

---

_Документ-аудит. Сгенерировано на основе docs/data-model.md + статистики. Следующий шаг: обсудить открытые вопросы (раздел 10) с PO/архитектором, затем — реализовать Priority 1._
