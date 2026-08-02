═══════════════════════════════════════════════════════════════
TZ-RBAC-302: Dual-guard + page-ACL policy (foundation)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/audits/2026-08-02-rbac-capability-gap-audit.md Findings 3–4

РОЛЬ АГЕНТА: Backend / Security Architect (docs + thin constants only)
ЗАВИСИМОСТИ: none (foundation). Precedes ACCESS-303 wiring; aligns ACCESS-301.
LAYER: 4

CONFLICT KEYS:
docs/RBAC-CONTRACT.md;
docs/product-vision-lite.md;
docs/audits/2026-08-02-rbac-capability-gap-audit.md;
backend/src/common/contracts/rbac-contract.ts (только если добавляется
  PAGE_KEYS export — иначе docs-only);
docs/agent-checklists/TZ-RBAC-302.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `PermissionsGuard` УЖЕ есть и зарегистрирован как APP_GUARD параллельно
   `RolesGuard` (`app.module.ts:268–269`, `permissions.guard.ts`).
2. Без `@Permissions()` guard pass-through — capability matrix инертна
   вне admin/* (Z-007).
3. Vision: page-level ACL (галочки разделов), не кнопка×кнопка
   (`product-vision-lite.md`).
4. Риск: исполнители начнут вешать `@Permissions` на 73 модуля против
   vision page-ACL.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Зафиксировать в `RBAC-CONTRACT.md` секцию **Page ACL vs
  Permissions**:
  - Phase 1 (цех ~10 чел): **page keys** = источник правды для UI nav +
    route CanMatch (ACCESS-301/302/303).
  - `@Roles` остаётся min-bar на mutations (и на reads per Z-007).
  - `@Permissions` — обязателен на **admin/** и self-service границах
    (`user:admin` vs `user:read`); НЕ требуется на каждый catalog CRUD
    в Phase 1.
ШАГ 2 — Явно сослаться: Finding 3 audit = partially closed (guard exists).
ШАГ 3 — Не писать production UI; не массово добавлять `@Permissions`.
ШАГ 4 — Executor report.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. RBAC-CONTRACT содержит секцию Page ACL vs Permissions с Phase-1 rule.
2. Audit Finding 3 marked partial-close в docs (ссылка).
3. Нет массового `@Permissions` diff по 73 модулям.
4. Executor report.

known_limitation: Full read-policy sweep = Z-007, не этот TZ.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
