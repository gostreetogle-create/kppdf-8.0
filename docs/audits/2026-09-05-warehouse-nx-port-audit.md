# Аудит: склад + снабжение → NX-порт (2026-09-05)

**Статус:** Cursor Mode A · peer-ready  
**Цель:** один складской движок на NX без WMS-раздувания; снабжение в связке.

## Preflight Check Output
- **Context read:** `docs/architecture/MASTER-CORE.md` §3–3.2; `docs/DOMAIN-MAP.md`; `docs/PO-SHARED-UNDERSTANDING.md` §2/§8; `docs/pages/warehouses.page.md`; `docs/pages/supply.page.md`; `backend/.../warehouse.schema.ts`; `tasks/_archive/2026-08/Z-001-*.done.md`; `tasks/_park/TZ-INVENTORY-301-*.md`; explore legacy FE + BE inventory
- **Key Constraints:** Mode A; ledger SoT уже в BE (Z-001 DONE); NX gap; necessity = оператор NX; не dual-site cleanup
- **Planned Deliverable:** WAVE-NX-WAREHOUSE + WAVE-NX-SUPPLY + PROMPT ×2 + TZs
- **Validation Path:** FIC A/B; PAGE-TZ-INDEX; DOMAIN-MAP NX column; gates per TZ

---

## 1. Что есть сейчас

### Backend (зрелый)
| Сущность | Роль |
|----------|------|
| `Warehouse` | Именованный склад; `type` enum; `zoneNames[]`; soft-delete |
| `StorageItem` | **Остаток SoT** (qty + reservedQty); XOR material\|product |
| `StockMovement` | Ledger in/out/transfer/adjust (транзакции Z-001) |
| `Reservation` | Холд под заказ (`orderId` = **номер**, не ObjectId) |
| `SupplyRequest` / `SupplyTask` | Канон снабжения |
| `inventory` | Read-only dashboard aggregator |
| Purchase*/Tender | Legacy — UI не в финал (MASTER-CORE) |

### Legacy FE (`frontend/`)
- `/inventory` dashboard, `/warehouses`, `/storage-items`, `/stock-movements`, `/shipping` (nav «Склад»)
- `/supply` = **два режима**: quick mock + registry SupplyTask
- Order hub: counters supply; reservations **read-only**
- Materials → deep-link остатки
- Production **не** списывает со склада в UI

### frontend-nx
- **Нет** routes склада/снабжения
- Реестр `supply-requests` (тонкий CRUD) — не рабочее место снабженца

---

## 2. Излишества legacy (не тащить в NX)

| Вырезать / не порт | Почему |
|--------------------|--------|
| Отдельный `/inventory` dashboard | KPI дублируют фильтр «мало» на остатках |
| 5 типов склада (main/branch/transit…) | На движения не влияют; путают |
| Зоны/ячейки как обязательный UI | MASTER-CORE: без адресов/ячеек |
| Transfer UI без сценария | create только in/out в v1 |
| Dual supply: quick mock + registry | Один write-path: Request/Task |
| PurchaseOrder/Request/Tender UI | Legacy, запрет MASTER-CORE |
| Параллельный «списание» экран | Adjust (−) + confirm при «в работу» |

---

## 3. Канон продукта (решение Cursor, согласовано с MASTER-CORE + dictation PO)

### Склад = один движок, N именованных разделов
- Оператор создаёт **склады по названию** («Металл», «Метизы», «Дерево») = записи `Warehouse`.
- Это и есть «разделы»; **не** строим дерево ячеек.
- В NX-форме: **имя + активен** (+ описание опционально). `type` всегда `main` с API. `zoneNames` не показываем в v1.
- «Один склад» в MASTER-CORE = **один ledger-движок и одна логика**, не запрет нескольких имён-разделов.

### Движок
1. Приход / расход / корректировка → `StockMovement` → обновляет `StorageItem` (Z-001).
2. Материал из каталога связан с остатком (`materialId`); изделие (ГП) — XOR product (авто-приход ЗК — successor, не блокер UI остатков).
3. Резерв под заказ → `Reservation` + `reservedQty`.
4. Нехватка при комплектации/«в работу» → **SupplyRequest** на заказ/изделие (мягкий блок цеха).

### Снабжение
- Один UX: реестр потребностей/задач (канон Supply*), без mock «быстрого заказа» как SoT.
- Приход закупки → StockMovement IN (уже задумано в MASTER-CORE; wire в волне supply).

### «В работу» (PO)
- Диалог подтверждения: что спишем/зарезервируем со склада.
- Хватает → reserve (и при необходимости out по политике BE).
- Не хватает → строки в снабжение + предупреждение, производство не жёсткий стоп.

---

## 4. Волны и параллель

| Волна | Агент | Зона | Старт |
|-------|-------|------|-------|
| **WAVE-NX-WAREHOUSE** | Freebuff | `frontend-nx` склад UI | После текущей days-волны Claude **или** параллельно с Claude **BE-only** kit |
| **WAVE-NX-SUPPLY** | Claude | BE kit/reserve/shortage + NX `/supply` + hub confirm | BE-часть **параллельна** WAREHOUSE UI; NX `/supply` после W1 shell (routes) |

**Карта зон:** `docs/agent-checklists/PARALLEL-SLOTS-WAREHOUSE-SUPPLY.md`

Общий `app.routes.ts` / chrome: владеет **WAREHOUSE W1**; SUPPLY добавляет `/supply` только после W1 DONE (или W1 кладёт stub route).

---

## 5. Вопросы PO

**Нет блокирующих вопросов.** Решения зафиксированы выше.  
Если позже скажешь «строго один документ Warehouse» — свернём UI к одному + переименуем разделы в `zoneNames`; движок тот же.

---

## 6. Артефакты

| Файл | Назначение |
|------|------------|
| `docs/agent-checklists/WAVE-NX-WAREHOUSE.md` | Цепочка UI склада |
| `docs/agent-checklists/WAVE-NX-SUPPLY.md` | Цепочка снабжение + kit |
| `tasks/_ready/nx-warehouse/*.md` | TZ |
| `tasks/_ready/nx-supply/*.md` | TZ |
| `tasks/PROMPT-FREEBUFF-NX-WAREHOUSE.md` | Промпт Freebuff |
| `tasks/PROMPT-CLAUDE-NX-SUPPLY.md` | Промпт Claude |
