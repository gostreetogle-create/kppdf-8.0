# Data Model — kppdf-8.0

> Структурированное описание доменной модели проекта.
> **Реструктурировано:** 2026-07-04 (raw dump переработан в этот структурированный формат).

## Обзор

Проект представляет **ERP/производственную систему** для управления коммерческими предложениями (КП), договорами, заказами на производство, складом, закупками, документами и тендерами. Модель содержит **89 сущностей**, сгруппированных в **11 доменов**, с явным указанием типов полей, FK-связей и обнаруженных аномалий.

**Конвенции (применены ко всем таблицам ниже):**

- `id` → `ObjectId` (PK)
- `*Id` → `ObjectId` (FK)
- `*Ids` → `ObjectId[]` (multi-FK)
- `createdAt` / `updatedAt` / `deletedAt` / `*At` → `Date`
- `is*` → `boolean`
- Прочие типы указаны вручную (по контексту)
- ⚠️ = потенциальная проблема (см. секцию «Дубликаты и аномалии»)

## Политики

### Валюта — всегда RUB

Поле `priceCurrency` в `Material` (и любых других сущностях) **удалено**. В системе ровно одна валюта — российский рубль (₽, ISO-4217: RUB). Символ `₽` подставляется на уровне UI при форматировании цены. Если в будущем потребуется multi-currency, поле будет добавлено обратно с миграцией. На дату 2026-07-06 модуль `Currency` удалён из backend, seed `CurrenciesSeed` удалён, контроллер `/currencies` отключён.

## Карта по доменам

| #  | Домен                       | Кол-во | Ключевые сущности                              |
|----|------------------------------|--------|------------------------------------------------|
| 1  | Identity & Access            | 6      | `User`, `Role`, `Permissions`, `FeatureFlag`   |
| 2  | People & Contacts            | 7      | `Person`, `Client`, `Counterparty`, `Worker`   |
| 3  | Organizations                | 3      | `Organization`, `OrgRole`, `Category`           |
| 4  | Products & Materials         | 16     | `Product`, `Material`, `Bom`, `ProductModule`  |
| 5  | Production                   | 11     | `ProductionOrder`, `WorkType`, `WorkCenter`    |
| 6  | Sales & Commerce             | 9      | `Quotation`, `Contract`, `Order`   |
| 7  | Warehouse & Inventory        | 6      | `Warehouse`, `StorageItem`, `InventoryItem`     |
| 8  | Procurement                  | 9      | `PurchaseRequest`, `PurchaseOrder`, `Tender`   |
| 9  | Documents & Templates        | 6      | `DocumentTemplate`, `TemplateBlock`, `DocType` |
| 10 | Finance                      | 3      | `ReconciliationAct`, `FinancialReport`         |
| 11 | System & Activity            | 6      | `Setting`, `StatusWorkflow`, `ImportJobs`      |
| **Total** |                          | **89** |                                                |

---

## 1. Identity & Access (Идентификация и доступ)

Системные сущности для авторизации, ролей и контроля доступа.

### `Counter` (Счётчик нумерации)

**Атомарный счётчик для генерации номеров документов (КП, договоров, заказов).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `entity` | `string` | Имя сущности (`Proposal`, `Contract`...) |
| `prefix` | `string` | Префикс номера |
| `year` | `number` | Год (для ежегодного сброса) |
| `seq` | `number` | Текущий sequence |
| `name` | `string` | Опциональное имя счётчика |
| `value` | `number` | Альтернативное значение |

### `User` (Пользователь)

**Системный пользователь платформы.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `username` | `string` | Логин |
| `email` | `string` | — |
| `displayName` | `string` | — |
| `passwordHash` | `string` | bcrypt/argon2 |
| `password` | `string` | ⚠️ дубликат `passwordHash` — кандидат на удаление |
| `role` | `string \| string[]` | Роль (одна или несколько) |
| `isActive` | `boolean` | — |
| `lastLoginAt` | `Date` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |
| `deletedAt` | `Date?` | soft delete |
| `permissions` | `string[]` | Явные разрешения |
| `phone` | `string` | — |
| `refreshTokenVersion` | `number` | Инвалидация refresh-токенов |
| `fullName` | `string` | — |

### `Role` (Роль)

**Системная роль с набором прав.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | Системное имя (slug) |
| `label` | `string` | Отображаемое название |
| `description` | `string` | — |
| `permissions` | `string[]` | Список permissions |
| `isSystem` | `boolean` | Системная (нельзя удалить) |
| `sortOrder` | `number` | — |
| `sectionIds` | `string[]` | Связь с секциями UI |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `Roles` (Роль, MongoDB-формат)

⚠️ **Дубликат `Role`** — другой формат, мигрированный из старой MongoDB-схемы.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `name` | `string` | — |
| `isSystemRole` | `boolean` | — |
| `status` | `string` | — |
| `permissions` | `string[]` | — |
| `description` | `string` | — |
| `deletedAt` | `Date?` | soft delete |

### `Permissions` (Права доступа)

**Каталог прав доступа (read/write/admin для каждой секции).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `key` | `string` | Уникальный ключ права |
| `section` | `string` | Секция UI |
| `action` | `string` | Действие (read/write/admin) |
| `description` | `string` | — |

### `FeatureFlag` (Фича-флаг)

**Фича-флаги для A/B-тестирования и постепенного rollout.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `key` | `string` | Уникальный ключ |
| `label` | `string` | — |
| `description` | `string` | — |
| `enabledByDefault` | `boolean` | — |
| `category` | `string` | Группировка |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `RateLimitEntry` (Ограничение частоты)

**Запись rate-limiter (Redis/БД).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `key` | `string` | Ключ (userId, IP) |
| `count` | `number` | Текущий счётчик |
| `expiresAt` | `Date` | TTL |

---

## 2. People & Contacts (Люди и контакты)

### `Person` (Контактное лицо)

**Физическое лицо — контакт организации/контрагента.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `lastName` | `string` | — |
| `firstName` | `string` | — |
| `patronymic` | `string` | Отчество |
| `phone` | `string` | — |
| `email` | `string` | — |
| `position` | `string` | Должность |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `Employees` (Сотрудник)

⚠️ **Дубликат `Worker`** (см. домен 5).

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `name` | `string` | — |
| `fullName` | `string` | — |
| `phone` | `string` | — |
| `email` | `string` | — |
| `position` | `string` | — |
| `active` | `boolean` | ⚠️ `active` (в Worker — `isActive`) |
| `deletedAt` | `Date?` | soft delete |

### `Worker` (Работник / сотрудник производства)

**Работник с привязкой к видам работ и тарифной ставке.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `lastName` | `string` | — |
| `firstName` | `string` | — |
| `patronymic` | `string` | — |
| `grade` | `string` | Разряд |
| `ratePerHour` | `number` | Ставка в час |
| `workTypeIds` | `ObjectId[]` | FK → `WorkType` |
| `isActive` | `boolean` | — |
| `phone` | `string` | — |
| `role` | `string` | ⚠️ Должность (есть `grade`) — кандидат на удаление |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `Client` (Клиент)

⚠️ **Потенциальный дубликат `Counterparty` / `Person`** — нет `id`, нет `createdAt`.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `lastName` | `string` | — |
| `firstName` | `string` | — |
| `patronymic` | `string` | — |
| `phone` | `string` | — |
| `email` | `string` | — |
| `inn` | `string` | ИНН (если ИП) |
| `address` | `string` | — |
| `organizationId` | `ObjectId` | FK → `Organization` |
| `personalMarkupPercent` | `number` | Персональная наценка |
| `notes` | `string` | — |
| `isActive` | `boolean` | — |

### `Counterparty` (Контрагент)

**Юр. лицо или ИП — контрагент (покупатель, поставщик, подрядчик).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | Полное наименование |
| `shortName` | `string` | Краткое наименование |
| `legalForm` | `string` | ООО/ИП/АО... |
| `roles` | `string[]` | Роли (`customer`, `supplier`...) |
| `inn` | `string` | — |
| `kpp` | `string` | — |
| `ogrn` | `string` | — |
| `legalAddress` | `string` | — |
| `phone` | `string` | — |
| `email` | `string` | — |
| `bankName` | `string` | — |
| `bik` | `string` | — |
| `checkingAccount` | `string` | ⚠️ `bankAccount` в `Organization` — кандидат на унификацию |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `CounterpartyRole` (Роль контрагента)

**Справочник ролей контрагента (покупатель, поставщик, подрядчик).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `name` | `string` | — |
| `description` | `string` | — |
| `slug` | `string` | — |
| `isActive` | `boolean` | — |

### `OrganizationContact` (Связь организация-контакт)

**M2M-связь между `Organization` и `Person`.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `organizationId` | `ObjectId` | FK → `Organization` |
| `personId` | `ObjectId` | FK → `Person` |

### `Interaction` (Взаимодействие)

**Лог взаимодействий с контрагентом (звонки, встречи, письма).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `counterpartyId` | `ObjectId` | FK → `Counterparty` |
| `type` | `string` | call/email/meeting |
| `description` | `string` | — |
| `relatedTo` | `string` | Связь с другим документом |
| `createdBy` | `ObjectId` | FK → `User` |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

---

## 3. Organizations (Организации)

### `Organization` (Организация)

⚠️ **Возможный дубликат `Counterparty`** — у обеих похожий набор полей (ИНН, КПП, ОГРН, банк).

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `shortName` | `string` | — |
| `legalForm` | `string` | — |
| `inn` | `string` | — |
| `kpp` | `string` | — |
| `ogrn` | `string` | — |
| `ogrnip` | `string` | Для ИП |
| `ipRegistrationDate` | `Date` | — |
| `passportSeries` | `string` | Для ИП |
| `passportNumber` | `string` | — |
| `passportIssuedBy` | `string` | — |
| `passportIssuedDate` | `Date` | — |
| `phone` | `string` | — |
| `email` | `string` | — |
| `legalAddress` | `string` | — |
| `actualAddress` | `string` | — |
| `postalAddress` | `string` | — |
| `bankName` | `string` | — |
| `bankBik` | `string` | — |
| `bankAccount` | `string` | — |
| `signerName` | `string` | — |
| `signerPosition` | `string` | — |
| `counterpartyRoleIds` | `ObjectId[]` | FK → `CounterpartyRole` |
| `contactPerson` | `string` | — |
| `paymentTermDays` | `number` | Срок оплаты |
| `vatRate` | `number` | Ставка НДС |
| `isActive` | `boolean` | — |
| `type` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |
| `legalType` | `string` | — |
| `website` | `string` | — |
| `directorName` | `string` | — |
| `registrationDate` | `Date` | — |
| `partyTypes` | `string[]` | Типы сторон |
| `photoIds` | `ObjectId[]` | FK → `Photos` |
| `deletedAt` | `Date?` | soft delete |

### `OrgRole` (Роль организации)

**Справочник ролей организации (покупатель/поставщик/подрядчик).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `slug` | `string` | — |
| `description` | `string` | — |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `Category` (Категория)

**Универсальная иерархическая категория (parent/child).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `parentId` | `ObjectId?` | FK → `Category` (parent) |
| `fullPath` | `string` | Кэш полного пути |
| `sortOrder` | `number` | — |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

---

## 4. Products & Materials (Продукция и материалы)

### `Material` (Материал)

**Глобальный справочник материалов.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `article` | `string` | Артикул |
| `sku` | `string` | SKU |
| `unit` | `string` | Единица измерения |
| `category` | `string` | Категория (legacy) |
| `categoryId` | `ObjectId` | FK → `MaterialCategory` |
| `description` | `string` | — |
| `price` | `number` | Цена (legacy) |
| `pricePerUnit` | `number` | Цена за единицу. Всегда в **RUB** — поле валюты отсутствует (см. политику ниже). |
| `dimensions` | `Dimension[]` | Габариты (см. `Dimension`). Массив, не объект. |
| `mainPhotoId` | `ObjectId?` | FK → `Photo`. Главное фото (используется в карточках). Выбирается галочкой из `photoIds[]`. |
| `photoIds` | `ObjectId[]` | FK → `Photos` |
| `supplierId` | `ObjectId?` | FK → `Organization` (только организации с флагом `type: 'supplier'`) |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |
| `deletedAt` | `Date?` | soft delete |

#### Подсхема `Dimension` (внутри `Material.dimensions[]`)

**Массив габаритов материала. Каждый элемент описывает ОДИН измеряемый параметр (длина / ширина / высота / толщина / диаметр / глубина) с признаком неизменяемости.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `type` | `string` | Вид размера: `length` / `width` / `height` / `thickness` / `diameter` / `depth` |
| `value` | `number` | Числовое значение в мм |
| `isImmutable` | `boolean` | Если `true` — размер **нельзя изменить** downstream (например, толщина листа металла). При создании продукции/модуля это поле блокируется на редактирование. |

**Семантика `isImmutable`:**
- `true` — параметр **жёстко привязан** к материалу (толщина листа 2 мм — её нельзя «раскатать»).
- `false` — параметр можно менять downstream (длина и ширина листа могут резаться под нужный модуль).

**Пример (лист металла 2×3 м, толщина 2 мм):**
```
dimensions: [
  { type: 'length',    value: 3000, isImmutable: false },
  { type: 'width',     value: 2000, isImmutable: false },
  { type: 'thickness', value: 2,    isImmutable: true  }
]
```

### `MaterialCategory` (Категория материалов)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `slug` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `ProductCategory` (Категория продукции)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `prefix` | `string` | Префикс для SKU |
| `description` | `string` | — |
| `sortOrder` | `number` | — |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `Product` (Продукция)

**Карточка продукции с BOM-связями и атрибутами.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `sku` | `string` | — |
| `kind` | `string` | Вид (good/service) |
| `productType` | `string` | Тип (legacy) |
| `unit` | `string` | — |
| `categoryId` | `ObjectId` | FK → `ProductCategory` |
| `subcategory` | `string` | — |
| `status` | `string` | — |
| `listPrice` | `number` | Прайсовая цена |
| `basePrice` | `number` | Базовая цена |
| `costPrice` | `number` | Себестоимость |
| `cost` | `number` | (legacy) |
| `defaultMarkupPercent` | `number` | — |
| `stockQty` | `number` | Остаток |
| `description` | `string` | — |
| `notes` | `string` | — |
| `photos` | `string[]` | URLs (legacy) |
| `photoIds` | `ObjectId[]` | FK → `Photos` |
| `height` / `length` / `width` | `number` | Габариты |
| `weight` / `weightKg` | `number` | ⚠️ Дубликат |
| `dimensions` | `object` | — |
| `materials` | `array` | Связанные материалы |
| `material` | `string` | Основной материал |
| `installation` | `string` | Монтаж (legacy) |
| `purpose` | `string` | Назначение |
| `ralCode` | `string` | RAL-цвет |
| `hasPassport` | `boolean` | — |
| `hasDrawing` | `boolean` | — |
| `copiedFromProductId` | `ObjectId` | Для дублей продукции |
| `productModuleIds` | `ObjectId[]` | FK → `ProductModule` |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |
| `deletedAt` | `Date?` | soft delete |

### `ProductPhoto` (Фото продукта)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `productId` | `ObjectId` | FK → `Product` |
| `url` | `string` | — |
| `caption` | `string` | Подпись |
| `isMain` | `boolean` | — |
| `sortOrder` | `number` | — |
| `createdAt` | `Date` | — |

### `ProductComponent` (Компонент / деталь)

**Деталь или сборочная единица в составе продукта.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `productId` | `ObjectId` | FK → `Product` |
| `name` | `string` | — |
| `quantityPerProduct` | `number` | — |
| `unit` | `string` | — |
| `description` | `string` | — |
| `drawingUrl` | `string` | URL чертежа |
| `sortOrder` | `number` | — |
| `materials` | `array` | — |
| `material` | `string` | — |
| `workTypes` | `array` | — |
| `workTypeId` | `ObjectId` | FK → `WorkType` |

### `ProductModule` (Модуль продукции)

**Модуль в составе продукта (для модульной продукции).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `productId` | `ObjectId` | FK → `Product` |
| `name` | `string` | — |
| `article` | `string` | — |
| `width` / `height` / `depth` | `number` | — |
| `weight` | `number` | — |
| `image` | `string` | — |
| `sortOrder` | `number` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `ModuleWorkType` (Вид работ модуля)

**Связь модуля с видом работ + оценка часов.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `moduleId` | `ObjectId` | FK → `ProductModule` |
| `workTypeId` | `ObjectId` | FK → `WorkType` |
| `estimatedHours` | `number` | — |
| `sortOrder` | `number` | — |

### `ModuleMaterial` (Материал модуля)

**Материалы, используемые в модуле.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `moduleId` | `ObjectId` | FK → `ProductModule` |
| `name` | `string` | — |
| `quantity` | `number` | — |
| `unit` | `string` | — |
| `isPurchased` | `boolean` | Закупается отдельно? |

### `Modules` (Модуль, BOM-формат)

⚠️ **Дубликат `ProductModule`** — другие названия полей, мигрированный формат.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `name` | `string` | — |
| `sku` | `string` | — |
| `category` | `string` | — |
| `notes` | `string` | — |
| `dimensions` | `object` | — |
| `childModuleIds` | `ObjectId[]` | Вложенные модули |
| `moduleMaterials` | `array` | — |
| `moduleWorks` | `array` | — |
| `photoIds` | `ObjectId[]` | — |
| `deletedAt` | `Date?` | — |

### `Bom` (Спецификация / BOM)

**Спецификация (Bill of Materials) для продукта — конкретная версия.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `productId` | `ObjectId` | FK → `Product` |
| `version` | `string \| number` | Версия BOM |
| `isActive` | `boolean` | — |
| `components` | `array` | Состав |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

⚠️ **Нет `id`** — кандидат на добавление.

### `ProductPassport` (Паспорт продукции)

**Паспорт изделия (документ с характеристиками).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `productId` | `ObjectId` | FK → `Product` |
| `passportNumber` | `string` | — |
| `productCode` | `string` | — |
| `warrantyCode` | `string` | — |
| `date` | `Date` | — |
| `name` / `category` / `article` | `string` | Кэш для отчётов |
| `height` / `length` / `width` / `weight` | `number` | — |
| `description` | `string` | — |
| `installationSite` | `string` | — |
| `supplier` | `string` | — |
| `photo` | `string` | — |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `InventorFile` (Файл чертежа)

**Чертёж/файл изобретения, привязанный к продукту.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `productId` | `ObjectId` | FK → `Product` |
| `productName` / `productSku` | `string` | Кэш |
| `fileName` / `fileType` | `string` | — |
| `sizeKb` | `number` | — |
| `version` | `string \| number` | — |
| `author` | `string` | — |
| `url` | `string` | — |
| `description` / `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `Photos` (Хранилище фото)

**Централизованное хранилище всех фото (варианты, разные размеры).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `storageUrl` | `string` | URL оригинала |
| `originalFilename` | `string` | — |
| `variant` | `string` | thumb/medium/full |
| `mimeType` | `string` | — |
| `sizeBytes` | `number` | — |
| `widthPx` / `heightPx` | `number` | — |
| `parentPhotoId` | `ObjectId?` | Родительский вариант |
| `linkedPhotoId` | `ObjectId?` | Связанное фото |

⚠️ **Нет `id`, `createdAt`, `updatedAt`** — нужен PK.

### `Certificate` (Сертификат / декларация)

**Сертификаты и декларации соответствия на продукцию.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `productIds` | `ObjectId[]` | FK → `Product` |
| `productNames` | `string[]` | Кэш |
| `number` | `string` | Номер сертификата |
| `certType` | `string` | Тип (декларация/сертификат) |
| `status` | `string` | — |
| `issuedBy` / `issuer` | `string` | ⚠️ Дубликат |
| `issueDate` | `Date` | — |
| `expiryDate` / `expiresAt` | `Date` | ⚠️ Дубликат |
| `fileUrl` | `string` | — |
| `notes` / `title` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `AttributeDefinition` (Определение атрибута)

**EAV: определение настраиваемого атрибута сущности.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `entityType` | `string` | К какой сущности |
| `categoryId` | `ObjectId?` | FK → `Category` |
| `name` | `string` | Системное имя |
| `label` | `string` | Отображаемое |
| `type` | `string` | string/number/date/... |
| `unit` | `string` | — |
| `options` | `array` | Для enum |
| `required` | `boolean` | — |
| `sortOrder` | `number` | — |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `EntityAttributeValue` (Значение атрибута)

**EAV: значение настраиваемого атрибута для конкретной сущности.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `entityType` | `string` | — |
| `entityId` | `ObjectId` | PK сущности |
| `attributeId` | `ObjectId` | FK → `AttributeDefinition` |
| `value` | `any` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

⚠️ **Нет `id` PK** — кандидат на добавление.

### `ComplianceRule` (Правило соответствия)

**Правило валидации/соответствия между сущностями.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `description` | `string` | — |
| `sourceType` / `targetType` | `string` | Типы сущностей |
| `field` / `fieldLabel` | `string` | — |
| `operator` | `string` | `=`, `>`, `<`... |
| `expectedValue` | `any` | — |
| `expectedValueMax` | `any` | — |
| `tolerance` | `number` | Допуск |
| `unit` | `string` | — |
| `severity` | `string` | warning/error/critical |
| `isActive` | `boolean` | — |
| `sortOrder` | `number` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

---

## 5. Production (Производство)

### `WorkType` (Вид работ)

**Справочник видов работ (сварка, покраска, сборка...).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `section` | `string` | Раздел UI |
| `description` | `string` | — |
| `isActive` | `boolean` | — |
| `department` | `string` | Цех/отдел |
| `defaultDurationHours` | `number` | — |
| `workCenterId` | `ObjectId` | FK → `WorkCenter` |
| `hourlyRate` | `number` | Ставка по умолчанию |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `Operation` (Операция)

⚠️ **Возможный дубликат `WorkType`** — обе описывают производственную операцию.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | Номер операции |
| `name` | `string` | — |
| `workshop` | `string` | Цех |
| `duration` | `number` | Длительность |
| `costPerHour` | `number` | Стоимость часа |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `WorkCenter` (Рабочий центр)

**Производственный участок / станок / линия.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `type` | `string` | Тип (станок/линия/участок) |
| `description` | `string` | — |
| `isActive` | `boolean` | — |
| `capacity` | `number` | Пропускная способность |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `ProductionOrder` (Заказ на производство)

**Заказ на производство конкретной продукции.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `title` | `string` | — |
| `contractId` | `ObjectId` | FK → `Contract` |
| `proposalId` | `ObjectId` | FK → `Proposal` |
| `productId` | `ObjectId` | FK → `Product` |
| `productName` / `productSku` | `string` | Кэш |
| `quantity` | `number` | — |
| `status` | `string` | — |
| `priority` | `number \| string` | — |
| `ralCode` | `string` | — |
| `plannedStart` / `plannedStartDate` | `Date` | ⚠️ Дубликат |
| `plannedEnd` / `plannedEndDate` | `Date` | ⚠️ Дубликат |
| `actualStart` | `Date` | — |
| `actualEnd` | `Date` | — |
| `workTypeId` | `ObjectId` | FK → `WorkType` |
| `workCenterId` | `ObjectId` | FK → `WorkCenter` |
| `packageTag` | `string` | — |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `OrderTask` (Задача заказа)

**Этап/задача в рамках производственного заказа.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `orderId` / `productionOrderId` | `ObjectId` | ⚠️ Дубликат — один FK под двумя именами |
| `componentId` / `componentName` | `ObjectId / string` | — |
| `workTypeId` / `workTypeName` | `ObjectId / string` | — |
| `workerId` | `ObjectId` | FK → `Worker` |
| `workCenterId` | `ObjectId` | FK → `WorkCenter` |
| `title` / `description` / `notes` | `string` | — |
| `status` | `string` | — |
| `estimatedHours` / `plannedHours` | `number` | ⚠️ Дубликат |
| `actualHours` | `number` | — |
| `plannedStartDate` / `plannedEndDate` | `Date` | — |
| `actualStartDate` / `actualEndDate` | `Date` | — |
| `dependsOnTaskIds` | `ObjectId[]` | FK → `OrderTask` |
| `sortOrder` | `number` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `WorkOrder` (Наряд-заказ)

**Наряд на выполнение работы (выдаётся работнику).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `orderId` | `ObjectId` | FK → `ProductionOrder` |
| `productId` | `ObjectId` | FK → `Product` |
| `qty` | `number` | Количество |
| `statusId` | `ObjectId` | FK → `EntityStatus` |
| `startDate` / `endDate` | `Date` | — |
| `assignedTo` | `ObjectId` | FK → `User` / `Worker` |
| `notes` | `string` | — |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `WorkOrderOperation` (Операция наряда)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `workOrderId` | `ObjectId` | FK → `WorkOrder` |
| `operationId` | `ObjectId` | FK → `Operation` |
| `order` | `number` | Порядок |
| `plannedDuration` | `number` | — |
| `actualDuration` | `number` | — |
| `statusId` | `ObjectId` | FK → `EntityStatus` |
| `startedAt` / `completedAt` | `Date` | — |
| `completedBy` | `ObjectId` | FK → `User` |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

⚠️ **Нет `id`** — кандидат на добавление.

### `CostCalculation` (Калькуляция себестоимости)

**Расчёт себестоимости продукта по BOM.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `productId` | `ObjectId` | FK → `Product` |
| `bomId` | `ObjectId` | FK → `Bom` |
| `bomVersion` | `string` | — |
| `isActive` | `boolean` | — |
| `materials` | `array` | — |
| `totalMaterialCost` | `number` | — |
| `totalLaborCost` | `number` | — |
| `overheadPercent` | `number` | — |
| `overheadCost` | `number` | — |
| `totalCost` | `number` | — |
| `calculatedAt` | `Date` | — |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

⚠️ **Нет `id`** — кандидат на добавление.

### `TechProcess` (Технологический процесс)

**Последовательность операций для производства продукта.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `productId` | `ObjectId` | FK → `Product` |
| `totalDuration` | `number` | Общая длительность |
| `isActive` | `boolean` | — |
| `operations` | `array` | Список операций |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

⚠️ **Нет `id`** — кандидат на добавление.

### `ActualCost` (Фактическая себестоимость)

**Фактические затраты по заказу (для сравнения с планом).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `orderId` | `ObjectId` | FK → `ProductionOrder` |
| `type` | `string` | Тип затрат |
| `amount` | `number` | Сумма |
| `description` | `string` | — |
| `sourceRef` | `string` | Ссылка на документ |
| `date` | `Date` | — |
| `createdBy` | `ObjectId` | FK → `User` |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `OrderClosing` (Закрытие заказа)

**Документ закрытия производственного заказа (акт, отчёт).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `productionOrderId` | `ObjectId` | FK → `ProductionOrder` |
| `orderNumber` | `string` | — |
| `closingType` | `string` | Тип закрытия |
| `number` | `string` | Номер документа |
| `date` | `Date` | — |
| `amount` / `totalAmount` | `number` | ⚠️ Дубликат |
| `organizationId` / `organizationName` | `ObjectId / string` | — |
| `status` | `string` | — |
| `fileUrl` | `string` | — |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

---

## 6. Sales & Commerce (Продажи)

### `CartItem` (Элемент корзины)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `sessionId` | `ObjectId` | FK → `CartSession` |
| `productId` | `ObjectId` | FK → `Product` |
| `quantity` | `number` | — |
| `priceSnapshot` | `number` | Цена на момент добавления |
| `markupPercent` | `number` | — |

### `CartSession` (Сессия корзины)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `createdAt` | `Date` | — |

### `Proposal` (КП v1)

**Первая версия схемы КП. ⚠️ Дубликат: см. `Quotation` и `CommercialProposal`.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `title` | `string` | — |
| `status` | `string` | — |
| `customerId` | `ObjectId` | FK → `Client` / `Counterparty` |
| `organizationId` | `ObjectId` | FK → `Organization` |
| `templateId` | `ObjectId` | FK → `DocumentTemplate` |
| `markupPercent` | `number` | — |
| `discountPercent` | `number` | — |
| `vatRate` | `number` | — |
| `ralCode` | `string` | — |
| `notes` | `string` | — |
| `validUntil` | `Date` | — |
| `parentProposalId` | `ObjectId` | FK → `Proposal` (для версий) |
| `version` | `number` | — |
| `supersededAt` | `Date` | — |
| `packageTag` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `ProposalItem` (Элемент КП)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `proposalId` | `ObjectId` | FK → `Proposal` |
| `productId` | `ObjectId` | FK → `Product` |
| `sourceItemId` | `ObjectId` | (для миграции из Quotation?) |
| `quantity` | `number` | — |
| `unitPrice` | `number` | — |
| `markupPercent` | `number` | — |
| `total` | `number` | — |
| `sortOrder` | `number` | — |

### `Quotation` (КП v2)

⚠️ **Дубликат `Proposal`** — другие названия полей, тот же смысл.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `number` | `string` | — |
| `organizationId` | `ObjectId` | FK → `Organization` |
| `counterpartyId` | `ObjectId` | FK → `Counterparty` |
| `tenderId` | `ObjectId` | FK → `Tender` |
| `date` / `validUntil` | `Date` | — |
| `statusId` | `ObjectId` | FK → `EntityStatus` |
| `total` | `number` | — |
| `discountType` | `string` | — |
| `discountPercent` | `number` | — |
| `discountAmount` | `number` | — |
| `notes` | `string` | — |
| `isActive` | `boolean` | — |
| `templateId` | `ObjectId` | FK → `DocumentTemplate` |
| `designSnapshot` / `templateSnapshot` | `object` | Снапшоты |
| `items` | `array` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

⚠️ **Нет `id`** — кандидат на добавление.

### `CommercialProposal` (КП, внутренняя)

⚠️ **Третий вариант КП** — компактный, возможно legacy.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `number` | `string` | — |
| `organizationId` | `ObjectId` | — |
| `clientId` | `ObjectId` | — |
| `status` | `string` | — |
| `items` | `array` | — |
| `totalAmount` | `number` | — |
| `notes` | `string` | — |
| `templateId` | `ObjectId` | — |

⚠️ **Нет `id`, `createdAt`, `updatedAt`**.

### `Contract` (Договор)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `title` | `string` | — |
| `proposalId` | `ObjectId` | FK → `Proposal` / `Quotation` |
| `organizationId` | `ObjectId` | FK → `Organization` |
| `customerId` / `clientId` | `ObjectId` | ⚠️ Дубликат |
| `status` | `string` | — |
| `items` | `array` | — |
| `notes` | `string` | — |
| `totalAmount` | `number` | — |
| `signedAt` | `Date` | — |
| `expiresAt` | `Date` | — |
| `packageTag` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `ContractItem` (Элемент договора)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `contractId` | `ObjectId` | FK → `Contract` |
| `name` | `string` | — |
| `quantity` | `number` | — |
| `unit` | `string` | — |
| `unitPrice` | `number` | — |
| `priceSnapshot` | `number` | — |
| `total` | `number` | — |
| `sortOrder` | `number` | — |

### `Order` (Заказ)

⚠️ **Возможный дубликат `ProductionOrder`** — но `ProductionOrder` явно про производство, `Order` — про общий заказ продажи.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `number` | `string` | — |
| `counterpartyId` | `ObjectId` | FK → `Counterparty` |
| `quotationId` | `ObjectId` | FK → `Quotation` |
| `date` / `plannedDate` | `Date` | — |
| `statusId` | `ObjectId` | FK → `EntityStatus` |
| `total` | `number` | — |
| `notes` | `string` | — |
| `isActive` | `boolean` | — |
| `items` | `array` | — |
| `deliveryAddress` | `string` | — |
| `managerId` | `ObjectId` | FK → `User` |
| `priority` | `number \| string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

⚠️ **Нет `id`** — кандидат на добавление.

### `Shipment` (Отгрузка)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `orderId` | `ObjectId` | FK → `Order` / `ProductionOrder` |
| `date` | `Date` | — |
| `recipient` | `string` | — |
| `address` | `string` | — |
| `statusId` / `status` | `ObjectId / string` | ⚠️ Дубликат |
| `driverInfo` | `string` | — |
| `isActive` | `boolean` | — |
| `items` | `array` | — |
| `photos` | `array` | — |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `ShippingDoc` (Отгрузочный документ)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `number` | `string` | — |
| `date` | `Date` | — |
| `type` | `string` | Тип (ТТН, ТОРГ-12...) |
| `shipmentId` | `ObjectId` | FK → `Shipment` |
| `totalAmount` | `number` | — |
| `signatures` | `array` | — |
| `pdfUrl` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

⚠️ **Нет `id`** — кандидат на добавление.

---

## 7. Warehouse & Inventory (Склад и инвентарь)

### `Warehouse` (Склад)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `address` | `string` | — |
| `type` | `string` | — |
| `isActive` | `boolean` | — |
| `zoneNames` | `string[]` | Зоны (legacy) |
| `roleIds` | `ObjectId[]` | FK → `Role` |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `StorageItem` (Предмет хранения)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `warehouseId` | `ObjectId` | FK → `Warehouse` |
| `productId` | `ObjectId` | FK → `Product` |
| `name` | `string` | — |
| `description` / `notes` | `string` | — |
| `photos` | `array` | — |
| `weightKg` | `number` | — |
| `dimensions` | `object` | — |
| `isActive` | `boolean` | — |
| `quantity` | `number` | Текущий остаток |
| `reservedQty` | `number` | Зарезервировано |
| `minQuantity` | `number` | Мин. остаток для уведомлений |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `InventoryItem` (Остаток)

⚠️ **Возможный дубликат `StorageItem`** — агрегированный view по складу.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `warehouseId` | `ObjectId` | FK → `Warehouse` |
| `zoneName` | `string` | — |
| `entityType` | `string` | Material/Product... |
| `entityId` | `ObjectId` | — |
| `entityName` / `entitySku` / `entityUnit` | `string` | Кэш |
| `quantity` | `number` | — |
| `minQuantity` | `number` | — |
| `updatedAt` | `Date` | — |

⚠️ **Нет `id`, `createdAt`** — кандидат на добавление.

### `InventoryMovement` (Движение.inventory)

⚠️ **Возможный дубликат `StockMovement`** — обе описывают движение товара.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `type` | `string` | in/out/transfer |
| `warehouseId` / `toWarehouseId` | `ObjectId` | FK → `Warehouse` |
| `zoneName` / `toZoneName` | `string` | — |
| `storageItemId` | `ObjectId` | FK → `StorageItem` |
| `productionOrderId` | `ObjectId` | FK → `ProductionOrder` |
| `entityType` / `entityId` / `entityName` / `entitySku` / `entityUnit` | `string / ObjectId` | — |
| `quantity` | `number` | — |
| `documentRef` | `string` | Ссылка на документ-основание |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |

### `StockMovement` (Движение остатков)

⚠️ **Дубликат `InventoryMovement`** — компактный формат.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `type` | `string` | — |
| `date` | `Date` | — |
| `productId` | `ObjectId` | — |
| `warehouseId` | `ObjectId` | — |
| `qty` | `number` | — |
| `cost` | `number` | — |
| `orderId` | `ObjectId` | — |
| `documentRef` | `string` | — |
| `createdBy` | `ObjectId` | FK → `User` |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `Reservation` (Резервирование)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `orderId` | `ObjectId` | FK → `Order` |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

---

## 8. Procurement (Закупки)

### `PurchaseRequest` (Закупочная заявка)

**Заявка на закупку (от производства или склада).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `date` | `Date` | — |
| `title` | `string` | — |
| `createdBy` | `ObjectId` | FK → `User` |
| `statusId` / `status` | `ObjectId / string` | ⚠️ Дубликат |
| `orderId` | `ObjectId` | FK → `ProductionOrder` |
| `isActive` | `boolean` | — |
| `sourceType` / `sourceId` | `string / ObjectId` | Универсальная ссылка |
| `entityType` / `entityId` / `entityName` / `entitySku` / `entityUnit` | `string / ObjectId` | Сущность-источник |
| `quantity` | `number` | — |
| `warehouseId` | `ObjectId` | FK → `Warehouse` |
| `zoneName` | `string` | — |
| `notes` | `string` | — |
| `totalAmount` | `number` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `PurchaseRequestItem` (Элемент заявки)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `requestId` | `ObjectId` | FK → `PurchaseRequest` |
| `name` | `string` | — |
| `quantity` | `number` | — |
| `unit` | `string` | — |
| `unitPrice` | `number` | — |
| `total` | `number` | — |

### `SupplierOrder` (Заказ поставщику v1)

⚠️ **Дубликат `PurchaseOrder`** — расширенная версия.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `title` | `string` | — |
| `supplierOrgId` / `supplierId` | `ObjectId` | ⚠️ Дубликат |
| `status` | `string` | — |
| `items` | `array` | — |
| `totalAmount` | `number` | — |
| `expectedDate` / `deliveryDate` | `Date` | ⚠️ Дубликат |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `PurchaseOrder` (Заказ поставщику v2)

⚠️ **Дубликат `SupplierOrder`**.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `supplierId` | `ObjectId` | FK → `Counterparty` |
| `orderDate` | `Date` | — |
| `deliveryDate` | `Date` | — |
| `statusId` | `ObjectId` | FK → `EntityStatus` |
| `total` | `number` | — |
| `notes` | `string` | — |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `SupplierOrderItem` (Элемент заказа поставщику)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `orderId` | `ObjectId` | FK → `SupplierOrder` |
| `name` | `string` | — |
| `quantity` | `number` | — |
| `unit` | `string` | — |
| `unitPrice` | `number` | — |
| `total` | `number` | — |

### `IncomingInvoice` (Входящий счёт)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `supplierId` | `ObjectId` | FK → `Counterparty` |
| `totalAmount` | `number` | — |
| `status` | `string` | — |
| `invoiceDate` | `Date` | — |
| `dueDate` | `Date` | — |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `Invoice` (Счёт, упрощённый)

⚠️ **Возможный дубликат `IncomingInvoice`** — компактная форма.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `number` | `string` | — |
| `date` | `Date` | — |
| `supplierOrgId` | `ObjectId` | — |
| `supplierOrderId` | `ObjectId` | FK → `SupplierOrder` |
| `amount` | `number` | — |
| `paid` | `boolean` | — |
| `status` | `string` | — |
| `fileUrl` | `string` | — |
| `notes` | `string` | — |

⚠️ **Нет `id`, `createdAt`, `updatedAt`**.

### `Tender` (Тендер / закупка)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `tenderId` | `string` | Внешний ID тендера |
| `date` | `Date` | — |
| `companyId` | `ObjectId` | — |
| `customerOrgId` / `customerName` | `ObjectId / string` | — |
| `email` | `string` | Email закупщика |
| `subject` / `productName` | `string` | — |
| `quantity` / `unit` | `number / string` | — |
| `attachments` / `documents` | `array` | — |
| `deliveryTerms` / `responseRequirements` / `legalBasis` | `string` | — |
| `statusId` / `status` | `ObjectId / string` | ⚠️ Дубликат |
| `isActive` | `boolean` | — |
| `title` / `type` | `string` | — |
| `noticeNumber` | `string` | Номер извещения |
| `platformUrl` | `string` | — |
| `startPrice` / `ourPrice` | `number` | — |
| `publishDate` | `Date` | — |
| `submissionDeadline` | `Date` | — |
| `resultDate` | `Date` | — |
| `totalAmount` | `number` | — |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `Rpp` (РПП — регистр предложений поставщика v2)

⚠️ **Дубликат `RppEntry`**.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `title` | `string` | — |
| `productId` | `ObjectId` | FK → `Product` |
| `productName` / `productSku` | `string` | — |
| `registryNumber` | `string` | — |
| `status` | `string` | — |
| `submissionDate` / `registrationDate` / `expiryDate` | `Date` | — |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `RppEntry` (РПП v1)

⚠️ **Дубликат `Rpp`** — компактная форма.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `number` | `string` | — |
| `title` | `string` | — |
| `status` | `string` | — |
| `notes` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

---

## 9. Documents & Templates (Документы и шаблоны)

### `DocType` (Тип документа v1)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `slug` | `string` | — |
| `description` | `string` | — |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `DocTypeDef` (Тип документа, определение)

⚠️ **Дубликат `DocType`** — без `id`, `createdAt`, `updatedAt`.

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `name` | `string` | — |
| `slug` | `string` | — |
| `description` | `string` | — |
| `isActive` | `boolean` | — |

### `DocumentTemplate` (Шаблон документа)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `description` | `string` | — |
| `tags` | `string[]` | — |
| `organizationId` | `ObjectId` | FK → `Organization` |
| `docType` / `docTypeId` | `string / ObjectId` | ⚠️ Дубликат |
| `isDefault` | `boolean` | — |
| `isActive` | `boolean` | — |
| `pageSize` | `string` | A4/A3... |
| `backgroundImage` / `backgroundImages` | `string / array` | ⚠️ Дубликат |
| `backgroundOpacity` | `number` | — |
| `blocks` | `array` | Блоки (TemplateBlock) |
| `version` | `string \| number` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `TemplateBlock` (Блок шаблона)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `templateId` | `ObjectId` | FK → `DocumentTemplate` |
| `type` | `string` | header/text/table/image |
| `order` | `number` | — |
| `title` / `content` | `string` | — |
| `height` | `number` | — |
| `showLine` | `boolean` | — |
| `settings` | `object` | — |

### `TableTemplate` (Шаблон таблицы)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `name` | `string` | — |
| `columns` | `array` | — |
| `description` | `string` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `DocumentTableType` (Тип таблицы документа)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `name` | `string` | — |
| `label` | `string` | — |
| `title` | `string` | — |
| `docType` | `string` | — |
| `columns` | `array` | — |
| `dataSource` | `string` | — |
| `productKind` | `string` | — |
| `sortOrder` | `number` | — |
| `fontSize` | `number` | — |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

⚠️ **Нет `id`** — кандидат на добавление.

---

## 10. Finance (Финансы)

### `ReconciliationAct` (Акт сверки взаиморасчётов)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `organizationId` / `organizationName` | `ObjectId / string` | — |
| `number` | `string` | — |
| `periodStart` / `periodEnd` | `Date` | — |
| `ourDebt` / `theirDebt` / `balance` | `number` | — |
| `status` | `string` | — |
| `signDate` | `Date` | — |
| `fileUrl` | `string` | — |
| `notes` | `string` | — |
| `totalDebit` / `totalCredit` | `number` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `FinancialReport` (Финансовый отчёт)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `title` | `string` | — |
| `number` | `string` | — |
| `reportType` | `string` | — |
| `periodStart` / `periodEnd` | `Date` | — |
| `data` | `object` | Произвольные данные |
| `totalAmount` | `number` | — |
| `status` | `string` | — |
| `generatedAt` | `Date` | — |
| `notes` | `string` | — |
| `totalIncome` / `totalExpense` / `netProfit` | `number` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `Setting` (Настройка)

**Глобальные настройки приложения (key-value).**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `key` | `string` | Уникальный ключ |
| `value` | `any` | — |
| `description` | `string` | — |
| `group` | `string` | Группировка |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

---

## 11. System & Activity (Системные и история)

### `StatusWorkflow` (Workflow статусов)

**Определение переходов между статусами для конкретной сущности.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `entityType` / `entity` | `string` | ⚠️ Дубликат |
| `name` | `string` | Название workflow |
| `statuses` | `array` | Список статусов |
| `transitions` | `array` | Переходы |
| `fromStatus` / `toStatus` | `string` | — |
| `roles` | `array` | Роли, доступные для перехода |
| `isActive` | `boolean` | — |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `EntityStatus` (Статус сущности)

**Каталог статусов для конкретного типа сущности.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `entityType` | `string` | — |
| `statusId` | `string` | — |
| `label` | `string` | — |
| `color` | `string` | HEX |
| `icon` | `string` | — |
| `sortOrder` | `number` | — |
| `isInitial` | `boolean` | Начальный статус |
| `isFinal` | `boolean` | Финальный статус |
| `createdAt` | `Date` | — |
| `updatedAt` | `Date` | — |

### `ImportJobs` (Импорт данных)

**Лог импорта данных из внешних источников.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `sourceType` | `string` | csv/excel/api |
| `entityType` | `string` | Куда импортируем |
| `sourceFile` / `sourceUrl` | `string` | — |
| `sourceOptions` | `object` | — |
| `status` | `string` | — |
| `progressPercent` | `number` | 0-100 |
| `totalRecords` / `processedRecords` / `successRecords` / `failedRecords` | `number` | — |
| `errorLog` | `string` | — |
| `createdByUserId` | `ObjectId` | FK → `User` |
| `startedAt` | `Date` | — |
| `completedAt` | `Date` | — |
| `deletedAt` | `Date?` | — |

### `OrderHistory` (История заказа)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `orderId` | `ObjectId` | FK → `Order` / `ProductionOrder` |
| `action` | `string` | Что произошло |
| `userId` / `userName` | `ObjectId / string` | — |
| `details` | `object` | — |
| `createdAt` | `Date` | — |

### `UserActivity` (Активность пользователя)

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `userId` / `userName` | `ObjectId / string` | — |
| `action` | `string` | — |
| `entity` | `string` | — |
| `entityId` | `ObjectId` | — |
| `details` | `object` | — |
| `createdAt` | `Date` | — |

### `Comment` (Комментарий)

**Комментарии в картотеке сделок.**

| Поле | Тип | Комментарий |
|------|-----|-------------|
| `id` | `ObjectId` | PK |
| `packageTag` | `string` | Тег пакета сделок |
| `authorId` / `author` | `ObjectId / string` | — |
| `text` | `string` | — |
| `isArchived` | `boolean` | — |
| `createdAt` | `Date` | — |

---

## ⚠️ Дубликаты и аномалии

### Дублирующиеся сущности (нужно консолидировать)

| Сущность 1            | Сущность 2              | Что общего                  | Рекомендация                                                       |
|------------------------|--------------------------|------------------------------|--------------------------------------------------------------------|
| `DocType`              | `DocTypeDef`             | Тип документа                | Оставить одну (`DocType`), мигрировать данные                      |
| `Proposal`             | `Quotation`              | КП                           | Оставить одну, мигрировать `Quotation` → `Proposal`                |
| `Proposal`             | `CommercialProposal`     | КП (внутр.)                  | Оставить одну, мигрировать                                         |
| `Rpp`                  | `RppEntry`               | РПП                          | Оставить одну (`Rpp`), мигрировать `RppEntry`                      |
| `PurchaseOrder`        | `SupplierOrder`          | Заказ поставщику             | Оставить одну, мигрировать                                         |
| `Invoice`              | `IncomingInvoice`        | Счёт                         | Оставить одну, мигрировать                                         |
| `Role`                 | `Roles`                  | Роль                         | Оставить одну (`Role`), мигрировать                                |
| `Employees`            | `Worker`                 | Сотрудник                    | Решить: prod-сотрудник или общий                                   |
| `Operation`            | `WorkType`               | Производственная операция    | Решить: что первично                                               |
| `ProductModule`        | `Modules`                | Модуль                       | Оставить одну                                                      |
| `InventoryMovement`    | `StockMovement`          | Движение                     | Оставить одну                                                      |
| `StorageItem`          | `InventoryItem`          | Остаток                      | Возможно `InventoryItem` — это view над `StorageItem`              |
| `MaterialCategory`     | `Category`               | Категория                    | Возможно объединить в `Category`                                   |
| `ProductCategory`      | `Category`               | Категория                    | Возможно объединить в `Category`                                   |
| `Organization`         | `Counterparty`           | Юр. лицо                     | Решить: это разные сущности или одна?                              |
| `Client`               | `Counterparty` / `Person`| Клиент                       | Решить                                                             |

### Потенциально избыточные поля внутри одной сущности

| Сущность           | Поле 1              | Поле 2              | Комментарий                                |
|--------------------|----------------------|---------------------|--------------------------------------------|
| `User`             | `passwordHash`       | `password`          | ⚠️ Дубликат — удалить `password`           |
| `User`             | `role`               | `permissions`       | Возможно, лучше только `role`              |
| `Material`         | `category`           | `categoryId`        | Legacy + новый                             |
| `Material`         | `price`              | `pricePerUnit`      | Legacy + новый                             |
| `Product`          | `cost`               | `costPrice`         | Legacy + новый                             |
| `Product`          | `weight`             | `weightKg`          | Дубликат                                   |
| `Product`          | `listPrice`          | `basePrice`         | Возможно дубликат                          |
| `ProductionOrder`  | `plannedStart`       | `plannedStartDate`  | Дубликат                                   |
| `ProductionOrder`  | `plannedEnd`         | `plannedEndDate`    | Дубликат                                   |
| `OrderTask`        | `orderId`            | `productionOrderId` | ⚠️ Дубликат                                |
| `OrderTask`        | `estimatedHours`     | `plannedHours`      | Дубликат                                   |
| `OrderClosing`     | `amount`             | `totalAmount`       | Дубликат                                   |
| `Certificate`      | `issuedBy`           | `issuer`            | Дубликат                                   |
| `Certificate`      | `expiryDate`         | `expiresAt`         | Дубликат                                   |
| `Contract`         | `customerId`         | `clientId`          | Дубликат                                   |
| `DocumentTemplate` | `docType`            | `docTypeId`         | Дубликат                                   |
| `DocumentTemplate` | `backgroundImage`    | `backgroundImages`  | Дубликат                                   |
| `PurchaseRequest`  | `statusId`           | `status`            | Дубликат                                   |
| `Shipment`         | `statusId`           | `status`            | Дубликат                                   |
| `StatusWorkflow`   | `entityType`         | `entity`            | Дубликат                                   |
| `SupplierOrder`    | `supplierOrgId`      | `supplierId`        | Дубликат                                   |
| `SupplierOrder`    | `expectedDate`       | `deliveryDate`      | Дубликат                                   |
| `Tender`           | `statusId`           | `status`            | Дубликат                                   |
| `Counterparty`     | `checkingAccount`    | `Organization.bankAccount` | Унифицировать название          |

### Сущности без `id` PK (нужен PK)

- `Bom`
- `CostCalculation`
- `DocTypeDef`
- `DocumentTableType`
- `EntityAttributeValue`
- `Invoice`
- `Photos`
- `Quotation`
- `ShippingDoc`
- `TechProcess`
- `WorkOrderOperation`

### Сущности без `createdAt` / `updatedAt`

- `Client` (нет ничего из стандартного набора)
- `DocTypeDef`
- `CommercialProposal` (нет ничего из стандартного набора)
- `Invoice`
- `Order` (нет `id`)
- `CounterpartyRole`

---

## Сводная статистика

- **Сущностей:** 89
- **Доменов:** 11
- **Дубликатов пар/троек:** ~16
- **Сущностей без PK `id`:** 11
- **Сущностей без `createdAt`/`updatedAt`:** ~6
- **Потенциально избыточных полей внутри entity:** ~24

---

_Документ сгенерирован автоматически. При внесении изменений в модель — обновляйте соответствующие секции этого документа._
