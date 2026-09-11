# Аудит: готовность склада к заносу инвентаризации

**Дата:** 2026-09-11  
**Триггер:** PO — есть бумажная/офлайн инвентаризация; нужно занести на сайт; метизы/изделия; вес→количество; Excel Desktop; куда что класть.  
**Режим:** Cursor Mode A. Источник фактов: explore [Audit warehouse import readiness](b9026acb-4326-4f16-b64e-d2d4f104910f) + page.md / WAVE.

### Preflight Check Output
- **Context read:** `docs/PO-CANON.md` (склад = движения); `WAVE-NX-WAREHOUSE.md`; `WAVE-NX-SUPPLY-OPS.md`; `docs/pages/{warehouses,storage-items,stock-movements}.page.md`; schemas `warehouse` / `storage-item` / `stock-movement` / `material` / `product`; `desktop/src/core/import-targets.ts`
- **Key Constraints:** один write-path остатка = StockMovement (+ adjust); NX SoT; не второй stockQty
- **Planned Deliverable:** этот аудит → после 1 ответа PO → WAVE inventory import
- **Validation Path:** FIC D при WAVE; Z-001 уже DONE

---

## Вердикт

| Зона | Готово? |
|------|---------|
| Склады / остатки / журнал на NX (W1–W3) | **Да** — ручной приход/расход/adjust |
| Каталог: куда метиз / деталь / ГП | **Да** — матрица ниже |
| Массовая заливка инвентаризации (Excel → остатки) | **Нет** |
| Пересчёт кг → шт (взвесили 15 кг → qty) | **Не нужно** (PO 2026-09-11: только qty) |
| Desktop Excel (каталог / снабжение) | **Частично** — паттерн match есть; target «остатки» нет |

---

## 1. Куда класть номенклатуру

| Физика | Сущность | Где в NX | На складе |
|--------|----------|----------|-----------|
| Метиз (болт, гайка…) | `Material` + `materialKind: fastener` | Реестр **Детали** (фильтр «Метиз») | `StorageItem.materialId` |
| Деталь / покупное | `Material` (`part` / `purchased`) | **Детали** | `materialId` |
| Сырьё (лист, труба…) | `Material` (`raw`) | **Материалы** | `materialId` |
| Готовое изделие | `Product` | **Изделия** | `StorageItem.productId` |
| Модуль сборки | `ProductModule` | Модули | **не складируется** (только BOM) |

Отдельной коллекции «Detail» нет — деталь = Material с kind.

Нужно до склада: карточка в каталоге + единица (`unit`, обычно шт) + опционально масса.

---

## 2. Складской движок (уже есть)

- **Остаток** = `StorageItem.quantity` (SoT).
- **Движение** = `StockMovement` `in|out|transfer|adjust` (Z-001).
- UI: `/warehouses`, `/storage-items` (положить/adjust; put UI сейчас в основном material), `/stock-movements` (+Приход/+Расход, material|product).
- Deprecated: `Material.stockQty` / `Product.stockQty` — **не писать**.

Ручной занос десятков строк — возможен. Сотни с инвентаризации — нет удобного bulk.

---

## 3. Вес → количество

| Есть | Нет |
|------|-----|
| `Material.weightKg` / `Product.weightKg` (паспорт каталога) | Конвертер на write-path склада |
| `StorageItem.weightKg` (метаданные строки) | Режим ввода «кг» → qty |
| | «вес за 10 шт» / `packSize` |

PO-сценарий «взвесили 15 кг → сразу штуки» = **новая** логика на границе импорта/прихода (не отдельный склад).

---

## 4. Desktop Excel

| Target | Есть | Пишет остаток? |
|--------|------|----------------|
| material / product / module | Да | Нет (каталог) |
| warehouse | Да | Только справочник складов |
| supplyRequest / supplyTask | Да (WAVE-NX-SUPPLY-OPS) | Остаток только после «Получено» на сайте |
| **storageItem / stockMovement / inventory pack** | **Нет** | — |

Паттерн для будущего: как Supply Excel — match по справочникам → reject miss → HITL confirm → batch `StockMovement IN`.

---

## 5. Gaps (чеклист готовности к «занести инвентаризацию»)

1. ~~Склады~~ — готовы  
2. ~~Журнал / остатки UI~~ — готовы (вручную)  
3. ~~Куда метиз / ГП~~ — ясно  
4. Каталог заполнен артикулами/единицами/массой — **операторская работа**, поля есть  
5. Excel «Остатки» + валидация — **нет**  
6. кг→шт при заносе — **нет**  
7. Opening balance только через ledger IN/adjust (не голый create qty без движения) — зафиксировать в WAVE  

---

## 6. WAVE (черновик, не стартовать пока text-library / PO)

| # | SIZE | Суть |
|---|------|------|
| A | S | Docs: матрица сущностей + запрет stockQty; page.md inventory-import |
| B | S | Desktop material import: колонки `materialKind` + `weightKg` (каталог) |
| C | L | BE batch inventory IN (match SKU/article → StockMovement); **только qty**, без кг |
| D | L | Desktop Excel pack «Инвентаризация»: колонки номенклатура + склад + **qty** (как Supply B, без веса) |
| E | S | optional NX paste-table; harden put-on-stock → всегда movement |

Conflict keys (ожидаемо): `stock-movement/**`, `storage-item/**`, `desktop/.../import-targets.ts`, `multi-import.ts`, warehouse NX pages, material/product forms, page.md.

---

## 7. Решение PO (2026-09-11)

**Упрощение:** вес→qty **не делаем**. PO считает штуки сам; в программу и в Excel — **только количество** (`qty` / `quantity` в каталожной единице).

WAVE C/D без `inputKg` / `packSize` / конвертеров. Масса в каталоге остаётся паспортным полем, не складским вводом.

---

## 8. Closeout 01/3 (2026-09-11) — `TZ-NX-WH-INV-DOCS` DONE

Канон занёс в `docs/CONTEXT.md` (opening balance = `StockMovement in`/`adjust`,
никогда голый create) и `docs/pages/storage-items.page.md` (entity-матрица
метиз/деталь/ГП/модуль + qty-only) + `docs/pages/stock-movements.page.md`
(ссылка + напоминание про batch = не второй write-path). `Material.stockQty` /
`Product.stockQty` явно deprecated/не-SoT везде, где встречается остаток.
WAVE row 01 → DONE, продолжение — 02 BE batch.
