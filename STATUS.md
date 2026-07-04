# STATUS — KPPDF ERP Project Status

**Last updated:** 2026-07-04
**Phase:** Frontend MVP (TZ-19..TZ-29) — ЗАВЕРШЕНО
**Total tasks:** 29/29 ✅ (100%)

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

**Build:** pnpm run build ✅ (542.84 kB initial bundle, 0 warnings)

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

1. **TZ-30: Phase 1 categories drill-down** — добавить per-category custom UI для Основа (НСИ), Закупок, Продаж
2. **TZ-31: FormSchema JSON** — каждая таблица получает свой config с типами полей; CrudPage рендерит формы автоматически
3. **TZ-32: Bulk import UI** — для ImportJobs сделать UI с file upload + progress
4. **TZ-33: Document Template Builder** — drag-drop конструктор шаблонов
5. **TZ-34: Mobile-responsive layout** — sidebar drawer на маленьких экранах
6. **TZ-35: Real-time updates** — WebSocket для task panel (когда счётчики меняются)
7. **TZ-36: Dark mode persistence** — сохранять в localStorage
8. **TZ-37: Role-based page visibility** — реализовать roleGuard в app.routes
9. **TZ-38: E2E frontend tests** — Playwright для критичных flows
10. **TZ-39: Production deploy** — Docker + nginx + CI/CD

