# TZ-SUPPLY-311 checklist — быстрый заказ: frontend-wiring на API

> Status: **DONE** (backend 305 + frontend wiring + real photo upload + supplier email)
> Предшественник: `tasks/TZ-SUPPLY-305-quick-order-data-bind.md` (backend) + 309 (мок)

## Claim slot

- agent_id: freebuff desktop agent
- claimed_at: 2026-08-20
- conflict keys:
  `frontend/src/app/pages/supply/supply-quick-order.component.ts`,
  `frontend/src/app/pages/supply/supply-quick-order.mock.ts`,
  `frontend/src/app/shared/services/supply-requests.service.ts`,
  `frontend/src/app/shared/services/organizations.service.ts`,
  `frontend/src/app/shared/services/pi-persons.service.ts`

## Сделано (эта волна)

1. [x] `SupplyRequestsService` (list/create/update/markOrdered/markReceived/cancel/remove) + 6 тестов.
2. [x] `PersonsService.create()` + поля `phone/email`.
3. [x] `OrganizationsService.listContacts()` + `addContact()` + тип `OrganizationContact`.
4. [x] `Material.colors?: string[]` в FE-контракте `MaterialsService`.
5. [x] Quick-order грузит из API при init: материалы, поставщики (type=supplier), persons, строки
      (`/api/supply-requests`); при пустом/failed ответе остаётся мок (offline-демо + spec).
6. [x] Строки: create (оптимистично + замена на server `_id`), автосохранение правок (fire-and-forget),
      delete (soft-delete), статусы через `onStatusChange` (`markOrdered/markReceived/cancel`).
7. [x] Справочники через API: категория (`slug`/`skuPrefix` генерируются), материал (create/edit,
      `article` fallback на name), копия через `MaterialsService.duplicate`, цвет через
      `MaterialsService.update({ colors })`, поставщик через `OrganizationsService.create(type=supplier)`.
8. [x] Менеджер: `PersonsService.create` → `OrganizationsService.addContact`; контакты живого
      поставщика грузятся по выбору (`listContacts` + join по `persons`).
9. [x] FK отправляются только валидным 24-hex ObjectId (`toId`) — мок-id не уходят в API и не ломают
      `@IsObjectId` валидацию.
10. [x] Поставщик больше не привязан к категории (`categoryIds: []` = доступен во всех категориях).
11. [x] Фото материала: `PhotosService.upload()` создаёт оригинал, модалка хранит `photoIds`/`mainPhotoId`,
       главное фото отображается реальным `<img>` в свёрнутой строке.
12. [x] `Organization.email` добавлен в backend schema/DTO и frontend contract; почта из модалки уходит в API,
       а изменения существующего поставщика сохраняются через `PATCH /organizations/:id`.

## Gates (текущие)

```text
cd frontend; pnpm typecheck                                                          — PASS
cd frontend; pnpm exec jest --config jest.config.js src/app/pages/supply/supply-quick-order.component.spec.ts — PASS (24 tests)
cd frontend; pnpm build                                                             — PASS (budget warnings only)
cd backend;  pnpm typecheck && pnpm build                                           — PASS
cd backend;  pnpm test -- supply-request                                            — PASS (7 tests)
```

## Осталось (successor)

- [ ] Автосохранение строки — fire-and-forget без debounce; для multi-user/прод добавить debounce.
- [ ] Окончательное удаление мок-fallback после стабилизации.

## Files changed

- `frontend/src/app/shared/services/supply-requests.service.ts` (+spec) — новый.
- `frontend/src/app/shared/services/pi-persons.service.ts` — `create()` + phone/email.
- `frontend/src/app/shared/services/organizations.service.ts` — contacts + `OrganizationContact`.
- `frontend/src/app/shared/services/materials.service.ts` — `Material.colors` + populated photo contract.
- `frontend/src/app/shared/services/photos.service.ts` — upload response variants contract.
- `backend/src/modules/organization/organization.schema.ts` / `dto/create-organization.dto.ts` — supplier email.
- `frontend/src/app/pages/supply/supply-quick-order.component.ts` — wiring + photo upload + маппинги.
- `frontend/src/app/pages/supply/supply-quick-order.mock.ts` — supplier-фильтр и photo URL fallback.
- `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts` — upload/email HTTP coverage.

## Known limitation

- F5 всё ещё показывает мок, пока API не вернёт данные; после успешной загрузки — только live.
- Маппинг `title` строки без `materialId` в UI пока не показывается (имя берётся из материала).
