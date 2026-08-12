# Аудит маппинга полей КП3 → КП8

> Дата: 2026-08-12 · Источник: VPS `130.49.129.240` (Mongo `kp-app`, `/opt/kppdf/media`)
> Исполнитель: TZ-MIG-301 (agent-buffy) · Staging: `data/from-kp3/`
> Канон имён: «контрагенты» → **Counterparty**, «КП» → **Quotation**, «артикул/код» КП3 `code` → Product.**sku**, «наша фирма» → **Organization**
>
> Схемы КП8 (read-only сверено): `backend/src/modules/product/product.schema.ts`, `counterparty/counterparty.schema.ts`, `organization/organization.schema.ts`, `quotation/quotation.schema.ts`, `category/category.schema.ts`.

## Итог одним абзацем

КП3 выгружен полностью (699 products / 23 counterparties / 28 kps + 690 media-файлов ≈82 MB) в `data/from-kp3/`.
Ядро маппится хорошо: почти все поля — **map** или **rename-synonym** (`code→sku`, `price→listPrice`, `bik→bankBik`, `qty→quantity`, `price(в items)→unitPrice`, `conditions→terms`).
Блокируют MIG-302 только 3 оси: **фото** (нет MCP upload tool), **email контрагента** (нет поля на Counterparty/Organization) и **брендинг КП** (`companySnapshot.assets`/`brandingTemplates` → нет слота в Organization.assets/DocumentTemplate). Всё остальное (строки продуктов без фото, контрагенты без email/фото, сами КП) можно грузить в MIG-302 сразу.

---

## 1. Products (699) → KP8 `Product`

Источник: коллекция `products`. Ключи: `_id, code, name, description, category, subcategory, unit, price, costRub, images[], isActive, kind, notes, createdAt, updatedAt, __v`.

| KP3 field | KP8 field | Вердикт | Комментарий |
|-----------|-----------|---------|-------------|
| `_id` | (новый `_id`) | **map** | через `id-map.template.json`; KP8 ObjectId генерится при создании |
| `code` | `sku` | **rename-synonym** | `required` в KP8; unique по `(organizationId, sku)` |
| `name` | `name` | **map** | |
| `description` | `description` | **map** | 13/699 непустых |
| `category` | `categoryId` | **map** | string → `Category` (словарь, type=`product`); 14 значений + 29 пустых; pre-step для 302 (найти/создать Category по name) |
| `subcategory` | `subcategory` | **map** | строка как есть (666/699 = category) |
| `unit` | `unit` | **rename-synonym** | нормализация: «шт.»→«шт», «м.п.»/«м/п»/«метр»→канон, «компл/комплект»; 9 вариантов |
| `price` | `listPrice` | **rename-synonym** | |
| `costRub` | `costPrice` | **rename-synonym** | 4/699 |
| `images[]` | `photoIds[]` | **gap-block** | связь есть (`ref: Photo`), но **MCP photo upload tool отсутствует** → фото нельзя залить в 301/302 без successor |
| `isActive` | `isActive` | **map** | |
| `kind` (`ITEM`) | `kind` | **rename-synonym** | value-map: `ITEM`→`good` (KP8 enum `good/service/work`) |
| `notes` | `notes` | **map** | |
| `createdAt`/`updatedAt` | `createdAt`/`updatedAt` | **drop-ok** | KP8 `timestamps:true` авто (при желании пересохранить) |
| `__v` | — | **drop-ok** | mongoose version key |

KP8-only поля без источника (не gaps — просто отсутствуют в КП3): `basePrice`, `defaultMarkupPercent`, `stockQty`, `dimensions`, `weightKg`, `ralCode`, `hasPassport/hasDrawing`, `productModuleIds`, `composition`, `organizationId`, `isSystem` → дефолты.

---

## 2. Counterparties (23) → KP8 `Counterparty` (+ `Organization` для «наша фирма»)

Источник: коллекция `counterparties`. Роли: `client` (22), `supplier` (3, пересекается с client), `company` (1, = наша фирма `isOurCompany:true`).

| KP3 field | KP8 field | Вердикт | Комментарий |
|-----------|-----------|---------|-------------|
| `_id` | (новый `_id`) | **map** | id-map |
| `name` | `name` | **map** | |
| `shortName` | `shortName` | **map** | |
| `legalForm` | `legalForm` | **map** | строка: ООО/АО/ИП/МКУ/Другое/Физлицо |
| `legalForm` | `legalType` | **rename-synonym** | derive: ООО→`ooo`, ИП→`ip`, АО→`ao`, иначе `other` |
| `inn` | `inn` | **map** | `required`, unique `(organizationId, inn)` |
| `kpp` | `kpp` | **map** | |
| `ogrn` | `ogrn` | **map** | |
| `role[]` | `roles[]` | **rename-synonym** | value-map: `client`/`supplier` → slug `CounterpartyRole`; `company` → **Organization** |
| `isOurCompany` | `Organization.isOurCompany` | **map** | 1 запись → **Organization** (не Counterparty) |
| `bankName` | `bankName` | **map** | |
| `bik` | `bankBik` | **rename-synonym** | |
| `checkingAccount` | `bankAccount` | **rename-synonym** | |
| `correspondentAccount` | `bankCorrAccount` | **rename-synonym** | |
| `legalAddress` | `legalAddress` | **map** | |
| `actualAddress` | — | **drop-ok** | 0 записей в источнике; на KP8 нет actual-address (появление данных → gap) |
| `phone` | `phone` | **map** | 15/23 |
| `email` | — | **gap-block** | 10/23; на Counterparty/Organization **нет поля email**; кандидат `Person.email` через `contactPersonId` (требует successor/решения) |
| `website` | `website` | **map** | |
| `contacts[]` | — | **drop-ok** | пусто `[]` в источнике |
| `tags[]` | — | **drop-ok** | UI-only legacy |
| `notes` | — | **drop-ok** | 1 запись (наша фирма); не критично |
| `status` (`active`) | `isActive` | **map** | active→true |
| `images[]` | `photoIds[]` | **gap-block** | ось фото (0 файлов в источнике, но gap тот же) |
| `brandingTemplates[]` | `Organization.assets` + `DocumentTemplate` | **gap-block** | только 1 (наша фирма); `assets.kpPage1/kpPage2` (бренд-картинки страниц КП) → нет слота (Organization.assets roles = logo/seal/signature); `conditions` → шаблон |
| `founderName`/`founderNameShort` | `signerName`/`directorName` | **rename-synonym** | 1 запись |
| `isDefaultInitiator` | — | **drop-ok** | KP8 single-org policy = `isOurCompany` |
| `defaultMarkupPercent`/`defaultDiscountPercent` | — | **drop-ok** | 0 значений (все 0) |
| `footerText` | — | **drop-ok** | пусто |
| `sameAddress` | — | **drop-ok** | нет аналога; `legalAddress` используется |
| `createdAt`/`updatedAt` | — | **drop-ok** | timestamps auto |
| `__v` | — | **drop-ok** | |

---

## 3. KPs (28) → KP8 `Quotation`

Источник: коллекция `kps`. Статусы: `draft`/`sent`. 18/28 имеют `counterpartyId`, все 28 имеют `recipient` snapshot + `companyId`. `vatPercent` = 22 у всех.

| KP3 field | KP8 field | Вердикт | Комментарий |
|-----------|-----------|---------|-------------|
| `_id` | (новый `_id`) | **map** | id-map |
| `title` | `title` | **map** | |
| `metadata.number` | `number` | **rename-synonym** | `required unique` |
| `status` | `status` | **map** | draft/sent → draft/sent (KP8 enum шире) |
| `counterpartyId` | `counterpartyId` | **map** | id-map; 18/28; 10 без → resolve по `recipient.inn` или создать CP |
| `companyId`/`companySnapshot.companyId` | `organizationId` | **map** | → Organization (isOurCompany), `required` |
| `vatPercent` (22) | `vatPercent` | **map** | дефолт KP8 20 — передаём 22 |
| `items[]` | `items[]` | **map** | см. §3.1 |
| `conditions[]` | `terms[]` | **rename-synonym** | `string[]` → `QuotationTerm[{text,sortOrder}]` |
| `metadata.validityDays` | `validUntil` | **map** | derive `date + validityDays` |
| `metadata.prepaymentPercent` | `prepaymentPercent` | **map** | |
| `metadata.productionDays` | `productionDays` | **map** | |
| `metadata.photoCropPercent` | `sheetLayout.photoCropYPercent` | **rename-synonym** | |
| `metadata.photoScalePercent` | `sheetLayout.photoScalePercent` | **rename-synonym** | |
| `metadata.showPhotoColumn` | `sheetLayout.showPhotoColumn` | **rename-synonym** | |
| `metadata.tablePageBreakFirstPage` | `sheetLayout.rowsFirstPage` | **rename-synonym** | |
| `metadata.tablePageBreakNextPages` | `sheetLayout.rowsNextPage` | **rename-synonym** | |
| `metadata.tablePageBreakAfter` | — | **drop-ok** | всегда 6; у KP8 только 2 поля layout |
| `metadata.defaultMarkupPercent` | `orgMarkupPercent` | **rename-synonym** | 0 или 59 (1 КП) |
| `metadata.defaultDiscountPercent` | `discountPercent` (+`discountType='percent'`) | **rename-synonym** | 0/20/25 |
| `recipient` (snapshot) | `counterpartyId` (resolve) + банк | **map** | snapshot дублирует CP; импортировать live CP, банк в CP |
| `companySnapshot.assets` | — | **gap-block** | `kpPage1`/`kpPage2` бренд-картинки → нет слота |
| `companySnapshot.texts` | `templateSnapshot`/`designSnapshot` | **drop-ok** | все пустые (0 записей) |
| `companySnapshot.requisitesSnapshot` | — | **drop-ok** | дубль Organization (live ref) |
| `companySnapshot.templateKey/templateName` | `templateId` | **map** | через словарь `DocumentTemplate` |
| `kpType` (`standard`) | — | **drop-ok** | template определяет layout; KP8 нет `kpType` |
| `versions[]` | `versions[]` | **map** | transform → `QuotationVersion{version,frozenAt,frozenBy,payload}` (21 КП без versions, 7 с 1 версией) |
| `createdAt`/`updatedAt` | — | **drop-ok** | timestamps auto |
| `__v` | — | **drop-ok** | |

### 3.1 QuotationItem (KP3 `items[]` → KP8 `QuotationItem`)

127 строк суммарно.

| KP3 item field | KP8 QuotationItem | Вердикт | Комментарий |
|----------------|-------------------|---------|-------------|
| `productId` | `productId` | **map** | id-map |
| `code` | `productSku` | **rename-synonym** | |
| `name` | `productName` | **map** | |
| `description` | `description` | **map** | |
| `unit` | `unit` | **map** | |
| `price` | `unitPrice` | **rename-synonym** | |
| `qty` | `quantity` | **rename-synonym** | |
| `imageUrl` | `photoUrl` | **rename-synonym** | |
| `markupPercent` | `markupPercent` | **map** | 1 строка ≠0 |
| `markupEnabled` | — | **drop-ok** | выводится из percent>0 |
| `discountPercent` | `discountPercent` | **map** | 2 строки ≠0 |
| `discountEnabled` | — | **drop-ok** | |
| — | `lineKind` | derive | `catalog` если productId резолвится, иначе `custom` |
| — | `total` | derive | computed (не source field) |
| — | `sortOrder` | derive | индекс массива |

---

## 4. Photos / media

| Аспект | Статус |
|--------|--------|
| Pack | **OK** — 690 файлов (684 `products` + 6 `kp`) локально, ≈82 MB, зеркало `/opt/kppdf/media` |
| `photos-index.json` | 661 product-запись → `[{url,isMain,sortOrder,context}]` |
| Битые ссылки | **0** (`missing-media.txt` пуст) |
| Legacy-префикс | 10 url вида `/media/products/x` при файле `products/x` → `media-prefix-mismatch.txt` (нормализовать при 302) |
| Orphan файлы | 35 в `media/products` не зарегистрированы в `images[]` (вкл. `kp-1str.PNG` + 19 `product-*.png/jpg` timestamped) → `orphan-media.txt` |
| **MCP upload** | **gap-block** — tool `kppdf_*_photo_upload` отсутствует → `photoIds` нельзя заполнить в 302 без successor |

---

## 5. Counts & samples

| Коллекция | Count (локально = удалённо) | Примеры `_id` |
|-----------|----------------------------|----------------|
| `products` | 699 | `69e86f5333d9e3ff185e7322`, `69e86f5333d9e3ff185e7325`, `69e86f5333d9e3ff185e7328` |
| `counterparties` | 23 | `69e86f9933d9e3ff185e7af6`, `69e86f9933d9e3ff185e7af9`, `69e86f9933d9e3ff185e7afc` |
| `kps` | 28 | `69eb36ec65e66fc71f4482ff`, `69f881845a838fb3dd520ad4`, `69f9d2205a838fb3dd520dc9` |
| `media` | 690 (products 684, kp 6, specs 0) | — |

---

## 6. Decision for PO — список `gap-block`

Блокирует **только эти оси** (по ним в SoT ничего не льём до successor/решения):

1. **Фото** (`Product.photoIds`, `Counterparty.photoIds`): MCP upload tool отсутствует. Файлы лежат локально в `data/from-kp3/media/`; строки продуктов/контрагентов можно грузить без фото.
2. **`Counterparty.email`** (10/23): на Counterparty/Organization нет поля `email`. Варианты: добавить поле (successor-TZ на schema) или `Person.email` через `contactPersonId`.
3. **Брендинг КП** (`companySnapshot.assets`, `counterparty.brandingTemplates`, `kpPage1/kpPage2`): нет слота в `Organization.assets` (roles logo/seal/signature) и `DocumentTemplate`. Затрагивает 1 нашу фирму + снимки 28 КП.

**Pre-step (не gap):** `category` string → `Category` словарь — перед 302 создать/найти Category по name (14 значений + 29 пустых).

**Рекомендация:** MIG-302 можно стартовать сейчас для map/rename части (продукты без фото, контрагенты без email/фото, КП→Quotation целиком по полям §3); фото/email/брендинг — отдельные successor-TZ.
