═══════════════════════════════════════════════════════════════
Z-003: Generic CRUD-база + унификация soft-delete на бэкенде
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Engineer (Platform / DRY)

ЗАВИСИМОСТИ: нет. Полезно, но не обязательно, после Z-001. Серия:
`tasks/_backlog/z-series/README.md` § Z-003.

LAYER: backend (common infrastructure + modules)

CONFLICT KEYS:
backend/src/common/mongoose/*;backend/src/common/db/*;backend/src/database/soft-delete.plugin.ts;backend/src/modules/material/material.service.ts;backend/src/modules/contract/contract.service.ts;backend/src/modules/order/order.service.ts;backend/src/modules/stock-movement/stock-movement.service.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ (верифицировано по коду 2026-08-02)
═══════════════════════════════════════════════════════════════

1. НЕТ generic CRUD-базы. Каждый из ~60 feature-модулей вручную пишет
   одинаковый набор: findAll (с пагинацией), findById, update, remove.
   Пагинация копируется дословно — ср. `material.service.ts:48-73`
   и `user.service.ts:50-66`. Новый CRUD-модуль = ~200 LOC копипасты.
   Это прямой налог на расширение ERP (а их будет много).

2. `optimisticLockPlugin` (common/mongoose) зарегистрирован только на
   4 схемах из ~72: category, material, organization, product. На схемах,
   где правка реальна и конкурентна (order, contract, user, role,
   stock-movement) — НЕТ optimistic-concurrency. Это риск lost-update
   при одновременной правке, особенно в order/contract.

3. Soft-delete implementation расходится с собственным API:
   - Глобальный plugin `database/soft-delete.plugin.ts` корректно
     вешает pre-hooks на find/findOne/countDocuments и фильтрует deletedAt.
     Opt-out — `{ softDelete: false }` для системных схем (audit-log,
     counter, feature-flag, permission, role, ...). Это ЧИСТО.
   - НО services пишут `model.updateOne({_id},{$set:{deletedAt:now}})`
     вручную (material:113, contract:158, order:217, stock-movement:205)
     вместо использования helper-а `.softDelete()`, который plugin
     предоставляет. Две семантики удаления в одной кодовой базе.

4. Listing-фильтрация soft-deleted не везде явная: плагин фильтрует на
   уровне query-hook, но если где-то используется `aggregate` или
   raw `mongoose.model` вне хука — deleted-записи просачиваются
   (нужно проверить в inventory/financial-report/registry; aggregate
   обходит find-hooks). Это потенциальный leak конфиденциальных данных.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Generic CRUD base class в `common/db/` (не обязательно для всех
модулей; opt-in).
  - Создать `BaseCrudService<TDoc, TCreate, TUpdate, TQuery>` с методами:
      findAll(query): Promise<{ items; total; page; limit }>
      findById(id): Promise<TDoc>
      create(dto, session?): Promise<TDoc>
      update(id, dto, session?): Promise<TDoc>
      remove(id, session?): Promise<void>   // через .softDelete() helper
    Конструктор принимает `@InjectModel`-модель.
  - Пагинация — единый helper `paginate(model, query, filter)` — устраняет
    копипасту material/user/etc.
  - НЕ навязывать: модули со сложной доменной логикой (order, contract,
    stock-movement) могут НЕ наследоваться. База — для простых CRUD
    (material, category, unit, work-type, document-template-category и пр.).

ШАГ 2 — Мигрировать 4–6 простых модулей на BaseCrudService как proof:
  - material, category, unit, work-type, organization, document-template-category.
  - Сравнить публичный API контроллеров до/после — zero breaking.
  - Покрыть существующими spec + добавить spec для пагинации.

ШАГ 3 — Расширить `optimisticLockPlugin` coverage на конкурентные схемы:
  - order, contract, user, role, stock-movement, production-order.
  - Для каждого: добавить `version` field + plugin registration.
  - Глобальный interceptor `VersionConflictFilter` уже есть — убедиться,
    что он ловит Mongoose `VersionError` и маппит в 409.
  - e2e/regression: одновременная правка одной сущности двумя запросами →
    второй получает 409, не silent overwrite.

ШАГ 4 — Унифицировать soft-delete через plugin API:
  - Заменить ручные `updateOne({$set:{deletedAt}})` на `model.softDelete()`
    (или эквивалентный helper, который экспозит plugin) во всех service.
  - Добавить lint-правило или grep-проверку в CI: запрет `deletedAt` вне
    common/db и database/.

ШАГ 5 — Audit soft-delete leak в aggregate-paths:
  - `grep -rn "\.aggregate(" backend/src/modules` → для каждого: проверить,
    что pipeline содержит `$match: { deletedAt: null }` (или plugin
    оборачивает). Зафиксировать правило: aggregate ОБЯЗАТЕЛЬНО фильтрует
    deletedAt явно.
  - Подозрительные: financial-report, inventory-summary, registry, audit.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. BaseCrudService создан, adopted ≥4 простыми модулями без breaking API.
2. optimisticLock на order/contract/user/role (+e2e на 409 conflict).
3. Ноль ручных `{$set:{deletedAt}}` вне common/db (grep CI-gate).
4. Все `.aggregate()` в modules явно фильтруют deletedAt — задокументировано.
5. Backend typecheck PASS; Jest PASS (новые spec: pagination helper, conflict).
6. В ARCHITECTURE.md — короткая секция «CRUD base contract» и
   «soft-delete aggregate rule».
7. diff не ломает unrelated модули.

ОГРАНИЧЕНИЯ: НЕ заставлять сложные доменные модули наследовать базу
(order/contract/stock-movement остаются custom). НЕ менять схему
soft-delete (поле deletedAt остаётся). НЕ вводить новый ORM.
migration данных не требуется (version field инициализируется 0).
