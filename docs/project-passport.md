# PROJECT PASSPORT — kppdf-8.0

> **Тип:** ERP / производственная платформа
> **Статус:** Канонический паспорт проекта; разработка продолжается (Angular 20 SPA + NestJS 10 + MongoDB 7 Replica Set)
> **Актуальность:** 2026-08-01. Список задач ниже — историческая дорожная карта, а не реестр текущих активных файлов.
> **Дата создания паспорта:** 2026-08-01
> **Автор паспорта:** Gemini (исследовательский анализ задач проекта)

---

## 1. Общее описание

**kppdf-8.0** — ERP-система для автоматизации полного цикла работы с заказами: коммерческие предложения, договоры, производство, склад, закупки, тендеры и документооборот. Платформа спроектирована для работы через AI-агентов с использованием оркестратора OrchestratorKit.

### Ключевые характеристики

| Параметр | Значение |
|----------|----------|
| Фронтенд | Angular 20 standalone, Signals, OnPush, strict TypeScript |
| Бэкенд | NestJS 10, TypeScript strict, Mongoose 8 |
| БД | MongoDB 7 Replica Set (Docker Compose) |
| Дизайн-система | Paper & Ink (OKLCH, hairline borders, anti-bling, WCAG) |
| UI-фреймворк | Собственный (24+ компонентов), без Material/PrimeNG/AG Grid |
| Стили | TailwindCSS v4 + CSS custom properties |
| Иконки | Lucide (lucide-angular) |
| Менеджер пакетов | pnpm (только pnpm) |
| Тесты | Jest (unit), Playwright (UI) |
| Оркестрация | start.mjs (cross-platform, Node 20+) |
| AI-агенты | OrchestratorKit + TZ-flow через tasks/TZ-NN.md |

---

## 2. Архитектура

### 2.1 Схема взаимодействия

Browser (Angular 20 SPA) -> :4200 Frontend -> :3000 Backend (NestJS 10) -> MongoDB 7 Replica Set

Frontend: core/ (auth, interceptors), layout/, pages/ (business), shared/ (ui, dsl, page, services, models, theme)
Backend: app.module.ts (18+ modules), common/ (guards, interceptors, decorators, seeds), config/, database/, modules/ (65+ entities)

### 2.2 Паттерн бэкенда

Module -> Controller -> Service -> Mongoose Schema

- DTOs: class-validator + class-transformer (whitelist + forbidNonWhitelisted)
- Guards (global): JwtAuthGuard, RolesGuard, PermissionsGuard
- Interceptors (global): UserContextInterceptor, AuditInterceptor, OrgScopeGuardInterceptor, IdempotencyMiddleware
- Soft-delete: Mongoose plugin (auto-filter deletedAt: null)
- Audit: AsyncLocalStorage -> Mongoose $locals.userId -> auditPlugin (createdBy/updatedBy)
- Replica Set обязателен: Counter service использует session.withTransaction

### 2.3 Паттерн фронтенда

- Standalone-only, ChangeDetectionStrategy.OnPush
- input<T>() / inject() / signal() / @if/@for/@switch
- Запрещено: any, OnInit/OnDestroy, box-shadow, #[hex]
- Borders: hairline-first, Focus-ring: pi-focus-ring

---

## 3. Доменная модель (11 доменов, 89 сущностей)

| # | Домен | Кол-во | Ключевые сущности |
|---|-------|--------|-------------------|
| 1 | Identity & Access | 7 | User, Role, Permissions, FeatureFlag, RateLimitEntry |
| 2 | People & Contacts | 8 | Person, Client, Counterparty, Worker, Interaction |
| 3 | Organizations | 3 | Organization, OrgRole, Category |
| 4 | Products & Materials | 18 | Product, Material, Bom, ProductModule, Certificate, AttributeDefinition |
| 5 | Production | 11 | ProductionOrder, WorkType, WorkCenter, WorkOrder, CostCalculation |
| 6 | Sales & Commerce | 11 | Proposal, Quotation, Contract, Order, Shipment, CartItem |
| 7 | Warehouse & Inventory | 6 | Warehouse, StorageItem, InventoryItem, StockMovement, Reservation |
| 8 | Procurement | 10 | PurchaseRequest, SupplierOrder, Tender, Rpp, IncomingInvoice |
| 9 | Documents & Templates | 6 | DocumentTemplate, TemplateBlock, DocType, TableTemplate |
| 10 | Finance | 3 | ReconciliationAct, FinancialReport, Setting |
| 11 | System & Activity | 6 | StatusWorkflow, EntityStatus, ImportJobs, OrderHistory, UserActivity |
| | **Итого** | **89** | |

Документация: docs/data-model.md (полная модель), docs/data-model-audit.md (аудит: 16 пар дубликатов, 11 entity без PK, 24 избыточных поля)

---

## 4. Структура репозитория

Ключевые директории:
- tasks/ — активные TZ-файлы
- tasks/_archive/ — архив завершённых задач (YYYY-MM/)
- tasks-archive/ — старые архивы (pre-2026-07)
- backend/src/modules/ — 65+ feature modules
- frontend/src/app/ — Angular SPA (core, layout, pages, shared)
- OrchestratorKit/ — закрытая папка оркестратора (не трогать)
- docs/ — вся документация

Полная структура см. в README.md и ARCHITECTURE.md.

---

## 5. Дорожная карта задач (исторический срез)

> После финальной очистки 2026-08-01 в корне `tasks/` не осталось активных task-файлов. Таблицы этого раздела сохраняют контекст ранее согласованной дорожной карты и не являются доказательством текущего статуса. Фактическое состояние проверяется через `tasks/`, `tasks/_archive/`, `STATUS.md` и `progress.md`.

### 5.1 Категории задач

#### A. Angular Assembly DSL Master Plan (TZ-232)

| ID | Название | Приоритет | Статус | Описание |
|----|----------|-----------|--------|----------|
| TZ-232 | Angular Assembly DSL: Master Plan | STRATEGIC | ACTIVE | Мастер-план миграции Angular-проекта на единый DSL |
| TZ-232.I | ESLint enforcement rules | HIGH | ACTIVE | 2 custom ESLint правила |

TZ-232 включает 14 подзадач (A через N). Объём: ~140-180 часов, 5-7 сессий.

#### B. Multi-Tenant Foundation (TZ-238..TZ-241)

| ID | Название | Приоритет | Статус |
|----|----------|-----------|--------|
| TZ-238 | User.organizationId + JWT propagation | CRITICAL | ACTIVE |
| TZ-239 | OrgScopeGuard (TX data isolation) | CRITICAL | ACTIVE |
| TZ-240 | Reference Data Scoping | HIGH | ACTIVE |
| TZ-241 | Counterparty Org-Scoping + isActive | CRITICAL | ACTIVE |

#### C. Security Hardening (TZ-247..TZ-253)

| ID | Название | Приоритет | Статус |
|----|----------|-----------|--------|
| TZ-247 | Backend idempotency middleware | HIGH | ACTIVE |
| TZ-248 | Production secrets and credential hygiene | CRITICAL | ACTIVE |
| TZ-249 | Auth entry points and anti-automation | CRITICAL | ACTIVE |
| TZ-250 | Secure file uploads | HIGH | ACTIVE |
| TZ-251 | Object-level authorization / IDOR | CRITICAL | ACTIVE |
| TZ-252 | Auth token storage and refresh contract | HIGH | ACTIVE |
| TZ-253 | Dependency and deployment checks | MEDIUM | ACTIVE |

#### D. RBAC & Authorization (TZ-254..TZ-256)

| ID | Название | Приоритет | Статус |
|----|----------|-----------|--------|
| TZ-254 | RBAC contract (canonical reference) | CRITICAL | ACTIVE |
| TZ-255 | Server-side permissions enforcement | CRITICAL | ACTIVE |
| TZ-256 | Capability-aware routes and navigation | HIGH | ACTIVE |

#### E. Admin Module (TZ-257..TZ-258)

| ID | Название | Приоритет | Статус |
|----|----------|-----------|--------|
| TZ-257 | Admin module (Users / Roles / Permissions) | MEDIUM | ACTIVE |
| TZ-257.A | Admin module mutations + dialogs | MEDIUM | ACTIVE |
| TZ-258 | Protected page onboarding contract | MEDIUM | ACTIVE |
| TZ-258.A | Protected-page contract close-out follow-ups | LOW | ACTIVE |

### 5.2 Зависимости между задачами

TZ-238 (foundation) -> TZ-239 (org-scope) -> TZ-240 (ref data scoping)
TZ-238 -> TZ-241 (counterparty + isActive)
TZ-248 -> TZ-249 -> TZ-247 (idempotency)
TZ-251 <- TZ-254 -> TZ-255 (permissions)
TZ-252 -> TZ-256 -> TZ-257 -> TZ-258
TZ-253 - параллельно, не блокирует
TZ-232 (DSL Master Plan) - стратегический, независим
  -> TZ-232.I (ESLint rules) - волна F

### 5.3 Ключевые conflict keys

progress.md, STATUS.md (root), ARCHITECTURE.md, OrchestratorKit/STATUS.md, frontend/src/app/core/*, frontend/src/app/shared/*, backend/src/app.module.ts, backend/src/main.ts, backend/src/common/*, docker-compose.yml

---

## 6. Архив задач

> Архивные записи — историческое evidence. Не удаляйте их при уборке: они объясняют происхождение решений и ограничений.

### 6.1 tasks/_archive/

- **2026-07:** 11 DONE + 24 SUPERSEDED + 23 failed forwarders (TZ-100..TZ-170)
- **2026-08:** TZ-110..TZ-127 DONE/FAILED, TZ-119.1 BLOCKED

### 6.2 tasks-archive/ (старые)

- TZ-12..TZ-18 - период 2026-07-04

### 6.3 Ключевые завершённые задачи (недавние)

| TZ | Название | Дата | Результат |
|----|----------|------|-----------|
| TZ-110 | Category backend safety | 2026-08-01 | DONE |
| TZ-119 | Backend safety sweep (IsObjectIdPipe) | 2026-08-01 | DONE |
| TZ-120 | Global soft-delete plugin | 2026-08-01 | DONE |
| TZ-121 | Cross-service transaction integrity | 2026-08-01 | DONE |
| TZ-122 | Optimistic locking | 2026-08-01 | DONE |
| TZ-123 | Type-safe ObjectId refactoring | 2026-08-01 | DONE |
| TZ-124 | List-query populate optimization | 2026-08-01 | DONE |
| TZ-125 | Interceptor RxJS leaks | 2026-08-01 | DONE |
| TZ-126 | EAV partial writes atomicity | 2026-08-01 | DONE |
| TZ-127 | Auth rate-limit + XSS tokens | 2026-08-01 | FAILED (-> TZ-127.1/2/3) |
| TZ-119.1 | Backend safety sweep incremental | 2026-08-01 | BLOCKED (-> TZ-119.2/3) |

---

## 7. Ключевые документы

| Файл | Назначение |
|------|------------|
| GEMINI.md | Главный контракт для AI-агентов |
| README.md | Описание проекта, quickstart |
| ARCHITECTURE.md | Полная архитектура |
| STACK.md | Технологический стек |
| progress.md | Журнал прогресса (2300+ строк) |
| STATUS.md | Доска статусов всех TZ |
| docs/AI-AGENT-GUIDE.md | Онбординг для AI-агентов |
| docs/DEVELOPMENT-PATTERNS.md | Код-паттерны |
| docs/RBAC-CONTRACT.md | Спецификация RBAC |
| docs/SECURITY-OPERATIONS.md | Безопасность |
| docs/protected-page-contract.md | Контракт для защищённых страниц |
| docs/paper-and-ink.md | Дизайн-система |
| docs/data-model.md | Полная модель данных |
| docs/data-model-audit.md | Аудит модели |
| docs/pages/*.page.md | Документация по каждой странице |
| OrchestratorKit/AGENTS.md | Инструкция для AI-агентов в OrchestratorKit |
| OrchestratorKit/STATUS.md | Kit board статусов |
| OrchestratorKit/_templates/TZF-00.txt | Финализатор: 8 шагов завершения TZ |

---

## 8. Конвенции разработки

### 8.1 Рабочий цикл TZ

1. PO создаёт tasks/TZ-NN.md
2. Агент читает задачу, проверяет conflict keys
3. Агент выполняет работу по acceptance criteria
4. Агент архивирует: tasks/_archive/YYYY-MM/TZ-NN.md.done с ARCHIVE_MARKER
5. Агент удаляет tasks/TZ-NN.md
6. STATUS.md обновляется
7. bash OrchestratorKit/verify-status.sh - проверка синхронизации
8. Финальный отчёт

### 8.2 Нумерация TZ

- TZ-NN - основной формат (2 цифры до 99)
- TZ-NN.M - подзадача
- TZ-NN.A, TZ-NN.B - волны/фазы
- TZ-NN.1, TZ-NN.2 - порядковые подзадачи

### 8.3 Архивация

- DONE: tasks/_archive/YYYY-MM/TZ-NN.md.done с ARCHIVE_MARKER
- FAILED: tasks/_archive/YYYY-MM/TZ-NN.md.failed с ARCHIVE_MARKER
- BLOCKED: tasks/_archive/YYYY-MM/TZ-NN.md.blocked с ARCHIVE_MARKER
- SUPERSEDED: tasks/_archive/YYYY-MM/TZ-NN.md.superseded

### 8.4 Lock-файлы

- Создаются только для DONE-задач
- Расположение: OrchestratorKit/.mimocode/locks/TZ-NN-<slug>.lock

---

## 9. Тестирование и верификация (V&V)

### 9.1 Стратегия тестирования

| Уровень | Инструмент | Что покрывает |
|----------|-----------|----------------|
| Unit | Jest (Angular + NestJS) | Сервисы, пайпы, гварды, утилиты, модели |
| Интеграционный | Jest + TestUtils (NestJS) | Контроллеры, сервисы с моками DB |
| E2E UI | Playwright | Полные пользовательские сценарии |
| Контрактный | hand-written | RBAC contract, protected-page contract |

### 9.2 Запуск тестов

- Unit: `pnpm test` (Jest, watch mode по умолчанию)
- E2E: `pnpm e2e` (Playwright, запускает dev-серверы автоматически)
- CI: `pnpm test:ci` (headless, coverage report)

### 9.3 Ключевые паттерны

- Все тесты в `*.spec.ts` рядом с тестируемым файлом
- Mock-сервисы через `Test.createTestingModule` (NestJS)
- Playwright: fixtures в `tests/e2e/fixtures/`, страницы в `tests/e2e/pages/`
- Данные для тестов: seed-скрипты в `backend/src/common/seeds/`

### 9.4 Критерии готовности задачи

- Все новые модули покрыты unit-тестами (минимум 80% coverage)
- E2E-тесты для новых UI-страниц
- Проверка conflict keys перед коммитом
- STATUS.md обновлён

---

## 10. Карта страниц (Page Map)

### 10.1 Фронтенд-страницы (Angular routes)

| Маршрут | Компонент | Модуль/Feature | Описание |
|----------|-----------|----------------|----------|
| /login | LoginPage | core/auth | Авторизация |
| /register | RegisterPage | core/auth | Регистрация |
| /dashboard | DashboardPage | pages/dashboard | Главный дашборд |
| /proposals | ProposalListPage | pages/proposals | Коммерческие предложения |
| /proposals/:id | ProposalDetailPage | pages/proposals | Детали КП |
| /quotations | QuotationListPage | pages/quotations | Счета на оплату |
| /contracts | ContractListPage | pages/contracts | Договоры |
| /orders | OrderListPage | pages/orders | Заказы |
| /production | ProductionListPage | pages/production | Производство |
| /warehouse | WarehousePage | pages/warehouse | Склад |
| /procurement | ProcurementPage | pages/procurement | Закупки |
| /tenders | TenderListPage | pages/procurement | Тендеры |
| /admin/users | AdminUsersPage | pages/admin | Управление пользователями |
| /admin/roles | AdminRolesPage | pages/admin | Управление ролями |
| /admin/permissions | AdminPermissionsPage | pages/admin | Управление правами |
| /settings | SettingsPage | pages/settings | Настройки |

### 10.2 Layout-структура

- `app.component.ts` — корневой компонент с sidebar + router-outlet
- `core/layout/` — ShellComponent (sidebar, header, breadcrumbs)
- `pages/` — каждая страница в отдельной директории
- `shared/` — переиспользуемые компоненты, директивы, пайпы

---

## 11. UI Kit (Paper & Ink)

### 11.1 Обзор

Собственная дизайн-система **Paper & Ink** — без зависимости от Material/PrimeNG/AG Grid.

### 11.2 Ключевые принципы

- **OKLCH** цветовое пространство для всех цветов
- **Hairline borders** (1px с прозрачностью) вместо толстых рамок
- **Anti-bling** — никаких box-shadow, градиентов, лишних эффектов
- **WCAG** — контрастность не ниже AA
- **Focus ring**: `pi-focus-ring` — тонкое кольцо фокуса
- **Typography**: системные шрифты, иерархия через размер и вес

### 11.3 Компоненты (24+)

| Компонент | Назначение |
|-----------|------------|
| Button | Кнопки (primary, secondary, ghost, danger) |
| InputText | Текстовый ввод |
| Select | Выпадающий список |
| Table | Таблица с сортировкой и пагинацией |
| Card | Карточка-контейнер |
| Modal | Диалоговое окно |
| Dialog | Форма в модальном окне |
| Toast | Уведомления |
| Spinner | Индикатор загрузки |
| Badge | Статусные бейджи |
| Tabs | Табы |
| Accordion | Раскрывающиеся панели |
| Toolbar | Панель инструментов |
| Breadcrumb | Навигационная цепочка |
| Sidebar | Боковая панель |
| Header | Верхний хедер |
| Avatar | Аватар пользователя |
| Menu | Контекстное/боковое меню |
| Tooltip | Подсказки |
| Checkbox | Чекбокс |
| Radio | Радио-кнопки |
| Toggle | Переключатель |
| Slider | Ползунок |
| FileUpload | Загрузка файлов |

### 11.4 Расположение

`frontend/src/app/shared/ui/` — все компоненты UI Kit
`frontend/src/app/shared/theme/` — CSS custom properties, OKLCH tokens

---

## 12. Angular Assembly DSL (TZ-232)

### 12.1 Цель

Миграция Angular-проекта на единый DSL (Domain Specific Language) для описания сборки UI-компонентов. DSL позволяет описывать страницы, формы, таблицы декларативно, а не через ручное написание шаблонов.

### 12.2 Структура DSL

- **Assembly DSL** — декларативный формат описания UI
- **Parser** — парсер DSL в Angular-компоненты
- **Generator** — генератор Angular-кода из DSL-описаний
- **ESLint rules** (TZ-232.I) — 2 custom правила для enforcement DSL-паттернов

### 12.3 Подзадачи TZ-232

| Подзадача | Описание |
|-----------|----------|
| TZ-232.A | DSL grammar definition |
| TZ-232.B | Parser implementation |
| TZ-232.C | Code generator |
| TZ-232.D | Template components |
| TZ-232.E | Form builder DSL |
| TZ-232.F | Table builder DSL |
| TZ-232.G | Layout DSL |
| TZ-232.H | Integration with existing pages |
| TZ-232.I | ESLint enforcement rules |
| TZ-232.J | Documentation and examples |
| TZ-232.K | Migration tooling |
| TZ-232.L | Performance benchmarks |
| TZ-232.M | E2E tests for DSL |
| TZ-232.N | Rollout plan |

### 12.4 Статус

TZ-232 — STRATEGIC, ACTIVE. Объём: ~140-180 часов, 5-7 сессий. Самая крупная задача в проекте.

---

## 13. Безопасность

### 13.1 Архитектура безопасности

- **Аутентификация**: JWT (access + refresh tokens), хранение в httpOnly cookies
- **Авторизация**: RBAC (Role-Based Access Control) + ABAC (Attribute-Based) для объектного уровня
- **Мультитенантность**: OrgScopeGuard фильтрует данные по organizationId на уровне БД
- **Rate limiting**: на уровне API gateway и отдельных эндпоинтов
- **Idempotency**: middleware для POST/PUT запросов (предотвращение дублей)
- **Audit**: AsyncLocalStorage -> Mongoose $locals.userId -> auditPlugin (createdBy/updatedBy)

### 13.2 Ключевые задачи безопасности

| TZ | Тема | Приоритет |
|----|------|-----------|
| TZ-248 | Production secrets and credential hygiene | CRITICAL |
| TZ-249 | Auth entry points and anti-automation | CRITICAL |
| TZ-251 | Object-level authorization / IDOR | CRITICAL |
| TZ-247 | Backend idempotency middleware | HIGH |
| TZ-250 | Secure file uploads | HIGH |
| TZ-252 | Auth token storage and refresh contract | HIGH |
| TZ-253 | Dependency and deployment checks | MEDIUM |

### 13.3 Глобальные guards и interceptors

- `JwtAuthGuard` — проверка JWT токена
- `RolesGuard` — проверка роли пользователя
- `PermissionsGuard` — проверка конкретных прав (RBAC)
- `OrgScopeGuardInterceptor` — фильтрация по organizationId
- `UserContextInterceptor` — извлечение пользователя из токена
- `AuditInterceptor` — логирование действий
- `IdempotencyMiddleware` — предотвращение дублей запросов

### 13.4 Защищённые страницы (TZ-258)

Контракт для защищённых страниц: каждая страница должна проверять права доступа на уровне компонента, а не только на уровне маршрута. Подробности в `docs/protected-page-contract.md`.

---

## 14. Инфраструктура

### 14.1 Docker Compose

```
Services:
- frontend (Angular dev server, :4200)
- backend (NestJS, :3000)
- mongodb (MongoDB 7 Replica Set, :27017)
- redis (кэш/сессии, :6379) — опционально
```

### 14.2 Оркестрация

- `start.mjs` — cross-platform launcher (Node 20+), запускает все сервисы
- `pnpm` — единственный менеджер пакетов
- `Node 20+` — минимальная версия Node.js

### 14.3 CI/CD

- Unit-тесты: Jest (встроен в pnpm scripts)
- E2E-тесты: Playwright
- Linting: ESLint (стандартный + 2 custom rules для TZ-232.I)
- Type checking: TypeScript strict mode

### 14.4 Конфигурация

- `backend/src/config/` — конфигурация приложения
- `backend/src/database/` — подключение к MongoDB
- `docker-compose.yml` — определение сервисов
- `.env` — переменные окружения (не коммитить!)

### 14.5 Ключевые backend-файлы

- `backend/src/app.module.ts` — корневой модуль (18+ modules)
- `backend/src/main.ts` — точка входа NestJS
- `backend/src/common/` — guards, interceptors, decorators, seeds

---

## 15. Руководство по обнаружению багов

### 15.1 Типичные паттерны багов в проекте

| Паттерн | Симптом | Как найти |
|----------|---------|-----------|
| Отсутствие soft-delete filter | Удалённые записи видны в списках | Проверить, что deletedAt: null фильтр применён |
| Missing OrgScope | Данные одной организации видны другой | Проверить OrgScopeGuardInterceptor на маршруте |
| Idempotency gap | Дублирующиеся записи при повторном запросе | Проверить наличие idempotency key |
| Audit missing | createdBy/updatedBy не заполнены | Проверить auditPlugin на схеме |
| Type unsafe ObjectId | Ошибки сравнения ObjectId строк | Проверить IsObjectIdPipe |
| Transaction leak | Несогласованность при ошибке | Проверить session.withTransaction usage |
| Race condition на счётчиках | Дублирующиеся номера | Проверить atomic increment с Replica Set |
| EAV partial write | Неполные наборы атрибутов | Проверить atomicity EAV writes |
| RxJS leak | Утечка памяти, подвисание | Проверить подписки в interceptors |
| Rate limit bypass | Спам запросов | Проверить rate-limit middleware |

### 15.2 Чек-лист перед коммитом

1. Все conflict keys проверены (не затронуты ли)
2. Soft-delete фильтр на месте
3. OrgScopeGuard на всех multi-tenant маршрутах
4. Audit fields заполнены
5. Idempotency key для мутаций
6. Unit-тесты написаны (80%+ coverage)
7. STATUS.md обновлён
8. TZ-файл заархивирован (.done)

---

## 16. Глоссарий

| Термин | Определение |
|--------|-------------|
| TZ | Task — единица работы в системе управления задачами |
| TZ-flow | Процесс управления задачами (создание → выполнение → архивация) |
| OrchestratorKit | Закрытая папка оркестратора для AI-агентов |
| conflict keys | Ключевые файлы/директории, которые нельзя затрагивать параллельным задачам |
| soft-delete | Паттерн: записи не удаляются физически, помечаются deletedAt |
| OrgScope | Фильтрация данных по organizationId для мультитенантности |
| RBAC | Role-Based Access Control — управление доступом на основе ролей |
| ABAC | Attribute-Based Access Control — управление доступом на основе атрибутов |
| IDOR | Insecure Direct Object Reference — уязвимость объекта авторизации |
| DSL | Domain Specific Language — предметно-ориентированный язык |
| Paper & Ink | Собственная дизайн-система проекта |
| OKLCH | Цветовое пространство для современных, доступных цветов |
| hairline border | Тонкая (1px) граница с прозрачностью |
| anti-bling | Отказ от визуальных эффектов (box-shadow, градиенты) |
| ARCHIVE_MARKER | Специальный комментарий в архивных файлах TZ |
| pnpm | Менеджер пакетов, единственный разрешённый в проекте |
| start.mjs | Cross-platform launcher для запуска всех сервисов |
| Replica Set | Реплицированный кластер MongoDB |
| EAV | Entity-Attribute-Value — паттерн хранения гибких атрибутов |

---

## 17. Быстрый старт (Quick Start)

### 17.1 Предварительные требования

- Node.js 20+
- pnpm (только pnpm, не npm/yarn)
- Docker & Docker Compose
- Git

### 17.2 Запуск

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd kppdf-8.0

# 2. Установить зависимости
pnpm install

# 3. Запустить все сервисы
node start.mjs

# 4. Открыть приложение
# Frontend: http://localhost:4200
# Backend API: http://localhost:3000
```

### 17.3 Работа с задачами

1. Прочитать `GEMINI.md` — главный контракт для AI-агентов
2. Проверить `STATUS.md` — текущие задачи и их статусы
3. Выбрать задачу из `tasks/TZ-NN.md`
4. Проверить conflict keys перед началом работы
5. Выполнить работу по acceptance criteria
6. Запустить тесты: `pnpm test`
7. Заархивировать задачу: `tasks/_archive/YYYY-MM/TZ-NN.md.done`
8. Удалить файл задачи из `tasks/`
9. Обновить `STATUS.md`
10. Запустить `bash OrchestratorKit/verify-status.sh`

### 17.4 Полезные команды

```bash
pnpm test              # Запуск unit-тестов (watch mode)
pnpm test:ci           # Unit-тесты в CI-режиме
pnpm e2e               # Запуск E2E-тестов (Playwright)
pnpm lint              # Линтинг кода
pnpm build             # Сборка продакшн-версии
node start.mjs         # Запуск всех сервисов
bash OrchestratorKit/verify-status.sh  # Проверка синхронизации статусов
```

### 17.5 Ключевые файлы для быстрого старта

| Файл | Зачем |
|------|-------|
| GEMINI.md | Главный контракт — читать первым |
| README.md | Описание проекта и quickstart |
| ARCHITECTURE.md | Полная архитектура |
| STACK.md | Технологический стек |
| STATUS.md | Доска задач |
| tasks/TZ-NN.md | Конкретная задача |
