═══════════════════════════════════════════════════════════════
TZ-RBAC-303: @Permissions adoption lite (admin + boundaries only)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/audits/2026-08-02-rbac-capability-gap-audit.md Finding 3 (corrected)

РОЛЬ АГЕНТА: Backend security lite
ЗАВИСИМОСТИ: TZ-RBAC-302; Z-007 остаётся full read-policy sweep
LAYER: 4

CONFLICT KEYS:
backend/src/modules/admin/;
backend/src/modules/auth/auth.controller.ts (только если нужен
  @Permissions на me — обычно Jwt only);
docs/RBAC-CONTRACT.md;
docs/agent-checklists/TZ-RBAC-303.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

PermissionsGuard уже global. `@Permissions` почти только на admin/*.
Phase-1 policy (RBAC-302): не размазывать capability на весь каталог.
Нужен **lite** pass: убедиться что admin + user:read/user:admin
границы консистентны; catalog CRUD остаётся на `@Roles` (+ page ACL UI).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Audit admin controllers: каждый endpoint имеет явный
  `@Permissions` + `@Roles` per TZ-257 comments.
ШАГ 2 — Подтвердить LIST users = `user:admin`, self/get-by-id profile
  paths = `user:read` (уже в users-admin) — тест/e2e smoke.
ШАГ 3 — НЕ добавлять `@Permissions('material:read')` и т.п. на shop
  modules в этом TZ (это Z-007 / future).
ШАГ 4 — Executor report.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Admin surface: нет endpoint без `@Permissions` там, где контракт
   требует capability.
2. Документированная граница user:admin vs user:read соблюдена тестом.
3. Diff не трогает ≥N catalog modules (N=0 предпочтительно).
4. Executor report.

known_limitation: Full read `@Roles`/`@Permissions` matrix = Z-007.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
