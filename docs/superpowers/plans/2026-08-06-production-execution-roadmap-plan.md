# План: Production Execution после Gantt 303

> **Тип документа:** PLAN / DRAFT FOR REVIEW
> **Статус:** СОХРАНЁН ДЛЯ ОБСУЖДЕНИЯ · НЕ УТВЕРЖДЁН · НЕ К ИСПОЛНЕНИЮ
> **Дата аудита:** 2026-08-06
> **База аудита:** `origin/main` `2fbc5325`
> **Правило:** этот файл не является executable TZ и не разрешает менять код, создавать `_active` claims, locks, архивы или выполнять production-действия.

## Как использовать этот план

При следующем запросе PO «выполнить Production 304–307» агент обязан сначала:

1. перечитать этот план и свежие production-документы;
2. проверить актуальный `origin/main`, локальный worktree, активные claims и conflict keys;
3. повторно проверить фактические схемы, контроллеры, API и архивы;
4. сверить план с бизнес-логикой `Order → ProductionOrder → OrderTask` и с каноном Design Verification;
5. найти уже выполненные, устаревшие, дублирующие или опасные пункты;
6. предложить обновлённую редакцию очереди, границ и acceptance criteria;
7. задать PO вопросы только по решениям, которые нельзя безопасно вывести из канона;
8. ждать явного подтверждения обновлённого плана;
9. только после подтверждения создать отдельную executable TZ и пройти обычный `CLAIM → gates → review → archive` flow.

Фразы «делай производство», «выполняй 304–307», «поехали» или «выполни план» без подтверждения обновлённой редакции **не считаются разрешением**. До подтверждения разрешены только read-only аудит и правки этого plan-документа.

Каноническая фраза разрешения:

```text
Утверждаю обновлённый Production Execution план; создавай TZ
```

## Цель

Безопасно перейти от визуальной страницы `/production` и плановой оценки 303 к operational production-контуру, в котором:

- коммерческий `Order` порождает конкретный `ProductionOrder` в определённый момент процесса;
- `ProductionOrder` после утверждённой инстанциации имеет зафиксированную историю состава и операций;
- `OrderTask` является Source of Truth для фактических операций, назначений и статусов;
- worker/manager check-in не меняет каталог и не записывает факт в визуальные Gantt bars;
- автоматическая цепочка выполняется идемпотентно и по зависимостям задач;
- завершение производства один раз передаёт заказ в shipping-контур;
- 303 остаётся честной plan-estimate поверх каталога и не притворяется цеховым фактом.

## Текущий проверенный контекст

На момент аудита в проекте присутствуют два backend-контура, которые нельзя развивать как равноправные SoT без отдельного решения:

```text
ProductionOrder → OrderTask
WorkOrder → WorkOrderOperation
```

Рекомендация плана: новым operational-функциям использовать **`ProductionOrder → OrderTask`**. `WorkOrder` / `WorkOrderOperation` считать legacy-контуром до отдельного аудита фактического использования и миграционной стратегии. Не создавать новые check-in/auto-chain записи одновременно в оба контура.

Текущее состояние `ProductionOrder` уже включает:

- product, quantity, status и planned dates;
- генерацию задач из текущих TechProcess/BOM при создании;
- `OrderTask` со статусом, worker, зависимостями, planned/actual dates и `complete()`;
- endpoint `GET /production-orders/:id/tasks`.

Это **не означает**, что P2 уже реализован: текущий `ProductionOrderService.create()` не создаёт задачи из утверждённого immutable production snapshot, а использует актуальные TechProcess/BOM в момент создания. Это gap, который должен быть закрыт только после P0.

В проверенных схемах также нет отдельного check-in record, поэтому P3 потребует нового явно согласованного контракта.

Но в текущем контракте не зафиксирована явная связь коммерческого заказа с производственным:

```text
Order._id → ProductionOrder.orderId
```

Также не зафиксированы момент инстанциации, snapshot состава, идемпотентность повторной генерации и границы ролей. Поэтому 305–307 нельзя безопасно запускать только на основании того, что соответствующие файлы уже существуют.

## Зафиксированные принципы

1. **Backend Source of Truth:** факты производства хранятся в operational production entities, а не в `Product`, `WorkType` или frontend signals.
2. **303 остаётся read-only estimate:** `Order → Product composition → modules/workTypes → WorkType.days`; 303 не читает, не создаёт и не изменяет `ProductionOrder`/`OrderTask`.
3. **Каталог ≠ производственный экземпляр:** изменение `Product`, `ProductModule` или `WorkType` не должно незаметно менять уже запущенное производство.
4. **Product не получает `productionComplete`:** карточка каталога не является конкретным изготовлением. Производная готовность агрегируется на `ProductionOrder`, затем на коммерческий `Order`.
5. **Одна operational-модель:** до решения PO не расширять параллельно `WorkOrder` и `ProductionOrder`.
6. **Рекомендуемое правило snapshot при старте:** после инстанциации задачи не должны читать изменяющийся каталог на лету; предпочтительный способ — зафиксировать состав, операции, порядок, нормативную длительность и исходные ссылки для конкретного `ProductionOrder`. Точная форма immutable history утверждается в P0.
7. **Все переходы идемпотентны:** повторный cron, retry запроса или повторная кнопка не создают дубли и не отправляют заказ в shipping дважды.
8. **RBAC на backend:** worker видит/изменяет только разрешённые ему задачи; manager/director получают отдельные права; скрытие UI не является защитой.
9. **Не использовать `estimatedHours` как замену `WorkType.days` в 304-A:** текущая оценка 303 и сигнал отсутствующего срока остаются календарными; фактические часы — отдельное operational-поле.
10. **Документы, склад и доставка подключаются через контракты:** Production wave не меняет Warehouse SoT и не изобретает новый shipping state.

## Обязательный порядок

```text
P0  Production execution contract + SoT decision ──────┐
    ↓                                                   │
P2  Instantiation + assignment + check-in contract      │
    ↓                                                   │
P3  305 check-in MVP                                    │
    ↓                                                   │
P4  306 dependency-driven auto-chain                    │
    ↓                                                   │
P5  307 completion aggregation + shipping event         │
    ↓                                                   │
P6  Shipping board integration (existing SHIPPING-301)   │
                                                        │
P1  304-A read-only stuck alarm  ◀── independent after 303
```

`TZ-PRODUCTION-301` Design Verification должен быть сопоставлен с P0. Если бизнес-правило требует утверждения проектировщиком до запуска производства, то переход `Order → ProductionOrder` должен происходить после approve/snapshot; если для ready-to-production изделия действует skip-path, это должно быть явно проверено и покрыто тестом.

P1/304-A допускается отдельно после проверки, что он не содержит mutation и не объявляет визуальную оценку фактом цеха. P0 обязателен для P2–P5 и для mutation-варианта 304-B. P2–P5 выполняются последовательно; автоматический параллельный запуск не разрешён.

---

## P0 — Production execution contract and SoT decision

**Плановый workstream:** `P0-EXECUTION-CONTRACT`
**Тип:** плановый контракт / архитектурный audit-first этап
**Важно:** это не номер executable TZ; реальный ID назначается только после отдельного review. Код до явного утверждения не писать.

### Цель

Устранить главный риск: check-in и auto-chain не могут работать по визуальным оценочным полосам 303. Нужно документально и технически выбрать operational SoT.

### Решения, которые должны быть зафиксированы

1. **Связь заказов:** добавить/подтвердить `ProductionOrder.orderId → Order`.
2. **Позиция заказа:** определить связь с конкретным `Order.items[]`, включая повторяющиеся позиции и quantity.
3. **Момент генерации:** после подтверждения заказа, после Design Verification approve или вручную менеджером.
4. **Snapshot:** какие данные копируются в production snapshot — product/module/workType IDs, названия для истории, порядок, days, estimatedHours, quantity и состав.
5. **Повторная генерация:** запрещена по умолчанию; разрешена только явным действием с версией/аудитом либо идемпотентным upsert.
6. **Единая модель:** `ProductionOrder → OrderTask` — primary; судьба `WorkOrder → WorkOrderOperation` — legacy/read-only/migration/отдельный поток.
7. **Статусы:** отдельно определить коммерческие `OrderStatus`, operational `ProductionOrderStatus` и `OrderTaskStatus`.
8. **План против факта:** planned dates, actual dates, check-in и delay log не смешиваются.
9. **Права:** director/manager/worker и capability keys для чтения, назначения, check-in, override и закрытия.
10. **Отмена и частичное производство:** правила для cancelled order, skipped task, частичного quantity и повторного запуска.

### Definition of Ready для P2

- Есть один выбранный operational SoT.
- Есть схема связи `Order → ProductionOrder → OrderTask`.
- Есть правило Design Verification approve/skip.
- Есть согласованная snapshot policy либо явно зафиксировано, почему применяется другая форма immutable history.
- Есть role matrix.
- Нет противоречия с `docs/data-model.md`, `docs/data-model-audit.md`, `TZ-PRODUCTION-300` и `SHIPPING-301`.

---

## P1 — 304-A: read-only stuck alarm

**Плановый workstream:** `P1-304A-READ-ONLY-ALARM`
**Статус зависимости:** `TZ-PRODUCTION-303` уже DONE; P0 не требуется, если этот workstream остаётся строго read-only.
**Тип:** безопасный frontend plug-in, без записи в SoT. Реальный executable ID и AC утверждаются отдельно.

### Цель

Показать менеджеру неполную оценку, если у полосы нет валидного `WorkType.days`, не выдавая это за факт производственной остановки.

### Scope

- detect `days === null | undefined | invalid` в данных 303;
- badge/иконка на соответствующей полосе;
- текст: «Срок не задан» / «Оценка неполная»;
- summary в toolbar и доступное описание для screen reader;
- фильтр или переход к проблемным строкам внутри текущего Ганта;
- ссылка на справочник вида работ как навигация, без автозаписи;
- сохранение текущего hollow/striped bar.

### Запрещено в P1

- менять `WorkType.days` кнопкой внутри заказа;
- менять `ProductionOrder` или `OrderTask`;
- создавать `stuck`-сущность;
- объявлять товар фактически застрявшим;
- пересчитывать operational schedule.

Если PO всё же нужен быстрый ввод норматива, это отдельный P1-B successor с явным подтверждением глобального изменения и capability `work-type:write`. Order/task-level override не добавлять без P0-контракта.

### Acceptance direction

- missing/invalid days визуально различимы от нормальной полосы;
- alarm не появляется для валидного положительного `days`;
- не происходит HTTP mutation;
- selected order, all-active mode, warnings и read-only completed orders не ломаются;
- Jest покрывает missing, invalid, valid, mixed bars и доступный текст;
- page docs фиксируют «alarm = incomplete estimate, not shop-floor fact».

---

## P2 — Instantiation, snapshot, assignment and check-in implementation

**Плановый workstream:** `P2-INSTANTIATION-ASSIGNMENT-CHECKIN-CONTRACT`
**Зависимость:** утверждённый P0.
**Тип:** backend implementation + thin UI contract, до полноценного check-in. Это не executable TZ и не текущая заявка на код.

### Цель

Реализовать утверждённые в P0 правила создания реальных экземпляров задач, worker assignment и формальной семантики дневного результата.

### Обязательные решения

- `ProductionOrder` создаётся из коммерческого `Order` один раз;
- tasks создаются из approved snapshot, а не читают изменяющийся каталог на лету;
- `OrderTask.workerId` — источник назначения, если P0 подтвердит эту модель;
- worker can read own assigned tasks and submit own check-in;
- manager/director can assign, reassign, override and review;
- timezone предприятия и границы рабочего дня;
- result enum: `done`, `not_done`, `blocked` либо подтверждённый эквивалент;
- one check-in per `taskId + workDate` with idempotency;
- delay log and comment semantics;
- ручной override и audit trail;
- cron reminder is not a production fact.

### Definition of Ready для P3

- API/DTO и role matrix готовы;
- snapshot/assignment ownership доказаны тестами;
- duplicate check-in policy определена;
- есть сценарии для multi-day task, absent worker, blocked task, cancelled task и retry.

---

## P3 — TZ-PRODUCTION-305: check-in MVP

**Плановый workstream:** `P3-CHECKIN-305`
**Зависимость:** реализованный и принятый P2. Реальный executable ID и scope проверяются перед созданием TZ.
**Primary SoT:** `OrderTask` + новый immutable check-in/audit record по утверждённому P2-контракту; такого record сейчас в проверенных схемах нет и его нельзя подразумевать уже реализованным.

### Поток

```text
worker → assigned OrderTask → check-in form
       → backend RBAC + idempotency + dependency check
       → check-in record + task transition
       → notification/refresh
```

### Acceptance direction

- configurable end-of-day job creates reminders only for relevant assigned tasks;
- worker sees only own due tasks unless capability permits broader read;
- `done/not_done/blocked` persists with actor, date and timestamp;
- duplicate retry is safe;
- done transition respects dependencies;
- not_done records delay reason without falsely completing task;
- blocked requires a visible reason and manager resolution path;
- UI appears in cockpit drawer/inspector, not as an unrelated production page;
- no SMS/Telegram dependency in MVP;
- focused backend unit/integration tests and FE Jest cover happy path, forbidden worker, duplicate retry and dependency failure.

---

## P4 — TZ-PRODUCTION-306: dependency-driven auto-chain

**Плановый workstream:** `P4-AUTO-CHAIN-306`
**Зависимость:** принятый P3. Реальный executable ID и scope проверяются перед созданием TZ.
**Не использовать визуальную последовательность 303 как operational trigger.**

### Цель

После фактического завершения одной `OrderTask` сделать следующую задачу доступной по snapshot dependencies.

### Правила

- порядок берётся из approved production snapshot;
- `dependsOnTaskIds` или утверждённый dependency entity — operational contract;
- переход идемпотентен;
- completion проверяет все зависимости;
- циклы и несуществующие зависимости отвергаются при создании snapshot;
- manual reorder/skip/override доступен только manager/director и аудируется;
- изменение каталога не перестраивает уже запущенную цепочку;
- последний завершённый task обновляет aggregate ProductionOrder state, но не отправляет shipping напрямую без P5.

### Acceptance direction

- A → B: завершение A делает B ready;
- B нельзя завершить до A без manager override;
- повторное событие не создаёт второй переход;
- cancel/skip не оставляет цепочку в ложном active state;
- manual override записывает actor, reason и before/after;
- refresh Cockpit показывает operational cue отдельно от estimate bars;
- cycle, duplicate event и concurrent completion покрыты тестами.

---

## P5 — TZ-PRODUCTION-307: completion aggregation

**Плановый workstream:** `P5-COMPLETION-307`
**Зависимость:** принятый P4 и подтверждённый shipping event contract. Реальный executable ID и scope проверяются перед созданием TZ.

### Цель

Корректно вычислить готовность конкретного `ProductionOrder`, затем коммерческого `Order`, не изменяя карточку каталога `Product`.

### Правила

```text
all required OrderTask completed/skipped
        ↓
ProductionOrder.completed (idempotent)
        ↓
all production positions for Order completed
        ↓
Order.ready (only if business policy allows)
        ↓
one durable shipping handoff/event
```

### Acceptance direction

- aggregation учитывает required/optional/skipped tasks по snapshot policy;
- повторный aggregate не меняет результат и не дублирует событие;
- partial quantity и multiple order items имеют определённое поведение;
- cancelled production order не становится ready;
- commercial Order status transition не перескакивает через бизнес-правила;
- shipping handoff содержит ссылки на `Order`, `ProductionOrder`, actor/source и idempotency key;
- failure/retry доставки события видимы и повторяемы;
- Product catalog не получает production fact;
- backend tests покрывают zero tasks, incomplete, complete, repeated event, partial order и cancelled cases.

---

## P6 — Shipping integration

`TZ-SHIPPING-301` остаётся отдельной задачей после P5. Она отвечает за board `ready → waiting → shipped`, документы и dispatch. P5 не должен сам реализовывать shipping UI, carrier tracking, печать документов или складскую транзакцию.

Связь с `TZ-DOC-330` может идти параллельно только после отдельной проверки conflict keys и если не меняет production SoT. Carrier/ЭДО остаются вне этой production wave.

## Что не запускать в рамках этого плана

- не использовать `Product.productionComplete` как operational fact;
- не добавлять check-in к коммерческому `Order` без task identity;
- не считать `WorkType.days` фактом выполнения;
- не менять глобальный `WorkType.days` из карточки конкретного заказа без отдельного confirmation flow;
- не развивать `WorkOrder` и `ProductionOrder` одновременно без migration decision;
- не подключать 305 к 303 visual bars как к SoT;
- не реализовывать drag-reschedule, auto-assign, carrier API, ЭДО, warehouse rewrite, desktop/MCP или deployment;
- не запускать 305, 306 и 307 параллельно;
- не создавать executable TZ, `_active` claims, locks или archives до PO confirmation.

## Checklist перехода из плана в executable TZ

Перед созданием любой TZ агент обязан проверить:

- [ ] актуальный `origin/main` и чистоту/чужой dirty worktree;
- [ ] отсутствие активного claim на нужных conflict keys;
- [ ] P0 решение о `ProductionOrder → OrderTask` и судьбе WorkOrder;
- [ ] Design Verification dependency/skip path;
- [ ] связь `Order → ProductionOrder` и order-item identity;
- [ ] snapshot и idempotency policy;
- [ ] worker/manager/director RBAC;
- [ ] текущий `ProductionOrderService.create()` оценён как legacy generation path или согласован для migration;
- [ ] отсутствие текущего check-in record учтено в P2/P3 scope;
- [ ] timezone и check-in semantics;
- [ ] shipping event contract;
- [ ] measurable AC и focused pnpm gates;
- [ ] page docs, checklist, archive and progress scope.

Только после этого PO утверждает обновлённую редакцию и выбирает первый исполнимый пункт.

## Источники

- `tasks/_backlog/TZ-PRODUCTION-300-production-cockpit-lego.md`
- `tasks/_backlog/TZ-PRODUCTION-301-design-verification-flow.md`
- `tasks/_backlog/TZ-PRODUCTION-303-gantt-board-page.md`
- `tasks/_backlog/TZ-PRODUCTION-304-stuck-products-action.md`
- `tasks/_backlog/TZ-PRODUCTION-305-daily-checkin-mechanism.md`
- `tasks/_backlog/TZ-PRODUCTION-306-work-type-chain-auto-flow.md`
- `tasks/_backlog/TZ-PRODUCTION-307-product-completion-state.md`
- `tasks/_backlog/TZ-SHIPPING-301-shipping-board-doc-attach.md`
- `docs/superpowers/specs/2026-08-06-production-cockpit-lego-design.md`
- `docs/data-model.md`
- `docs/data-model-audit.md`
- `docs/SECTION-READINESS.md`
- `backend/src/modules/production-order/production-order.schema.ts`
- `backend/src/modules/production-order/production-order.service.ts`
- `backend/src/modules/order-task/order-task.schema.ts`
- `backend/src/modules/order-task/order-task.service.ts`
- `backend/src/modules/work-order/work-order.schema.ts`
- `backend/src/modules/work-order-operation/work-order-operation.schema.ts`

## PO decision

- [ ] Свежий review выполнен после изменения `origin/main`
- [ ] P0 SoT decision подтверждён
- [ ] `ProductionOrder → OrderTask` выбран как основной operational-контур
- [ ] `WorkOrder → WorkOrderOperation` классифицирован как legacy/parallel/migration
- [ ] 304-A подтверждён как read-only alarm
- [ ] Design Verification dependency подтверждён
- [ ] Первый executable TZ выбран отдельно

> **Последнее правило:** наличие этого файла означает обсуждаемый Production Execution roadmap, а не разрешение на реализацию. Любой запуск начинается с повторного аудита и заканчивается явной фразой PO: «Утверждаю обновлённый Production Execution план; создавай TZ».
