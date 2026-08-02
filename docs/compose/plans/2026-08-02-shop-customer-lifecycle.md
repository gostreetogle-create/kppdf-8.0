# Plan: Shop — Customer-to-Shipment Lifecycle (business-flow planning)

> **For agentic workers:** carry out tasks task-by-task with review + verification gates.
> This plan is the **single source of truth** for the customer-to-shipment lifecycle in
> `kppdf` (production ERP). Earlier Cursor gap-map (TZ-JOURNEY-301, commit `22caa41`) covers the **shape** of gaps in UI routes; this document adds **.detail** on what each stage actually does, the **immutability rule** (cross-cutting), **automation triggers**, **entity inventory**, and **15 candidate TZIDs** that Cursor/PO should split into executable tasks. Use compound template: read **§ 1–6 first** (what exists + plans), then **§ 7 backlog** for which tasks to execute, then **§ 8 open questions** for the architectural forks PO is uncertain about.

**Goal:** Lock down the business flow `КП → Заказ → Проектирование → Склад → Производство → Отгрузка → Архив` BEFORE we build it. Establish immutability at every transition, automate wherever the logic is mechanical, identify gaps that map to existing or new TZ-IDs, leave the open questions to be answered either by PO or by Mode-A Cursor.

**Tech Stack:** NestJS 10, MongoDB Replica Set, Mongoose 8; Angular 20 standalone/signals/OnPush; Paper & Ink UI; Soft-delete + audit + RBAC pattern from existing modules.

**Architecture:** Snapshot-on-transition denormalization. Every cross-stage trigger captures a denormalized immutable snapshot of upstream state. Editorial changes to catalog (Products, Materials) never cascade downstream into Orders / Specifications / Shipping.

**Upstream artifacts (already merged to `main`):**
- `docs/product-vision-lite.md` — high-level vision + scope (10 шагов потока с gap-status: ✅/🔶/⛔/🅿️ + mermaid).
- `docs/agent-checklists/TZ-JOURNEY-301.md` — Cursor's gap-map execution record (commit `22caa41`).
- `docs/compose/plans/2026-07-12-angular-refactoring-tasks-1-4.md` — pattern reference for this plans format (Goal / Architecture / Tasks / …).
- `tasks/_backlog/vision/GANT-calendar.md` — PARKED spec for Gantt board (the only PARKED gap on TZ-JOURNEY-301 list).

**New artifacts produced by THIS plan (pre-implementation):**
- `docs/compose/plans/2026-08-02-shop-customer-lifecycle.md` — this file (you are reading it).
- `docs/compose/specs/2026-08-02-shop-customer-lifecycle.md` — companion spec for downstream TZ authors.
- `_backlog/vision/TZ-ORDERS-301-quote-to-order-conversion.md` through `TZ-ARCHIVE-301-immutable-lifecycle-links.md` (15 NEW TZ spec files to be authored by Cursor, see § 7).

---

## § 1. State Machine (lifecycle)

```
                     ┌─────────────────────────────────────────────────┐
                     │       CATALOG (master data, всегда эволюционирует)│
                     │  Products · Materials · Modules · WorkTypes · Workers│
                     └─────────────────────────────────────────────────┘
                                                  ▲
                                                  │ snapshot at create
                                                  │
  [CATALOG] → (S1) КП → (S2) ЗАКАЗ → (S3) ПРОЕКТИРОВАНИЕ → (S4) СКЛАД-RESERVE →
                                              │ (если материалов нет)
                                              ├→ (S4b) СНАБЖЕНИЕ: auto-create purchase request
                                              │
                                              (S5) ПРОИЗВОДСТВО (Gantt)
                                              │
                                              (S6) СКЛАД-ОТГРУЗКА + документы
                                              │
                                              (S7) АРХИВ (immutable forever)
```

**Universal invariant:** Each transition S → S+1 captures an immutable snapshot of its input. Snapshots do **not** re-compute when upstream changes.

---

## § 2. Stages — детальное поведение (PO dictation 2026-08-02)

### S1. КП (Коммерческое Предложение = Proposal / Quote)

- **Назначение:** продающий документ, демонстрируется клиенту.
- **Содержит:** список товаров из витрины (Product), их `price`, `discount`, актуальные на момент создания.
- **Persist:** КП сохраняется в БД как immutable record. **Никогда не меняется** при изменении витрины. Это = "история продаж".
- **Mapping к существующему:** если в модели уже есть `Contract` — reuse. PO упомянул "КП это подобие договора"; возможно кандидат на TZ-SALES-301 в upstream.

### S2. ЗАКАЗ (Order)

- **Триггер:** КП подтверждена / оплачена → конвертируется в Заказ.
- **Copy mechanics (immutability rule соблюдается):**
  - ❌ НЕ копировать: `price`, `discount`, `total`, налоговые поля.
  - ✅ Копировать: `productIds[]`, `quantity[]`.
  - 🤔 **PO pondered: "передача идентификаторов товаров как-то грамотно"** — финальное решение: **inline-snapshot per item** `productSnapshot: { name, sku, photoUrl, keyProps }` БЕЗ implicit FK-only reference. Только так можно гарантировать, что правка имени товара в каталоге не «протекает» в архивный заказ.
- **Жизненный цикл:** Заказ → начинает S3.

### S3. ПРОЕКТИРОВАНИЕ (Design Verification)

- **Триггер:** заказ создан → **авто-создаётся design-task для проектировщика**.
- **Цель проектировщика:** verify completeness товара:
  - Модули (composition: `ProductModule`).
  - Материалы per module.
  - Спецификация = «что именно изготовлять»: материалы + порядок модулей.
- **Выход:** `Specification document` (snapshot состава товара) + флаг `Product.isSpecificationApproved: boolean`.
- **Early-exit shortcut:** если `isReadyForProduction === true` на старте → **Skip S3**, переходим прямо к S5. Устраняет bottleneck для повторных типовых заказов.

### S4. СКЛАД-RESERVE (Warehouse Availability Check)

- **Триггер:** спецификация одобрена.
- **Действие:** warehouse availability check для **всех материалов спецификации** (агрегация по модулям).
- **2 исхода:**
  - **Все материалы есть:** `StockMovement.create(deduct)` + reservation flag на Order.
  - **Часть материалов отсутствует:** авто-создание `PurchaseRequest` per missing material (S4b). Заказ parked до прихода материалов.
- **Технические:** уже есть `Z-001` atomic write paths на shipment/purchase-order/order/stock-movement. Использовать те транзакции.

### S4b. СНАБЖЕНИЕ (Procurement)

- **Auto-action при S4 недостача:** создаётся `PurchaseRequest` per missing material.
- **Owner:** снабженец (НЕ проектировщик). After fulfilling → auto-сигнал в S4 возобновить reserve deduction.

### S5. ПРОИЗВОДСТВО (Production — Gantt-driven)

- **Триггер:** материалы acquired + reserved → заказ переходит в Production board.
- **Визуализация:** **GanttChart page** (отдельная страница в приложении).
- **Days estimation:** **ДВА ИСТОЧНИКА ПРАВДЫ — PO не уверен, нужен Cursor TZ-JOURNEY-302 / open question Q3 ↓:**
  - **Вариант A:** на `WorkType` задаётся `days` (модуль сначала сварка, потом покраска — каждая операция имеет свой срок). Гранулярно.
  - **Вариант B:** на `Module` задаётся `totalDays` (грубое поле). Просто.
  - Возможно оба сразу (WorkType override per module), но это усложнит modeling.
- **Stuck products:** товар без указанных дней → висит на Gantt как **action item** для менеджера. Manager fills days → auto-flows в планирование.
- **Worker assignment:** распределяется по дням и worker'ам (через Worker/Person).
- **Daily check-in (§ 6):** end-of-day → авто-генерация **Task-сообщений** для assigned worker'ов.

### S5b. WORK-TYPE CHAIN (within Module)

- Модуль может иметь много `WorkType`-операций последовательно (сварка → покраска → сушка).
- **Auto-flow:** worker ставит галочку на «сварка готовa» → автоматический переход на следующий WorkType в цепочке. Manual override возможен.

### S5c. PRODUCT COMPLETION

- Когда **все модули** товара `productionDone: true`:
  - Product.entity → `productionComplete`.
  - Товар передаётся на **склад отгрузки** (S6).

### S6. СКЛАД-ОТГРУЗКА + ДОКУМЕНТЫ

- **Триггер:** product complete → перемещение на shipping warehouse.
- **Документы на отгрузку:** заранее заготовленные в `DocConstructor` шаблоны (TZ-DOC-308+316+317 уже покрывают category + filter для catalog страниц). На странице отгрузки:
  - Список готовых к отгрузке товаров.
  - Кнопка `Подготовить документы` → авто-сборка filled-doc из pre-prepared template.
  - Кнопка `Распечатать / отгрузить`.
  - UX: visual indicators («готово», «ожидает», «отгружено»).
- **Технические:** doc-constructor уже покрывает большую часть. Нужен только "single-doc-from-order-data" glue (TZ-DOC-322/323 уже цепочку закрыли в text-block; потребуется TZ-аналог для orders/documents side).

### S7. АРХИВ (immutable forever)

- **Триггер:** shipment complete (отгрузка финализирована).
- **Поведение:** immutable forever. Не реагирует на изменения catalog (товар переименовали — в архиве остаётся старое имя). Не реагирует на изменения upstream-связей (КП edit'нули, в архиве stays as-was).

---

## § 3. **IMMUTABILITY** — ГЛАВНЫЙ cross-cutting rule

> **Принцип:** «Что создано — зафиксировано. Что архивировано — не меняется.»
> PO подчеркнул TWICE в dictation: «что мы уже создали, то, что уже работает, она до архива сохраняется в таком же виде, ничего не меняется».

| Stage | Snapshot входного state | Реагирует ли на upstream-change? |
|-------|------------------------|---------------------------------|
| КП создан | `product[] + price + discount` snapshot | ❌ никогда |
| Заказ создан | КП без коммерческих полей + product IDs + **inline-snapshot имени/SKU** | ❌ на catalog / КП |
| Спецификация issued | modules + materials per module snapshot | ❌ на товар / КП / заказ |
| Warehouse reserve | materials deducted → log immutable | ❌ на каталог |
| Production scheduled | days + workers + dates snapshot | ❌ в большинстве случаев; calendar rebase возможен (требует отдельной TZ) |
| Shipping doc | product spec + order data snapshot | ❌ навсегда |
| Archive | полный immutable record | ❌ навсегда |

> ⛔ **Это значит:** BACKEND должен делать **denormalized snapshot-копии** при каждом S→S+1 переходе. Не FK-only (тогда retro-change пробивает границу). Это главный architectural decision для цепочки.

> 📌 **Open architectural fork (Q9, Q10 ниже):** snapshot storage — одна collection per stage или single mega-collection? Решает Cursor в Mode A или PO в явной директиве.

---

## § 4. AUTOMATION RULES

> PO цитата: «максимально автоматизируем те места, которые можно сделать логически, исходя из каких-то действий — раз мы сделали какое-то действие, обязательно поступает в следующее действие».

| Триггер (action) | Auto-action |
|---|---|
| КП status → `paid` | create `Order` from КП (deep-copy, strip commerce) |
| Order created | auto-create `DesignTask` per item (or skip if `Product.isReadyForProduction`) |
| Designer approves Specification | update `Product.isSpecificationApproved: true` per item; queue for S4 |
| All materials available at S4 | reserve + move to S5 |
| Materials missing at S4 | auto-create `PurchaseRequest` per missing material |
| `PurchaseRequest` fulfilled (S4b → S4) | auto-resume Order — re-evaluate availability |
| `isReadyForProduction === true` | skip S3, jump to S5 |
| Item placed on Gantt | generate per-item scheduled tasks per WorkType chain |
| Worker toggles `day_done: true` | (1) progress log + (2) auto-advance WorkType chain if not last |
| All modules → `productionDone: true` | move Product to Shipping warehouse (S6) |
| Shipping prepared + doc attached | generate filled-doc from template |
| `Shipment.dispatched: true` | move to Archive (truly immutable) |

Each row above is potentially its own TZ (auto-trigger logic + UI affordance).

---

## § 5. ENTITY INVENTORY (что уже есть vs что нужно NEW)

| Entity | Status | Where |
|---|---|---|
| `Product` (витрина) | ✅ exists | `backend/src/modules/product/` |
| `Module` / `ProductModule` | ✅ exists | `TZ-PRODUCTS-303` only closed |
| `Material` | ✅ exists | `backend/src/modules/material/` |
| `Project` / `ModuleMaterial` | ✅ exists | TZ-MATERIALS-* chain |
| `Worker` / `Person` | 🟡 partial UI missing | `tasks/TZ-WORKERS-301..302-*.md` |
| `WorkType` | 🟡 partial UI missing | `tasks/TZ-WORKTYPES-301..302-*.md` |
| `Gantt` schema | ❌ NEW | — |
| `GanttBoard` page | ❌ NEW | — |
| `PurchaseRequest` | 🟡 partial | TZ-232 chain mentions |
| `Order` | 🟡 exists but not connected to КП / production | `order.service.ts` |
| **KP / Proposal** | ❌ NEW (явная дыра #1 от TZ-JOURNEY-301) | `tasks/TZ-SALES-301-proposal-thin-ui.md` exists (only spec) |
| **Specification document** | ❌ NEW | — |
| **Shipping warehouse UI** | 🟡 partial | Z-001 mentioned `shipment.service.ts` |
| **Auto-filleable doc template** | 🟡 partial | DocConstructor has templates, but no order-data glue yet |
| `Archive` immutable-storage | 🟡 partial | `documents.page.ts` exists, but no S7-lifecycle link |
| **Snapshot denormalization library** | ❌ NEW | — |

---

## § 6. DAILY CHECK-IN MECHANICS (S5)

> PO: «когда день прошёл, эти сообщения в виде задач, чтобы зафиксировать выполненно или нет».

```
End-of-day {for each active production task}:
  task-message to assigned Worker: "День X прошёл для товара Y
   в модуле Z, workType W. Готово?"
  Worker toggle: ✅ (ready) OR ❌ (delay)

  ✅ → next WorkType в цепочке (S5b) → if last → module.productionDone: true
  ❌ → log delay; Gantt отображает ALARM badge; downstream blocked
```

Также PO упоминал **«смена видов работ на следующую автоматически»** — это часть S5b auto-flow.

Также упоминался **«Гант «распределяется по работникам»** — кто закреплён за активным period. Это планировщик-назначение per-worker per-day, не WIP «диспетчер руками».

---

## § 7. **BACKLOG** — proposed TZ list (15 NEW)

> Все TZ нужно создавать через Cursor Mode A, чтобы появились proper `.md` task-файлы в `tasks/`.
> Pending Cursor TZ (TZ-JOURNEY-301 уже отработал — gap-map есть; следующие TZ-предложения):

| # | Cand. TZ ID | Gap | Layer | Deps / cross-check |
|---|---|---|---|---|
| 1 | `TZ-SALES-301` (уже спека) | КП без UI | 3 | TZ-JOURNEY-301 +203 |
| 2 | `TZ-ORDERS-301-quote-to-order-conversion` | КП → Order deep-copy с strip commerce | 4 | TZ-SALES-301 |
| 3 | `TZ-PRODUCTION-301-design-verification-flow` | DesignTask + completeness verification | 4 | TZ-ORDERS-301 |
| 4 | `TZ-PRODUCTS-306-readable-production-flag` | `Product.isReadyForProduction` + auto-skip S3 | 4 | TZ-PRODUCTION-301 |
| 5 | `TZ-INVENTORY-301-availability-check-on-order` | Warehouse availability check + auto reserve | 4 | TZ-PRODUCTION-301 |
| 6 | `TZ-PROCUREMENT-301-auto-purchase-from-order` | PurchaseRequest auto-create on shortage | 4 | TZ-INVENTORY-301 |
| 7 | `TZ-PRODUCTION-302-work-type-days-config` | `WorkType.days` AND/OR `Module.totalDays` config | 4 | TZ-WORKTYPES-* |
| 8 | `TZ-PRODUCTION-303-gantt-board-page` | GanttBoard page (визуализация) | 3 | TZ-PRODUCTION-302 |
| 9 | `TZ-PRODUCTION-304-stuck-products-action` | Stuck-product Gantt action items + manager fill days | 3 | TZ-PRODUCTION-303 |
| 10 | `TZ-PRODUCTION-305-daily-checkin-mechanism` | Daily check-in cron or on-visit message generator | 4 | TZ-PRODUCTION-303 |
| 11 | `TZ-PRODUCTION-306-work-type-chain-auto-flow` | WorkType chain auto-flow (✅ → next) | 4 | TZ-WORKTYPES-* |
| 12 | `TZ-PRODUCTION-307-product-completion-state` | Product transition `productionComplete` | 4 | TZ-PRODUCTION-306 |
| 13 | `TZ-SHIPPING-301-shipping-board-doc-attach` | Shipping warehouse UI + auto-doc attach | 3 | TZ-PRODUCTION-307 + TZ-DOC-330 |
| 14 | `TZ-DOC-330-doc-from-order-data` | Doc generation from order-data (filled-template glue); was DOC-322 proposal | 3 | TZ-SHIPPING-301 + DocConstructor |
| 15 | `TZ-ARCHIVE-301-immutable-lifecycle-links` | Archive-lifecycle links + immutability guarantee | 4 | TZ-SHIPPING-301 |
| 16 | `TZ-CORE-301-snapshot-immutability-pattern` | Cross-cutting snapshot-on-transition denorm; was TZ-Z-007 proposal | research+design | All above → precedes/follows |

> 🔑 **TZ-CORE-301 is the foundational decision** (snapshot-on-transition denormalization). Without it, retroactive catalog edits will corrupt archives. Recommend executing **TZ-CORE-301 → TZ-SALES-301 → TZ-ORDERS-301 → … sequentially**. Single chain makes merge conflicts trivial.

---

## § 8. OPEN QUESTIONS — вилки, PO прямо не уверен

> PO сказал: «много нюансов будет именно как грамотно-технически сделать сохранение дублирования, копирование на определенных этапах».
> Решения нужны ДО старта chain (или Curator Mode A может default-решить с disclosed assumption).

| # | Question | Options | Mode A DEFAULT (2026-08-02 Cursor) |
|---|---|---|---|
| Q1 | КП → Order: какие поля чистятся? | только price/discount? + налоговые флаги? | **RESOLVED:** strip `price`, `discount`, `total`, любые tax/VAT flags если есть на КП-item; копировать qty + product identity + inline snapshot |
| Q2 | КП → Order: snapshot vs FK? | inline-snapshot vs FK-only | **RESOLVED: inline-snapshot** per item `{name,sku,photoUrl,keyProps}` |
| Q3 | Days estimation: WorkType vs Module? | WorkType.days vs Module.totalDays | **RESOLVED: WorkType.days first**; Module.totalDays = successor optional TZ |
| Q4 | Stuck products: board vs alarm? | sub-page vs Gantt alarm | **RESOLVED: inline alarm on Gantt** first |
| Q5 | Daily check-in: cron vs on-mount? | server cron vs client | **RESOLVED: server cron** (or Nest scheduled job) |
| Q6 | `isReadyForProduction`: кто toggle? | Designer vs manager | **RESOLVED: Designer auto-set** on Specification approve |
| Q7 | WorkType chain ordering | fixed vs configurable | **RESOLVED: configurable** per module (admin/designer sets order) |
| Q8 | Day counter | calendar / work-day / capacity | **RESOLVED: calendar days** first; WorkType may override later |
| Q9 | Snapshot storage | per-stage vs mega-collection | **RESOLVED: denormalize per stage** (immutability-first) |
| Q10 | Archive granularity | per-order vs per-shipment | **RESOLVED: per-shipment** (concrete card); order links many shipments |

> Spike TZ не создавались: defaults достаточно уверенные для lite-цеха (~10 чел). PO может override до старта chain.
>
> ✅ **Executor verification (Buffy, 2026-08-02):** все 10 defaults (Q1–Q10) независимо
> перепроверены против кода (`order.service.ts`, `work-type`/`module` схемы, `Z-001`
> транзакции, `shipment.service.ts`) и соответствуют текущему состоянию каталога:
> - Q1/Q2 (strip commerce + inline snapshot) — консистентно с «история продаж» и отсутствием price на Order;
> - Q3/Q8 (WorkType.days + calendar days) — единственные поля, которые можно читать из существующей схемы без миграции;
> - Q5 (server cron) — NestJS `@nestjs/schedule` уже в стеке (backend/package.json);
> - Q6 (Designer auto-set) — совпадает с S3 early-exit (PRODUCTS-306 flag);
> - Q9/Q10 (per-stage denorm + per-shipment archive) — прямой след immutability rule §3.
> Z-spikes (Z-008..Z-017) НЕ создаются — каждый default либо тривиален, либо уже
> зафиксирован в 15 backlog-спеках §7. PO подтверждает перед стартом chain.

---

## § 9. SYNC recommendation для Cursor / TZ-author

Если эту структуру передать в Cursor в качестве SEED для следующих TZ, рекомендованный порядок:

1. **§ 1 + § 2** → high-level lifecycle (что есть и как работает сейчас)
2. **§ 3** → immutability rule (главный architectural constraint)
3. **§ 5** → entity inventory (что есть / что NEW)
4. **§ 7** → gap-list с proposed TZ numbers (чтобы Cursor не плодит дубликаты)
5. **§ 8** → OPEN QUESTIONS (пусть Cursor даст auto-ответы ИЛИ создаст sub-TZ)
6. **§ 4 + § 6** → auto-rules & check-in (детали implementation)

---

## § 10. Cross-check against existing Cursor artifacts

`docs/product-vision-lite.md` already mentions 10 stages in its gap-map:
> КП ⛔ → Заказ ✅ → Договор ✅ → Модули ✅ → Виды работ ✅ → Люди 🔶 → Склад ✅ → Документы ✅ → Гант 🅿️ → Проектное ОК 🅿️

При развертке в этот plan (§ 2) обнаруживаем:
- **Расхождение #1:** upstream gap-map не разделяет Договор и КП как два stage. PO в dictation не упоминает «Договор» явно. Возможно PO считает договор=КП, либо они устарели. PO нужна confirm.
- **Расхождение #2:** upstream gap-map не имеет stage «Проектирование» (design verification) — PO в dictation явно выделил его. Это gap который нужно добавить в upstream `product-vision-lite.md`.
- **Расхождение #3:** upstream не имеет «Specification document» и «Auto-fillable doc template». PO в dictation явно выделил.
- **Расхождение #4:** upstream «Гант» помечен 🅿️ parked; PO в dictation про Gantt дал детальное описание (3 параметра: days estimation, stuck-alarm, daily check-in). Возможно ready для un-park если upstream dependencies закрыты.

> **Action item:** при следующей sync Cursor может обновить `docs/product-vision-lite.md` gap-map с этими 4 разхождениями, или PO подтверждает «договор=КП» rule и план сливается с upstream.

### Cursor expert remarks (2026-08-02) — §10 cross-check

| # | Вердикт | Действие |
|---|---------|----------|
| **#1** | **Частично опровергнуто как «Договор=КП».** Договор ≠ КП: КП = коммерция (S1); Contract = optional legal artifact. Не сливаем сущности. В vision: Договор ✅ *optional*, не обязательный stage цепочки. | PO confirm если хочет убрать `/contracts` из scope цеха |
| **#2** | **CONFIRM** | Добавлено в product-vision-lite: stage Проектирование ⛔ → PRODUCTION-301 |
| **#3** | **CONFIRM** | Specification + Auto-fill doc glue в gap-map; glue TZ = **TZ-DOC-330** (не DOC-322 — ID занят text-block archive) |
| **#4** | **CONFIRM** (с оговоркой) | Гант → 🔜 READY_WHEN_DEPS; не mono-unpark файла GANT-calendar — цепочка PRODUCTION-302…307 |

**ID collisions fixed by Cursor:** proposed `TZ-Z-007` snapshot → **`TZ-CORE-301`** (Z-007 already = RBAC audit). Proposed `TZ-DOC-322` order-docs → **`TZ-DOC-330`**.

---

## File Structure (NEW + DELTA)

```
docs/
├── compose/
│   ├── plans/
│   │   └── 2026-08-02-shop-customer-lifecycle.md       ← THIS FILE (new)
│   ├── specs/
│   │   └── 2026-08-02-shop-customer-lifecycle.md       ← companion spec (new) for downstream TZ authors
│   └── plans/
│       └── 2026-07-12-angular-refactoring-tasks-1-4.md ← existing pattern reference
├── product-vision-lite.md                              ← Cursor sync target (gap-map tabs добавятся)
└── agent-checklists/
    └── TZ-JOURNEY-301.md                               ← existing — gap-map output

tasks/
├── TZ-JOURNEY-301-shop-flow-gap-map.md                 ← existing — Cursor's gap-map
├── _backlog/
│   └── vision/
│       └── GANT-calendar.md                            ← existing — PARKED
└── _backlog/                                           ← futures (CORE-301, ORDERS-301, PRODUCTION-301..307, PRODUCTS-306, INVENTORY/PROCUREMENT-301, SHIPPING-301, DOC-330, ARCHIVE-301) — Cursor Mode A DONE
```

---

## Verification gates (для downstream TZ-execution)

- [x] Все 15 candidate TZ из § 7 имеют `.md` файлы в `_backlog/` (Cursor Mode A 2026-08-02)
- [ ] Каждый создаёт свой `docs/agent-checklists/<TZID>.md` checklist ДО старта (per handoff MVP rules)
- [ ] Каждый проходит gates: `pnpm exec tsc -p tsconfig.build.json --noEmit` + `pnpm exec jest <scope> --no-coverage` + `git diff --check` + `bash OrchestratorKit/verify-status.sh`
- [ ] `## Executor report (auto)` блок в каждом checklist ≤6 строк, full 40-char SHA, status / commits / gates / known / ask
- [ ] 2 atomic conventional commits per TZ (no push per convention)
- [ ] TZ-DOC-308/316/317 chain + TZ-DOC-324 IA refactor уже merged, остальные цепочки isolation-respected
- [ ] Browser E2E = `MANUAL_BROWSER_CHECK_REQUIRED` (semi-automatic; documented scenario in each checklist)

---

## Task 1: Cursor Mode A — _backlog/ TZ spec creation

> **DONE 2026-08-02 (Cursor Mode A):** 15/15 parked specs created. ID renames: Z-007→CORE-301, DOC-322→DOC-330. TZ-SALES-301 already in `tasks/` — not duplicated.

- [x] `tasks/_backlog/TZ-CORE-301-snapshot-immutability-pattern.md`
- [x] `tasks/_backlog/TZ-ORDERS-301-quote-to-order-conversion.md`
- [x] `tasks/_backlog/TZ-PRODUCTION-301-design-verification-flow.md`
- [x] `tasks/_backlog/TZ-PRODUCTION-302-work-type-days-config.md`
- [x] `tasks/_backlog/TZ-PRODUCTION-303-gantt-board-page.md`
- [x] `tasks/_backlog/TZ-PRODUCTION-304-stuck-products-action.md`
- [x] `tasks/_backlog/TZ-PRODUCTION-305-daily-checkin-mechanism.md`
- [x] `tasks/_backlog/TZ-PRODUCTION-306-work-type-chain-auto-flow.md`
- [x] `tasks/_backlog/TZ-PRODUCTION-307-product-completion-state.md`
- [x] `tasks/_backlog/TZ-INVENTORY-301-availability-check-on-order.md`
- [x] `tasks/_backlog/TZ-PROCUREMENT-301-auto-purchase-from-order.md`
- [x] `tasks/_backlog/TZ-SHIPPING-301-shipping-board-doc-attach.md`
- [x] `tasks/_backlog/TZ-DOC-330-doc-from-order-data.md`
- [x] `tasks/_backlog/TZ-ARCHIVE-301-immutable-lifecycle-links.md`
- [x] `tasks/_backlog/TZ-PRODUCTS-306-readable-production-flag.md`

Each has: ROLE / DEPENDENCIES / LAYER / CONFLICT KEYS / ИСХОДНОЕ СОСТОЯНИЕ / ЧТО ДЕЛАТЬ / AC / known_limitation.

---

## Task 2: PO — resolve OPEN QUESTIONS

> Mode A defaults уже в § 8 (Q1–Q10 RESOLVED). PO: **confirm или override** → затем Task 3.
> Spike mini-TZ Z-008..Z-017 не создавались — defaults достаточно уверенные.

---

## Task 3: Executor pick-up sequentially

Per Cursor gap-map order merged with § 7 dependency chain:

```
TZ-CORE-301 → TZ-SALES-301 → TZ-ORDERS-301 → TZ-PRODUCTION-301 → TZ-PRODUCTION-302
                                                              ├→ TZ-PRODUCTION-303 (Gantt board)
                                                              ├→ TZ-PRODUCTION-304 (stuck-alarm)
                                                              ├→ TZ-PRODUCTION-305 (daily check-in)
                                                              └→ TZ-PRODUCTION-306 (work-type chain)
TZ-INVENTORY-301 → TZ-PROCUREMENT-301 → TZ-PRODUCTION-307
TZ-SHIPPING-301 + TZ-DOC-330 (parallel) → TZ-ARCHIVE-301
```

Max **2 parallel streams** at any moment per `docs/agent-checklists/_active-map.md` rule. Each TZ ≤ 60 мин для Layer 4 backend, ≤ 90 мин для Layer 3 frontend. Total estimate ~15-20 часов serial execution.

---

## Task 4: Public-link-merge-flow

After all 15 TZs close:
- Single `git merge --no-ff` from each worktree (or sequential merge in canonical) → main
- Update `docs/product-vision-lite.md` gap-map (remove ⛔/🅿️ icons that became ✅)
- Update `OrchestratorKit/STATUS.md` lineage
- Generate `docs/_audits/2026-08-03-shop-customer-lifecycle-closure.md` (final summary)

---

## Notes

- ЭТОТ ПЛАН — pre-implementation. Никакое production-code изменение не должно произойти без создания TZ файла в `tasks/` и проверки § 8 OPEN QUESTIONS закрытыми.
- Все 16 candidate TZ-IDs из § 7 — это proposal, не commitment. Cursor Mode A их утвердит / скорректирует / разделит на под-TZs.
- Существующие upstream-артефакты (`product-vision-lite.md`, `TZ-JOURNEY-301`, `GANT-calendar.md`) — это baseline. Этот план — **superset + delta**.
- Pattern reference: `docs/compose/plans/2026-07-12-angular-refactoring-tasks-1-4.md` (execute task-by-task, checkbox tracking).

---

## END OF PLAN
