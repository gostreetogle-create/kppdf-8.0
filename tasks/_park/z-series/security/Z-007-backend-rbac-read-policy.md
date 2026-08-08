═══════════════════════════════════════════════════════════════
Z-007: RBAC на чтение — единая политика видимости list/get endpoints
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Backend Engineer (Security / RBAC consistency)

ЗАВИСИМОСТИ: нет. Серия: `tasks/_backlog/z-series/README.md` § Z-007. Низший приоритет
в серии — formalize то, что сегодня «работает, но непредсказуемо».

LAYER: backend (security / cross-module policy)

CONFLICT KEYS:
backend/src/modules/order/order.controller.ts;backend/src/modules/contract/contract.controller.ts;backend/src/modules/purchase-order/purchase-order.controller.ts;backend/src/modules/work-order/work-order.controller.ts;backend/src/modules/production-order/production-order.controller.ts;backend/src/modules/stock-movement/stock-movement.controller.ts;backend/src/modules/registry/registry.controller.ts;backend/src/modules/actual-cost/cost-comparison.controller.ts;backend/src/common/guards/permissions.guard.ts;backend/src/common/decorators/permissions.decorator.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ (верифицировано по коду 2026-08-02)
═══════════════════════════════════════════════════════════════

1. RBAC на MUTATIONS — единый и сильный: `@Roles` стоит на всех
   create/update/delete. Global `RolesGuard` зарегистрирован в
   `app.module.ts`. Это чисто.

2. RBAC на READ — неформализован, «кто во что горазд»:
   - GATE reads через `@Roles('admin','manager')`: product.controller:26,
     counterparty.controller:26, audit.controller:10.
   - НЕ GATE reads (только JwtAuthGuard): order.controller:36 findAll,
     contract.controller:37, purchase-order.controller:22, work-order:20,
     production-order:42, stock-movement:27.
   - Контроллеры без `@Roles` ВООБЩЕ ни на одном методе:
     `actual-cost/cost-comparison.controller.ts:8`,
     `registry/registry.controller.ts:25`.

   Итого: для одной и той же по-сути операции (list сущности) действует
   две разные политики. Невозможно ответить на вопрос «может ли менеджер
   видеть заказы?» без вычитывания каждого контроллера.

3. `@Permissions` capability-matrix декоратор (canonical-key asserted,
   permissions.decorator.ts:70) используется только 3 контроллерами
   (admin/*). `PermissionsGuard` зарегистрирован глобально, но БЕЗ
   `@Permissions`-метаданных на эндпоинте он молча пропускает — то есть
   вся capability-matrix для 73 модулей инертна. Это либо «будущая фича»,
   либо мёртвая инфраструктура (перекликается с Z-005 по паттерну).

═══════════════════════════════════════════════════════════════
ПОЧЕМУ ЭТО ВАЖНО ДЛЯ ПЛАТФОРМЫ
═══════════════════════════════════════════════════════════════

ERP-видимость — security-domain. Сегодня нет единого контракта «кто
что читает». По мере добавления модулей и ролей (планируется рост)
это превратится в набор ad-hoc решений, которые невозможно audit-ить.
Даже если все заказы «внутри компании и всем видны» — это должно быть
ЯВНОЕ решение (policy), а не отсутствие декоратора.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Зафиксировать read-policy на уровне проекта (PO + architect):
   решение для КАЖДОЙ сущности — одна из:
   (a) PUBLIC-read   — любой authenticated user (explicit `@Public` N/A;
       это просто JwtAuthGuard-only, но ЯВНО задокументированное).
   (b) ROLE-read     — `@Roles('admin','manager', ...)` (текущий паттерн
       у product/counterparty/audit).
   (c) PERMISSION-read — `@Permissions('order:read')` capability-key
       (расширенный path, если matrix внедряется).
   Рекомендация архитектора: начать с (b) как min-bar — каждый read
   endpoint ЯВНО несёт `@Roles(...)`. Capability-matrix (c) — отдельная
   инициатива, не в этом TZ.

ШАГ 2 — Провести RBAC-audit таблицей: для каждого модуля зафиксировать
   policy + RACI (какие роли читают/пишут). Сохранить как
   `docs/RBAC-CONTRACT.md` (похоже, частично есть — проверить и дополнить
   секцией read-policy).

ШАГ 3 — Применить выбранную policy ко ВСЕМ read endpoints:
   - order/contract/purchase-order/work-order/production-order/
     stock-movement findAll+findOne → добавить `@Roles(...)`.
   - cost-comparison.controller, registry.controller → покрыть `@Roles`
     на всех методах (сегодня их нет вообще).

ШАГ 4 — Запретить «голый» JwtAuthGuard-only read в lint/CI:
   - eslint-правило (backend): controller method `@Get` БЕЗ `@Roles` или
     `@Public` → warning/error. Аналогично для `@Permissions`.
   - Если правило слишком тяжёлое — добавить grep-check в CI как
     interim (как уже сделано для deletedAt в Z-003).

ШАГ 5 — Тесты:
   - spec: пользователь БЕЗ роли → GET /order получает 403.
   - spec: пользователь с role → 200.
   - regression: существующие e2e не сломаны (если они работают под
     admin-токеном — пройдут; если под user-токеном — упадут, это
     выявит latent issues).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Каждый `@Get` (list/get) в modules/ несёт ЯВНЫЙ `@Roles` (или `@Public`,
   если осознанно) — 0 «голых» read endpoints.
2. `docs/RBAC-CONTRACT.md` содержит таблицу read-policy по всем модулям.
3. eslint/CI-gate предотвращает появление нового голого read endpoint.
4. cost-comparison, registry покрыты RBAC (сегодня — нет).
5. Backend typecheck + Jest PASS; добавлены 403-spec на read.
6. e2e regression: если latent-баги всплыли (user-токен видел заказы) —
   зафиксировать в progress.md как исправленные security-issue.

ОГРАНИЧЕНИЯ: НЕ вводить capability-matrix (`@Permissions` на все 73
модуля) — это отдельная большая инициатива (candidate на Z-008). Здесь
только formalize role-based read-policy. НЕ ломать admin-access.
НЕ менять auth-mechanism (JWT остаётся). e2e — опциональны, unit-403
обязателен.
