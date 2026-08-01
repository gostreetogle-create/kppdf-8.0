# Справочник сущностей kppdf-8.0 (для AI-нормализации)

> Карта ключевых полей сущностей на основе реальных схем `backend/src/modules/*`.
> Обновлять при изменениях бэкенда. Полные схемы: `backend/src/modules/<entity>/<entity>.schema.ts`.

---

## Продукты (`products`)

| Поле | Тип | Обязательное | Примечание |
|---|---|---|---|
| `name` | string | ✅ | Наименование |
| `sku` | string | — | Артикул, unique (sparse) |
| `kind` | `good` \| `service` \| `work` | ✅ | По умолчанию `good` |
| `unit` | string | ✅ | Единица измерения, по умолчанию `шт` |
| `categoryId` | ObjectId | — | FK → categories |
| `subcategory` | string | — | Подкатегория |
| `status` | `new` \| `active` \| `archived` \| `draft` | — | По умолчанию `new` |
| `listPrice` / `basePrice` / `costPrice` | number | — | Цены, по умолчанию 0 |
| `defaultMarkupPercent` | number | — | По умолчанию 30 |
| `stockQty` | number | — | Остаток, по умолчанию 0 |
| `description` / `notes` | string | — | |
| `dimensions` | {length, width, height, unit} | — | Габариты |
| `weightKg` | number | — | |
| `ralCode` | string | — | Цвет RAL |
| `hasPassport` / `hasDrawing` | boolean | — | |
| `isActive` | boolean | — | По умолчанию true |
| `purpose` / `installation` | string | — | Назначение, монтаж |

## Материалы (`materials`)

| Поле | Тип | Обязательное | Примечание |
|---|---|---|---|
| `name` | string | ✅ | Наименование |
| `article` | string | — | Артикул |
| `sku` | string | — | unique (sparse) |
| `unit` | string | ✅ | FK → Unit.key: m2/m3/kg/sheet/pcs/... |
| `categoryId` | ObjectId | — | FK → categories |
| `description` | string | — | |
| `pricePerUnit` | number | — | Всегда RUB |
| `stockQty` | number | — | Остаток |
| `dimensions` | array | — | `[{type: length\|width\|height\|thickness\|diameter\|depth, value, isImmutable}]`, мм |
| `supplierId` | ObjectId | — | FK → organizations |
| `notes` | string | — | |

## Контрагенты (`counterparties`)

| Поле | Тип | Обязательное | Примечание |
|---|---|---|---|
| `name` | string | ✅ | Наименование |
| `shortName` | string | — | Краткое имя |
| `legalForm` | string | — | ООО/ИП/... |
| `roles` | string[] | — | Роли (slug) |
| `inn` | string | ✅ | ИНН, unique |
| `kpp` / `ogrn` | string | — | |
| `bankName` / `bankBik` / `bankAccount` / `bankCorrAccount` | string | — | Реквизиты |
| `signerName` / `signerPosition` | string | — | Подписант |
| `isActive` | boolean | — | По умолчанию true |
| `type` | string[] | — | |
| `legalType` | `ooo` \| `ip` \| `pao` \| `ao` \| `other` | — | |
| `website` / `directorName` | string | — | |
| `paymentTermDays` | number | — | По умолчанию 10 |
| `vatRate` | number | — | По умолчанию 20 |

## Прочие сущности (ссылки на схемы)

| Сущность | Файл схемы |
|---|---|
| Организации | `backend/src/modules/organization/organization.schema.ts` |
| Виды работ | `backend/src/modules/work-type/work-type.schema.ts` |
| Категории | `backend/src/modules/category/category.schema.ts` |
| Модули | `backend/src/modules/product-module/product-module.schema.ts` |
| Заказы | `backend/src/modules/order/order.schema.ts` |
| Документы | `backend/src/modules/document-template/` + `generated-document/` |
