# Полный аудит-анализ всех TZ проекта kppdf-8.0

**Дата:** 2026-07-19
**Объём:** 22 активных + ~37 архивных TZ
**Проект:** kppdf-8.0 — ERP-система (NestJS 10 + Angular 20 + MongoDB 7)

---

## 0. Вердикт по векторной базе данных

**НЕ НУЖНА. Уже решено.**

Вердикт зафиксирован в `ARCHITECTURE.md` §5 (TZ-105.1, 2026-07-12):

> kppdf-8.0 uses MongoDB-only search. **No Vector DB** — neither external semantic-search infrastructure nor MongoDB Atlas `$vectorSearch`.

### Что проверено:
- 0 совпадений для Qdrant/Weaviate/Pinecone/pgvector/Chroma/Milvus/Atlas в `package.json`, `pnpm-lock.yaml`, `docker-compose*.yml`, `backend/src/`, `frontend/src/`
- 0 `$vectorSearch`/`$text`/`$search` в MongoDB-коде
- 7 false positives в `shared/theme/` — это OKLCH color space (lightness/chroma/hue), НЕ vector embeddings
- Docker Compose содержит только MongoDB 7 + backend

### Почему не нужна:
1. **Поиск по ИНН/артикулу/телефону** — 100% покрыт MongoDB regex + compound индексами. Semantic search для фактографических данных = overkill.
2. **MongoDB `$text`** — dismissed: stemming добавляет index-maintenance cost без ROI для structured-fact-lookup.
3. **Natural-language search по текстовым блокам** — TZ-86 вводит text-block конструктор, но нет use-case "найти шаблон по смыслу".
4. **Рекомендательные системы** — отсутствуют в roadmap.

### Если将来 появится нужда:
- **MongoDB Atlas `$vectorSearch`** — если Atlas tier. Новая инфраструктура не нужна: vector index добавляется к schema + driver call.
- **Qdrant sidecar** — если MongoDB Atlas tier недоступен. Добавляется отдельный server в `docker-compose.yml` + SDK в backend.

**Вывод: заполнять векторную БД не нужно — это будет ненужная работа.**

---

## 1. Полная картина: что построено

### Ядро ERP ( shipped )
| Модуль | TZ | Описание |
|--------|-----|----------|
| Иерархия продуктов | TZ-83 | Product → ProductModule → Materials + WorkTypes |
| Расчёт себестоимости | TZ-85 | Автоматическое ценообразование через иерархию модулей |
| Конструктор документов | TZ-86 | 3-pane builder, тексты, таблицы, drag-from-palette |
| Инвентарь | TZ-100/101 | Dashboard, storage-items, stock-movements |
| Организации/Контакты | TZ-06 | CRM с контрагентами, INN-валидацией |

### Безопасность ( shipped )
| Компонент | TZ | Описание |
|-----------|-----|----------|
| Auth & Identity | TZ-04 | JWT (15m + 7d refresh), bcrypt, иерархия ролей |
| RBAC sweep | TZ-91 | `@Roles()` на 73 контроллера (226 write-endpoints) |
| Rate limiting | TZ-18/91 | 10 req/s + login: 5 req/min |
| CORS, Swagger gating, admin-password drift | TZ-91 | Production-ready |

### Design System ( shipped )
| Компонент | TZ | Описание |
|-----------|-----|----------|
| Paper & Ink | TZ-93/94/95 | Brutalist UI с hairline borders, OKLCH palette |
| Pi-* primitives | TZ-32..62 | 24+ компонентов (button, card, dialog, table, toast, progress, skeleton...) |
| Dialog system | TZ-90 | Polymorphic wrapper, 4 шаблона |
| UI-kit wrappers | — | PageHeader, EmptyState, Badge, TableRowActions |

### Dev Tooling ( shipped )
| Инструмент | TZ | Описание |
|------------|-----|----------|
| start.mjs | TZ-41/42/46 | Кросс-платформенный оркестратор с TUI |
| MCP integration | TZ-92 | Project-local codebase-memory сервер |
| DI audit | TZ-45 | Статический анализатор каскадных багов |
| Тесты | — | 242 frontend unit tests, 10 backend e2e suites |

---

## 2. Активные TZ: краткое описание каждого

### CRITICAL (сделать ПЕРВЫМИ)

| TZ | Название | Что делает | Файлы |
|----|----------|------------|-------|
| **TZ-125** | Interceptor RxJS Leaks | `tap(async)` в audit interceptor → crash Node при audit-failure. Замена на `mergeMap` + `catchError`. | 3 interceptor'а + 1 spec |
| **TZ-126** | EAV Partial Writes | `resolveAttributes` делает N sequential `updateOne` без транзакции. 5-й op fail = partial corruption. bulkWrite + `withTransaction()`. | 1 service + 1 spec |
| **TZ-121** | Cross-Service TX | Order.reserveStock / Contract.activate — cross-service без shared session. Orphan orders/contracts при failure. SessionRunner helper. | 4 services + 1 helper |

### HIGH

| TZ | Название | Что делает | Файлы |
|----|----------|------------|-------|
| **TZ-127** | Auth Rate-Limit Bypass + XSS | Авторизованный user = unlimited req/s. Refresh token в localStorage = XSS. HttpOnly cookie + tiered throttler. | 7 файлов |
| **TZ-119** | Backend Safety Sweep | `GET /api/products/INVALID_ID` → 500 (нет ObjectId validation pipe). lookup-table memory leak. | 1 pipe + 7 controllers + 1 script |
| **TZ-118** | Cross-page Type Safety | Duplicate error-banner в 8+ pages. `onDialogCloseOnce` callback type unknown. Empty-route 404 fire. | 1 component + 7+ pages |
| **TZ-117** | Toolbar UX Consistency | Нет кнопки Reload. Нет keyboard navigation для table rows. Нет clear-filters. | 1 component + 7 pages |

### MEDIUM

| TZ | Название | Что делает |
|----|----------|------------|
| **TZ-122** | Optimistic Locking | `Object.assign(doc, dto); doc.save()` — silent overwrite при параллельном edit. VersionKey + 409 filter. |
| **TZ-114** | Category Tree View UX | Frontend drag-reorder для категорий (blocked на TZ-110). |
| **TZ-116** | Sort State Reactivity Bug | work-types: `as any` cast, snapshot vs reactive sort. stock-movements: `numeric: true` на formatted string. |
| **TZ-113** | Builder Canvas A11y | Keyboard multi-select + ARIA для Document Constructor. |
| **TZ-112** | Table Template Dialog | Column metadata loss при field toggle. Mode switch без confirmation. |

### LOW (code quality)

| TZ | Название | Что делает |
|----|----------|------------|
| **TZ-124** | List-Query Optimization | N+1 populate: 80+ queries per list page → batch populate + lean(). |
| **TZ-123** | Type-Safe ObjectId | `as unknown as Types.ObjectId` в 12+ сервисах → `@ToOptionalObjectId()` decorator. |

### Infrastructure / Backlog

| TZ | Название | Описание |
|----|----------|----------|
| **TZ-105** | Архитектурная полировка | Vector DB verdict (DONE) + BOM migration + error-handling standardization |
| **TZ-105.3** | Server-side DOMPurify | Sanitize HTML в text-blocks (backlog, P2) |
| **TZ-104.3-b2** | Pi-table batch-2 | 7 remaining list-pages migration |
| **TZ-104.4** | Pi-table polish | Debounce + generic restoration |
| **TZ-104.5** | Pi-Primitives Migration | Checkbox, textarea, select adoption |
| **TZ-87** | Doc Constructor F.3 | Dev fixtures seed + Create-template UI |
| **tz-ui-audit** | UI-kit unification | 251-line adoption plan |
| **u.audit** | Архитектурный рефакторинг | 24 items, 8 stages |

---

## 3. Граф зависимостей (критический путь)

```
TZ-120 (Soft-delete ✅)
    ├─→ TZ-122 (Optimistic Locking)
    ├─→ TZ-121 (Cross-service TX) ──→ TZ-122
    └─→ TZ-126 (EAV atomicity)

TZ-110 (Category safety ✅)
    ├─→ TZ-119 (Backend safety sweep)
    ├─→ TZ-121 (Cross-service TX)
    └─→ TZ-114 (Category tree UX)

TZ-115 (Inventory httpResource ✅)
    ├─→ TZ-117 (Toolbar UX)
    ├─→ TZ-116 (Sort state bugs)
    └─→ TZ-118 (Type Safety)

TZ-104.3 batch-1 ✅
    └─→ TZ-104.3-b2 (7 pages)
         └─→ TZ-104.5 (Primitives)
              └─→ TZ-104.4 (pi-table polish)

TZ-86 (Doc Constructor ✅)
    └─→ TZ-87 (F.3 close-out)
         └─→ TZ-105.3 (Server-side sanitization)
```

---

## 4. Паттерны и темы

### Тема 1: Data Integrity Hardening (CRITICAL)
Цепочка защиты MongoDB данных:
1. TZ-120 (Soft-delete) → скрытие удалённых записей ✅
2. TZ-121 (Cross-service TX) → атомарность Order/Contract/Reservation
3. TZ-122 (Optimistic Locking) → защита от silent overwrite
4. TZ-126 (EAV atomicity) → bulkWrite в транзакции
5. TZ-110 (Category safety) → fullPath integrity + ObjectId validation ✅

### Тема 2: Frontend UI Consistency
- TZ-104 серия: миграция 27 list-pages на `<app-pi-table>` (~80% done)
- TZ-104.5: Checkbox, textarea, select adoption
- TZ-117/118: Toolbar UX, error banner extraction

### Тема 3: Security & Reliability
- TZ-127: HttpOnly cookie auth + tiered rate limiting
- TZ-125: RxJS interceptor crash prevention
- TZ-119: ObjectId validation pipe
- TZ-105.3: Server-side DOMPurify (backlog)

### Тема 4: Developer Experience
- TZ-123: Type-safe ObjectId (12+ services)
- TZ-124: Query optimization (80+ queries → batch)
- TZ-116: Sort state reactivity bugs

---

## 5. Рекомендации: что делать и когда

### Немедленно (неделя 1)
1. **TZ-125** — минимальные усилия, максимальный эффект (fix crash process)
2. **TZ-126** — data integrity, requires replica set verification
3. **TZ-127** — security hardening, HttpOnly cookies

### Короткий срок (неделя 2-3)
4. **TZ-121** — cross-service transactions (orphan orders/contracts)
5. **TZ-119** — ObjectId validation (500 errors на invalid IDs)
6. **TZ-118** — error banner extraction (8+ pages)

### Средний срок (месяц)
7. **TZ-104 серия** — завершить миграцию pi-table (22 pages remaining)
8. **TZ-117** — toolbar UX (reload button, search input, keyboard a11y)
9. **TZ-122** — optimistic locking

### Долгосрочный
10. u.audit — 24-item refactoring roadmap (8 stages)
11. tz-ui-audit — UI-kit unification (251-line spec)

---

## 6. Что НЕ стоит делать

### ❌ Векторная БД — уже решено, не нужна
Вердикт TZ-105.1 канонический. Нет use-case. Добавление vector DB SDK без formal TZ = нарушение архитектурного решения.

### ❌ MongoDB `$text` index — dismissed
Stemming добавляет write-amplification cost без ROI для structured-fact-lookup.

### ❌ `BaseCrudService` extraction — premature
Массивный cross-page refactor. Только после TZ-104 + TZ-105 merge.

### ❌ Cart-session consolidation — file shuffle без profit
Чистая перестановка файлов без реального упрощения.

### ❌ Form-dialog form-logic extraction — out of scope
Legitimate size каждого dialog подтверждена.

---

## 7. Статистика проекта

| Метрика | Значение |
|---------|----------|
| Всего TZ (включая архив) | ~59 |
| Завершённых TZ | ~37 |
| Активных TZ | 22 |
| Frontend unit tests | 242 |
| Backend e2e suites | 10 |
| Backend modules | 18+ (72 entities) |
| Frontend UI primitives | 24+ |
| Контроллеров с RBAC | 73 (226 write-endpoints) |
| Векторная БД | ❌ не нужна (verdict TZ-105.1) |

---

*Сгенерировано аудитом MiMoCode — 2026-07-19*
