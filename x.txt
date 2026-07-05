================================================================================
        ГЛУБОКИЙ АНАЛИЗ ПРОЕКТА kppdf-8.0 — ПОЛНЫЙ ОТЧЁТ
        Дата проверки: 2026-07-05
        Метод: 4 параллельных агента, полное чтение всех файлов
================================================================================


СОДЕРЖАНИЕ
----------
  1. ОБЩАЯ ХАРАКТЕРИСТИКА
  2. BACKEND: АРХИТЕКТУРА
  3. BACKEND: АУТЕНТИФИКАЦИЯ И БЕЗОПАСНОСТЬ
  4. BACKEND: БАЗА ДАННЫХ И ПЛАГИНЫ
  5. BACKEND: GUARDS, INTERCEPTORS, DECORATORS
  6. BACKEND: SEED-СИСТЕМА
  7. BACKEND: ОБРАБОТКА ОШИБОК
  8. BACKEND: КАТАЛОГ API (69 контроллеров, ~290 эндпоинтов)
  9. BACKEND: КАТАЛОГ СУЩНОСТЕЙ (67 схем)
  10. BACKEND: ПАТТЕРНЫ СЕРВИСОВ
  11. BACKEND: ВАЛИДАЦИЯ И DTO
  12. BACKEND: SWAGGER
  13. FRONTEND: АРХИТЕКТУРА
  14. FRONTEND: АВТОРИЗАЦИЯ
  15. FRONTEND: LAYOUT И КОМПОНЕНТЫ
  16. FRONTEND: СТРАНИЦЫ
  17. FRONTEND: UI KIT (40+ компонентов)
  18. FRONTEND: СЕРВИСЫ
  19. FRONTEND: КОНФИГУРАЦИЯ СТРАНИЦ
  20. FRONTEND: СТИЛИЗАЦИЯ
  21. FRONTEND: ИНФРАСТРУКТУРА
  22. БЕЗОПАСНОСТЬ: ПОЛНЫЙ АУДИТ
  23. КАЧЕСТВО КОДА
  24. ТЕСТИРОВАНИЕ
  25. ИНФРАСТРУКТУРА И DEPLOYMENT
  26. СВОДКА: КРИТИЧЕСКИЕ ПРОБЛЕМЫ
  27. СВОДКА: ВСЕ НАХОДКИ ПО ПРИОРИТЕТУ


================================================================================
 1. ОБЩАЯ ХАРАКТЕРИСТИКА
================================================================================

Проект: kppdf-8.0 — ERP-система для предприятия
Стек:   NestJS 10 + Mongoose 8 + MongoDB (backend)
        Angular 20.3 + TailwindCSS 3.4 + AG Grid 32 (frontend)
Цель:   Управление продукцией, складом, закупками, продажами, производством

Масштаб:
  - Backend:  67 модулей, 67 схем, 69 контроллеров, ~290 API-эндпоинтов
  - Frontend: 4 страницы (login, dashboard, task-panel, dynamic /p/:id)
              65 CRUD-страниц через единый PageRenderer
              40+ переиспользуемых UI-компонентов
  - 8 категорий sidebar: Основные, Продукция, Производство, Склад,
    Закупки, Продажи, Документы+Финансы, Система

Статус: 47/47 задач (TZ-02..TZ-46) помечены завершёнными.
Проект НЕ запускается из-за 2 критических багов.


================================================================================
 2. BACKEND: АРХИТЕКТУРА
================================================================================

Структура модулей (67 в src/modules/):
  Каждый модуль типично содержит:
    - *.module.ts       — NestJS модуль (Module decorator)
    - *.schema.ts       — Mongoose схема (@Schema + @Prop)
    - *.service.ts      — Бизнес-логика (Injectable)
    - *.controller.ts   — REST API (Controller)
    - *.dto.ts          — DTO для валидации (class-validator)

Модули с особенностями:
  auth       — нет схемы (использует User)
  inventory  — фасад (делегирует StorageItemService)
  permissions — seed-only, нет контроллера
  actual-cost — 2 контроллера (CRUD + cost-comparison)

app.module.ts импортирует все 67 модулей + инфраструктурные:
  - ConfigModule.forRoot (глобальный, Joi-валидация)
  - LoggerModule (nestjs-pino, pino-pretty в dev)
  - DatabaseModule (Mongoose + 3 плагина)
  - ThrottlerModule (short: 1s/10req, long: 60s/100req)
  - TerminusModule (health checks)

Глобальные провайдеры:
  - APP_GUARD → JwtAuthGuard (все маршруты требуют JWT)
  - APP_GUARD → RolesGuard (проверка ролей)
  - APP_INTERCEPTOR → UserContextInterceptor (AsyncLocalStorage)
  - APP_INTERCEPTOR → AuditInterceptor (логирование мутаций)

main.ts (bootstrap):
  - Helmet: CSP (self + unsafe-inline styles), HSTS (1 year, preload)
  - Compression (gzip/deflate)
  - CORS whitelist из CORS_ORIGINS
  - Global prefix: /api
  - Swagger: /docs (title: "KPPDF API", Bearer auth)
  - ValidationPipe: whitelist + forbidNonWhitelisted + transform
  - Graceful shutdown: SIGTERM/SIGINT


================================================================================
 3. BACKEND: АУТЕНТИФИКАЦИЯ И БЕЗОПАСНОСТЬ
================================================================================

JWT Auth Flow:
  Request → ThrottlerBehindAuthGuard → JwtAuthGuard (skip if @Public())
         → RolesGuard → UserContextInterceptor → AuditInterceptor → Controller

Auth Endpoints:
  POST /api/auth/register  — @Public() — создание пользователя + токены
  POST /api/auth/login     — @Public() — username+password
  POST /api/auth/refresh   — jwt-refresh guard — ротация токенов
  POST /api/auth/logout    — authenticated — инкремент версии refresh
  GET  /api/auth/me        — authenticated — текущий пользователь

Токены:
  Access:  {sub, username, role, version} — 15min, secret: JWT_SECRET
  Refresh: {sub, version} — 7d, secret: JWT_REFRESH_SECRET

Реализация:
  - bcryptjs, 10 раундов (стандарт индустрии)
  - Refresh token versioning (инкремент при logout/смене пароля)
  - Passport.js strategies: jwt + jwt-refresh
  - Password hash никогда не возвращается в API
  - JwtStrategy валидирует и загружает свежего пользователя из БД

Проблемы:
  ! RegisterDto.role принимает любую строку — можно self-register как admin
  ! test-auth.ts отправляет {email, password} но LoginDto ожидает {username, password}


================================================================================
 4. BACKEND: БАЗА ДАННЫХ И ПЛАГИНЫ
================================================================================

DatabaseModule:
  - Mongoose forRootAsync с конфигом из ConfigService
  - autoIndex: false в production
  - retryAttempts: 3, retryDelay: 1000

3 глобальных Mongoose-плагина:

1) soft-delete.plugin.ts:
   - pre('find', 'findOne', 'findOneAndUpdate', 'countDocuments')
   - Автоматически добавляет {deletedAt: null} в фильтры
   - Query helpers: .softDelete(), .restore()
   ! Дублирующий pre('find') (строки 35 и 39)
   !!! ВСЕ 67 СХЕМ НЕ ИМЕЮТ ПОЛЯ deletedAt — ПЛАГИН ЛОМАЕТ ЗАПРОСЫ

2) audit.plugin.ts:
   - pre('save'): устанавливает createdAt/createdBy, updatedAt/updatedBy
   - pre(updateOne/findOneAndUpdate/updateMany): мержит в $set
   - Читает userId из $locals (от userContextPlugin)

3) user-context.plugin.ts:
   - На всех query hooks + save читает getCurrentUser() из AsyncLocalStorage
   - Инжектит userId в this.$locals для auditPlugin

Порядок выполнения:
  userContextPlugin.pre() → auditPlugin.pre()


================================================================================
 5. BACKEND: GUARDS, INTERCEPTORS, DECORATORS
================================================================================

Guards:
  JwtAuthGuard        — глобальный, пропускает @Public()
  RolesGuard          — глобальный, проверяет @Roles()
  ThrottlerBehindAuthGuard — rate limiting, пропускает аутентифицированных

Interceptors:
  UserContextInterceptor — AsyncLocalStorage (глобальный)
  AuditInterceptor       — запись AuditLog (глобальный)
  LoggingInterceptor     — СУЩЕСТВУЕТ но НЕ зарегистрирован глобально

Decorators:
  @Public()            — endpoints без аутентификации
  @Roles(...)          — ограничение по ролям
  @CurrentUser()       — param decorator для req.user
  @AuditAction()       — пометка для аудита
  @IsObjectId()        — custom validator для MongoDB ObjectId

Другое:
  AsyncLocalStorage<UserContext> — мост между HTTP и Mongoose middleware
  INN validator — российский ИНН с checksum (10- и 12-значный)
  EAV service — Entity-Attribute-Value для динамических атрибутов
  27 canonical permissions across 10 sections


================================================================================
 6. BACKEND: SEED-СИСТЕМА
================================================================================

6 seed-классов (все OnApplicationBootstrap):

1) AdminSeed:
   - Системные роли: admin (все permissions), manager, user
   - Дефолтный admin-user (только если users пуста)
   - Логирует предупреждение о смене пароля

2) SettingsSeed:
   - Валюта (RUB), НДС (20%), срок оплаты (10 дней),
     финансовый год (01-01), название компании (KPPDF)

3) FeatureFlagsSeed:
   - new_ui, e2e_payments, dark_mode, advanced_analytics
   - Все false по умолчанию
   ! CRASH: upsert с {deletedAt} на схеме без deletedAt

4) StatusesSeed:
   - Proposal: draft→sent→accepted/rejected/archived (5 статусов)
   - Contract: draft→active→closed/terminated (4)
   - Order: new→in_production→ready→shipped→delivered/cancelled (6)
   - Workflows с role-gated transitions

5) OrgRolesSeed:
   - our-company, partner, holding, branch

6) CounterpartyRolesSeed:
   - customer, supplier, contractor, manufacturer

Все seed'ы идемпотентны (проверяют существование перед вставкой).


================================================================================
 7. BACKEND: ОБРАБОТКА ОШИБОК
================================================================================

HttpExceptionFilter (глобальный):
  - @Catch() — ловит все исключения
  - HttpException → извлекает status + payload
  - Не-HttpException → 500 "Internal server error"
  - Формат: {statusCode, timestamp, path, method, message}
  - Логирует стек только для 500+

ValidationPipe:
  - whitelist: true (стрипает неизвестные поля)
  - forbidNonWhitelisted: true (400 для неизвестных полей)
  - transform: true (автотрансформация в DTO)

Нет дополнительных exception filters.


================================================================================
 8. BACKEND: КАТАЛОГ API (69 контроллеров, ~290 эндпоинтов)
================================================================================

АУТЕНТИФИКАЦИЯ И УПРАВЛЕНИЕ:
  /api/auth           POST register,login,refresh,logout  GET me
  /api/users          CRUD + GET /me/profile + POST /:id/change-password
  /api/roles          CRUD (admin для записи)
  /api/settings       CRUD (group filter, admin для записи)
  /api/feature-flags  GET, GET /:key, PUT /:key (admin)
  /api/audit-logs     GET (entityType, userId, action, pagination)
  /api/rate-limits    GET, DELETE /:key, DELETE / (clear all)

УПРАВЛЕНИЕ КОНТРАГЕНТАМИ:
  /api/organizations              CRUD + contacts подмаршруты
  /api/counterparties             CRUD + search/pagination
  /api/persons                    CRUD + search/pagination
  /api/org-roles                  CRUD
  /api/counterparty-roles         CRUD

КАТАЛОГ ПРОДУКЦИИ:
  /api/products          CRUD + search/filter/sort + photos + components + modules
  /api/materials         CRUD + search/pagination
  /api/categories        CRUD + /tree
  /api/product-modules   CRUD
  /api/photos            CRUD + /upload (TODO)
  /api/product-photos    CRUD по productId
  /api/product-components CRUD по productId
  /api/boms              GET /product/:id, CRUD, /:id/expanded, POST /:id/activate
  /api/tech-processes    CRUD + /:id/expanded + activate
  /api/cost-calculations CRUD + activate

ПРОДАЖИ:
  /api/quotations    CRUD + /duplicate, /convert-to-contract, /convert-to-order
  /api/contracts     CRUD + /sign, /activate (создаёт Order)
  /api/orders        CRUD + /reserve-stock, /ship, /cancel
  /api/shipments     CRUD + /dispatch, /add-doc
  /api/tenders       CRUD + /expiring, /quotes, /win
  /api/cart-sessions POST, GET /:id, GET /:id/items, POST /:id/checkout
  /api/cart-items    CRUD

ЗАКУПКИ:
  /api/purchase-requests  CRUD + /convert-to-purchase-order
  /api/purchase-orders    CRUD + /receive
  /api/invoices           CRUD + /overdue, /mark-paid

СКЛАД:
  /api/warehouses        CRUD + /:id/inventory, /:id/movements, /:id/zones
  /api/storage-items     CRUD + /:id/adjust
  /api/stock-movements   GET + POST + /inventory/movements/summary
  /api/reservations      CRUD + /release, /fulfill
  /api/inventory         GET /low-stock

ПРОИЗВОДСТВО:
  /api/production-orders     CRUD + /tasks, /start, /close
  /api/work-orders           CRUD + /complete
  /api/work-order-operations CRUD + /start, /complete
  /api/order-tasks           CRUD + /ready, /complete
  /api/order-closings        CRUD
  /api/actual-costs          GET, POST, DELETE (под /production-orders/:id/)
  /api/cost-comparison       GET (под /production-orders/:id/)

ПЕРСОНАЛ:
  /api/workers     CRUD
  /api/work-types  CRUD
  /api/work-centers CRUD
  /api/routing-steps CRUD

ДОКУМЕНТЫ И ШАБЛОНЫ:
  /api/doc-types            CRUD + /by-slug/:slug
  /api/document-templates   CRUD + /expanded, /preview, /duplicate, /set-default
  /api/template-blocks      CRUD + reorder
  /api/document-table-types CRUD
  /api/table-templates      CRUD
  /api/inventor-files       CRUD + /download (multipart upload)

ДИНАМИЧЕСКИЕ АТРИБУТЫ (EAV):
  /api/attribute-definitions  CRUD
  /api/:entityType/:entityId/attributes  GET, PUT (bulk), PUT /:attrId, DELETE

КОММЕНТАРИИ И ВЗАИМОДЕЙСТВИЯ:
  /api/comments      CRUD + /archive
  /api/interactions   CRUD (call/email/meeting/chat/task/note)

ФИНАНСЫ:
  /api/financial-reports   CRUD + /generate, /export (pdf/xlsx)
  /api/reconciliation-acts CRUD + /sign

СТАТУСЫ И WORKFLOW:
  /api/statuses/:entityType    GET
  /api/statuses                POST (admin)
  /api/workflows/:entityType   GET
  /api/workflows               POST (admin)

ИМПОРТ:
  /api/import-jobs  CRUD + /upload (multer), /start, /cancel

СЕРВЕРНЫЕ:
  /api/health              GET (MongoDB ping + uptime)
  /api/health/ready        GET (readiness probe)
  /api/health/live         GET (liveness probe)


================================================================================
 9. BACKEND: КАТАЛОГ СУЩНОСТЕЙ (67 схем)
================================================================================

A. АУТЕНТИФИКАЦИЯ И ДОСТУП (7):
   User, Role, Permission, Setting, FeatureFlag, RateLimitEntry, Counter

B. УПРАВЛЕНИЕ КОНТРАГЕНТАМИ (6):
   Organization, OrganizationContact, Counterparty, Person,
   RoleOrg, RoleCounterparty

C. ПРОДУКЦИЯ И МАТЕРИАЛЫ (7):
   Product, Material, Category, ProductModule, ProductComponent,
   ProductPhoto, Photo

D. ПРОДАЖИ (7):
   Quotation, Tender, Contract, Order, Shipment, CartSession, CartItem

E. ЗАКУПКИ (3):
   PurchaseRequest, PurchaseOrder, Invoice

F. СКЛАД (4):
   Warehouse, StorageItem, StockMovement, Reservation

G. ПРОИЗВОДСТВО (6):
   ProductionOrder, WorkOrder, WorkOrderOperation, OrderTask,
   OrderClosing, ActualCost

H. ИНЖЕНЕРИЯ И BOM (4):
   Bom, TechProcess, RoutingStep, CostCalculation

I. ПЕРСОНАЛ (3):
   Worker, WorkType, WorkCenter

J. СЕРТИФИКАЦИЯ (4):
   Certificate, Rpp, ProductPassport, ComplianceRule

K. ДОКУМЕНТЫ (6):
   DocType, DocumentTemplate, TemplateBlock, DocumentTableType,
   TableTemplate, InventorFile

L. EAV (2):
   AttributeDefinition, EntityAttributeValue

M. КОММЕНТАРИИ (2):
   Comment, Interaction

N. ФИНАНСЫ И АУДИТ (3):
   FinancialReport, ReconciliationAct, AuditLog

O. WORKFLOW (3):
   EntityStatus, StatusWorkflow, ImportJobs

Все схемы используют timestamps: true.
Ни одна схема НЕ имеет @Prop() deletedAt (критический баг).


================================================================================
 10. BACKEND: ПАТТЕРНЫ СЕРВИСОВ
================================================================================

Единый паттерн CRUD + domain-actions:

  create(dto)          — CounterService.next() для нумерации + model.create()
  findAll(filters)     — model.find() с пагинацией {items, total, page, limit}
  findById(id)         — Types.ObjectId.isValid() + model.findById() + NotFoundException
  update(id, dto)      — model.findByIdAndUpdate()
  remove(id)           — model.updateOne({$set: {deletedAt: new Date()}}) — soft delete

Domain actions (примеры):
  OrderService:       reserveStock(), ship(), cancel()
  ContractService:    sign(), activate() → создаёт Order
  QuotationService:   duplicate(), convertToContract(), convertToOrder()
  WorkOrderOpService: start(), complete()
  BOM:                activate()
  InvoiceService:     markPaid()
  StorageItemService: adjust()

Кросс-сервисные связи:
  Contract.activate() → OrderService.create()
  Order.ship() → ShipmentService.create()
  Order.cancel() → ReservationService.releaseAll()
  PurchaseRequest.convert() → PurchaseOrderService.create()

Все remove() делают SOFT DELETE (deprecatedAt), но схемы не声明 deletedAt.


================================================================================
 11. BACKEND: ВАЛИДАЦИЯ И DTO
================================================================================

~100+ DTO файлов:
  Каждый модуль имеет CreateXxxDto + UpdateXxxDto
  Многие Update DTO используют @nestjs/swagger PartialType

Декораторы class-validator:
  @IsString, @IsNumber, @IsMongoId, @IsIn, @IsOptional, @IsArray,
  @ValidateNested, @Type, @Length, @Min, @Max, @IsEmail, @Matches

Кастомные:
  @IsObjectId — валидация 24-символьного hex MongoDB ObjectId
  @IsINN — российский ИНН с checksum (10/12-значный)

Domain-specific DTOs:
  RegisterDto, LoginDto, RefreshTokenDto, AuthResponseDto,
  ChangePasswordDto, ReserveStockDto, SignContractDto, MarkPaidDto,
  AddDocDto, WinTenderDto, ReorderBlocksDto, AdjustStorageItemDto,
  SetAttributeValueDto, BulkAttributesDto, GenerateFinancialReportDto,
  CreateImportJobDto, QueryProductDto

Вложенные DTO (items[]):
  @ValidateNested({ each: true }) + @Type(() => ItemDto)
  Для OrderItem, QuotationItem, ContractItem, PurchaseOrderItem и др.


================================================================================
 12. BACKEND: SWAGGER
================================================================================

Конфигурация:
  DocumentBuilder: title "KPPDF API", version 0.1.0, Bearer auth
  SwaggerModule.setup('/docs')

Что ЕСТЬ:
  - PartialType из @nestjs/swagger в 8 Update DTO
  - Auto-generation из NestJS metadata

Чего НЕТ:
  - Нет @ApiProperty() ни на одном DTO/схеме — модели пустые в Swagger UI
  - Нет @ApiOperation() / @ApiResponse() ни на одном контроллере
  - Нет @ApiBearerAuth() / @ApiTags() на контроллерах
  - Нет @ApiQuery() / @ApiParam() для документирования параметров

Swagger работает, но документация минимальна.


================================================================================
 13. FRONTEND: АРХИТЕКТУРА
================================================================================

Фреймворк: Angular 20.3 (standalone, signals, new control flow)
Bootstrap: bootstrapApplication(App, appConfig) — чистый standalone

app.config.ts:
  - provideZoneChangeDetection (eventCoalescing)
  - provideRouter(routes, withComponentInputBinding())
  - provideHttpClient(withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor]))
  - provideAnimationsAsync()
  - API_BASE_URL = http://localhost:3000/api

Маршруты:
  /login          → LoginPage (lazy)
  /               → MainLayoutComponent (authGuard)
    ''            → redirect /dashboard
    /dashboard    → DashboardPage (lazy)
    /task-panel   → TaskPanelPage (lazy)
    /p/:id        → PageRenderer (lazy, динамическая страница для 65+ таблиц)
  **              → redirect /

Архитектурные решения:
  - Полностью standalone компоненты (нет NgModules)
  - Signal-based state (нет RxJS для компонентного state)
  - shadcn/ui design system port (CSS variables, CVA, cn(), Tailwind)
  - CDK Dialog для модалок (не Material Dialog)
  - AG Grid Community для таблиц
  - Chart.js / ng2-charts для графиков


================================================================================
 14. FRONTEND: АВТОРИЗАЦИЯ
================================================================================

auth.guard.ts:
  - authGuard: Functional CanActivateFn → проверяет isAuthenticated(), редирект /login

auth.interceptor.ts:
  - Добавляет Authorization: Bearer <token> ко всем запросам

error.interceptor.ts:
  - Ловит HttpErrorResponse, показывает toast.error() для не-401 ошибок

loading.interceptor.ts:
  - Инкремент/декремент LoadingService

auth.service.ts:
  - Signal-based: tokenSignal, userSignal, refreshSignal
  - SSR-safe: проверяет isPlatformBrowser()
  - Token refresh: shareReplay(1) для предотвращения race condition
  - Persistence: localStorage (kppdf.access, kppdf.refresh, kppdf.user)
  - Computed: isAuthenticated, role
  - hasRole(roles) для role-based UI

roleGuard: экспортируется но НЕ используется в текущих маршрутах.


================================================================================
 15. FRONTEND: LAYOUT И КОМПОНЕНТЫ
================================================================================

MainLayout:
  - Flex h-screen: sidebar (fixed 264px) + main content (flex-1, scrollable)

Sidebar:
  - Branding: "K" logo + "KPPDF ERP v0.1.0"
  - Навигация: Dashboard, Task Panel + динамические категории из CATEGORIES
  - Фильтрация по ролям: auth.hasRole(page.roles)
  - Collapsible секции (signal<Set<number>>)
  - Footer: аватар (первая буква email), email, роль, logout

Topbar:
  - Search bar: фильтрация PAGES по title/id
  - Theme toggle: sun/moon через ThemeService.toggle()
  - Language selector: RU/EN (ТОЛЬКО косметический — i18n НЕ настроен)
  - User email


================================================================================
 16. FRONTEND: СТРАНИЦЫ
================================================================================

Login (login.page.ts):
  - Centered card, "KPPDF ERP" branding
  - Email/password (template-driven, FormsModule)
  - Default: admin@kppdf.local / admin
  - Вызывает auth.login(), редирект /dashboard

Dashboard (dashboard.page.ts):
  - Stats: Total tables, Empty, Low fill (1-4), Ready (>=5)
  - Category cards: сетка 8 категорий, badge count пустых таблиц
  - Data: parallel HTTP requests с limit=0 для подсчёта записей

Task Panel (task-panel.page.ts):
  - Priority-based task list для заполнения данных
  - Filters: All / Empty (red) / Low (yellow)
  - Phase grouping: Phase 1-12
  - Status: empty (0), low (1-4), ok (>=5)

Page Renderer (page-renderer.ts):
  - Dynamic resolver для /p/:id
  - Ищет PageConfig по id из PAGES
  - Role check: null если нет доступа
  - Custom mapping: showcase → ShowcasePage
  - Default: <app-crud-page [config]>

Showcase (showcase.page.ts):
  - 731 строк — демонстрация 40+ компонентов UI Kit
  - 7 секций: Colors/Typography, Buttons/Badges, Inputs/Forms,
    Navigation, Overlays, Data Display/Charts, Layout Primitives
  - ScrollSpy, command palette (Cmd+K), shortcuts, density toggle


================================================================================
 17. FRONTEND: UI KIT (40+ компонентов)
================================================================================

TZ-19..29 (Core):
  badge, button, card, confirm-dialog, crud-page, empty-state,
  form-dialog, row-actions, skeleton

TZ-31 (Core Primitives):
  tooltip (directive), switch, slider, tabs (4-части: component/list/trigger/content),
  breadcrumb, accordion, pagination, sheet

TZ-32 (Advanced Inputs):
  combobox, rating, stepper, progress, avatar

TZ-33 (UX Features):
  command-palette, density-toggle, shortcuts

TZ-36 (Charts):
  chart (обёртка ng2-charts/Chart.js)

TZ-37 (Premium Inputs):
  calendar, otp-input, kbd

TZ-38 (Advanced Overlays):
  popover, context-menu, hover-card, bottom-sheet

TZ-39 (Layout Primitives):
  resizable (panel-group), scroll-area, aspect-ratio, collapsible, carousel

crud-page.component.ts (493 строки — ядро CRUD):
  - AG Grid с автогенерацией колонок из data keys
  - Пагинация 25/50/100, floating filters, sortable, resizable
  - Actions column: RowActionsComponent (Edit/Delete)
  - CRUD: FormDialog (create/edit), ConfirmDialog (delete)
  - Relation fields: async загрузка options
  - Search: клиентская фильтрация

form-dialog.component.ts:
  - CDK Dialog, динамические поля
  - Типы: text, number, email, date, textarea, select, boolean, relation


================================================================================
 18. FRONTEND: СЕРВИСЫ
================================================================================

toast.service.ts:
  - Signal-based toast queue, max 5 видимых
  - Варианты: default, info, success, warning, destructive
  - Auto-dismiss через setTimeout

theme.service.ts:
  - Signal-based theme ('light' | 'dark')
  - Dark-first default
  - Persist в localStorage (kppdf-theme)
  - Anti-FOUC script в index.html

dialog.service.ts:
  - Обёртка CDK Dialog
  - openForm(), confirm()

loading.service.ts:
  - Ref-count signal: inc() / dec()
  - isLoading readonly signal


================================================================================
 19. FRONTEND: КОНФИГУРАЦИЯ СТРАНИЦ
================================================================================

pages.config.ts (268 строк):
  - Единый источник правды для 65 ERP-таблиц + 1 showcase = 66 всего
  - PageConfig: id, title, endpoint, icon, category (1-8), priority (1-12), roles?, fields?
  - 8 категорий:
    1. Основные (Foundation) — counterparties, organizations, persons, users...
    2. Продукция (Products) — products, materials, BOM, certificates...
    3. Производство (Manufacturing) — work centers, routing, production orders...
    4. Склад (Warehouse) — warehouses, storage, stock movements...
    5. Закупки (Purchasing) — requests, orders, invoices, tenders...
    6. Продажи (Sales) — quotations, contracts, orders, shipments, cart...
    7. Документы + Финансы — doc types, templates, reconciliation, reports...
    8. Система — audit, comments, imports, rate limits, feature flags, showcase

  Form fields определены для: counterparty (11), organization (13),
  person (8), product (8), material (6). Остальные read-only.

  Role-gated pages: admin-only для users, roles, permissions, settings,
  counters, audit, import-jobs, rate-limits, feature-flags.


================================================================================
 20. FRONTEND: СТИЛИЗАЦИЯ
================================================================================

tailwind.config.js:
  - Dark mode: class strategy
  - CSS variable-based design system (shadcn/ui pattern):
    Colors: border, input, ring, background, foreground, primary, secondary,
            destructive, muted, accent, popover, card, success, warning
    All as hsl(var(--name))
  - Custom border-radius: 0.75rem
  - Font families: Inter (sans), JetBrains Mono (mono)
  - Custom keyframes: fade-in, slide-*, scale-in, shimmer, accordion-*

styles.css (220 строк):
  - AG Grid styles (ag-grid.css, ag-theme-quartz.css)
  - Light theme: violet primary, cyan secondary, rose destructive,
    emerald success, amber warning
  - Dark theme: adjusted lightness
  - Component classes: .btn-*, .card-*, .input, .label, .badge-*
  - Typography scale: .text-display through .text-code (11 классов)
  - Global focus ring: *:focus-visible { ring-2 ring-ring }
  - Scrollbar utilities

index.html:
  - Google Fonts: Inter (400-700), JetBrains Mono (400-500)
  - Anti-FOUC: читает kppdf-theme из localStorage до Angular bootstrap


================================================================================
 21. FRONTEND: ИНФРАСТРУКТУРА
================================================================================

angular.json:
  - Builder: @angular/build:application
  - Budgets: initial 800kB warn / 1.5MB error
  - Component styles: 4kB warn / 8kB error
  - outputHashing: "all"

Ключевые зависимости:
  Angular 20.3, CDK 20.2, AG Grid 32.3, TailwindCSS 3.4
  TypeScript 5.9, Chart.js 4.x, ng2-charts 5.x
  CVA 0.7, clsx 2.1, tailwind-merge 3.6
  zod 3.23, date-fns 4.1

Yarnage utilities:
  cn() — clsx + twMerge (shadcn/ui)
  API_BASE_URL InjectionToken

ngx-translate:
  @ngx-translate/core v17 и http-loader установлены
  но НИГДЕ не используются — 0 импортов в коде
  Языковой селектор RU/EN — косметический


================================================================================
 22. БЕЗОПАСНОСТЬ: ПОЛНЫЙ АУДИТ
================================================================================

АУТЕНТИФИКАЦИЯ:
  [OK] bcryptjs 10 rounds
  [OK] Два отдельных JWT secrets (access + refresh)
  [OK] Refresh token versioning (server-side revocation)
  [OK] Password hash никогда не в API
  [OK] Global guards: JwtAuthGuard + RolesGuard
  [!] RegisterDto.role принимает любую строку (self-escalation)

HELMET/CORS/RATE LIMITING:
  [OK] Helmet: CSP (self + unsafe-inline), HSTS (1 year, preload)
  [OK] CORS: whitelist из CORS_ORIGINS + credentials
  [OK] ThrottlerModule: short 1s/10req, long 60s/100req
  [OK] ValidationPipe: whitelist + forbidNonWhitelisted + transform
  [!] DISABLE_THROTTLE=1 отключает rate limiting полностью

NoSQL INJECTION:
  [OK] Нет $where операторов
  [OK] Все $gt/$lt/$in/$exists конструируются серверно
  [OK] ValidationPipe + class-validator фильтруют DTO
  [!] Зависит от полноты @IsObjectId валидации в DTO

ХРАНЕНИЕ ТОКЕНОВ:
  [HIGH] localStorage (уязвим к XSS)
  [OK] Смягчено strict CSP (scriptSrc: 'self')
  [OK] Для internal ERP приемлемо, для публичного приложения — HIGH

ENV VALIDATION:
  [OK] NODE_ENV: development|production|test
  [OK] JWT_SECRET: min 16 chars, required
  [!] CORS_ORIGIN vs CORS_ORIGINS — несовпадение имён
  [!] allowUnknown: true — пропускает любые доп. env vars

DOCKER-COMPOSE:
  [!] MongoDB без аутентификации (нет --auth)
  [!] Порт 27017 экспозиция на хост
  [!] Нет лимитов ресурсов (mem_limit, cpus)
  [!] Нет read_only, security_opt


================================================================================
 23. КАЧЕСТВО КОДА
================================================================================

TypeScript strict mode:
  Backend:  strict: true, noImplicitAny, strictNullChecks,
            strictBindCallApply, forceConsistentCasingInFileNames
  Frontend: strict: true, noImplicitOverride, strictTemplates,
            strictInjectionParameters, strictInputAccessModifiers
  Оценка: ВЫШЕ СРЕДНЕГО — оба проекта с полным strict mode

any-типизация:
  Backend:  1 обоснованный `as any` с ESLint-комментарием (user-context.plugin)
  Frontend: 0 any
  Оценка: ИСКЛЮЧИТЕЛЬНО — virtually any-free codebase

Console.log в backend:
  0 occurrences. Используется NestJS Logger + pino.
  Оценка: ИДЕАЛЬНО

Модульная архитектура:
  67 модулей в monolith — может потребоваться decomposition при росте
  Все модули полные (schema+service+controller+module) кроме auth/inventory/permissions

AsyncLocalStorage для user context:
  Элегантный паттерн, избегает передачу req через service layers
  3-plugin Mongoose chain (userContext → audit) — хорошо спроектировано

Seed система:
  Идемпотентная, OnApplicationBootstrap, безопасна для повторного запуска


================================================================================
 24. ТЕСТИРОВАНИЕ
================================================================================

Backend:
  E2E тесты: 7 файлов, ~21 тест-кейс
    auth.e2e-spec.ts          — 4 теста (login, wrong password, /me, refresh)
    products.e2e-spec.ts      — 3 теста (create, search, BOM)
    warehouse.e2e-spec.ts     — 4 теста (stock in, insufficient, transfer, low-stock)
    quotations.e2e-spec.ts    — 4 теста (create, duplicate, snapshot, convert)
    orders.e2e-spec.ts        — 4 теста (create, reserve-stock, cancel, ship)
    integration.e2e-spec.ts   — 1 тест (полный sales flow)
    production.e2e-spec.ts    — 1 тест (полный production flow)

  Unit тесты: 0

  Потенциальный баг в test-auth.ts:
    loginAsAdmin() отправляет {email, password} но LoginDto ожидает {username, password}

Frontend:
  1 тест: app.spec.ts — smoke test "should create the app"
  E2E тесты: нет

Покрытие: МИНИМАЛЬНОЕ — ~1% от общего кода


================================================================================
 25. ИНФРАСТРУКТУРА И DEPLOYMENT
================================================================================

start.mjs (1083 строк):
  - Cross-platform Node.js launcher
  - Pre-flight checks: Node 20+, pnpm, Docker, .env, ports
  - MongoDB: docker compose up, replica set wait
  - Auto-install: pnpm install если нет node_modules
  - Backend: pnpm start:dev / node dist/main.js
  - Frontend: pnpm start / inline static server
  - Modes: --check, --stop, --reset, --prod, --no-build, --tail, --no-browser
  - TUI mode: in-place terminal status для 3 сервисов
  - Production mode: build + inline Node.js static server
  - PID management: .start.pids.json
  - Graceful shutdown: SIGINT/SIGTERM
  - Security: shell: true только для .cmd/.bat, аргументы whitelisted

OrchestratorKit/:
  - Portable task orchestration для AI agents
  - Conflict-key parallelism (до 4 agents)
  - Автоматическое архивирование и status sync

Docker Compose:
  - mongo:7 с replica set rs0
  - mongo-init: инициализация replica set
  - backend: build + env_file, порт 3000
  - mongo-data volume для persistent storage


================================================================================
 26. СВОДКА: КРИТИЧЕСКИЕ ПРОБЛЕМЫ
================================================================================

!!! ОШИБКА #1: Backend не стартует (dist/main.js не найден)
    Причина: nest-cli.json sourceRoot:"src" + tsconfig outDir:"./dist"
             → main.js попадает в dist/src/main.js
    Влияние: npm run start/start:all/start:prod — все сломаны
    Исправление: Обновить путь в package.json/start.mjs

!!! ОШИБКА #2: Backend падает с StrictModeError ("deletedAt" not in schema)
    Причина: soft-delete plugin глобальный, но 0 из 67 схем имеют deletedAt
    Влияние: Backend НЕ может запуститься
    Исправление: Добавить deletedAt во все схемы ИЛИ настроить plugin

!!! ОШИБКА #3: RegisterDto.role — privilege escalation
    Причина: @IsString() без @IsIn(['user'])
    Влияние: Любой может self-register как admin
    Исправление: Ограничить допустимые роли при регистрации


================================================================================
 27. СВОДКА: ВСЕ НАХОДКИ ПО ПРИОРИТЕТУ
================================================================================

CRITICAL (3):
  [C1] dist/main.js path mismatch — backend не стартует
  [C2] All 67 schemas missing deletedAt — backend падает при seed
  [C3] RegisterDto.role self-escalation — привилегия admin

HIGH (2):
  [H1] backend/.env не в .gitignore — секреты могут попасть в git
  [H2] JWT tokens в localStorage — XSS vector (смягчено CSP)

MEDIUM (5):
  [M1] ESLint broken (.eslintrc.js vs eslint@10)
  [M2] Frontend lint не настроен (angular-eslint не установлен)
  [M3] CORS_ORIGIN vs CORS_ORIGINS naming mismatch
  [M4] Docker Compose без MongoDB auth и resource limits
  [M5] Swagger без @ApiProperty/@ApiOperation — пустые модели

LOW (9):
  [L1] Feature-flag virtual getter no-op (тернарник возвращает одно и то же)
  [L2] soft-delete.plugin.ts дублирующий pre('find')
  [L3] ngx-translate установлен но не используется (0 импортов)
  [L4] Language selector RU/EN — косметический
  [L5] test-auth.ts: {email} vs LoginDto {username}
  [L6] INN validator: d10 check на несуществующем индексе
  [L7] LoggingInterceptor существует но не зарегистрирован
  [L8] Нет unit тестов (~1% покрытие)
  [L9] CORS_ORIGIN в .env указывает на :3000 вместо :4200

INFO (3):
  [I1] 67 модулей в monolith — может потребоваться decomposition
  [I2] Multer в зависимостях но нет upload controller (кроме import-jobs)
  [I3] 0 console.log в backend — отлично

ОБЩАЯ ОЦЕНКА:
  Архитектура:        ОТЛИЧНО — чистая, последовательная, хорошо спроектирована
  Качество кода:      ВЫСОКОЕ — strict TypeScript, 0 any, structured logging
  Безопасность:       ХОРОШАЯ — bcrypt, JWT, Helmet, CORS, rate limiting
  Тестирование:       СЛАБОЕ — ~1% покрытие, нет unit тестов
  Запуск:             СЛОМАН — 2 критических бага не дают стартовать
  Документация:       МИНИМАЛЬНАЯ — Swagger пуст, нет JSDoc
  i18n:               ОТСУТСТВУЕТ — ngx-translate установлен, не используется
  Deployment:         DEV-ONLY — Docker Compose без auth/limits

  Вердикт: Проект хорошо спроектирован на архитектурном уровне,
  но имеет 2 критических бага, блокирующих запуск. После их исправления
  и добавления тестов будет готов к продакшн-деплою.

================================================================================
                          КОНЕЦ ОТЧЁТА
================================================================================
