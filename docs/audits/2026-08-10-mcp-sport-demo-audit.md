# Audit: MCP demo seed — спорт / воркаут / отгрузка (2026-08-10)

**Стенд:** `https://kppdf-crm.ru`  
**Клиент MCP:** Cursor ↔ Desktop host `127.0.0.1:9743`  
**Тема данных:** спортивное оборудование (воркаут, падел, покрытия)  
**Цель:** заполнить вкладки для ручного теста + понять, чего не хватает MCP.

---

## 1. Verdict

Живой MCP сейчас — **узкий material-контур** (propose → confirm → list/get).  
Полный коммерческий поток (изделие → КП → договор → заказ → отгрузка) через MCP **невозможен**: инструментов нет.  
Демо-данные для UI заполнены **гибридом**: материалы через MCP, остальное — прямой REST с тем же pairing key.

Отдельно: **рантайм Desktop MCP отстаёт от исходников** `desktop/mcp` в репо (в коде зарегистрированы TZD-17…30, в `tools/list` их нет).

---

## 2. Что заведено на стенде (можно кликать)

| Зона | Что появилось | Как искать |
|------|---------------|------------|
| Материалы | 14 позиций `SPORT-*` (труба, стекло, LED, покрытие…) | Материалы → поиск `SPORT` |
| Цены материалов | `pricePerUnit` проставлены | Карточка материала |
| Категории изделий | Уличный воркаут / Спортивные площадки / Покрытия | Каталог / категории |
| Модули | 4 модуля с составом из материалов | Модули `SPORT-MOD-*` |
| Изделия | Турник, брусья, скамья, шведская, комплекс «Чемпион», падел, плита, монтаж | Продукция → `SPORT` |
| Виды работ | Резка / сварка / покраска / сборка / монтаж | Цех → Виды работ |
| Цвета | RAL 7016 / 3020 / 5015 / 9005 | Справочники цвета |
| Контрагенты | 2 клиента + 1 поставщик | Клиенты |
| Люди | 3 контакта | Люди (`/persons`) |
| Площадки | 3 объекта | Сайты у контрагентов |
| Склад | 12 приходов (`stock-movements` in) на основной склад | Склад / движения |
| КП | draft / sent / accepted | Сделки → КП |
| Договор | 1 из accepted КП (`convert-to-contract`) | Договоры |
| Заказы | draft / ready / **shipped** | Заказы |
| Import todo | 1 открытая задача | Задачи импорта |

**Итоговые счётчики после сида (примерно):** materials 20 · products 15 · counterparties 8 · quotations 4 · orders 3 · contracts 1 · storage-items 14 · stock-movements 12 · persons 3 · work-types 10 · color-references 5.

### Рекомендуемый ручной смоук

1. **Материалы** — `SPORT-MTL-040`, цена > 0.  
2. **Изделие «Комплекс воркаут Чемпион»** — состав: модуль + вложенные изделия.  
3. **КП draft** — открыть студию, поменять скидку/позиции.  
4. **КП accepted** → договор уже есть.  
5. **Заказ shipped** — статус отгрузки.  
6. **Склад** — остатки по движениям прихода.

---

## 3. Что реально умеет живой MCP (`tools/list` на :9743)

### Есть и проверено в этой сессии

| Tool | Результат |
|------|-----------|
| `kppdf_ping` | admin @ kppdf-crm.ru |
| `kppdf_propose_material_create` + `kppdf_confirm_proposal` | 14 материалов SoT |
| `kppdf_list_materials` / `kppdf_get_material` | search `SPORT` OK |
| `kppdf_list_products` / `kppdf_get_product` | read OK (write нет) |
| `kppdf_list_warehouses` / `kppdf_list_storage_items` | read OK |
| `kppdf_list_mutations` / undo / cancel | в surface есть (undo не жгли на демо) |
| `kppdf_inbox_list` | файл CSV в inbox виден |

### Нет в живом host (но есть в исходниках `desktop/mcp`)

Критичный drift: Desktop поднимает **старый** MCP, не актуальный workspace.

- Domain: `kppdf_get_domain_schema`, `kppdf_list_categories`, `kppdf_validate_material|product`
- Graph: `kppdf_list_modules`, composition/where_used, `kppdf_run_integrity_suite`
- Batch: `kppdf_propose_material_batch`, `kppdf_confirm_batch`, `kppdf_cancel_batch`
- Product write: `kppdf_propose_product_create|update`
- Inbox extras: `kppdf_inbox_audit_file`, `kppdf_inbox_classify_columns`
- Import task/todo + doc/text-block tools (TZD-22…30)

**Первый фикс без новых фич:** перезапуск Desktop MCP из актуального `desktop/mcp` (или packaging sidecar), чтобы Cursor увидел уже написанные tools.

---

## 4. Чего не хватает MCP для «агент заполнил весь сайт»

Даже после выравнивания рантайма с репо **нет** коммерческого/операционного контура:

| Нужно для демо/работы | API уже есть | MCP tool |
|-----------------------|--------------|----------|
| Категории create | `POST /categories` | нет |
| Модули + состав | `POST /modules`, `…/composition` | нет write |
| Изделия + состав | `POST /products`, `…/composition` | propose product только в source; BOM write — нет |
| Виды работ / RAL | `POST /work-types`, `/color-references` | нет |
| Контрагенты / люди / площадки | counterparties, persons, sites | нет |
| КП (quotations) CRUD + статусы | `/quotations` | нет |
| Договор / convert | contracts + convert-to-* | нет |
| Заказы + ship/reserve | `/orders`, `…/ship` | нет |
| Склад write | stock-movements (POST storage-items на стенде 404) | только list |
| Снабжение / производство / Gantt | supply, production | out of scope в MCP.md |

### Ограничения material-write даже там, где MCP работает

- Propose create: только `name|unit|article|sku|categoryId` — **нет** `pricePerUnit`, `materialKind`, `description`, dimensions.  
- Цены в демо пришлось ставить через REST `PATCH /materials/:id`.  
- `POST /storage-items` на проде → **404** (остатки появляются через `stock-movements`).

---

## 5. Рекомендуемый backlog (приоритет)

1. **TZD-31 — MCP runtime sync**  
   Desktop всегда стартует MCP из текущего `desktop/mcp` (или версионированный sidecar). Acceptance: `tools/list` содержит TZD-17…30 names; smoke `kppdf_list_categories` + `kppdf_propose_product_create`.

2. **TZD-32 — material propose fields**  
   Расширить `material.create/update` proposal: `pricePerUnit`, `materialKind`, `description`, dimensions (whitelist как в CreateMaterialDto).

3. **TZD-33 — commercial read/write (HITL)**  
   Read: counterparties, persons, sites, quotations, orders, contracts.  
   Write (propose→confirm или явный draft-only): counterparty, quotation draft, order draft.  
   Convert/ship — только после явного confirm tool (как journal).

4. **TZD-34 — stock write**  
   `kppdf_stock_movement_create` (`in|out|transfer|adjust`) + list; не опираться на POST storage-items если его нет на API.

5. **Опционально TZD-35 — composition propose**  
   Добавление линии состава module/product (не silent BOM rewrite).

Черновики: `tasks/_backlog/desktop/WAVE-MCP-GAP-2026-08-10.md`.

---

## 6. Метод этой сессии (прозрачность)

| Шаг | Канал |
|-----|--------|
| 14 материалов | MCP propose→confirm |
| Цены / категории / модули / изделия / CRM / КП / заказы / ship | REST + pairing key (обход gap MCP) |
| Проверка | MCP list materials/products `SPORT` |

Временный seed-скрипт **не коммитился** (содержал ключ); ключ остаётся только в локальном `~\.cursor\mcp.json`.
