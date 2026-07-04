# kppdf-8.0

> **ERP-система для управления коммерческими предложениями, договорами, производством, складом, закупками и тендерами.**
> Ранняя стадия: описание доменной модели и инфраструктура для AI-агентов. Код приложения пока не написан.

---

## 📌 Что это

**kppdf-8.0** — это **ERP / производственная платформа** для автоматизации полного цикла работы с заказами:

- **Продажи** — коммерческие предложения (КП), договоры, заказы, отгрузки, отгрузочные документы.
- **Производство** — заказы на производство, наряды, операции, технологические процессы, себестоимость, закрытие заказов.
- **Склад** — остатки, движения, резервирование, инвентаризация.
- **Закупки** — заявки, заказы поставщикам, входящие счета, тендеры, РПП.
- **Документы** — гибкие шаблоны (блоки, таблицы), автоматическая генерация PDF по КП/договорам.
- **Финансы** — акты сверки, финансовые отчёты.
- **Identity & Access** — пользователи, роли, права, фича-флаги, rate-limiting.

Доменная модель (89 сущностей, 11 доменов) описана в [`docs/data-model.md`](docs/data-model.md).

---

## 🗂 Доменная модель (11 доменов, 89 сущностей)

Подробное описание полей каждой сущности — в [`docs/data-model.md`](docs/data-model.md).
Там же — секция «Дубликаты и аномалии» (16 пар дубликатов, 11 entity без PK, 24 избыточных поля).

| #  | Домен                       | Кол-во | Ключевые сущности |
|----|------------------------------|--------|-------------------|
| 1  | **Identity & Access**        | 7      | `User`, `Role`, `Permissions`, `FeatureFlag`, `RateLimitEntry` |
| 2  | **People & Contacts**        | 8      | `Person`, `Client`, `Counterparty`, `Worker`, `Interaction` |
| 3  | **Organizations**            | 3      | `Organization`, `OrgRole`, `Category` |
| 4  | **Products & Materials**     | 18     | `Product`, `Material`, `Bom`, `ProductModule`, `Certificate`, `AttributeDefinition` |
| 5  | **Production**               | 11     | `ProductionOrder`, `WorkType`, `WorkCenter`, `WorkOrder`, `CostCalculation` |
| 6  | **Sales & Commerce**         | 11     | `Proposal`, `Quotation`, `Contract`, `Order`, `Shipment`, `CartItem` |
| 7  | **Warehouse & Inventory**    | 6      | `Warehouse`, `StorageItem`, `InventoryItem`, `StockMovement`, `Reservation` |
| 8  | **Procurement**              | 10     | `PurchaseRequest`, `SupplierOrder`, `Tender`, `Rpp`, `IncomingInvoice` |
| 9  | **Documents & Templates**    | 6      | `DocumentTemplate`, `TemplateBlock`, `DocType`, `TableTemplate` |
| 10 | **Finance**                  | 3      | `ReconciliationAct`, `FinancialReport`, `Setting` |
| 11 | **System & Activity**        | 6      | `StatusWorkflow`, `EntityStatus`, `ImportJobs`, `OrderHistory`, `UserActivity` |
|    | **Итого**                    | **89** | |

**Стек-сигнатуры из доменной модели:** MongoDB-стиль (ObjectId, `*Id`/`*Ids`, `createdAt`/`updatedAt`/`deletedAt`, `is*`-флаги) → бэкенд скорее всего на Node.js (NestJS/Mongoose) или Python. UI — гибкие шаблоны документов → SPA с PDF-генерацией.

> ⚠️ Стек **пока не зафиксирован** — `STACK.md` авто-генерируется из manifests проекта, и сейчас manifests нет. См. [«Как определить стек»](#-как-определить-стек).

---

## 📁 Структура репозитория

```
kppdf-8.0/
├── README.md                      ← вы здесь
├── docs/
│   └── data-model.md              ← структурированная модель (11 доменов, дубликаты, статистика)
├── OrchestratorKit/               ← переносимый kit для AI-агентов (TZ, скрипты, шаблоны)
│   ├── README.md                  ← описание kit-а
│   ├── QUICKSTART.md              ← 5 шагов от нуля до первого TZ
│   ├── AGENTS.md                  ← мануал для ИИ-агента
│   ├── kit-init.sh                ← bootstrap (создаёт root progress/ARCHITECTURE/STACK)
│   ├── kit-stack.sh               ← auto-detect стека → STACK.md
│   ├── make-tz.sh                 ← создать новый TZ-NN.txt
│   ├── auto-archive.sh            ← финализация TZ (move → _archive, обновить STATUS)
│   ├── verify-status.sh           ← двусторонняя синхронизация STATUS.md ↔ FS
│   ├── STATUS.md                  ← at-a-glance board (READY / IN WORK / DONE / FAILED)
│   ├── _templates/                ← шаблоны TZ, STATUS, STACK, stack-specific
│   ├── _active/                   ← TZ в работе (создаётся kit-init.sh)
│   ├── _archive/                  ← завершённые TZ (YYYY-MM/, создаётся kit-init.sh)
│   └── .mimocode/locks/           ← lock-файлы DONE-задач (создаётся kit-init.sh)
├── STACK.md                       ← авто-сгенерированный kit-ом: стек проекта
├── progress.md                    ← журнал прогресса (обновляется после каждого TZ)
└── ARCHITECTURE.md                ← архитектурный документ
```

---

## 🚀 Quickstart

Проект в стадии **«доменная модель определена, код не написан»**. Для перехода к разработке:

### 1. Прочитать модель
```bash
# Краткий обзор — в этом README, выше
# Полное описание 89 сущностей:
cat docs/data-model.md
```

### 2. Запустить OrchestratorKit
В проекте уже есть `OrchestratorKit/` — переносимая система задач для AI-агентов.
Она берёт [`docs/data-model.md`](docs/data-model.md) как ТЗ и превращает его в отдельные задачи (TZ) для агентов.

```bash
# Bootstrap: создаст _active/, _archive/, .mimocode/locks/, root progress/ARCHITECTURE
bash OrchestratorKit/kit-init.sh

# Прочитать quickstart kit-а
cat OrchestratorKit/QUICKSTART.md
```

### 3. Создать первую задачу (TZ)
```bash
# Создаёт TZ-01.txt по шаблону + добавляет запись в STATUS.md
bash OrchestratorKit/make-tz.sh "Initialize NestJS backend with Mongoose"
```

### 4. Передать агенту
```
«Прочитай OrchestratorKit/AGENTS.md и TZ-01.txt, затем выполни TZ-01.»
```

### 5. Проверить синхронизацию
```bash
# Должен быть PASS — STATUS.md синхронизирован с файловой системой
bash OrchestratorKit/verify-status.sh
```

---

## 🧪 Определить стек

Сейчас manifests проекта (`package.json`, `requirements.txt`, `go.mod` и т.п.) отсутствуют, поэтому `STACK.md` пустой. Чтобы авто-детект заработал:

```bash
# Вариант 1: инициализировать проект (например, NestJS)
npx @nestjs/cli new backend
# → kit-stack.sh при следующем запуске увидит package.json и заполнит STACK.md

# Вариант 2: вручную создать минимальный package.json
cat > package.json <<'EOF'
{
  "name": "kppdf-8.0",
  "version": "0.1.0",
  "private": true
}
EOF
bash OrchestratorKit/kit-stack.sh --force
```

После этого `STACK.md` заполнится реальным стеком. Kit-stack.sh также поддерживает `requirements.txt` (Python), `go.mod` (Go), `Cargo.toml` (Rust), `pyproject.toml`, `pom.xml` — для каждого стека есть специализированный шаблон в `OrchestratorKit/_templates/_stacks/`.

---

## 📊 Текущий статус

- ✅ **Доменная модель:** 89 entity, 11 доменов, задокументированы дубликаты и аномалии
- ✅ **Инфраструктура для AI-агентов:** OrchestratorKit полностью функционален (после фикса STACK-template.md)
- ⚠️ **Стек проекта:** не определён (нет manifests)
- ⚠️ **Код приложения:** не начат
- ⚠️ **Дубликаты в модели:** 16 пар/троек требуют консолидации (см. `docs/data-model.md` § «Дубликаты и аномалии»)

---

## 📚 Ссылки

- [`docs/data-model.md`](docs/data-model.md) — структурированная модель (полное описание полей, дубликаты, статистика)
- [`STACK.md`](STACK.md) — авто-генерируемый стек проекта
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — архитектурный документ (заготовка)
- [`progress.md`](progress.md) — журнал прогресса
- [`OrchestratorKit/README.md`](OrchestratorKit/README.md) — описание kit-а для AI-агентов
- [`OrchestratorKit/QUICKSTART.md`](OrchestratorKit/QUICKSTART.md) — 5 шагов от нуля до первого TZ
- [`OrchestratorKit/AGENTS.md`](OrchestratorKit/AGENTS.md) — мануал для ИИ-агента

---

_Документ создан: 2026-07-04. При изменении доменной модели — обновляйте [`docs/data-model.md`](docs/data-model.md) + соответствующие секции этого README._
