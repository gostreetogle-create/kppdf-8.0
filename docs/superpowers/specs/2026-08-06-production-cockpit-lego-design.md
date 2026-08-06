# Production Cockpit — Lego shell + Gantt (design)

**Status:** APPROVED direction by PO 2026-08-06 (composability / «Лего»).  
**303:** **UN-PARKED** 2026-08-06 — IN WORK (`tasks/_active/TZ-PRODUCTION-303.md`).  
**Locks:** audit A–J (statuses / anchor / days-only / no ProductionOrder / dense / docs / **FE facade** / **quantity ×N** / **director RBAC**).  
**Color:** colorful OKLCH bars by workType (PO OK).  
**Canon vision:** `docs/product-vision-lite.md` (Гант = later).  
**Umbrella TZ:** `tasks/_backlog/TZ-PRODUCTION-300-production-cockpit-lego.md`  
**First build TZ:** `tasks/_backlog/TZ-PRODUCTION-303-gantt-board-page.md`

---

## 1. Intent (PO)

Одно место «сверху видно всё производство»: заказы / кто чем занят / что впереди.  
Не монолитный MS Project. Собирать **блоками** (Angular standalone components), чтобы потом стыковать новые разделы без переписывания страницы.

## 2. Approaches considered

| | Approach | Verdict |
|---|----------|---------|
| A | Одна толстая страница со всем сразу | Reject — пустышка или god-component |
| B | Только Гант без shell | Reject — потом больно вставлять фильтры/заказы |
| C | **Shell + slots + plug-in blocks** | **Choose** — Лего; 303 = shell + 2 блока |

## 3. Architecture

### 3.1 Route / IA

- Primary: `/production` (или `/production/board` — выбрать в 303, один канон).
- Nav category «Производство»; `PAGE_KEYS` + seed pages + Feature Integration Checklist §A.
- Roles: Director / Manager (+ production role если появится).

### 3.2 Shell (`ProductionCockpitPage`)

Layout Paper & Ink, не dashboard-каша:

```text
┌────────────┬──────────────────────────────────────┐
│ LEFT SLOT  │ MAIN SLOT                            │
│ (filters / │ (Gantt timeline)                     │
│  orders)   │                                      │
├────────────┴──────────────────────────────────────┤
│ OPTIONAL BOTTOM / DRAWER SLOT (inspector later)   │
└───────────────────────────────────────────────────┘
```

- Shell **не** знает доменную логику блоков — только слоты + shared filter context (signals).
- `ProductionCockpitContext` (signals): `selectedOrderId`, `dateRange`, `workerIdFilter`, `search`.
- Blocks subscribe / emit via context — без EventBus-зоопарка Phase 1.

### 3.3 Block contract

Каждый блок = standalone Angular component + optional thin service:

| Block ID | First TZ | Role |
|----------|----------|------|
| `orders-rail` | **303** | Список заказов (read API), клик → filter Gantt |
| `gantt-bars` | **303** | Полоски по модуль / workType / `WorkType.days` |
| `stuck-alarm` | 304 | Badge/alarm на bars без days |
| `check-in` | 305 | Daily check-in UI (drawer/inspector) |
| `auto-chain` | 306 | Автоцепочка work types |
| `completion` | 307 | Состояние готовности → отгрузка |

Новый блок = новый TZ; shell меняется только если нужен **новый слот**.

### 3.4 Data Phase 1 (честность)

**303 не изобретает** полную сущность `ProductionSchedule` / auto-assign engine.

Bars Phase 1 = **оценка** из уже существующих данных:

- Order (+ items / modules composition read),
- WorkType.`days` (PRODUCTION-302 DONE),
- Worker list (People) — слоты назначения **read-only или stub assign** в 303;
  write-assign — successor если нет API.

UI обязательно помечает: «План-оценка по дням видов работ» (не факт цеха).

Позже (отдельный TZ / Wave): immutable snapshot schedule, auto-layout, manager assign writes.

**PO lifecycle north-star (2026-08-06, не scope 303):**  
КП (будущий полный раздел) → заказ с изделиями → модули/workTypes → Гант  
(1) **автозаполнение** свободными людьми по видам работ,  
(2) **ручной** путь (проектировщик / этап) когда авто нельзя сразу,  
→ готовность → склад / отгрузка / отгрузочные документы.  
Cockpit остаётся Lego: подключаем блоки, не переписываем монолит. Демо-seed для e2e переходов — отдельным TZ при тесте.

### 3.5 Out of scope (cockpit Phase 1)

- Бухгалтерия, carrier tracking, MS Project clone.
- Параллельный rewrite catalog composition (320/311 — другая волна).
- Warehouse SoT changes.

## 4. Wave map

```text
302 WorkType.days          DONE
300 Cockpit Lego canon     docs (this + umbrella TZ)
303 Shell + orders-rail + gantt-bars   ← FIRST CODE
304 stuck-alarm plug-in
305 check-in plug-in
306 auto-chain plug-in
307 completion → shipping handoff
```

## 5. Success for PO

Заходишь на `/production` → слева заказы, справа Гант по выбранному/всем → понятно что идёт и что впереди.  
Пустых обещаний «автоматом всё разложит» в 303 нет; авто — в 306+ после SoT.

## 6. Un-park rule

Не CLAIM 303 пока:

- PO: «стартуем Гант / production cockpit»;
- предпочтительно 320 на origin (состав изделий стабильнее для bars);
- не параллелить с ADMIN-306 на `app.routes.ts` без DEFER.
