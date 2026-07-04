# STATUS — KPPDF ERP Project Status

**Last updated:** 2026-07-05
**Phase:** Dev Tooling (TZ-41) — ЗАВЕРШЕНО
**Total tasks:** 41/41 ✅ (100% — TZ-02..TZ-41)

## ✅ Завершённые этапы

### Backend (TZ-01..TZ-18)
- TZ-01..TZ-08: Auth + Users + Roles + Permissions + Reference data
- TZ-09..TZ-13: Catalog (Products, Materials, BOM) + Storage
- TZ-14..TZ-15: Document Templates + Finance (Reconciliation, Reports)
- TZ-16: Integrations (CSV Import, Comments)
- TZ-17: E2E tests (7 suites)
- TZ-18: Production Hardening (Rate Limit, Helmet, CORS, Health)

**Build:** pnpm run build ✅ (280+ файлов, 65 entities)

### Frontend (TZ-19..TZ-29)
- TZ-19: Frontend Foundation (Angular 20 + Tailwind + AG Grid)
- TZ-20: Auth + Layout (sidebar/topbar/main) + 65 generic pages
- TZ-29: Dashboard (4 KPI cards) + Task Panel (8 phase groups)

### Frontend Phase 2 (TZ-30..TZ-40)
- TZ-30: CRUD actions + per-page FormSchema (FormDialog, RowActions, 5 страниц с fields[])
- TZ-31..TZ-40: UI Kit — foundation (cn/cva/theme/scroll-spy/button) + 10 секций showcase на /p/showcase (core primitives, advanced inputs, charts, calendar/otp/kbd, overlays, layout primitives)

**Build:** pnpm run build ✅ (542.84 kB initial bundle, 0 warnings)

### Dev Tooling (TZ-41)
- TZ-41: Health Check Panel + Log TUI Mode — `start.mjs` стал TUI-aware orchestrator с `--tail` режимом (in-place статус 3 сервисов, ring buffer 5 строк на сервис, финальная "Ready" панель с латентностями /api/health). checkHealth() парсит JSON body и определяет `degraded` состояние.

**Smoke test:** `node start.mjs` — preflight ✅, Mongo RS ready ✅, backend boot ✅, /api/health OK.

## 📊 Метрики проекта

| Слой | Метрика | Значение |
|------|---------|----------|
| Backend | Entities | 65 |
| Backend | Modules | 18 |
| Backend | Files | ~280 |
| Backend | Build time | ~10s |
| Frontend | Pages (router) | 4 (login, dashboard, task-panel, dynamic /p/:id) |
| Frontend | Tables rendered | 65 (через единый PageRenderer) |
| Frontend | Categories | 8 (sidebar groups) |
| Frontend | Bundle size | 542.84 kB initial / ~155 kB transfer |
| Frontend | Build time | ~2s |

## 🎯 Стек

### Backend
- NestJS 10 + Mongoose 8 + MongoDB
- JWT auth + RBAC (Roles, Permissions)
- Class-validator + Swagger
- Helmet + CORS + Throttler
- Jest + Supertest (E2E)

### Frontend
- Angular 20.3 (standalone, signals, new control flow)
- TailwindCSS 3.4 (shadcn-style design system)
- AG Grid 32 (data tables)
- @angular/cdk/dialog (modals)
- ngx-translate 17 (i18n ready)
- date-fns 4, zod 3

## 📁 Структура

```
kppdf-8.0/
├── backend/              # NestJS API (TZ-01..TZ-18)
│   ├── src/
│   │   ├── main.ts       # Bootstrap + Helmet + CORS + Throttler
│   │   ├── app.module.ts # Root module
│   │   ├── common/       # Guards, filters, decorators
│   │   └── modules/      # 18 feature modules
│   └── test/             # E2E test suites
├── frontend/             # Angular 20 SPA (TZ-19..TZ-29)
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/     # Auth, interceptors, services, guards
│   │   │   ├── shared/   # Skeleton, EmptyState, Badge, Card, CrudPage, FormDialog
│   │   │   ├── layout/   # Sidebar, Topbar, MainLayout
│   │   │   ├── configs/  # pages.config.ts (65 tables registry)
│   │   │   └── pages/    # auth/login, dashboard, task-panel, page-renderer
│   │   ├── styles.css    # shadcn tokens + Tailwind layers
│   │   └── index.html
│   └── tailwind.config.js
├── OrchestratorKit/      # Task orchestration (kit-init, make-tz, etc)
├── tasks/                # TZ-*.md specifications
│   └── _archive/         # Completed TZ files
├── progress.md           # Chronological progress log
└── STATUS.md             # This file
```

## 🚀 Следующие шаги (предложения)

Все этапы до TZ-41 завершены. Возможные направления:

1. **TZ-42: Production deployment mode** — `--prod` флаг в start.mjs (`pnpm build` + `node dist/main.js` вместо `pnpm start:dev`)
2. **TZ-43: Health-check Dashboard** — frontend страница с live статусами всех сервисов (используя TZ-41 ring buffer pattern)
3. **TZ-44: E2E tests run** — реальный прогон test/setup/* + test/e2e/*.e2e-spec.ts (тесты созданы в TZ-17, не запускались)
4. **TZ-45: Backend DI audit** — найти и починить оставшиеся DI cascade баги (5+ было в TZ-19..TZ-17) — `grep` модулей с инжектами сервисов без импорта модуля
5. **TZ-46: Pre-existing verify-status fix** — синхронизировать конвенции: kit ожидает `OrchestratorKit/_archive/YYYY-MM/TZ-NN.done.txt`, проект использует `tasks/_archive/TZ-NN.md.done`. Нужно выбрать одну конвенцию и мигрировать.

