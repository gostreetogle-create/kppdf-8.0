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
│   ├── data-model.md              ← структурированная модель (11 доменов, дубликаты, статистика)
│   └── data-model-audit.md        ← аудит модели (консолидация, target schema)
├── tasks/                         ← 👁️ ТВОЯ ПАПКА: файлы задач (TZ-NN.md)
│                                    (агент удаляет файл после выполнения)
├── backend/                       ← сюда агент кладёт backend-код (пока пусто)
├── frontend/                      ← сюда агент кладёт frontend-код (пока пусто)
├── OrchestratorKit/               ← 🔒 МОЯ ПАПКА: автоматизация, скрипты, архив (не трогать)
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

### ⚡ Запустить локально одной командой

**Из корня проекта** (любая ОС, Node 20+, Docker Desktop, pnpm 8+):

```bash
# ── Прямой вызов (всегда работает):
node start.mjs                # полный запуск (Mongo в Docker + backend + frontend + browser)
node start.mjs --tail         # TUI-режим: live-логи в одном TTY-окне
node start.mjs --check        # только pre-flight проверки
node start.mjs --stop         # остановить backend + frontend
node start.mjs --reset        # полный сброс: docker down -v + rm node_modules
node start.mjs --no-browser   # без авто-открытия браузера
node start.mjs --help         # справка

# ── npm-скрипты (из корня, где есть package.json):
npm start                     # = node start.mjs --check (безопасный preflight, не висит)
npm run start:all             # = node start.mjs (полный запуск, висит пока работает)
npm run start:tail            # = node start.mjs --tail (TUI-режим)
npm run check:start           # = node start.mjs --check
npm run stop:start            # = node start.mjs --stop
npm run reset:start           # = node start.mjs --reset
npm run start:no-browser      # = node start.mjs --no-browser
npm run start:prod            # = node start.mjs --prod (production: pnpm build + node dist/main.js + static server)

# ── ENV-переменные:
NO_TUI=1 node start.mjs       # отключить TUI (для CI / пайп-режима), даже если передан --tail
NO_COLOR=1 node start.mjs     # отключить ANSI-цвета

# ── Платформенные обёртки (chmod +x start.sh на Unix):
./start.sh --check            # bash: работает из любой директории
.\start.cmd --check           # Windows cmd: ОБЯЗАТЕЛЬНО префикс .\ иначе Windows путает с built-in `start`
```

**Что делает `start.mjs`:**
1. ✅ Pre-flight: Node 20+, pnpm 8+, Docker daemon, `.env` (hard-fail на занятых 3000/4200)
2. ✅ `docker compose up -d mongo` (replica set rs0) — **бэкенд локально** (обход Dockerfile pnpm blocker из TZ-18)
3. ✅ Ждёт `rs.status().ok === 1`
4. ✅ `pnpm install` в `backend/` и `frontend/` (если нужно)
5. ✅ `pnpm start:dev` для backend на :3000
6. ✅ `pnpm start` для frontend на :4200
7. ✅ Polls /api/health + GET /, парсит body, измеряет латентность
8. ✅ **TUI-режим (`--tail`)** — рисует 3 строки статуса с in-place обновлением + ring buffer логов (последние 5 строк на сервис)
9. ✅ Финальная "Ready" панель с латентностями /api/health и / для backend/frontend
10. ✅ Открывает браузер на http://localhost:4200
11. ✅ Ctrl+C → чистая остановка backend + frontend (Mongo остаётся работать)

**Endpoints после старта:**
- Backend: http://localhost:3000/api/health
- Frontend: http://localhost:4200
- Login: `admin` / `admin-change-me-immediately-in-production` (admin user seeded by `AdminSeed`)
- UI Kit showcase: http://localhost:4200/kit ( хедер → кнопка "🎨 UI Kit")

**Требования:** Node 20+, pnpm 8+, Docker Desktop.

**Кросс-платформенность:** Windows 10+ (cmd/PowerShell/Git Bash), macOS, Linux.

**⚠️ Важно для Windows:** не вводите `start --check` без `.\` — Windows путает с built-in командой `start` (для открытия файлов). Используйте `.\start.cmd --check` или `node start.mjs --check` или `npm run start:check`.

### 🛠️ Под капотом

Архитектура проекта:
- Backend: NestJS 10 + Mongoose 8 + MongoDB Replica Set — 18 модулей, 65+ entities (TZ-02..TZ-18)
- Frontend: Angular 20 + TailwindCSS + AG Grid + CDK — 35+ UI Kit компонентов (TZ-19..TZ-40)
- Auth: JWT (access+refresh), bcrypt, RBAC, 30+ permission keys (TZ-04)
- Audit: все мутации автоматически логируются в AuditLog (TZ-05)

### 📂 Структура репозитория

```
kppdf-8.0/
├── start.mjs                     ← ⚡ ЕДИНЫЙ СТАРТЕР (Node 20+)
├── docker-compose.yml            ← Mongo + mongo-init (бэк локально)
├── .env                          ← переменные окружения (не в git)
├── docs/                         ← data-model.md, data-model-audit.md
├── tasks/                        ← текущие TZ-NN.md (агент удаляет после выполнения)
│   └── _archive/                 ← завершённые TZ
├── backend/                      ← NestJS приложение
├── frontend/                     ← Angular приложение
├── OrchestratorKit/              ← 🔒 kit для AI-агентов (TZ-flow, скрипты, шаблоны)
├── STACK.md / progress.md / ARCHITECTURE.md  ← сгенерированы kit-ом
└── mimo.exe                      ← CLI-агент (не в git)
```

### 🛑 Остановить всё

```bash
node start.mjs --stop   # убивает backend + frontend
docker compose down      # убивает Mongo (если нужно)
```

### 🎨 UI Kit (Paper & Ink)

Кастомный UI Kit на базе TailwindCSS + Lucide Angular. Доступен по ссылке **http://localhost:4200/kit** (кнопка в хедере).

**Структура компонентов:**
```
frontend/src/app/shared/ui/
├── button/          — PiButton (6 variants × 4 sizes)
├── badge/           — PiBadge (status indicators)
├── form-field/      — PiFormField (input wrapper)
├── dialog/          — PiDialog + PiAlertDialog
├── toast/           — PiToast notifications
├── pi-tabs/         — PiTabs
├── pi-accordion/    — PiAccordion
├── pi-drawer/       — PiDrawer (side panel)
├── pi-empty-state/  — PiEmptyState
├── pi-empty-tile/   — PiEmptyTile (placeholder)
├── pi-row-actions/  — PiRowActions (table row buttons)
├── select/          — PiSelect dropdown
├── switch/          — PiSwitch toggle
├── textarea/        — PiTextarea
├── input/           — PiInput
├── label/           — PiLabel
├── separator/       — PiSeparator
├── skeleton/        — PiSkeleton (loading)
├── progress/        — PiProgress bar
├── scroll-area/     — PiScrollArea
├── slider/          — PiSlider
├── radio/           — PiRadio
├── charts/          — PiBarChart, PiLineChart
└── menu/            — PiNavDropdown, PiContextMenu
```

**Kit страницы:** overview, foundations (tokens), basics, forms, overlays, navigation, playground (theme editor, code preview)

### 3. 📂 Рабочий цикл — `tasks/` = твоя папка, `OrchestratorKit/` = моя закрытая

| Где | Что | Кто трогает |
|-----|-----|-------------|
| **`tasks/`** | Файлы задач `TZ-NN.md` — там появляются задачи, которые я тебе сгенерировал | **Ты** — смотришь, отдаёшь агенту, файл исчез = готово |
| **`OrchestratorKit/`** | Моя закрытая папка: скрипты, шаблоны, архив выполненных задач, лок-файлы | **Я** (Buffy) — автоматизация, не лезь |
| `backend/`, `frontend/` | Куда агент кладёт код по задачам | Агент по задачам |
| `docs/`, `README.md`, `STACK.md` | Документация | По мере необходимости |

**Конвенция имён TZ-файлов:** `TZ-NN.md` (короткий, без описательного суффикса — заголовок берётся из первой строки файла, например `TZ-01: Запустить backend`).

**Workflow (одна задача за раз):**
1. Я кладу файл в `tasks/TZ-NN.md` с описанием задачи.
2. Ты видишь файл в `tasks/` → отдаёшь его агенту (другому AI).
3. Агент делает работу по критериям приёмки.
4. Агент **удаляет файл из `tasks/`** (это сигнал «выполнено»).
5. Я вижу что `tasks/` пустая → кладу следующую задачу.
6. Повторяем пока проект не готов.

> 💡 Если `tasks/` пустая — все задачи выполнены, жди от меня следующую.

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
