# ФУНДАМЕНТАЛЬНОЕ ЯДРО — синтез 8 исторических версий

> ⚠️ **SUPERSEDED (2026-08-30).** Черновик-предшественник. Финальный,
> проверенный CTO документ с закрытыми бизнес-решениями PO:
> [`docs/architecture/MASTER-CORE.md`](./MASTER-CORE.md). Содержимое ниже
> оставлено для истории, не актуально как источник правды.

> **Статус:** PLAN (2026-08-30), Cursor Mode A  
> **Источник:** `D:\Для аналитики все kppdf\` — kppdf, kppdf-2.0 … kppdf-8.0  
> **Дополнение:** параллельная линия `D:\crm-generator` → `crm_04` → kppdf-8.0  
> **Связанный документ (слои текущего v8):** `reports/MASTER-CORE.md`

---

## Как читать «8 версий»

| # | Папка | Позиционирование | Зрелость |
|---|-------|------------------|----------|
| 1 | `kppdf` | KP PDF — генератор КП/PDF | ★★★★☆ КП-мастер |
| 2 | `kppdf-2.0` | PLM + ERP pivot | ★★★☆☆ BOM/заказы, нет PDF |
| 3 | `kppdf-3.0` | PLM-first платформа | ★★★★☆ глубина производства |
| 4 | `kppdf-4.0` | CRM/операционка | ★★★★☆ роли, финансы |
| 5 | `kppdf-5.0` | Next.js монолит | ★★★★★ единственный full runtime (Next) |
| 6 | `kppdf-6.0` | Теория поверх v5 | ★★☆☆☆ код = v5, docs = золото |
| 7 | `kppdf-7.0` | Greenfield BOM | ★★☆☆☆ admin/BOM MVP |
| 8 | `kppdf-8.0` | Текущий ERP (канон PO) | ★★★★★ полный контур |

**Вердикт для финала:** архитектура **v8** + КП/PDF из **v1** + quotation editor из **v3/v5** + бизнес-правила из **v6 BIG-BOOK** + BOM-удобства из **v7** + PLM-глубина из **v3** (выборочно).

---

## 1. Технологический стек и Архитектура

### 1.1 Эволюция стека

| Версия | Frontend | Backend | БД |
|--------|----------|---------|-----|
| v1 | Angular 21, свой UI-kit | Express | MongoDB |
| v2–v4 | Angular 21 + PrimeNG | Express | MongoDB (+ ChromaDB в v4) |
| v5–v6 | Next.js 16 + React 19 | Route Handlers | **PostgreSQL + Prisma** |
| v7 | Angular 22 | NestJS 11 + BullMQ | MongoDB + Redis |
| v8 | Angular 20 + Paper & Ink | NestJS 10 | MongoDB RS |

### 1.2 Целевой стек (синтез)

| Слой | Решение | Источник |
|------|---------|----------|
| Frontend | Angular standalone + signals + OnPush | v8 |
| Design System | Paper & Ink (OKLCH, hairline, icon-rail overlay) | v8 |
| Backend | NestJS модульный монолит | v8 |
| БД | MongoDB Replica Set | v8 |
| PDF | **Puppeteer** (серверный) | v1, v8 — не jsPDF |
| Desktop | Tauri + MCP + mutation-journal | v8 |
| Очереди | BullMQ + Redis — **только** тяжёлый импорт | v7 |
| Auth | JWT + RBAC capabilities + device invite | v1 + v8 |

**Не переносить:** микросервисы, Kafka, ChromaDB как SoT, Next.js runtime, PrimeNG UI, multi-warehouse/zones.

### 1.3 Архитектурные принципы

1. Один write-path на сущность.
2. **Counterparty ≠ Organization** (v8; v7 имел unified Organization).
3. Остаток SoT = **StorageItem + movements**, не `Material.stockQty`.
4. КП = коммерческий snapshot, каталог не портится.
5. Document Studio — единая платформа документов (v8).
6. ~10 пользователей, single-tenant (v6).

---

## 2. Архитектура данных (Сущности)

### 2.1 Шесть кирпичей потока

```
Каталог → КП → Заказ → Производство → Склад → Отгрузка
```

Вокруг: Party (Counterparty/Organization/Person/Site), Documents, Supply, Finance, Access.

### 2.2 Консолидация дубликатов (все версии)

| Проблема | Целевое решение |
|----------|-----------------|
| Proposal / Quotation / Kp / CommercialProposal | **Quotation** (UI: «КП») |
| Client / Counterparty / Organization | **Counterparty** = клиент; **Organization** = мы |
| Employee / Worker | **Worker** + **User** |
| PurchaseOrder / SupplierOrder | **SupplyRequest → SupplyTask** (v8) |
| InventoryMovement / StockMovement | **StockMovement** |

### 2.3 Ключевые поля-связки

- `packageTag` — семья сделки / Картотека (v5 schema, v6 theory)
- `quotationId` / stub-КП при прямом заказе
- `counterpartyId` + `siteId` на заказе
- `line.ownerUserId` — ответственный на линии
- `materialsSource: own|customer` — soft gate цеха

### 2.4 v5/v6/v7 — уточнение по данным

| Версия | Модели | Примечание |
|--------|--------|------------|
| v5 | 47 Prisma, 89 API | Полный runnable CRM |
| v6 | 48 (+Comment, packageTag) | Код идентичен v5; BIG-BOOK, RBAC-MATRIX, FLOW-MAP |
| v7 | 11 Mongoose | Только catalog/BOM/admin; нет sales/warehouse |

---

## 3. Целостная Бизнес-логика

### 3.1 Сквозной поток

```
ПРОДАЖИ: Каталог → КП (витрина + A4) → sent → accepted → «в работу» → Заказ (без цен)
         Альтернатива: прямой заказ → auto stub-КП

ГОТОВНОСТЬ: изделие/модуль → ГОТОВ | НЕ ГОТОВ (модуль можно раньше изделия)

СНАБЖЕНИЕ: потребность → SupplyRequest (confirm) → SupplyTask → приход

ПРОИЗВОДСТВО: OrderTask на Ганте → soft gate материалов → завершение → приход ГП

ОТГРУЗКА: частичная (модуль за модулем) → Shipment; документ опционален

ЗАКРЫТИЕ: OrderClosing; [v6 план] Invoice → Payment → margin
```

### 3.2 Статусы (синтез)

**КП:** draft → sent (immutable version) → accepted → rejected; paid → auto ЗК (v5).

**Заказ:** new → confirmed → in_production → ready_to_ship → shipped → closed.

**Правила v6:** запрет КП paid → договор; один КП → один заказ; только RUB.

**Канон v8:** `docs/audits/2026-08-08-sales-to-shop-flow-canon.md`, `docs/PO-CANON.md`.

### 3.3 Роли

| Роль | Экран |
|------|-------|
| Менеджер | `/desk`, КП workspace |
| Директор | Картотека `/packages`, отчёты |
| Проектировщик | Очередь доукомплектования |
| Снабженец | `/supply` |
| Цех | Гант `/production` |
| Кладовщик | `/inventory` |
| Бухгалтер | `/finance` |

---

## 4. Золотой фонд фич (Lost & Found)

### 4.1 Must-have в финал

| # | Фича | Лучшая версия |
|---|------|---------------|
| 1 | KP Builder / Workspace (autosave, undo) | v1, v5, v8 |
| 2 | Puppeteer PDF | v1, v8 |
| 3 | Версионирование КП (immutable sent) | v1, v5, v6 |
| 4 | Guest preview КП | v1 |
| 5 | 3-zone proposal editor (витрина\|корзина\|A4) | v5 |
| 6 | Gantt plan vs actual | v4, v5 |
| 7 | Картотека packageTag + Comment | v5 schema, v6 |
| 8 | Compliance engine (8 операторов) | v2, v3 |
| 9 | EAV attributes | v3 |
| 10 | CRM Interactions (таймлайн) | v3 |
| 11 | Stock movements + reservations | v3, v8 |
| 12 | Shipments + ТОРГ-12/ТТН | v3, v5 |
| 13 | Cost roll-up из BOM | v2, v3 |
| 14 | «Скопировать КП для другого юрлица» 30 сек | v6 |
| 15 | Inline product search в строке КП | v3 |
| 16 | BOM inline editing | v7 |
| 17 | Backup management | v1 |
| 18 | Manager Desk `/desk` | v8 |
| 19 | Document Studio (единая платформа) | v8 plan |
| 20 | Desktop MCP import | v8 |
| 21 | StatusWorkflow configurable | v4, v5 |
| 22 | Role-segmented navigation | v4, v6 |
| 23 | SSE realtime (multi-window) | crm-generator |
| 24 | paidAt immutability на КП | crm-generator |

### 4.2 Намеренно не возвращать

Full accounting mega, tender mega, microservices, multi-warehouse, PurchaseRequest UI (legacy), PrimeNG visual.

---

## 5. Чек-лист вопросов для Создателя

### Стек

1. MongoDB (v8) vs PostgreSQL (v5/v6) — финально?
2. Next.js-линия закрыта навсегда?
3. Redis/BullMQ только для импорта или полностью через Desktop MCP?

### Домен

4. Контрагент = клиент И поставщик — два Counterparty или roles[]?
5. Worker↔User обязательная связь?
6. Картотека `/packages` — приоритет MVP?
7. Invoice/Payment/Refund (v6) или OrderClosing достаточно?

### Процессы

8. КП paid → сразу ЗК или сначала договор?
9. Один КП → один заказ — жёстко?
10. Гранулярность «готов к работе» — модуль, линия, операция?
11. Soft vs hard gate материалов?
12. Отгрузка без документа — достаточно статуса?

### UI

13. Эталон редактора КП: v1 undo/redo или v8 geometry 480px?
14. Guest preview нужен клиентам?
15. Витрина КП (лево/право) — MVP или polish?

### PLM

16. BOM depth: max 8 (v8) vs 10 (v2)?
17. Compliance в v1 продукта?
18. Digital Twin 4 стадии (v2/v3) или composition tree (v8)?

### Ops

19. Встроенный backup (v1) или ops-скрипты?
20. Synology — целевой хост?
21. Nx: следующий модуль после Doc Studio?

---

## Приложение A: Параллельная линия D:\ (не 8 папок analytics)

Цепочка **crm-generator → kppdf-8.0** (источник: exploration D:\ drive):

| Шаг | Папка | Вклад |
|-----|-------|-------|
| 1 | `crm-generator` | Production v1 Mongo: КП, PDF, Gantt, SSE, paidAt freeze |
| 2 | `crmgenerator_nx_01` | PostgreSQL lifecycle canon, snapshots, passports |
| 3 | `crm_03` | Manufacturing dictionaries, RBAC matrix |
| 4 | `crm_04` | ERP bridge: Order, BOM, SupplyRequest, Warehouse |
| 5 | `kppdf-8.0` | Mongo return, 90+ modules, Doc Studio, registries |

**Сознательные разрывы v8 vs crm_04:** Prisma→Mongoose, Client→Counterparty, CommercialOffer→Quotation.

**Off-lineage:** `my-crm` (Baserow), `nx-staging-crm` (пустой scaffold), `crm-fresh-run` (subset reset).

---

## Приложение B: Матрица зрелости v5–v7 (детализация)

| Аспект | v5 | v6 | v7 |
|--------|----|----|-----|
| Runnable CRM | ✅ full | ❌ landing only | ❌ admin tabs only |
| Frontend | Next.js | Angular stub | Angular admin SPA |
| Backend | Next API | none | NestJS REST |
| DB | PostgreSQL/Prisma | schema only | MongoDB/Mongoose |
| Sales flow | ✅ | 📄 docs | ❌ |
| Unique value | Working product + UI | Business canon | BOM + BullMQ import |

---

*Обновлять при новых инсайтах PO или смене канона v8. Integrity: ссылка из TZ при roadmap-решениях.*
