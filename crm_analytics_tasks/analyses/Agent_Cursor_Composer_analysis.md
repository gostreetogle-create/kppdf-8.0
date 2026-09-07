# Анализ 8 версий CRM — Agent_Cursor_Composer

> **Агент:** Agent_Cursor_Composer  
> **Дата:** 2026-08-30  
> **Источник:** `D:\Для аналитики все kppdf\` (kppdf … kppdf-8.0)  
> **Доп. линия:** `D:\crm-generator` → `crmgenerator_nx_01` → `crm_03` → `crm_04` → kppdf-8.0

---

## 1. Технологический стек и Архитектура

### 1.1 Эволюция по версиям

| Версия | Frontend | Backend | БД | Уникальная архитектурная идея |
|--------|----------|---------|-----|-------------------------------|
| **v1** (kppdf) | Angular 21, свой UI-kit, Storybook | Express + Mongoose | MongoDB | Монолит «КП = продукт», Puppeteer PDF |
| **v2** | Angular 21 + PrimeNG | Express + Helmet, rate-limit | MongoDB | PLM Digital Twin, SSE notifications |
| **v3** | Angular 21 + kp-* DS (~30 компонентов) | Express, `/api/v1/directories/*` | MongoDB | Generic `/modules` CRUD hub (13 сущностей) |
| **v4** | Angular 21 + Lucide, dark theme | Express ESM + Swagger + Pino | MongoDB + ChromaDB | Role-segmented nav (6 ролей) |
| **v5** | Next.js 16 + React 19 + Tailwind 4 | Next Route Handlers (монолит) | **PostgreSQL + Prisma** | 44 pages, 89 API, full CRM runtime |
| **v6** | = v5 (код идентичен) + Angular landing stub | = v5 | PostgreSQL + Prisma (+Comment) | BIG-BOOK, 221 MD, бизнес-канон |
| **v7** | Angular 22, custom SCSS (без DS) | NestJS 11 + BullMQ | MongoDB RS + Redis | Greenfield BOM, monolith admin SPA |
| **v8** | Angular 20 + Paper & Ink (OKLCH) | NestJS 10 | MongoDB RS | 87 BE-модулей, Desktop Tauri, frontend-nx |

### 1.2 Целевой стек (синтез для финального продукта)

| Слой | Решение | Откуда |
|------|---------|--------|
| Frontend | Angular standalone + signals + OnPush | v8 |
| Design System | Paper & Ink: OKLCH, hairline, icon-rail 480px overlay | v8 |
| Backend | NestJS модульный монолит | v8 |
| БД | MongoDB Replica Set (транзакции склада) | v8 |
| PDF | Puppeteer серверный рендер | v1, v8 |
| Desktop | Tauri 2 + MCP + mutation-journal (HITL) | v8 |
| Auth | JWT + refresh + RBAC capabilities + device invite | v1 + v8 |
| Очереди | BullMQ + Redis — только тяжёлый импорт | v7 |
| Тесты | Jest + Playwright + architecture:check | v8 |
| Deploy | Synology + `start.mjs` | v5 deploy/, v8 |

**Не переносить:** микросервисы, Kafka/Rabbit, ChromaDB как SoT, Next.js runtime, PrimeNG UI, multi-warehouse/zones (PO-CANON).

### 1.3 Архитектурные принципы

1. **Один write-path** на сущность (Desktop/MCP/UI не дублируют SoT).
2. **Counterparty ≠ Organization** — клиент сделки vs наша фирма (v8; v7 имел unified Organization с partyTypes).
3. **Остаток SoT = StorageItem + StockMovement**, не `Material.stockQty`.
4. **КП = коммерческий snapshot** — правки каталога не протекают в отправленные КП/заказы.
5. **Document Studio** — единая платформа документов вместо Builder + Studio + КП workspace (v8).
6. **~10 пользователей, single-tenant** — без enterprise-overhead (v6).
7. **Snapshot immutability** при переходах КП→Order→Shipment (v8 CORE-301, crmgenerator_nx).
8. **Атомарная нумерация** через Counter + MongoDB transaction (v8).

### 1.4 Параллельная линия D:\ (контекст наследия)

| Шаг | Папка | Вклад в v8 |
|-----|-------|------------|
| 1 | crm-generator | КП/PDF, Gantt, SSE sync, paidAt freeze, YouGile |
| 2 | crmgenerator_nx_01 | Lifecycle canon, snapshots, passports, client finance |
| 3 | crm_03 | Manufacturing dictionaries, RBAC matrix в DB |
| 4 | crm_04 | Order, BOM, SupplyRequest, Warehouse (ближайший Prisma-предок) |
| 5 | kppdf-8.0 | Mongo return, 90+ modules, Doc Studio, registries |

**Сознательные разрывы:** Prisma→Mongoose, Client→Counterparty, CommercialOffer→Quotation.

---

## 2. Архитектура данных (Сущности)

### 2.1 Карта доменов (11 зон, синтез v3 + v8)

```
Identity & Access → User, Role, Permissions, FeatureFlag, DeviceEnrollment
Party → Counterparty, Organization, Person, Worker, Site, Interaction
Catalog → Product, ProductModule, Material, BOM/composition[], Certificate, ProductPassport
Sales → Quotation, Contract, Order, Shipment, CartSession, DeskNote
Production → ProductionOrder, OrderTask, WorkType, WorkCenter, WorkOrder, TechProcess
Warehouse → Warehouse, StorageItem, StockMovement, Reservation
Supply → SupplyRequest, SupplyTask (+ legacy PurchaseRequest read-only)
Documents → DocumentTemplate, TextBlock, TableTemplate, GeneratedDocument, StudioDocument
Finance → OrderClosing, ReconciliationAct, FinancialReport (+ Invoice/Payment план v6)
System → Counter, StatusWorkflow, Comment, Audit, Setting
```

### 2.2 Главные сущности (язык для создателя)

| Сущность | Смысл | Связи |
|----------|-------|-------|
| Counterparty | Клиент/покупатель | N КП, N заказов, N Site |
| Organization | Наша фирма (бланк КП) | шаблоны, НДС, подписант |
| Person | Контактное лицо | M2M с контрагентом |
| Site | Объект монтажа у клиента | FK на заказ |
| Product | Изделие на полке каталога | composition[], модули |
| ProductModule | Сборочная единица | материалы, виды работ |
| Material | Сырьё/деталь/метиз | StorageItem на складе |
| Quotation (КП) | Коммерческое предложение | → Contract, Order; версии |
| Contract | Договор | → ProductionOrder |
| Order | Заказ на изготовление (без цен сделки) | OrderItem, снабжение, Гант |
| ProductionOrder (ЗК) | Производственный заказ | OrderTask, Worker |
| SupplyRequest/Task | Закупка | ← потребность заказа |
| StorageItem | Остаток на складе | XOR productId/materialId |
| Shipment | Отгрузка (частичная) | order + изделие + модуль |
| DocumentTemplate | Шаблон A4 | блоки, таблицы, фон |
| Worker | Сотрудник цеха | ≠ User (логин) |

### 2.3 Консолидация дубликатов

| Дубликаты в истории | Целевое имя |
|---------------------|-------------|
| Proposal / Quotation / Kp / CommercialProposal | **Quotation** |
| Client / Counterparty | **Counterparty** (клиент) |
| Organization (как клиент) | **Organization** (только мы) |
| Employee / Worker | **Worker** + **User** |
| PurchaseOrder / SupplierOrder | **SupplyRequest → SupplyTask** |
| InventoryMovement / StockMovement | **StockMovement** |
| ProductModule / Modules / BomModule | **ProductModule** + composition[] |
| Role / Roles | **Role** |

### 2.4 Ключевые поля-связки

- `packageTag` — семья сделки / Картотека (v5/v6)
- `parentProposalId` / `version` — история КП
- `quotationId` + stub-КП при прямом заказе (v8 D7)
- `counterpartyId` + `siteId` на заказе (v8 D20)
- `line.ownerUserId` — ответственный на линии (v8 D18)
- `procureConfirm {by, at}` — подтверждение закупки
- `materialsSource: own|customer` — soft gate (v8 D19)
- `priceSnapshot` на строках договора/КП — immutable цены

### 2.5 Зрелость данных по версиям

| Версия | Сущностей | Состояние |
|--------|-----------|-----------|
| v1 | 8 MongoDB моделей | КП-центрично |
| v2 | 20 модулей | + Order, BOM, compliance |
| v3 | 33 Mongoose | полный PLM + EAV |
| v4 | 33 Mongoose | + finance, Gantt, status-workflows |
| v5 | 47 Prisma | полный runnable |
| v6 | 48 Prisma (+Comment) | теория + schema bootstrap |
| v7 | 11 Mongoose | catalog/BOM only |
| v8 | ~90 схем | полный ERP |

---

## 3. Целостная Бизнес-логика

### 3.1 Сквозной поток (единый механизм)

```
A. ОБЫЧНЫЙ ПУТЬ (менеджер)
   Каталог (полка) → КП (витрина + A4 + скидки)
   → sent (immutable version) → accepted
   → «Отдать в работу» → Заказ (состав, БЕЗ цен сделки)
   → развилка готовности

B. БЫСТРЫЙ ПУТЬ (директор/производство)
   Создать заказ → auto stub-КП «создано от заказа»

C. РАЗВИЛКА ГОТОВНОСТИ (изделие / модуль)
   ГОТОВ → снабжение + Гант → цех (soft gate материалов)
         → склад ГП → отгрузка (частичная)
   НЕ ГОТОВ → очередь проектировщику
         → можно выдать ОТДЕЛЬНЫЙ модуль раньше

D. СНАБЖЕНИЕ
   Потребность из BOM заказа
   → SupplyRequest (confirm «можно заказывать»)
   → SupplyTask → приход StockMovement IN

E. ПРОИЗВОДСТВО
   OrderTask на Ганте (виды работ × люди)
   → факт часов → completed → приход ГП

F. ОТГРУЗКА
   Shipment (заказ + изделие + модуль)
   → документ опционален; статус «Отгружено» допустим без PDF

G. ЗАКРЫТИЕ
   OrderClosing → [v6 план] Invoice → Payment → margin
```

### 3.2 Статусы

**КП:** `draft` → `sent` (+ version freeze) → `accepted` / `rejected` → [v5] `paid` → auto ЗК

**Заказ:** `new` → `confirmed` → `in_production` → `ready_to_ship` → `shipped` → `closed`

**ЗК:** `planned` → `in_progress` → `completed` → auto приход ГП

**Снабжение:** `requested` → `approved` → `ordered` → `received` → `closed`

**Правила v6/v8:** один КП → один заказ; запрет paid→договор; только RUB; скидки только в КП.

### 3.3 Роли и экраны

| Роль | Экран | Действия |
|------|-------|----------|
| Менеджер | `/desk`, КП workspace | Сборка сделки, печать, в работу |
| Директор | `/packages`, отчёты | Семьи сделок, margin |
| Проектировщик | Очередь доукомплектования | Ready на модуль/изделие |
| Снабженец | `/supply` | Confirm + реестр закупок |
| Начальник цеха | `/production` Gantt | Распределение задач |
| Кладовщик | `/inventory` | Приход/расход, отгрузка |
| Бухгалтер | `/finance` | Сверки, закрытие |

### 3.4 Автоматизации (must-have)

- Автонумерация: КП, Д, ЗК, ЗП, СД, АС через Counter
- Autosave КП (debounce 2s, v1)
- paid → auto ProductionOrder (v5)
- completed ЗК → auto приход (v5)
- Snapshot при конвертации КП→заказ
- Audit log (кто/когда менял)
- Idempotency на критичных POST

### 3.5 Бизнес-правила (канон)

1. Скидки/наценки только в КП — каталог не портится.
2. Заказ = что изготовить; прайс сделки не живёт на заказе.
3. Склад — один, разделы внутри (металл, метизы…), без мультисклада.
4. Частичная отгрузка модулей — да.
5. Soft gate материалов для цеха (warning, не блок).
6. Семья КП: master/variant по Organization (бланк).
7. Desktop import — propose→confirm, не прямой write.
8. Compliance: блокировка паспорта при нарушениях (v2/v3, опционально).

### 3.6 Что терялось между версиями (дыры в цепочке)

| Переход | Потеря | Критичность |
|---------|--------|-------------|
| v1→v2 | KP Builder, PDF, versioning, guest, backups | 🔴 критично |
| v3→v4 | BOM versioning, compliance, EAV, interactions, shipments docs | 🟠 высокая |
| v4→v5 | Role guards → Next monolith (другой стек) | 🟡 архитектурный pivot |
| v5→v8 | 44 pages Next → Angular rebuild; packageTag UI не перенесён | 🟠 |
| v7→v8 | BullMQ import, BOM inline, Employee model | 🟡 выборочно вернуть |

---

## 4. Золотой фонд фич (Lost & Found)

### 4.1 Критичные — обязательно в финал

| # | Фича | Версия | Почему |
|---|------|--------|--------|
| 1 | KP Builder/Workspace: autosave, undo/redo, canDeactivate | v1 | Ядро продукта |
| 2 | Puppeteer PDF export/preview | v1, v8 | Качество печати |
| 3 | Версионирование КП (immutable sent) | v1, v5, v6 | История для клиента |
| 4 | Guest preview `/guest-preview/:token` | v1 | Показ без логина |
| 5 | 3-zone editor: витрина\|корзина\|A4 preview | v5 | Скорость сборки КП |
| 6 | Gantt plan vs actual + worker load | v4, v5, crm-generator | Цех |
| 7 | Картотека packageTag + Comment | v5, v6 | Директорский обзор |
| 8 | «Скопировать для другого юрлица» 30 сек | v6 | Реальная боль |
| 9 | Inline product search в строке таблицы КП | v3 | Скорость |
| 10 | Stock movements + reservations журнал | v3, v8 | Аудит склада |
| 11 | Shipments + ТОРГ-12/ТТН | v3, v5 | Логистика |
| 12 | Cost roll-up из BOM | v2, v3 | Маржа |
| 13 | Manager Desk `/desk` expand-in-row | v8 | Стол менеджера |
| 14 | Document Studio (единая платформа) | v8 plan | 3 редактора → 1 |
| 15 | Desktop MCP Excel import HITL | v8 | Массовый ввод |
| 16 | paidAt immutability (403 на edit) | crm-generator | Защита оплаченного КП |
| 17 | SSE multi-window sync | crm-generator | Несколько вкладок |
| 18 | Backup management UI | v1 | Ops безопасность |
| 19 | StatusWorkflow configurable | v4, v5 | Гибкость FSM |
| 20 | Role-segmented navigation | v4, v6 | UX по ролям |
| 21 | Compliance engine (8 операторов) | v2, v3 | Качество/регуляторика |
| 22 | EAV attributes | v3 | Гибкий каталог |
| 23 | CRM Interactions timeline | v3 | История с клиентом |
| 24 | BOM inline editing | v7 | Удобство конструктора |
| 25 | fixedDimensions / isImmutable на материале | v7→v8 | Толщина листа |
| 26 | kp-product-picker + block rail 280px | v3 | Редактор КП |
| 27 | Dark/Light theme toggle | v1, v4 | PO требует |
| 28 | DaData INN lookup | v5 | Быстрый ввод контрагента |
| 29 | RAL selector (цвет покраски) | v5 | Цепочка КП→ЗК |
| 30 | Generic `/modules` dynamic CRUD | v3 | Быстрый онбординг сущностей |

### 4.2 UI/UX паттерны

- Icon-rail + flyout overlay 480px, A4 не reflow (v8)
- Glassmorphism / section-colored sidebar 7 палитр (v5)
- Monolith admin для dev/debug (v7)
- App Guide in-app карта (v4)
- Permission-gated sidebar `*appCan` (v1)
- Snapshot immutability badge на архивных документах

### 4.3 Намеренно не возвращать

- Full accounting / tender mega / CRM-звонки (v8 removed)
- Microservices / message brokers
- ChromaDB как SoT
- Multi-warehouse / zones / cells
- PurchaseRequest/PurchaseOrder UI (legacy)
- PrimeNG visual language
- jsPDF как основной PDF pipeline

### 4.4 Вердикт синтеза

**Финальный продукт =** архитектура v8 + КП/PDF из v1 + quotation editor из v3/v5 + бизнес-правила v6 BIG-BOOK + BOM из v7 + PLM v3 (выборочно) + ops-паттерны crm-generator.

---

*Конец файла анализа. Вопросы → `../questions/Agent_Cursor_Composer_questions.md`*
