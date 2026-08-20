# TZ-SUPPLY-305 — Быстрый заказ: backend-сущность SupplyRequest + цвета материала

**Status:** READY (проверен domain preflight 2026-08-20; решения PO приняты дефолтом)

```
PAGES: /supply (backend API для frontend-wiring в TZ-SUPPLY-311)
ROLE: backend executor (NestJS + Mongoose)
DEPENDS ON: TZ-SUPPLY-304 DONE (mock UI), TZ-SUPPLY-309 DONE (цвета/фото/контакт в моке)
SUCCESSOR: TZ-SUPPLY-311-quick-order-frontend-wiring.md
LAYER: backend (schema, module, API, seed, migration)
CONFLICT KEYS: backend/src/modules/supply/** ;
  backend/src/modules/material/material.schema.ts ;
  backend/src/app.module.ts ;
  backend/src/common/seed/statuses.seed.ts  (НЕ трогать — статусы остаются enum, см. ниже)
```

## Domain preflight (проверено в коде)

- `backend/src/modules/supply/supply-task.schema.ts` — `SupplyTask` требует `orderId` (required) → быстрый заказ **нельзя** класть в SupplyTask без обязательного заказа.
- `backend/src/modules/purchase-request/purchase-request.schema.ts` — легаси-гибрид (`number` required unique, `entityType`/`entityId` required, два поля статуса: `statusId` + `status`) → переиспользовать **не** будем.
- `backend/src/modules/material/material.schema.ts` — есть `photoIds`/`mainPhotoId`, `categoryId`, `supplierId`, `unit` (required), `article` (required у новых). **Нет** `colors`.
- `backend/src/modules/organization/…` + `contacts/organization-contact.schema.ts` — поставщик = `Organization` (type `supplier`); менеджер = `Person` + `OrganizationContact` (связь `organizationId → personId`, `isPrimary`, `role`).
- `backend/src/modules/person/person.schema.ts` — `Person` (lastName, firstName, patronymic, phone, email, position).
- `backend/src/modules/status/entity-status.schema.ts` — EntityStatus dict. **Не используем в 305**: sibling `SupplyTask` уже хранит статус строковым enum, повторяем этот канон.
- `backend/src/main.ts` — global prefix `/api`; глобальные `JwtAuthGuard` + `PermissionsGuard` + `RolesGuard`; контроллеры гейтятся через `@Roles(...)`.
- `backend/src/common/seed/statuses.seed.ts` — seed по `entityType`; НЕ нужен для 305 (enum).

Канон имён (TZ-AUTHORING §1.1):
- Поставщик = `Organization` (type `supplier`) → `supplierId`.
- Менеджер/контакт = `OrganizationContact` → `supplierContactId` (а не Worker — мок-комментарий 308 устарел).
- Наша компания = `Organization` → `companyId`.
- Материал = `Material` → `materialId`; цвет строки = `color` (одно из `Material.colors`).

## ИСХОДНОЕ СОСТОЯНИЕ

1. Quick-order (`/supply?view=quick`) живёт на моке `supply-quick-order.mock.ts`; строки хранятся in-memory, F5 сбрасывает.
2. Реестр `view=registry` уже подключён к `SupplyTaskService` (`/api/supply-tasks`).
3. Справочники уже имеют API: `/api/categories`, `/api/materials` (+`/duplicate`), `/api/organizations`, `/api/persons`, `/api/organizations/:orgId/contacts`, `/api/photos` (+`/upload`).
4. `Material` не имеет `colors`; quick-order мок хранит `QuickOrderMaterial.colors`.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — `Material.colors`

1. В `material.schema.ts` добавить `@Prop({ type: [String], default: [] }) colors?: string[];`
   (обычный массив строк; без unique — дедупликация на сервисе).
2. Миграция **не требуется** (отсутствующее поле = пустой список). Индекс не нужен.

### ШАГ 2 — Сущность `SupplyRequest`

Новый `backend/src/modules/supply/supply-request.schema.ts`, collection `supplyrequests`, timestamps:

- `title?: string` — свободное наименование (когда нет materialId)
- `categoryId?: ObjectId ref Category` (index)
- `materialId?: ObjectId ref Material` (index)
- `article?: string` — snapshot артикула материала
- `color?: string` — выбранный цвет строки
- `productUrl?: string`
- `supplierId?: ObjectId ref Organization` (index)
- `supplierContactId?: ObjectId ref OrganizationContact` (index)
- `companyId?: ObjectId ref Organization`
- `requestedBy?: string`
- `orderId?: ObjectId ref ProductionOrder` (index)
- `qty: number` default 1, min 0
- `unit?: string`
- `neededBy?: Date`
- `status: 'in_progress'|'requested'|'ordered'|'received'|'cancelled'` default `in_progress` (index)
- `priority: 'urgent'|'normal'|'low'` default `normal`
- `notes?: string`
- `priceHint?: number`
- `lineTotal?: number`
- `supplierOrderDate?: Date`
- `responsible?: string`
- `linkedSupplyTaskId?: ObjectId ref SupplyTask` (index) — для spawn при «Заказано»
- `deletedAt?: Date|null` default null (index) — soft-delete как SupplyTask

Индексы: `{ status: 1, createdAt: -1 }`, `{ deletedAt: 1 }`.

### ШАГ 3 — DTO

`backend/src/modules/supply/dto/supply-request.dto.ts`:
- `CreateSupplyRequestDto` — все опциональные кроме `qty`/`status`/`priority` (имеют defaults);
  `qty?: number`, `unit?: string`, `title?`, `categoryId?`, `materialId?`, `article?`, `color?`,
  `productUrl?`, `supplierId?`, `supplierContactId?`, `companyId?`, `requestedBy?`, `orderId?`,
  `neededBy?`, `status?`, `priority?`, `notes?`, `priceHint?`, `lineTotal?`,
  `supplierOrderDate?`, `responsible?` (class-validator: `@IsOptional`, `@IsMongoId` на FK,
  `@IsString`/`@IsNumber`/`@IsDateString`/`@IsIn` по типу).
- `UpdateSupplyRequestDto` — `PartialType(CreateSupplyRequestDto)`.
- Валидация: нельзя `ordered` без `orderId`+`materialId` **на spawn**, не на create (создание строки допускается без заказа).

### ШАГ 4 — Сервис `SupplyRequestService`

`backend/src/modules/supply/supply-request.service.ts`:
- `findAll({ status?, priority?, search? })` — фильтр + sort `priority`(weight) ↓, `createdAt` ↓; исключать `deletedAt != null`.
- `findById(id)` — 404 если нет/удалён.
- `create(dto)` — `title = dto.title ?? material.name` (если materialId задан), `article` snapshot из материала если не передан; `status='in_progress'`, `priority='normal'`.
- `update(id, dto)` — merge; при смене `materialId` обновить `article`/`unit`/`title` snapshot если не заданы явно.
- `markOrdered(id)` — `status='ordered'`; **spawn** `SupplyTask` только если `orderId` && `materialId`:
  создать через `SupplyTaskService.create({ orderId, materialId, qty, title, notes })` (status draft),
  сохранить `linkedSupplyTaskId`. Иначе просто статус `ordered` без link (не ошибка).
- `markReceived(id)` — `status='received'`.
- `cancel(id)` — `status='cancelled'`.
- `remove(id)` — soft-delete `deletedAt=now` (не физическое удаление).

### ШАГ 5 — Контроллер + модуль

`backend/src/modules/supply/supply-request.controller.ts` — `@Controller('supply-requests')`:
- `GET /` `@Roles('admin','director','manager','user')` — list (`status`, `priority`, `search` query).
- `GET /:id` — findById.
- `POST /` `@Roles('admin','manager')` + `@AuditAction({ action:'create', entityType:'SupplyRequest' })`.
- `PATCH /:id` `@Roles('admin','manager')` + audit update.
- `POST /:id/ordered` `@Roles('admin','manager')` + audit.
- `POST /:id/received` `@Roles('admin','manager')`.
- `POST /:id/cancel` `@Roles('admin','manager')`.
- `DELETE /:id` `@Roles('admin','manager')` + `@HttpCode(NO_CONTENT)`.

`supply-request.module.ts` — регистрирует `SupplyRequest` schema + service + controller;
импортирует `SupplyModule` (для `SupplyTaskService`). Зарегистрировать модуль в `app.module.ts`.

### ШАГ 6 — Тесты

`supply-request.service.spec.ts` (unit, mock model как в `supply-task.service.spec.ts`):
- create: title из материала, дефолты status/priority, qty.
- create без materialId: title обязателен (BadRequest).
- update: snapshot article/unit при смене materialId.
- markOrdered без orderId/materialId: только статус, `linkedSupplyTaskId` undefined, `SupplyTaskService.create` не вызван.
- markOrdered с orderId+materialId: вызывает `SupplyTaskService.create`, сохраняет `linkedSupplyTaskId`.
- remove: soft-delete (deletedAt set).
- findById: 404.

## ИЗМЕНЯТЬ

- `backend/src/modules/supply/**` (добавить schema/dto/service/controller/module)
- `backend/src/modules/material/material.schema.ts` (поле `colors`)
- `backend/src/app.module.ts` (регистрация нового модуля)

## НЕ ИЗМЕНЯТЬ

- `supply-task.schema.ts` / `supply-task.service.ts` / `supply-task.controller.ts` (реестр) — только вызов `SupplyTaskService.create` из нового сервиса.
- `purchase-request/**`, `purchase-order/**`, `order/**`.
- `statuses.seed.ts` и EntityStatus — статусы 305 = строковый enum (канон SupplyTask).
- Справочники (`category`, `organization`, `person`, `organization-contact`, `photos`) — уже готовы.
- Frontend — это TZ-SUPPLY-311.

## КРИТЕРИИ ПРИЁМКИ

1. `Material.colors?: string[]` в схеме; `POST/PATCH /api/materials` принимает `colors`.
2. `POST /api/supply-requests` создаёт строку с дефолтами `status=in_progress`, `priority=normal`, `qty=1`.
3. `GET /api/supply-requests` фильтрует по status/priority и ищет по title/article/notes (search).
4. `PATCH /api/supply-requests/:id` обновляет поля и snapshot article/unit при смене материала.
5. `POST /api/supply-requests/:id/ordered` при наличии orderId+materialId создаёт `SupplyTask` и сохраняет `linkedSupplyTaskId`; без них — просто `status=ordered`.
6. `DELETE` — soft-delete (строка исчезает из list, документ остаётся).
7. Контроллер гейтится ролями как выше; audit на create/update/ordered.
8. Модуль зарегистрирован в `app.module.ts`, бэкенд собирается.

```text
cd backend && pnpm typecheck
cd backend && pnpm test -- supply-request  (unit, mock model — без Mongo)
```

## known_limitation

- Без org-scope (`organizationId`) как у существующего `SupplyTask`; мульти-орг скоупинг — successor.
- Статусы — строковый enum, не редактируются в админ-справочнике (EntityStatus) — осознанный выбор.
- Spawn SupplyTask требует `orderId` (контракт реестра); строки без заказа при «Заказано» не линкуются.
- Реальный upload фото и фронт-wiring — `TZ-SUPPLY-311`.

## Промпт исполнителю

```text
CLAIM первым (до кода): прочитай docs/TZ-AUTHORING.md + этот TZ, проверь
tasks/_active-map и чужие _active keys по backend/src/modules/supply/** → конфликт = STOP.
Затем реализуй ШАГ 1–6, прогони `pnpm typecheck` и `pnpm test -- supply-request`.
Не трогай frontend и существующий supply-task write-path.
```
