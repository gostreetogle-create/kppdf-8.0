# TZ-SUPPLY-311 — Быстрый заказ: frontend-wiring на реальный API

**Status:** DONE (выполнено 2026-08-20)

```
PAGES: /supply
ROLE: frontend executor (Angular standalone, signals, Paper & Ink)
DEPENDS ON: TZ-SUPPLY-305 DONE (backend /api/supply-requests + Material.colors)
LAYER: frontend (services + quick-order component)
CONFLICT KEYS: frontend/src/app/pages/supply/** ;
  frontend/src/app/shared/services/** (новый supply-requests.service.ts)
```

## Domain preflight

- Бэкенд-контракт 305: `POST/GET/PATCH /api/supply-requests`, `POST /:id/ordered|received|cancel`, `DELETE`.
- `Material.colors?: string[]`, `Material.photoIds/mainPhotoId` уже в контракте `MaterialsService`.
- Существующие сервисы: `MaterialsService` (create/update/duplicate), `CategoriesService` (create/list),
  `OrganizationsService` (create/list type=supplier), `PersonsService` (list — **добавить create**),
  `SupplyTaskService` (реестр).
- Контакт менеджера = `POST /api/persons` + `POST /api/organizations/:orgId/contacts { personId }`.
- Фото: `POST /api/photos/upload` (multipart) → `photoId`; `MaterialsService.update(id,{ photoIds, mainPhotoId })`.
- `silent-http` helpers (`silentGet/silentPost/silentPatch/silentDelete` + `SilentResult`).

## ИСХОДНОЕ СОСТОЯНИЕ

Quick-order компонент держит всё в signals-моке (`supply-quick-order.mock.ts`); справочники и строки in-memory, F5 сбрасывает. Бэкенд по 305 готов принимать строки и отдавать список.

## ЧТО ДЕЛАТЬ

### ШАГ 1 — `SupplyRequestsService` (новый)

`frontend/src/app/shared/services/supply-requests.service.ts`:
- Типы: `SupplyRequestStatus`/`SupplyRequestPriority` (как мок), `SupplyRequest` (маппинг полей 305:
  `_id`, `title`, `categoryId`, `materialId`, `article`, `color`, `productUrl`, `supplierId`,
  `supplierContactId`, `companyId`, `requestedBy`, `orderId`, `qty`, `unit`, `neededBy`, `status`,
  `priority`, `notes`, `priceHint`, `lineTotal`, `supplierOrderDate`, `responsible`,
  `linkedSupplyTaskId`, `createdAt`), `CreateSupplyRequestDto`, `UpdateSupplyRequestDto`.
- Методы: `list({status?,priority?,search?})`, `create(payload)`, `update(id, patch)`,
  `markOrdered(id)`, `markReceived(id)`, `cancel(id)`, `remove(id)` — все через `silent*`.

### ШАГ 2 — Загрузить справочники из API при init

В quick-order компоненте заменить мок-массивы на данные сервисов (keep mock seed только как
fallback при `!res.ok` — для offline-демо):
- категории: `CategoriesService.list('material')` → `{ id: _id, label: name }`.
- материалы: `MaterialsService.list({ limit: 500 })` → маппинг в `QuickOrderMaterial`
  (`id: _id`, `colors`, `photos` из `photoIds`+`mainPhotoId`).
- поставщики: `OrganizationsService.list({ type: 'supplier', limit: 500 })`.
- контакты: по выбранному `supplierId` — `GET /api/organizations/:orgId/contacts` + `GET /api/persons`
  (добавить в `PersonsService.create(payload)`).

### ШАГ 3 — Персист строк

- `onCreate()` → `SupplyRequestsService.create(...)` → подставить `_id` и reload списка.
- `patchRow()` → debounce `update(id, patch)` (или по сохранению); ошибку показывать toast, не терять ввод.
- Удаление → `remove(id)`.
- «Заказано» / «Получено» / «Отменено» → `markOrdered/markReceived/cancel`.
- При `ordered` и наличии link — показывать бейдж `linkedSupplyTaskId` (реестр) без навигации.

### ШАГ 4 — Создание справочников через API (заменить мок-модалки)

- Категория: `CategoriesService.create({ name, type: 'material', ... })`.
- Материал (new/edit/copy): `MaterialsService.create/update/duplicate`; цвета — массив `colors`;
  edit предзаполняет; copy зовёт `duplicate(id)`.
- Поставщик: `OrganizationsService.create({ name, type: ['supplier'], website, ... })`.
- Менеджер: `PersonsService.create({ lastName, firstName, patronymic, phone, email, position })` →
  `POST /api/organizations/:orgId/contacts { personId }` → выбрать контакт в строке.
- Цвет материала: `MaterialsService.update(materialId, { colors: [...new] })`.

### ШАГ 5 — Реальный upload фото материала

- [x] В модалке материала file input вызывает `PhotosService.upload()` → `POST /api/photos/upload`.
- [x] `photoIds`/`mainPhotoId` сохраняются через `MaterialsService.create/update`.
- [x] Главное фото (★) — установка `mainPhotoId`; миниатюра в свёрнутой строке использует URL оригинала/thumbnail.
- [x] `Organization.email` добавлен в backend schema/DTO; почта поставщика передаётся при создании и PATCH-редактировании.
- [x] Quick-order modal требует ИНН, потому что backend Organization contract делает его обязательным.

### ШАГ 6 — Переходный период и откат

- Держать `supply-quick-order.mock.ts` как offline-fallback и для spec-тестов, но по умолчанию
  компонент читает/пишет через API (без полного удаления мока в этой волне).

### ШАГ 7 — Тесты

- `supply-requests.service.spec.ts` — методы строят правильные URL/payload (HttpTestingController).
- `supply-quick-order.component.spec.ts` — mock-сервисы через DI: init грузит справочники,
  create/delete вызывают сервис, ошибка не роняет компонент.

## ИЗМЕНЯТЬ

- `frontend/src/app/shared/services/supply-requests.service.ts` (новый)
- `frontend/src/app/shared/services/pi-persons.service.ts` (добавить `create`)
- `frontend/src/app/pages/supply/supply-quick-order.component.ts` (wiring + upload)
- `frontend/src/app/pages/supply/supply-quick-order.mock.ts` (типы/fallback)
- `frontend/src/app/shared/services/index.ts` (если там центральный реэкспорт)

## НЕ ИЗМЕНЯТЬ

- `supply.page.ts` реестр (уже на SupplyTaskService) и `supply-task` backend.
- UI-раскладку/канон (модалки, три карточки, цвета) — только data-источники.
- `PurchaseRequest`/`PurchaseOrder`.
- Публичные `data-test` hooks (уже используются в 20+ тестах).

## КРИТЕРИИ ПРИЁМКИ

1. Список заявок грузится из `/api/supply-requests`; создание/правка/удаление/статусы пишут в API.
2. Справочники (категория/материал/поставщик/менеджер/цвет) создаются через реальные endpoint'ы.
3. Цвета материала сохраняются в `Material.colors` и подхватываются при повторном выборе.
4. Фото материала грузится через `/api/photos/upload`, `photoIds`/`mainPhotoId` сохраняются, главное фото отражается в свёрнутой строке.
5. Почта поставщика сохраняется в `Organization.email`; для создания поставщика UI запрашивает обязательный ИНН.
5. Менеджер создаётся как `Person` + `OrganizationContact` и привязывается к строке.
6. При недоступном API компонент не падает (fallback на мок + toast об ошибке).
7. Existing tests (28 supply) остаются зелёными; добавлены тесты сервиса.

```text
cd frontend && pnpm typecheck
cd frontend && pnpm exec jest --config jest.config.js supply
cd frontend && pnpm build
```

## known_limitation

- Debounce/оптимистичный UI — упрощённый (сохранение по изменению поля); real-time коллизий нет (single-user).
- Offline-fallback держим временно; окончательное удаление мока — отдельная гигиеническая волна.
- Multi-org scope и EntityStatus-статусы — successor (см. 305 known_limitation).
