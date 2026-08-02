═══════════════════════════════════════════════════════════════
Z-002: Оживление фронтового DSL — defineEntity + CRUD-консолидация
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Engineer (Platform / DSL)

ЗАВИСИМОСТИ: нет. Серия: `tasks/_backlog/z-series/README.md` § Z-002.

LAYER: frontend (core/shared DSL + page services)

CONFLICT KEYS:
frontend/src/app/shared/dsl/entity/entity-service.ts;frontend/src/app/shared/dsl/entity/entity-service.spec.ts;frontend/src/app/shared/dsl/entity-list/entity-list.component.ts;frontend/src/app/pages/users/users.entity.ts;frontend/src/app/shared/services/materials.service.ts;frontend/src/app/shared/services/products.service.ts;frontend/src/app/shared/services/organizations.service.ts;frontend/src/app/pages/contracts/contracts.service.ts;frontend/src/app/pages/orders/orders.service.ts;frontend/src/app/pages/inventory/storage-items.service.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ (верифицировано по коду 2026-08-02)
═══════════════════════════════════════════════════════════════

Проект позиционирует DSL-слой (`defineEntity`, `PiEntityListComponent`,
`SubmitGuard`, `silent-http`, `httpResource`) как флагманскую абстракцию.
Реальность:

1. `defineEntity` (shared/dsl/entity/entity-service.ts:129-172) — НОЛЬ
   реальных потребителей. `grep -rln defineEntity` возвращает:
     ./pages/users/users.entity.ts          ← само определение
     ./shared/dsl/entity/entity-service.spec.ts
     ./shared/dsl/entity/entity-service.ts
   Файл `pages/users/users.entity.ts:10` импортируется ТОЛЬКО spec-ом.
   Единственный реальный consumers-кандидат (`users-admin.page.ts`) —
   НИЧЕГО из него не использует, см. п.3.

2. `PiEntityListComponent` (shared/dsl/entity-list/entity-list.component.ts)
   имеет ровно ОДНОГО потребителя: `pages/inventory/storage-items.page.ts`.
   Флагманская list-абстракция не проверена на вариативности.

3. Raw `HttpClient` в страницах (нарушение конвенции GEMINI.md:30
   «не добавляй raw HttpClient в компоненты»). Верифицировано:
     pages/admin/roles-admin.page.ts          ← HttpClient + subscribe
     pages/admin/users-admin.page.ts          ← HttpClient + subscribe
     pages/doc-constructor/builder/builder.page.ts ← HttpClient
     pages/contracts/contracts.service.ts     ← service, но страницы page
     pages/orders/orders.service.ts
     pages/inventory/storage-items.service.ts
     pages/inventory/stock-movements.service.ts
     pages/inventory/warehouses.service.ts
     pages/dictionaries/units.service.ts

4. ~14 канонических CRUD-сервисов вручную копируют ОДНУ И ТУ ЖЕ сигнатуру:
   list/findById/create/update/remove — 5 методов на ~30 строк каждый:
     shared/services/materials.service.ts:57-87
     shared/services/products.service.ts:71-112
     shared/services/organizations.service.ts
     shared/services/categories.service.ts
     shared/services/pi-counterparty.service.ts
     shared/services/pi-document-templates.service.ts
     shared/services/pi-text-blocks.service.ts
     shared/services/pi-work-types.service.ts
     shared/services/pi-product-modules.service.ts
     shared/services/pi-table-templates.service.ts
     shared/services/pi-document-template-categories.service.ts
     shared/services/pi-cost-calculations.service.ts
     pages/contracts/contracts.service.ts
     pages/orders/orders.service.ts
     pages/inventory/storage-items.service.ts
   Каждый — бойлерплейт: URL plumbing, дефолты пагинации, extract-error.
   Фильтры дрейфят (materials хардкодит page/limit inline, фабрика — нет).

5. Две read-примитивы сосуществуют без решения о каноничности:
   `.subscribe(` — 34 файла; `httpResource` — 21 файл. Внутри ОДНОЙ
   страницы (materials.page.ts) смешаны обе. Это две ментальные модели
   загрузки данных.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ (по фазам; можно выдать как 3 подзадачи)
═══════════════════════════════════════════════════════════════

ФАЗА A — Решить судьбу DSL (решение PO, 30 мин).

Если проект намерен держать DSL: переходим к B+C.
Если DSL признан «преждевременной абстракцией»: удаляем defineEntity,
PiEntityListComponent, users.entity.ts (это ~3 файла, чистое удаление).
Рекомендация архитектора: ОЖИВИТЬ. Платформа будет расти, бойлерплейт
по 14 сервисам — это прямой налог на каждую новую сущность.

ФАЗА B — Миграция канонических сервисов на defineEntity (incremental).

ШАГ B1: Для каждого из ~14 сервисов (порядок: materials, products,
organizations, categories — самые простые/каноничные первыми):
  - заменить тело класса на `defineEntity<T, P>({...})` factory-call,
    сохранив имя InjectionToken и публичный API (list/findById/create/
    update/remove) — consumers не должны сломаться;
  - сохранить кастомные методы (если есть) поверх базовых;
  - прогнать существующий spec сервиса; если spec-а нет — покрыть минимально
    (list + create happy path).

ШАГ B2: Подтвердить, что `materials.page.ts` (и peers) работают без
изменений шаблона/вызовов. Цель — zero-diff в pages при миграции service.

ФАЗА C — Ликвидация raw HttpClient в страницах.

ШАГ C1: `pages/admin/users-admin.page.ts` — заменить HttpClient + ручные
  silentPost/Patch/Delete на использование `Users` entity (users.entity.ts
  сегодня мёртв — это и есть его первый реальный consumer). Тем самым
  оживляется и entity, и страница ложится на конвенцию.

ШАГ C2: `pages/admin/roles-admin.page.ts` — аналогично: либо создать
  roles.entity.ts (если CRUD), либо обернуть в roles.service.ts.

ШАГ C3: `pages/doc-constructor/builder/builder.page.ts` — вынести
  HttpClient-вызовы в сервис (builder специфичен, DSL может не подходить;
  тогда — pi-builder.service.ts). Цель: страница не импортирует HttpClient.

ШАГ C4: Инвентарь services (stock-movements, warehouses, storage-items) и
  dictionaries/units — мигрировать по образцу B1.

ФАЗА D — Решение о read-примитиве (fix или зафиксировать).

ШАГ D1: PO/architect фиксирует: `httpResource` — каноническая read-примитив
  для declarative resource-loading (auto-refetch по params); `silent-*`
  остаётся только для mutations внутри handlers.
ШАГ D2: В страницах со смешанным стилем (materials.page.ts и др.)
  привести к единой модели: read = httpResource, mutation = silent-* через
  SubmitGuard. Не делать big-bang — по странице за PR.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. defineEntity имеет ≥3 реальных consumers (не spec), PiEntityList ≥2.
   ИЛИ (если выбрана ветка удаления) — DSL удалён полностью, без orphan.
2. Ни одна страница под pages/ не импортирует `HttpClient` напрямую
   (`grep -rln "import.*HttpClient" pages/` возвращает 0 .ts, не-spec).
3. Мигрированные сервисы сохраняют публичный API — consumers не правятся.
4. Frontend typecheck (`tsc -p tsconfig.app.json --noEmit`) PASS.
5. Frontend Jest PASS; new/updated specs для мигрированных сервисов.
6. lint PASS. `pnpm circular` не新增 циклов (madge).
7. `tasks/_backlog/z-series/README.md` обновлён (зачеркнуть/отметить выполненные фазы).

ОГРАНИЧЕНИЯ: не ломать существующий UX (zero visual diff); не трогать
backend; не вводить новый state-management (NgRx и пр. — REJECTED);
unit-тесты достаточны, e2e опционально. Если DSL оживляется — не
переусложнять factory: текущая сигнатура уже принята в spec.
