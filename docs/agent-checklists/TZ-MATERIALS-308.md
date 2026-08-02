# TZ-MATERIALS-308 checklist

> Executor: Buffy (background run) · Created: 2026-08-02 · Status: **DONE** (archived 2026-08-02)
> TZ: `tasks/_archive/2026-08/TZ-MATERIALS-308-material-stock-link.done.md` · Layer 4 (domain/API)
> Decision: **вариант (A)** — `StorageItem.materialId` nullable + XOR с productId (рекомендация TZ, backend layer уже в `837d278`).

## Context (исходное состояние — проверено 2026-08-02)

- Backend слой для 308 уже закоммичен в `837d278` (intermediate, задачи active):
  - `storage-item.schema.ts` — `materialId?: Types.ObjectId` (ref Material, index) + unique-индексы (warehouseId+materialId+zoneName, partial).
  - `storage-item.service.ts` — `resolveTarget` XOR (productId/materialId), `findAll(materialId)`, populate `materialId`, `adjust` пишет `materialId` в движение.
  - `stock-movement.service.ts` — `StockTarget` + XOR, `applyIn` создаёт/обновляет позицию с materialId, `remove` копирует materialId в reverse-движение.
  - `storage-item.controller.ts` — `POST /materials/:materialId/storage-items`, `GET /storage-items?materialId=`.
  - DTO — `materialId` в create-storage-item / create-stock-movement.
- Отсутствует (этот TZ): FE-интеграция, backend-спеки на material-флоу, docs.

## Acceptance

- [x] Backend e2e: XOR productId+materialId → 400; PATCH смена на productId при materialId → 400; material create → позиция с materialId; движение in/out для материала меняет quantity; movement с обоими → 400; material create НЕ создаёт позицию; dashboard метрики включают материал; low-stock включает материал.
- [x] Backend unit (новые): `storage-item.controller.spec.ts` + `inventory.controller.spec.ts` — envelope {items,total} и метрики (6/6).
- [x] FE `StorageItem` тип: `materialId`/`material` + `storageItemName()` helper.
- [x] `storage-items.page` — колонка «Продукт/Материал» + фильтр `?materialId=` + подпись «Материал: …».
- [x] `inventory-dashboard.page` — low-stock таблица показывает материал.
- [x] `materials.page` — колонка-ссылка «Склад →» (routerLink на `/storage-items?materialId=`, read-only).
- [x] FE-тесты: 55/55 (storage-items.page.spec + materials.page.spec обновлены).
- [x] Docs: `data-model.md` (StorageItem.materialId, StockMovement.materialId, stockQty note), `storage-items.page.md`, `materials.page.md`, `inventory-dashboard.page.md`, `PAGE-TZ-INDEX.md`.
- [x] Gates: backend tsc ✓ · frontend tsc ✓ · frontend jest 55/55 ✓ · ng build ✓ · `git diff --check` PASS ✓.
- [ ] ~~backend e2e повторно~~ — **внешний блокер**: параллельная RBAC-сессия (TZ-ACCESS-301) сломала DI всего e2e-раннера (`AuthService` → `RoleService` не зарегистрирован в AuthModule). Мой e2e-спек `materials-stock` проходил 9/9 ДО их правок; envelope-контракт подтверждён unit-тестами контроллеров.
- [x] `## Executor report (auto)` заполнен.

## Notes / decisions

- (A) выбран: меньше кода, единый flow приходов/расходов, единый inventory-dashboard (рекомендация TZ).
- Приход/расход остаётся в рамках существующих операций; новый складской функционал НЕ вводим.
- Material create не создаёт складскую позицию (boundary TZ-304).
- Миграция данных НЕ требуется (materialId nullable, partial indexes).
- **Контракт-фикс:** `GET /storage-items` и `GET /inventory/low-stock` теперь отдают envelope `{items,total}` (FE entity-list/dashboard/service-spec уже ожидали envelope; ранее голый массив не рендерился). Единственный e2e-потребитель голого массива (`warehouse.e2e-spec`) обновлён.
- Колонка «Склад» в materials.page использует legacy-ключ `stockQty` (ColumnDef.key требует `keyof Material`; виртуальные ключи типом запрещены), рендер — cellTemplate.
- `text-ink-1` (несуществующий токен) заменён на `text-primary` по ревью.
- Code review (deepseek-flash): замечания учтены (потребители массива проверены — только warehouse.e2e; токен `text-ink-1`; lazy materials lookup отклонён — `url: ''` в httpResource не работает как disabled, оставлен безусловный lookup).

## Executor report (auto)

- TZ-MATERIALS-308 выполнен (Layer 4, материал→склад, вариант A).
- Backend: envelope-контракт для `/storage-items` и `/inventory/low-stock` (align с FE); unit-спеки контроллеров (6/6). Backend layer (XOR, materialId, индексы, эндпоинты) был уже в `837d278`.
- E2E `materials-stock.e2e-spec.ts`: 9 тестов, проходили 9/9 до чужого DI-блокера; повторный прогон отложен до закрытия TZ-ACCESS-301.
- Frontend: storage-items (Продукт/Материал + ?materialId фильтр), inventory-dashboard (материал в low-stock), materials.page («Склад →» ссылка). Тесты 55/55.
- Gates: tsc ×2 ✓, frontend jest ✓, ng build ✓, git diff --check ✓.
- Push/commit НЕ выполнялись (правило: только по запросу PO).
- AC: материал → склад → приход → остаток виден в storage-items/dashboard подтверждён e2e (до блокера) + unit.
