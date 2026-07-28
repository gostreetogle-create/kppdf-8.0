---
id: 001
category: inventory
title: Frontend Inventory Audit
date: 2026-07-27
author: Buffy (kppdf-8.0 inventory agent)
scope: frontend/ — Angular 20 SPA + supporting tools
methodology: direct-grep + file-reads (no rewrite of project files)
status: FINAL
supersedes: null
---

# Audit 001 — Frontend Inventory (kppdf-8.0)

> Дата: 2026-07-27 · Источник: прямой grep + чтение исходников (без перезаписи файлов)

---

## 1. СТРУКТУРА И АРХИТЕКТУРА

### 1.1 Дерево `frontend/src/app/`

```
app/
├── core/                      ← инфраструктура (HTTP, auth, tokens, 8 файлов)
│   ├── api.tokens.ts          ← API_BASE_URL InjectionToken
│   ├── api.tokens.prod.ts     ← override для production
│   ├── auth.guard.ts
│   ├── auth.interceptor.ts (+ .spec.ts)
│   ├── auth.service.ts (+ .spec.ts)
│   └── silent-http.ts         ← silentGet/Post/Patch/Delete, SilentResult<T>
├── layout/                    ← app-shell (3 компонента + theme-toggle)
├── pages/                     ← фичи (24+ page-файлов)
│   ├── contracts/, dictionaries/, forms/, inventory/, login/,
│   ├── materials/, modules/, orders/, organizations/, playground/,
│   ├── products/, work-types/
│   └── doc-constructor/       ← builder/ + tables/ + texts/ + documents/ + templates/
├── shared/                    ← переиспользуемые примитивы
│   ├── code/ (pi-code-preview)
│   ├── command/, models/, playground/, template-block/, theme/
│   ├── page/ (pi-page-header, pi-section, pi-toolbar, pi-demo)
│   ├── services/ (19 entity-сервисов)
│   ├── ui/ (60+ компонентов примитивов)
│   └── util/ (8 утилит)
├── app.config.ts, app.routes.ts (+ .spec.ts), app.ts, styles.css
```

### 1.2 Слои и документация

Слои **разделены**, но **не документированы явной схемой** в коде:
- **core/** — singleton инфраструктура (HTTP, auth, tokens)
- **layout/** — app-shell, глобальные toggle-ы
- **shared/** — переиспользуемые примитивы (UI + utilities)
- **pages/** — фичи (`<domain>/<domain>.page.ts`)

Документация слоёв:
- **`docs/DEVELOPMENT-PATTERNS.md`** (≈350 строк) — канонический справочник по сервисам, list-page, form-dialog, util-помощникам, чек-лист перед коммитом.
- **`STACK.md`** — high-level обоснование решений (Angular 20, Material MD3, Signals, density -3). ⚠️ Частично устарел: раздел "UI Patterns" упоминает `shared/ui-kit/ui-page-header.component.ts` с селектором `<app-ui-page-header>`, но в реальном коде примитив называется `PiPageHeaderComponent` в `shared/page/pi-page-header.component.ts` с селектором `<app-pi-page-header>` (старое название, но путь другой).
- **`docs/pages/*.page.md`** — 24 per-page дока (по соглашению из §9).

### 1.3 Standalone vs NgModules

**100% standalone.** `grep -E "@NgModule" frontend/src` → **0 матчей**. `grep "standalone: true"` → **90 совпадений**, включая:
- 78 в `shared/ui/` и подпапках (`shared/ui/dialog/*.component.ts`, `shared/ui/form-field/form-field.component.ts`, `shared/ui/switch/switch.component.ts`, …)
- 12 в page-файлах (`orders/order-form-dialog`, `products/product-form-dialog`, `doc-constructor/builder/builder.page.ts`, все list-pages)

ESLint правило принудительно: `'@angular-eslint/prefer-standalone': 'error'` в `frontend/eslint.config.js:39`.

---

## 2. СУЩЕСТВУЮЩИЕ DSL-ПОДОБНЫЕ АБСТРАКЦИИ

### 2.1 Универсальные компоненты в `shared/ui/` ✓ ЕСТЬ

| Компонент | Файл | LOC | Назначение |
|---|---|---|---|
| `<app-pi-table>` | `shared/ui/pi-table.component.ts` | **603** | Центральный primitive — таблица с sortable columns, sticky headers, paginator, cellTemplates, rowActions, localSort, error-banner hooks |
| `<app-pi-dialog>` + `PiDialogService` | `shared/ui/dialog/pi-dialog.component.ts` + `pi-dialog.service.ts` | — | Диалог-шелл с шириной `sm/md/lg`, slot `body`/`footer`, lifecycle |
| `<app-pi-alert-dialog>` | `shared/ui/dialog/pi-alert-dialog.component.ts` | — | Стандартизированный confirm-диалог |
| `<app-pi-form-field>` + `<app-pi-input>` / `<app-pi-select>` / `<app-pi-textarea>` / `<app-pi-checkbox>` / `<app-pi-radio>` / `<app-pi-switch>` / `<app-pi-slider>` | `shared/ui/form-field/` + `input/` + `select/` + … | — | Полная библиотека form-controls с label, error, hint |
| `<app-pi-row-actions>` | `shared/ui/pi-row-actions/pi-row-actions.component.ts` | — | Reveal-on-hover action-колонка |
| `<app-pi-empty-state>` | `shared/ui/pi-empty-state/pi-empty-state.component.ts` | — | Empty state с icon/description/CTA |
| `<app-pi-empty-tile>` | `shared/ui/pi-empty-tile/pi-empty-tile.component.ts` | — | Compact empty |
| `<app-pi-pagination>` | `shared/ui/pi-pagination.component.ts` | — | Standalone paginator |
| `<app-pi-tabs>` + `<app-pi-tab>` | `shared/ui/pi-tabs.component.ts` + `pi-tab.component.ts` | — | Tab-стрипы |
| `<app-pi-breadcrumb>` + `-item` | `shared/ui/pi-breadcrumb.component.ts` | — | Хлебные крошки |
| `<app-pi-tooltip>` + `.directive` | `shared/ui/pi-tooltip.*` | — | Tooltip на CSS-only `data-tooltip` + директива |
| `<app-pi-popover.directive>` | `shared/ui/pi-popover.directive.ts` | — | Popover через CDK Overlay |
| `<app-pi-error-banner>` | `shared/ui/error-banner/error-banner.component.ts` | — | Стандартизированный error-state |
| `<app-pi-toast>` (service + component) | `shared/ui/toast/` | — | Глобальный toast-bus |
| `<app-pi-rich-text-editor>` | `shared/ui/rich-text/pi-rich-text-editor.component.ts` | 573 | TipTap-обёртка |
| `<app-pi-canvas-page>` + `<app-pi-canvas-block-handle>` | `shared/ui/canvas/` | — | Примитивы для builder-canvas |

`<app-pi-page-header>`, `<app-pi-section>`, `<app-pi-toolbar>` лежат в `shared/page/` (отдельная папка от `shared/ui/`).

### 2.2 Utilities для поиска/сортировки/пагинации/lookup ✓ ЕСТЬ

В `shared/util/` (8 файлов):

| Util | Файл | Назначение |
|---|---|---|
| `createSearchState(debounceMs?)` | `search.ts` | Серверный поиск с debounce 300ms |
| `createClientSearchState(data, matcher)` | `search.ts` | Клиентский фильтр через `computed<T[]>` |
| `createLookupTable<T>(fetcher, keyFn?)` | `lookup-table.ts` | FK-резолв через `byId()` signal (`{record: id → T}`) |
| `createSortState<K>(initialKey, initialDir?)` | `sort.ts` | Типизированный sort state + `sorted()` helper |
| `onDialogCloseOnce<T>(ref, injector, callback)` | `on-dialog-close-once.ts` | Подписка на close (NG0203-safe, `filter(Boolean)+take(1)`) |
| `pluralize(n, [f1,f2,f3])` | `format.ts` | Русское склонение |
| `formatPrice` / `formatDate` | `format.ts` | Числовой/дата форматтер |
| `moveItemInArray` | `move-item-in-array.ts` | Drag-reorder helper |

### 2.3 Фабрики сервисов и API-клиентов ❌ ОТСУТСТВУЕТ

- ❌ **НЕТ** `defineEntity<T,P>(config)` factory
- ❌ **НЕТ** `createServiceFactory(baseUrl)` генератора
- ❌ **НЕТ** типизированного endpoint-реестра (string-literal URL'ы `${baseUrl}/${entity}` хардкодятся в каждом сервисе)
- ❌ **НЕТ** mutation-обёртки (`useMutation` / `Mutation<T,P>` signal-based helper). Все мутации делаются через `.subscribe((res) => ...)` — главный источник boilerplate (см. §8)

### 2.4 Кастомные Schematic-генераторы ❌ ОТСУТСТВУЕТ

- `angular.json` строка 8: `"schematics": {}` — пусто
- `grep "@schematics/" frontend/` → **0 матчей**
- Для создания новой page → копипаст §3 из `DEVELOPMENT-PATTERNS.md` вручную. **Никакого `ng generate entity-page` нет.**

---

## 3. HTTP И СЕРВИСЫ

### 3.1 Единый HTTP-слой ✓ ЕСТЬ

Файл: `frontend/src/app/core/silent-http.ts`.

Паттерн: **ошибки не пробрасываются в observable** — вместо этого возвращается дискриминированное `SilentResult<T>`:

```ts
type SilentResult<T> =
  | { ok: true;  data: T }
  | { ok: false; error: HttpErrorResponse };

export const silentGet  : <T>(http, url, opts?) => Observable<SilentResult<T>>;
export const silentPost : <T>(http, url, body, opts?) => Observable<SilentResult<T>>;
export const silentPatch: <T>(http, url, body, opts?) => Observable<SilentResult<T>>;
export const silentDelete: <T>(http, url, opts?) => Observable<SilentResult<T>>;
export const extractErrorMessage: (err) => string; // 'err.error.message ?? err.message ?? Неизвестная ошибка'
export const normalizeError: (err) => HttpErrorResponse;
```

Все entity-сервисы **обязаны** использовать `silent*` (DEVELOPMENT-PATTERNS.md §1 + §2). Прямой `this.http.get` — запрещён чек-листом §10 строки 287-289.

### 3.2 Типовой паттерн сервиса ✓ ЕСТЬ, описан

5-методный CRUD-скелет (DEVELOPMENT-PATTERNS.md §2):
```ts
list(params?)      → Observable<SilentResult<MyEntityListResponse>>
findById(id)       → Observable<SilentResult<MyEntity>>
create(payload)    → Observable<SilentResult<MyEntity>>
update(id, payload)→ Observable<SilentResult<MyEntity>>
remove(id)         → Observable<SilentResult<void>>
```

Реализован в 19 сервисах в `shared/services/`. Из них **8 имеют spec-компаньоны**: `organizations.service.spec.ts`, `pi-work-types.service.spec.ts`, `pi-text-blocks.service.spec.ts`, `pi-table-templates.service.spec.ts`, `pi-product-modules.service.spec.ts`, `pi-product-module-photos.service.spec.ts`, `pi-document-templates.service.spec.ts`, `pi-counterparty.service.spec.ts`, `pi-cost-calculations.service.spec.ts`, `pi-registry.service.spec.ts` — но **без spec**: `materials.service.ts`, `products.service.ts`, `categories.service.ts`, `pi-generated-documents.service.ts`, `photos.service.ts`, `pi-template-blocks.service.ts`.

### 3.3 Типизированные эндпоинты ❌ НЕТ

- URL'ы — template-literal strings (`${this.baseUrl}/my-entities`, `…/my-entities/${id}`) в каждом сервисе
- ❌ НЕТ `const API_ROUTES = { materials: { list: '/api/materials', byId: (id) => `/api/materials/${id}` } } as const`
- ❌ НЕТ OpenAPI client-gen, нет генерации types из NestJS Swagger
- ⚠️ openAPI/Swagger на backend есть (`backend/src/main.ts` → `/api/docs` в dev per STACK.md), но **НЕ используется** в frontend.

---

## 4. УПРАВЛЕНИЕ СОСТОЯНИЕМ И СИГНАЛЫ

### 4.1 Signals vs BehaviorSubject

| Metric | Count | Loc |
|---|---|---|
| Pages implementing `OnInit` | **7** | `work-types:168`, `organizations:144`, `products:217`, `materials:192`, `orders:267`, `modules:241`, `contracts:270` |
| Shared primitive with `OnInit` | **1 (intentional)** | `pi-table.component.ts:249` (one-shot templateRef seed) |
| `BehaviorSubject` / `ReplaySubject` / `Subject<>` in pages | **0** | — |
| `.subscribe(` calls across `frontend/src/app/**/*.ts` | **197** | heavily concentrated in CRUD mutation handlers (page-level + service-level) |
| `httpResource<>` usage | **61 calls in 14 page files** | `auth.service.ts:33-34` documents: "httpResource only for read; mutations use Observable" |

### 4.2 Реактивность

- **`httpResource`** в 14 pages — главный data-loader, автоматически re-fires на signal changes (см. `materials.page.ts:260`, `products.page.ts:254`)
- **`computed()`** для derived state (`data()`, `total()`, `paginatedRows()`, `sortedRows()`, `filteredRows()`, `loading()`, `error()`, `emptyMessage()`)
- **`signal()`** для локального mutable state (`submitting`, `searchQuery`, `sortKey`, `form`)
- ⚠️ **Мутации (POST/PATCH/DELETE) всё ещё через `.subscribe`** в pages — `httpResource` read-only by design. Это главная зона, которую фабрика `defineEntity`/`useMutation` может устранить.

### 4.3 Загрузка/ошибка/пустое состояние ✓ ПАТТЕРН ЕСТЬ

Каждая list-page вычисляет 4 сигнала унифицированно (см. `work-types.page.ts:189`):
```ts
protected readonly data     = computed<T[]>(() => this.listRes.value()?.items ?? []);
protected readonly loading  = computed<boolean>(() => this.listRes.isLoading());
protected readonly error    = computed<string|null>(() => {
  const e = this.listRes.error() as HttpErrorResponse | undefined;
  return e ? extractErrorMessage(e) : null;
});
protected readonly emptyMessage = computed(() => this.searchQuery() ? 'Ничего не найдено.' : 'Нет записей.');
```

В шаблоне: `@if (error()) { … }` + `<app-pi-table [loading]="loading()" [emptyMessage]="emptyMessage()">`. **Полностью консистентно в 13 pages.**

---

## 5. ТИПИЗАЦИЯ И БЕЗОПАСНОСТЬ КОДА

### 5.1 `any` в коде

- **1 явный `: any`** в production коде: `shared/util/lookup-table.ts:25` — дефолтный `keyFn: (item: any) => item._id` (защитный default для generic-обёртки)
- Прочие хиты из grep — в `.spec.ts` файлах (test-doubles) и в `frontend/src/setup-jest.ts` (Angular testing utilities)

Чисто ✅.

### 5.2 Strict TypeScript ✓

`frontend/tsconfig.json`:
- `strict: true`
- `noImplicitOverride: true`
- `noPropertyAccessFromIndexSignature: true`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`

Angular options:
- `strictTemplates: true`
- `strictInjectionParameters: true`
- `strictInputAccessModifiers: true`

### 5.3 ESLint кастомные правила ⚠️ МИНИМУМ

Файл: `frontend/eslint.config.js`. Включает:
- `@typescript-eslint/no-unused-vars: error`
- `@typescript-eslint/no-explicit-any: warn` ⚠️ только warn
- `@angular-eslint/component-selector: error` → требует `kebab-case`
- `@angular-eslint/use-lifecycle-interface: error`
- `@angular-eslint/prefer-standalone: error`
- `@angular-eslint/no-output-on-prefix: error`
- `no-console: warn` (allow `console.error`)

❌ **НЕТ кастомных safety-правил:**
- ❌ НЕТ `no-restricted-syntax` для `.subscribe(` в pages
- ❌ НЕТ raw `this.http.*` outside services
- ❌ НЕТ запрета `OnInit` (только Angular default `use-lifecycle-interface`)
- ❌ НЕТ запрета `: any`
- ❌ НЕТ DSL guards

DEVELOPMENT-PATTERNS.md §10 «чек-лист перед коммитом» задокументирован, но **не enforced через ESLint** — кроме `prefer-standalone` и `no-explicit-any`.

---

## 6. ДОКУМЕНТАЦИЯ И КОНВЕНЦИИ

### 6.1 Файлы конвенций

| Файл | Назначение | Объём |
|---|---|---|
| **`docs/DEVELOPMENT-PATTERNS.md`** | Канонические паттерны: `silent-http`, service template, list-page template (полный код), form-dialog template, util helpers, dialog patterns, backend module template, route registration, per-page doc convention, pre-commit checklist (12 правил) | **~350 строк, 10 секций** 🟢 Очень подробный |
| **`STACK.md`** | Stack choice rationale, Material MD3 + density -3, 3 ui-kit wrappers (но ⚠️ имена устарели), `mat.all-component-densities(-3)`, 6.5 `<app-ui-table-row-actions>` (тоже устарело → реальный код: `pi-row-actions`) | ~150 строк 🟡 Частично outdated |
| **`docs/pages/_template.md`** | Шаблон для per-page документации со ссылкой `docs/pages/<name>.page.md` | ~50 строк |
| **`docs/pages/*`** | 24 per-page доки | — |

### 6.2 Нейминг

Зафиксировано в ESLint:
- Селектор компонента: `kebab-case` без префикса (но `angular.json:9: "prefix": "app"` → фактически `app-<name>-page`)
- Класс: `<Name>Page` PascalCase

Зафиксировано руками:
- Page файл: `<name>.page.ts` (не `<name>-page.component.ts`)
- Form-dialog: `<name>-form-dialog.component.ts`
- Service: `frontend/src/app/shared/services/<name>.service.ts`

---

## 7. ПРОЦЕССЫ ПРОВЕРКИ И ТЕСТИРОВАНИЕ

### 7.1 Команды (`frontend/package.json`)

| Скрипт | Команда |
|---|---|
| `pnpm typecheck` | `tsc -p tsconfig.app.json --noEmit` |
| `pnpm lint` | `eslint src/` |
| `pnpm lint:fix` | `eslint src/ --fix` |
| `pnpm format` / `format:check` | prettier |
| `pnpm test` | `jest --config jest.config.js` (jest-29 + jest-preset-angular-14 + @testing-library/angular-17 + jsdom) |
| `pnpm build` | `ng build` |
| `pnpm analyze` | `ng build --configuration=analyze` + source-map-explorer |
| `pnpm circular` | `npx madge --circular` (детектор циклов в импортах) |
| `pnpm audit:a11y` | `tsx scripts/audit-a11y.ts` |
| `pnpm lighthouse` | `lhci autorun` |

### 7.2 Юнит-тесты

**Всего: 49 spec.ts файлов, 8,185 LOC** тестового кода в `frontend/src/app/`.

**Что покрыто (хорошо):**
- `shared/ui/pi-table.component.spec.ts` — ~340 LOC, обширное покрытие primitive
- `core/auth.service.spec.ts` + `core/auth.interceptor.spec.ts` — HTTP/auth flow
- `shared/services/*.service.spec.ts` — 8 сервисов (organizations, pi-work-types, pi-counterparty, pi-text-blocks, pi-table-templates, pi-product-modules, pi-product-module-photos, pi-document-templates, pi-cost-calculations, pi-registry)
- `app.routes.spec.ts` — маршруты
- `shared/util/on-dialog-close-once.spec.ts` — util primitive
- `pages/materials/materials.page.spec.ts` — httpResource page + cd
- `pages/doc-constructor/tables/tables.page.spec.ts` + `table-template-dialog.component.spec.ts` — около 700 LOC
- `pages/dictionaries/page уровень` — есть

**Что НЕ покрыто (большие дыры):**
- ❌ `pages/contracts/contracts.page.ts:614` — нет spec
- ❌ `pages/orders/orders.page.ts:601` — нет spec
- ❌ `pages/work-types/work-types.page.ts` — нет spec (но service покрыт)
- ❌ `pages/organizations/organizations.page.ts` — нет spec (но service покрыт)
- ❌ `pages/products/products.page.ts:475` + `product-detail.page.ts:525` — нет spec
- ❌ `pages/materials/materials.page.ts:482` — **есть** spec (✅ единственный полностью покрытый list-page)
- ❌ `pages/modules/modules.page.ts` + `module-detail.page.ts` — нет spec
- ❌ Все form-dialog components (`*-form-dialog.component.ts`) — нет spec
- ❌ `pages/doc-constructor/builder/*` — нет spec (3 файла — 5257 LOC)

### 7.3 E2E / smoke

- ❌ **E2E тестов нет.** В `package.json` нет `cypress`, `playwright`, `@playwright/test`.
- ⚠️ Есть `puppeteer` в devDeps — но используется только в `scripts/audit-a11y.ts` (Chromium-driven a11y audit, не e2e).
- ⚠️ В `backend/test/` есть `reset-password.e2e-spec.ts` + `jest-e2e.json` → backend e2e есть, **фронт — нет**.

---

## 8. ПРОБЛЕМНЫЕ МЕСТА (ЧЕСТНЫЙ ВЗГЛЯД)

### 8.1 Топ дублирований

| Класс | Кол-во повторений | Объём |
|---|---|---|
| List-page (page-header + toolbar + section + pi-table + dialog open/close + reload) | **7 list-pages** (work-types, organizations, modules, materials, products, orders, contracts) | **~3,961 LOC коллективно** |
| Form-dialog (isEdit + submitting + hasError + errorFor + onSubmit + onCancel + form Group) | **9 dialogs** (work-type, organization, material, module, module-materials, category, product, order, contract, table-template) | **~5,000 LOC коллективно** |
| `service.list({page,limit,search})` boilerplate | ~12 сервисов в `shared/services/` (по ~80 строк каждый) | ~1,000 LOC |
| `comparatorBy<K>(accessorFor(key), sign)` аналог | 7 list-pages дублируют ↓ | pattern in `work-types.page.ts:33-44` |

**% дубликата в list-page business logic** = `~85%` (DEVELOPMENT-PATTERNS.md §3 шаблон почти дословно копируется во все 7 list-pages).

### 8.2 God-компоненты (топ-15 по LOC)

| # | LOC | Файл |
|---|---|---|
| 1 | **1983** 🚨 | `pages/doc-constructor/builder/builder-inspector.component.ts` |
| 2 | **1790** 🚨 | `pages/doc-constructor/builder/builder.page.ts` |
| 3 | **1484** 🚨 | `pages/doc-constructor/builder/block-renderer.component.ts` |
| 4 | **1371** 🚨 | `pages/doc-constructor/tables/table-template-dialog.component.ts` |
| 5 | 669 | `pages/materials/material-form-dialog.component.ts` |
| 6 | 614 | `pages/contracts/contracts.page.ts` |
| 7 | 603 | `shared/ui/pi-table.component.ts` ⚠️ baseline primitive |
| 8 | 601 | `pages/orders/orders.page.ts` |
| 9 | 575 | `pages/dictionaries/categories.page.ts` |
| 10 | 573 | `shared/ui/rich-text/pi-rich-text-editor.component.ts` |
| 11 | 533 | `pages/doc-constructor/tables/tables.page.ts` |
| 12 | 530 | `pages/doc-constructor/texts/text-block-editor.component.ts` |
| 13 | 525 | `pages/products/product-detail.page.ts` |
| 14 | 523 | `pages/modules/modules.page.ts` |
| 15 | 510 | `pages/doc-constructor/texts/texts.page.ts` |

🚨 = >1000 LOC. Первые 4 файла — **5,628 LOC** критического god-компонента в builder+tables.

### 8.3 Смешение стилей

- Большинство list-pages мигрированы на `httpResource` для read-операций ✅
- **Но mutations всё ещё через `.subscribe`** в pages (~197 хитов). Auth.service.ts явно фиксирует это дизайн-решение (`:33-34`), но не предлагает решения.
- В `docs/DEVELOPMENT-PATTERNS.md §10` чек-лист говорит "НЕТ raw .subscribe" → но это **никогда не enforced** через ESLint, поэтому 197 хитов продолжают накапливаться.

### 8.4 Hard-to-modify безопасно

- 🚨 `docs/constructor/builder/*` — 3 файла, 5257 LOC. Любое изменение в `builder.page.ts:99` → cascade ref в `builder-canvas` (`shared/ui/canvas/pi-canvas-page.component.ts`) + `builder-inspector` + `block-renderer` + `template-setup-dialog`.
- ⚠️ `shared/ui/pi-table.component.ts:603` — фундаментальный primitive. Один breaking input → 13 list-pages сломаются. Есть spec ~340 LOC, спасает.
- ⚠️ `pi-table.component.ts:249` — `ngOnInit` (intentional seed, не bug). Задокументирован в TZ-104.4.2.
- ⚠️ `pages/contracts/contracts.page.ts:614` — большой, без spec. Изменения в ContractService → каскад через page без тестового покрытия.

---

## 9. ИНСТРУМЕНТЫ ДЛЯ БЫСТРОЙ РАЗРАБОТКИ

- ❌ **НЕТ** scaffolding tools для новой entity-page (`ng generate entity-page` отсутствует)
- ❌ **НЕТ** Angular Schematics в `angular.json` (поле `"schematics": {}`)
- ❌ **НЕТ** checklist "добавление новой сущности за 7 шагов" — есть только §10 pre-commit checklist и §3 (CRUD list-page) + §4 (form-dialog) **копипастные шаблоны**
- ✓ Setup-jest готов (jest-preset-angular-14 поддерживает standalone + signals + httpResource — задокументировано в `jest.config.js`)
- ✓ ESLint + Prettier стабильные

---

## 10. 3-5 КОНКРЕТНЫХ УЛУЧШЕНИЙ

### 10.1 **Mutation-обёртка / `useMutation<T,P>` signal-based factory** (HIGH impact, MED effort)

**Проблема:** 197 `.subscribe((res) => …)` в pages, паттерн повторяется в каждом CRUD handler: success → toast + reload, error → toast + extractErrorMessage. Один `if/else` блок × 13 pages × 3-4 мутации = ~50 повторов.

**Решение:** Создать `frontend/src/app/shared/util/mutation.ts`:
```ts
export interface Mutation<T, P> {
  isLoading: Signal<boolean>;
  error: Signal<string | null>;
  lastResult: Signal<T | null>;
  mutate: (params: P) => Promise<T>;
  reset: () => void;
}

export function createMutation<T, P>(
  fetcher: (params: P) => Observable<SilentResult<T>>,
  opts?: { onSuccess?: (data: T) => void; onError?: (msg: string) => void; successMessage?: string }
): Mutation<T, P>;
```

Это **первый** кирпич для будущего `defineEntity<T,P>` factory из TZ-232 — но может быть введён **сейчас**, без полного DSL, и сразу заменит ~30% of `.subscribe` boilerplate в page.handlers.

### 10.2 **ESLint safety-guards** (HIGH impact, LOW effort)

`frontend/eslint.config.js` сейчас позволяет пройти любому `@typescript-eslint/no-explicit-any: warn`, raw `this.http.*`, `.subscribe(`. Добавить:

```js
rules: {
  // Block raw HTTP outside services
  'no-restricted-imports': ['error', {
    paths: [{ name: '@angular/common/http', message: 'Use silent-http in services.' }],
    patterns: ['*.component.ts', '*.page.ts'],
  }],
  // AST: block .subscribe( in pages
  '@typescript-eslint/no-restricted-syntax': ['error', {
    selector: "CallExpression[callee.property.name='subscribe']",
    message: 'Use createMutation() or firstValueFrom(). Subscribe leaks.',
  }],
  // Tighten: any → error (not warn)
  '@typescript-eslint/no-explicit-any': 'error',
}
```

Это превращает DEVELOPMENT-PATTERNS.md §10 чек-лист из «не забыть проверить вручную» в enforced constraint.

### 10.3 **Typed endpoint registry** (MED impact, LOW effort)

Сейчас URL'ы — строки `${baseUrl}/${entity}` разбросаны по сервисам. Создать `core/api.routes.ts`:
```ts
export const API = {
  materials: {
    list:   () => '/api/materials',
    byId:   (id: string) => `/api/materials/${id}`,
    bulk:   () => '/api/materials/bulk',
  },
  // … 19 entities
} as const;
```

Плюсы: переименование backend endpoint'а = single-file edit; type-safe path-builder; легко сгенерировать из OpenAPI schema (есть в backend).

### 10.4 **Decomposition god-компонента builder** (HIGH impact, HIGH effort)

Top-4 god-файла = 5,628 LOC. **План (готов в TZ-232 §3):**
- `builder.page.ts → BuilderShellComponent` (~400 LOC, только оркестрация)
- `builder-canvas.component.ts → BuilderCanvasComponent` (~350 LOC)
- `builder-inspector.component.ts → BuilderInspectorHostComponent` (~400 LOC)
- `block-renderer.component.ts → BlockRendererHostComponent` (~500 LOC) + 8 блок-рендереров по ~150 LOC
- `template-setup-dialog → TemplateSetupContract`
- Извлечь `BuilderStateService` (signals + auto-save pipeline) и `BuilderSavePipeline` (Subject + groupBy + debounce + switchMap)

Каждая волна — маленькая, полностью протестированная, после неё проходит ручной QA. Шаблон AC уже есть в TZ-232 §5.

### 10.5 **Migration to `<app-pi-table [cellTemplates]="autoCollect">`** (MED impact, MED effort)

`work-types.page.ts:212-228` демонстрирует boilerplate:
```ts
@ViewChild('rowActionsTpl', { static: true }) private readonly rowActionsTplRef!: TemplateRef<…>;
@ViewChild('isActiveTpl', { static: true }) private readonly isActiveTplRef!: TemplateRef<…>;
protected cellTemplates: Record<string, TemplateRef<…>> = {};
protected rowActionsTplBinding: TemplateRef<…> | null = null;
ngOnInit(): void {
  this.cellTemplates = { isActive: this.isActiveTplRef };
  this.rowActionsTplBinding = this.rowActionsTplRef;
}
```

Этот шаблон повторяется в 7 list-pages → можем сделать `<app-pi-table>` собирающим любые `<ng-template #cellTpl="...">` из `ContentChildren` auto-magically. Устранит 7 instances × ~25 LOC + убирает использование OnInit только ради bootstrap'a.

---

## ИТОГО

**Здоровье проекта:** 7/10. Strict TypeScript + Signals + good util primitives + httpResource + очень детальный DEVELOPMENT-PATTERNS.md + jest infra на месте.

**Главные слепые зоны:**
1. ❌ **Mutation pattern** не вынесен в util (~197 `.subscribe` хитов)
2. ❌ **ESLint safety** минимален (только prefer-standalone + no-explicit-any-warn)
3. ❌ **No-typed endpoints** (строка повсюду)
4. ❌ **No-schematics** для scaffolding нового entity
5. 🚨 **4 god-файла** 5257 LOC в `pages/doc-constructor/builder/*+ tables/table-template-dialog`

**Уже сделано хорошо** (на чём можно строить дальше):
- ✓ `<app-pi-table>` — central primitive готов к расширению (cellTemplates autoCollect, useMutation hook)
- ✓ `createSearchState` / `createClientSearchState` / `createLookupTable` / `createSortState` — паттерны state-фабрик уже в коде
- ✓ `silent-http` — централизованный HTTP-слой
- ✓ Jest preset + 49 спецификационных файлов — testing infra готова
- ✓ 100% standalone, OnPush, signals — современная база

Это всё — зрелая основа, на которой **defineEntity / DSL** из TZ-232 может строиться инкрементально, не как «big bang rewrite», а как серия маленьких миграций поверх существующих primitives.

---

## Связанные документы

- [`tasks/TZ-232.md`](../../tasks/TZ-232.md) — Angular Assembly DSL Master Plan (принят PO, READY_FOR_PO_APPROVAL). Прямое следствие этого аудита.
- [`docs/DEVELOPMENT-PATTERNS.md`](../../docs/DEVELOPMENT-PATTERNS.md) — канонические паттерны проекта.
- [`STACK.md`](../../STACK.md) — стек-решения.
- [`audit/README.md`](../../audit/README.md) — индекс других аудитов.
