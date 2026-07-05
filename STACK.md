# Stack — kppdf-8.0

> Источник: `frontend/package.json`, `backend/package.json`, `docker-compose.yml`.
> Дата актуализации: 2026-07-04.

## Summary

**Angular 20 + Material MD3** (frontend) + **NestJS 10 + Mongoose 8** (backend) + **MongoDB Replica Set** (storage) + Docker Compose (infra).

Фронтенд держится на `@angular/material` 20 (Material Design 3 compliance из коробки) + трёх кастомных обёртках в `frontend/src/app/shared/ui-kit/`, которые закрывают повторяющиеся паттерны (page-header, empty-state, status-badge). Глобальный compact-mode через `mat.all-component-densities(-3)` — table rows ≈36px, inputs/chips/paginator ≈36px без per-page правок.

> Stack нарочно **минималистичный**: только Angular Material (MD3) + тонкие собственные обёртки. Никаких CSS-фреймворков поверх (не используется utility-CSS), никаких альтернативных UI-китов. Material 20 даёт MD3 tokens (`--mat-sys-*`) + density mixins + accessibility из коробки; собственный ui-kit покрывает 3 повторяющихся паттерна (page-header / empty-state / status-badge), для которых в Material нет готового «швейцара».

---

## 1. Frontend (`frontend/`)

| | |
|--|--|
| **Framework** | Angular 20.3 (standalone components, Signals, OnPush) |
| **UI library** | `@angular/material@20.2` — Material Design 3 (MD3) |
| **CDK** | `@angular/cdk@20.2` (overlays, focus trap, virtual scroll — никаких UI overrides) |
| **Styling** | SCSS + CSS custom properties (`--mat-sys-*` токены), **density -3** глобально |
| **Forms / Validation** | Reactive Forms + **`zod@3.23`** для декларативных схем в dialog'ах |
| **State** | Angular Signals (нет NgRx / RxJS-store) |
| **HTTP** | `HttpClient` (in services, через `inject()`) |
| **TypeScript** | 5.9 strict + `noPropertyAccessFromIndexSignature: true` |
| **Tests** | — (фронт-юнит-тестов пока нет; e2e ниже) |
| **Package manager** | pnpm |

### Структура

```
src/
  app/
    core/                 ← services (auth, api, etc.), guards, signals
    features/             ← pages by domain (materials/, units/, currencies/, …)
    shared/
      ui-kit/             ← 3 кастомные MD3 обёртки (см. UI patterns)
      components/         ← переиспользуемые доменные компоненты
    layouts/              ← shell-компоненты
  styles.scss             ← MD3 theme() + all-component-densities(-3)
```

### Скрипты

```bash
pnpm start       # ng serve (dev)
pnpm build       # ng build (prod)
pnpm typecheck   # tsc --noEmit (strict)
```

### Архитектурные решения

| Решение | Дата | Обоснование |
|--|--|--|
| **Standalone components** | TZ-19 | Без NgModule boilerplate; tree-shakable imports |
| **Signals everywhere** | TZ-19 | Локальный state (loading/total/form) без RxJS-store |
| **OnPush по умолчанию** | TZ-19 | ChangeDetection.OnPush на каждом компоненте |
| **`zod` в dialog'ах** | TZ-19 | Декларативная валидация в форме, лучше читается чем class-validator в шаблонах |
| **Material MD3 (а не собственный kit)** | 2026-07-04 rework | `@angular/material@20` уже реализует Material You; tokens + a11y + density mixins — бесплатно |
| **`mat.all-component-densities(-3)` глобально** | 2026-07-04 rework | Table rows ≈36px, inputs/chips/paginator ≈36px — без per-page правок |
| **3 кастомные обёртки в `shared/ui-kit/`** | 2026-07-04 rework | `<app-ui-page-header>` / `<app-ui-empty-state>` / `<app-ui-badge>` — закрывают повторяющиеся паттерны, не конкурируют с Material, а тонко над ним |

---

## 2. Backend (`backend/`)

| | |
|--|--|
| **Framework** | NestJS 10.3 (Mongoose 10 adapter) |
| **Database** | MongoDB 7+ (**Replica Set `rs0`** обязателен — нужен `session.withTransaction`) |
| **Auth** | JWT (access 15m + refresh 7d, refreshTokenVersion bump), bcryptjs (10 rounds), `@nestjs/throttler` rate limit |
| **Validation** | `class-validator` + `class-transformer` в DTO, `joi` для env validation |
| **Logging** | `nestjs-pino` (структурный JSON) + `pino-http` request middleware |
| **Security** | `helmet` + `cors` + `compression` |
| **API docs** | `@nestjs/swagger` (OpenAPI 3) |
| **TypeScript** | 5.4 strict |
| **Tests** | Jest (unit + e2e через `test/jest-e2e.json`) |
| **Package manager** | pnpm |

### Архитектурные решения

| Решение | Дата |
|--|--|
| **Replica Set обязателен** | TZ-03 | Counter / Inventory / Shipment используют `session.withTransaction`; standalone MongoDB не подходит |
| **AsyncLocalStorage → Mongoose `$locals.userId`** | TZ-04 → ТЗ-03 | AuditPlugin читает контекст без явной передачи по сервисам |
| **`@AuditAction()` глобальный interceptor** | TZ-05 | Все POST/PATCH/DELETE автоматически логируются с `userId` из AsyncLocalStorage |
| **Production-safe soft-delete через плагин** | TZ-03 | Не отключать в prod; unique-index + `deletedAt: null` надо учитывать при конфликтах |

---

## 3. Infrastructure

### Docker services

| Service | Image / Source | Port | Notes |
|--|--|--|--|
| MongoDB | `mongo:7` (Replica Set `rs0`) | 27017 | Обязателен — кэунтеры/транзакции |
| Backend | Dockerfile (Node 20 + pnpm 9) | 3000 | со всеми TZ domain modules |
| Frontend | dev: `ng serve` (5500) · prod: nginx | — | сейчас dev mode |

**Compose file:** `docker-compose.yml`

---

## 4. Cross-cutting

- **Runtime:** Node.js ≥ 20 (engines в backend package.json)
- **Package manager:** pnpm 9.x (monorepo-style lock)
- **TypeScript:** strict, `noPropertyAccessFromIndexSignature: true` (frontend)
- **Lint / Format:** ESLint + Prettier (backend — `pnpm lint`, frontend — prettier через editorconfig)
- **Backend i18n:** все enum и тексты API — на русском; frontend локализация — через `MatPaginatorIntl` override

---

## 5. Module Map (UI-patterns-friendly)

Все list-page паттерны (page-header + filter + mat-table + paginator + actions) стараются следовать одному шаблону. См. `frontend/src/app/features/{materials,units,currencies}/` как канонику.

| Module / Page | Path | Backend TZ | Статус |
|--|--|--|--|
| `/materials` | `features/materials/` | TZ-07 | ✅ migrated → ui-kit |
| `/units` | `features/units/` | ref (Unit/Currency entity TZ) | ✅ migrated → ui-kit (2026-07-04) |
| `/currencies` | `features/currencies/` | ref (Unit/Currency entity TZ) | ✅ migrated → ui-kit (2026-07-04) |
| `/categories`, `/products`, `/orders`, `/quotations`, … | `features/<name>/` | TZ-07..TZ-29 | ⏳ to migrate |

---

## 6. UI patterns

Кастомные обёртки в `frontend/src/app/shared/ui-kit/`. Три компонента — канонические UI-паттерны для всех будущих CRUD-страниц. Каждый standalone, OnPush, Signals-based, использует MD3 tokens.

### 6.1 `<app-ui-page-header>`

**Файл:** `frontend/src/app/shared/ui-kit/ui-page-header.component.ts`

**Назначение:** стандартизированный заголовок страницы (заменяет копипасту `<header class="page-header">` во всех list-pages).

**API:**

| Input / slot | Тип | Описание |
|--|--|--|
| `icon` (input) | `string?` | Material icon слева от title |
| `title` (input, required) | `string` | основной заголовок (h1) |
| `subtitle` (input) | `string?` | подзаголовок под h1 |
| `backLink` (input) | `string?` | если задан — показать кнопку «Назад» (routerLink) |
| `backLabel` (input) | `string?` | текст кнопки «Назад» (default `'Назад'`) |
| `<ng-content select="[actions]">` | slot | action buttons справа (Create, Export, etc.) |

**Acceptance criteria:**
- `grep '<header class="page-header">' src/app/features/` → **0 hits**
- Все list-pages / detail-pages импортируют `UiPageHeader` и используют `<app-ui-page-header>` в template'е
- CSS `.page-header` / `.page-title` нигде не дублируется (всё в одном компоненте)

### 6.2 `<app-ui-empty-state>`

**Файл:** `frontend/src/app/shared/ui-kit/ui-empty-state.component.ts`

**Назначение:** стандартизированный empty-state (для mat-table `*matNoDataRow`, для пустых filter-results, для «нет данных после seed»).

**API:**

| Input / slot | Тип | Описание |
|--|--|--|
| `icon` (input) | `string?` | Material icon (default `'inbox'`) |
| `title` (input, required) | `string` | основной текст |
| `description` (input) | `string?` | поясняющий текст под title |
| `<ng-content>` | default slot | опциональный CTA (кнопка создать/сбросить фильтр) |

**Acceptance criteria:**
- `grep '<tr class="mat-row" \*matNoDataRow' src/app/features/` → только hits с `app-ui-empty-state` внутри
- Никаких inline `<div class="empty-state">` / `.no-data` / `.empty-cell` в features

### 6.3 `<app-ui-badge>`

**Файл:** `frontend/src/app/shared/ui-kit/ui-badge.component.ts`

**Назначение:** status / isActive / isSystem indicator. Заменяет копипасту `<span class="chip">` + inline `<mat-icon matTooltip>` в list-pages.

**API:**

| Input / slot | Тип | Описание |
|--|--|--|
| `variant` (input) | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'muted'` | цвет через MD3 tokens |
| `size` (input) | `'sm' \| 'md'` | высота (24 / 28 px) |
| `dot` (input) | `boolean` | dot indicator слева |
| `icon` (input) | `string?` | Material icon слева |
| `<ng-content>` | default slot | текст badge |

**Acceptance criteria:**
- `grep '<span class="chip">' src/app/features/` → **0 hits**
- Никаких inline `<mat-chip color="primary">` / `[color]` привязок — все badges через `<app-ui-badge>`
- `matTooltip` работает на `<app-ui-badge>` (через `MatTooltipModule`, импортированный в consuming page)

### 6.5 `<app-ui-table-row-actions>` (P1, добавлено 2026-07-05 rework)

**Файл:** `frontend/src/app/shared/ui-kit/ui-table-row-actions.component.ts`

**Назначение:** обёртка для actions-колонки в `<mat-table>`. Action buttons are hidden by default (не занимают горизонтальное место постоянно), staggered-reveal на `:hover`/`:focus-within` строки. Persistent visibility через `[revealed]` input (для selected / editing rows).

**Архитектура:** CSS-only animation (NO JS animation loop). Использует `::ng-deep > button:nth-child(N)` selectors с `transition-delay: 0/30/60/90ms` для stagger.

**API:**

| Input / slot | Тип | Описание |
|--|--|--|
| `revealed` (input) | `boolean` (default `false`) | Persistent visibility (overrides hover behaviour) — для selected / editing rows |
| `staggerMs` (input) | `number` (default `30`) | per-button delay multiplier (ms) — bump для длинных action rows |
| `<ng-content>` | default slot | projected кнопки (mat-icon-button, mat-stroked-button, etc.) — DOM order определяет stagger |

**Acceptance criteria:**
- Action buttons не видны до hover/focus/revealed → таблица плотнее (не выделена fixed-width колонка icon-buttons).
- `:focus-within` keyboard nav: tab в button → reveal persistent (auto-revert on blur).
- Staggered reveal: первый button появляется мгновенно, последующие с delay 30/60/90ms (4 actions max в default stagger).
- Consuming page импортирует `UiTableRowActions` в `imports: []` рядом с `MatTableModule`.

**Refs:** использование в планируемых `warehouses / orders / tech-processes` list-pages (TZ-49+). Текущие `materials/units/currencies` обходятся inline `<button mat-icon-button>` без обёртки (для них stagger не критичен).

### 6.4 Глобальные density & валидация

`frontend/src/styles.scss` имеет **`@include mat.all-component-densities(-3);`** сразу после `mat.theme()`. Эффект мгновенный на все компоненты:

| Компонент | При density -3 |
|--|--|
| `mat-table` row height | ≈36 px (вместо дефолтных 52) |
| `mat-form-field` | input ≈36 px, label 12 px |
| `mat-paginator` | строка ≈40 px |
| `mat-chip` / `mat-icon-button` | ≈32 px |

Per-component opt-out (если где-то density -3 слишком жмёт) — через component-scoped mixin:
```scss
// в styles конкретной страницы:
@include mat.table-density(0);        // вернуть table rows к дефолту
@include mat.form-field-density(0);  // вернуть inputs
```

---

## 7. Quickstart

```bash
# 1. Инфраструктура (MongoDB Replica Set)
docker compose up -d mongo

# 2. Backend
cd backend && pnpm install && pnpm start:dev
# → http://localhost:3000/api

# 3. Frontend
cd frontend && pnpm install && pnpm start
# → http://localhost:4200
```

Default admin user создаётся при первом запуске backend (см. `backend/src/common/seed/admin.seed.ts`).

---

## 8. Архитектурные решения (high-level)

| Решение | TZ | Статус |
|--|--|--|
| Mongoose Replica Set → atomic counters / transactions | TZ-03 | ✅ |
| AsyncLocalStorage → user context для audit | TZ-04 | ✅ |
| Audit-action interceptor глобально | TZ-05 | ✅ |
| Soft-delete plugin (auto-filter `deletedAt:null`) | TZ-03 | ✅ (⚠️ unique-collision caveat с soft-deleted записями — решается через partialFilterExpression) |
| **Material MD3 + density -3 + 3 ui-kit обёртки** | 2026-07-04 rework | ✅ (эта rework-сессия) |
| Production-ready docker-compose | TZ-02 | ✅ |

---

## 9. Что это НЕ

- **НЕ** task tracker → `OrchestratorKit/STATUS.md`
- **НЕ** changelog / release notes → git log + tags
- **НЕ** API documentation → OpenAPI из `@nestjs/swagger` (Swagger UI на `/api/docs` в dev)
- **НЕ** dependency manifest → `frontend/package.json`, `backend/package.json`
- **НЕ** deployment manifest → `docker-compose.yml`
- **НЕ** design doc → `ARCHITECTURE.md` + `docs/data-model.md`

---

_Этот файл написан вручную (не из kit-stack.sh). Если хочешь пере-генерации из auto-template — `bash OrchestratorKit/kit-stack.sh --force` ⚠️ (но пере-генерация затрёт ручные правки в секции UI patterns)._
