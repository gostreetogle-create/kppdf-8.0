# kppdf-8.0

> Цеховой ERP (~10 пользователей): продажи / КП → заказ → снабжение / производство → склад / отгрузка.  
> Стек: **Angular 20** + **NestJS 10** + **MongoDB 7 Replica Set**. UI: **Paper & Ink** (OKLCH, hairline).  
> Разработка ведётся ИИ-агентами по executable TZ. GitHub = хранилище кода (без GitHub Actions / Dependabot).

---

## Для ИИ, открывшего репозиторий

**Вход:** skill [`kppdf-context-preflight`](.agents/skills/kppdf-context-preflight/SKILL.md). SoT = `docs/` + `.agents/skills/`. Не `.ai/`. Cursor = TZ only; Executor = код + FIC. `.claude/rules` не используем (см. [`docs/agents/CLAUDE-CODE.md`](docs/agents/CLAUDE-CODE.md)). Аудит: [`docs/audits/2026-08-24-agent-skills-ai-folder-audit.md`](docs/audits/2026-08-24-agent-skills-ai-folder-audit.md).

Не читай весь репозиторий. Следуй порядку ниже — иначе сломаешь контур агентов и доменные имена.

### Порядок чтения (обязательный)

| Шаг | Файл | Зачем |
|-----|------|--------|
| 0 | [`docs/how-to-connect-ai.md`](docs/how-to-connect-ai.md) | Workspace: continuous = `main`, isolated = `.worktrees/<TASK-ID>`; `.freebuff/worktrees` запрещён |
| 1 | [`GEMINI.md`](GEMINI.md) | Контракт исполнителя: claim, gates, archive, DoD |
| 2 | [`docs/PROJECT-MEMORY.md`](docs/PROJECT-MEMORY.md) | Куда смотреть «правду»; что не потерять при DONE |
| 3 | [`docs/PO-CANON.md`](docs/PO-CANON.md) | Планка качества PO, север продукта, антипаттерны |
| 4 | [`docs/CONTEXT.md`](docs/CONTEXT.md) | Доменный язык (Counterparty ≠ Organization и т.д.) |
| 5 | [`docs/agent-checklists/_NOW.md`](docs/agent-checklists/_NOW.md) + `tasks/_active/` | Текущая очередь и conflict keys |
| 6 | Своя TZ + checklist + релевантный `docs/pages/*.page.md` | Только зона задачи |

Справочники по необходимости (не startup): [`docs/AI-AGENT-GUIDE.md`](docs/AI-AGENT-GUIDE.md), [`ARCHITECTURE.md`](ARCHITECTURE.md), [`docs/DEVELOPMENT-PATTERNS.md`](docs/DEVELOPMENT-PATTERNS.md), [`docs/DOMAIN-MAP.md`](docs/DOMAIN-MAP.md), [`docs/data-model.md`](docs/data-model.md) — **живая schema в `backend/src/modules/` побеждает** data-model.md.

### Роли агентов

| Роль | Кто | Делает | Не делает |
|------|-----|--------|-----------|
| **Архитектор / TZ-author** | Cursor | Спеки, grilling, UX-smell → TZ, review текстом | Product-код (`frontend/**`, `backend/**/*.ts`) |
| **Исполнитель** | Freebuff / Claude CLI / Gemini | Код по TZ, gates, archive, commit по политике | Roadmap «улучшить всё»; deploy без явной команды PO |
| **Peer** | MCP `claude_code` из Cursor | Analysis-only: архитектура, идеи, review | Grind, product files |
| **Perplexity** | MCP | Выжимка сайта/статьи | Канон репо, TZ, код |
| **Kit** | `OrchestratorKit/` | Только kit `TZ-NN.txt` (отдельный контур) | Root `tasks/TZ-*.md` |

Skills: [`.agents/skills/kppdf-project/SKILL.md`](.agents/skills/kppdf-project/SKILL.md) · карта: [`docs/agents/SKILLS-MAP.md`](docs/agents/SKILLS-MAP.md).

### Критичные запреты

- Без **CLAIM** (`tasks/_active/<ID>.md` + Claim slot в checklist) — не писать product-код.
- Не `git add -A` / не коммитить чужой WIP. Политика: [`docs/GIT-POLICY.md`](docs/GIT-POLICY.md).
- Deploy / wipe — только по явной команде PO (`deploy/synology/`, `docs/ops/DANGEROUS-OPS.md`).
- Не путать: **клиент = `Counterparty`**, **наша фирма = `Organization`**; остаток склада SoT = **`StorageItem`**, не `Material.stockQty`; КП ≠ Order.
- Смысл статуса/поля на нескольких экранах — [`docs/COUPLING-MAP.md`](docs/COUPLING-MAP.md); локальный «активный» запрещён.
- Проверки только локальные (tsc / jest / lint / `pnpm architecture:check`). CI на GitHub не добавлять.

---

## Что это за продукт

ERP для небольшого производства: менеджер ведёт сделки и документы, цех — производство, склад — остатки и отгрузку. UI на русском; цель — рабочий продукт для показа коллегам, не демо-заглушка.

| Контур | Содержание |
|--------|------------|
| **Продажи** | КП (`Quotation`), договоры, заказы, стол менеджера `/desk`, отгрузка |
| **Каталог** | Продукция, модули, материалы, состав (BOM) — SoT будущих документов |
| **Производство** | Наряды, виды работ, cockpit / Гант |
| **Склад** | Остатки, движения, резервы (READY TO USE — см. readiness) |
| **Снабжение** | Заявки / задачи снабжения (не legacy PurchaseRequest UI) |
| **Документы** | Шаблоны, builder, PDF |
| **Desktop** | Tauri: HITL-импорт / MCP; сайт = SoT; ПДн клиентов через API не гонять |
| **Identity** | Users, roles, RBAC, feature flags |

Готовность разделов: [`docs/SECTION-READINESS.md`](docs/SECTION-READINESS.md).  
Домен → модуль → route → page.md: [`docs/DOMAIN-MAP.md`](docs/DOMAIN-MAP.md).  
Север продаж→цех: [`docs/audits/2026-08-08-sales-to-shop-flow-canon.md`](docs/audits/2026-08-08-sales-to-shop-flow-canon.md).

Модель (ориентир, может отставать): [`docs/data-model.md`](docs/data-model.md) — ~11 доменов / ~89 сущностей.

---

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | Angular 20 standalone, Signals, OnPush, TailwindCSS v4, Lucide, TipTap |
| UI kit | Paper & Ink — `frontend/src/app/shared/ui/*` (без Material / PrimeNG) |
| Backend | NestJS 10, Mongoose 8, JWT+RBAC, idempotency, audit log |
| DB | MongoDB 7 Replica Set (`docker compose`) |
| Desktop | Tauri + MCP (`desktop/`) |
| Package manager | **только pnpm** (отдельно в `backend/` и `frontend/`) |

Детали: [`STACK.md`](STACK.md) · паттерны кода: [`docs/DEVELOPMENT-PATTERNS.md`](docs/DEVELOPMENT-PATTERNS.md) · диалоги: [`docs/DIALOG-COOKBOOK.md`](docs/DIALOG-COOKBOOK.md).

---

## Структура репозитория

```
kppdf-8.0/
├── README.md                 ← вы здесь (онбординг людей и ИИ)
├── GEMINI.md / CLAUDE.md     ← контракт исполнителя
├── start.mjs                 ← единый локальный старт
├── docker-compose.yml        ← Mongo RS
├── ARCHITECTURE.md           ← архитектура (читать по зоне задачи)
├── STACK.md / progress.md / STATUS.md
├── frontend/                 ← Angular 20 SPA
├── backend/                  ← NestJS 10 API
├── desktop/                  ← Tauri + MCP import
├── mobile/                   ← отдельный контур (см. mobile/README)
├── deploy/synology/          ← prod deploy (только по команде PO)
├── docs/                     ← канон, pages, compliance, agents
│   ├── how-to-connect-ai.md  ← ПЕРВЫЙ файл сессии ИИ
│   ├── PROJECT-MEMORY.md     ← индекс «где правда»
│   ├── PO-CANON.md           ← планка PO
│   ├── CONTEXT.md            ← глоссарий
│   ├── pages/                ← page.md по экранам
│   └── agent-checklists/     ← _NOW.md, checklists TZ
├── tasks/                    ← root TZ (executable specs)
│   ├── _active/              ← claimed / in work
│   ├── _archive/             ← done
│   ├── _backlog/ / _park/    ← очередь / парковка
│   └── QUEUE-LIVE.md         ← живая очередь исполнителей
└── OrchestratorKit/          ← отдельный kit-контур (не смешивать с root tasks/)
```

Индекс docs: [`docs/README.md`](docs/README.md).

---

## Quickstart (локально)

**Требования:** Node 20+, pnpm 8+, Docker Desktop.

```bash
node start.mjs                # Mongo + backend :3000 + frontend :4200 + browser
node start.mjs --check        # только preflight
node start.mjs --stop         # остановить BE/FE
node start.mjs --help
```

Эквиваленты: `pnpm run start:all`, `pnpm run check:start`, `pnpm run stop:start`.

| URL | Назначение |
|-----|------------|
| http://localhost:4200 | SPA |
| http://localhost:3000/api/health | Health |
| http://localhost:3000/docs | Swagger |
| http://localhost:4200/kit | UI Kit showcase |

Логин seed: `admin` / `admin123` (поле **`username`**, не email).

**Windows:** не вызывай `start` без префикса — используй `node start.mjs` или `.\start.cmd`.

---

## Рабочий цикл задач (исполнитель)

1. Синхронизация с `main` (`docs/how-to-connect-ai.md`).
2. Взять TZ из очереди / `tasks/` → **CLAIM** в `_active` + checklist.
3. Conflict keys пересекаются с чужим `_active` → STOP / DEFERRED.
4. Код только в зоне TZ → focused gates (tsc / test / lint; UI — browser/DOM).
5. `## Executor report (auto)` в checklist → archive в `tasks/_archive/YYYY-MM/` после PASS.
6. Git: только свои файлы, по [`docs/GIT-POLICY.md`](docs/GIT-POLICY.md).

Писать новую TZ: [`docs/TZ-AUTHORING.md`](docs/TZ-AUTHORING.md) + skill `tz-authoring`.  
Аудит ≠ реализация: [`docs/AUDIT-METHODOLOGY.md`](docs/AUDIT-METHODOLOGY.md).

---

## Deploy

Канон: [`deploy/synology/README.md`](deploy/synology/README.md).  
ИИ **не** деплоит сам — только после явной фразы PO («сделай деплой по документации»).

---

## Compliance (152-ФЗ)

Уже оператор ПДн. Без TZ+юрист: foreign analytics, marketing SMS/email, публичный register, трансгран SaaS с ПДн.  
Канон: [`docs/compliance/COMPLIANCE-RULES.md`](docs/compliance/COMPLIANCE-RULES.md).

---

## Ключевые ссылки

| Тема | Путь |
|------|------|
| Онбординг ИИ | [`docs/how-to-connect-ai.md`](docs/how-to-connect-ai.md) |
| Память / индекс | [`docs/PROJECT-MEMORY.md`](docs/PROJECT-MEMORY.md) |
| PO / качество | [`docs/PO-CANON.md`](docs/PO-CANON.md) |
| Глоссарий | [`docs/CONTEXT.md`](docs/CONTEXT.md) |
| Готовность разделов | [`docs/SECTION-READINESS.md`](docs/SECTION-READINESS.md) |
| Карта домена | [`docs/DOMAIN-MAP.md`](docs/DOMAIN-MAP.md) |
| Связность статусов | [`docs/COUPLING-MAP.md`](docs/COUPLING-MAP.md) |
| Паттерны кода | [`docs/DEVELOPMENT-PATTERNS.md`](docs/DEVELOPMENT-PATTERNS.md) |
| Страницы UI | [`docs/pages/README.md`](docs/pages/README.md) |
| Git | [`docs/GIT-POLICY.md`](docs/GIT-POLICY.md) |
| Deploy | [`deploy/synology/README.md`](deploy/synology/README.md) |
| Desktop MCP | [`desktop/docs/MCP.md`](desktop/docs/MCP.md) |
| ADR | [`docs/adr/README.md`](docs/adr/README.md) |

---

_При смене контура продукта или процесса агентов обновляй этот README и `docs/PROJECT-MEMORY.md` в той же волне docs._
