═══════════════════════════════════════════════════════════════
TZ-RBAC-304: user:read + /auth/me contract (self-service)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/audits/2026-08-02-rbac-capability-gap-audit.md Finding 5

РОЛЬ АГЕНТА: Backend contract + auth projection
ЗАВИСИМОСТИ: TZ-ACCESS-301 (pages[] seed/API); TZ-RBAC-302
LAYER: 4

CONFLICT KEYS:
docs/RBAC-CONTRACT.md;
backend/src/modules/auth/auth.service.ts;
backend/src/modules/auth/auth.controller.ts;
(optional) AuthUserPayload DTO types;
docs/agent-checklists/TZ-RBAC-304.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. `GET /auth/me` существует (`auth.controller.ts:97`) и отдаёт
   permissions, но **не** `pages[]` (`toAuthUser` L264–278).
2. В `_backlog/` нет отдельного TZ на `/me` (ACCESS-301 упоминает
   pages на /auth/me, но контракт `user:read` в RBAC-CONTRACT не
   расписан).
3. Код уже резервирует `user:read` для self-service
   (`app.routes.ts:274–275`, users-admin comments) — docs отстают.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — RBAC-CONTRACT: секция `user:read` =
  self-service (`/auth/me`, optional self profile GET);
  `user:admin` = enumerate/mutate users.
ШАГ 2 — Расширить `/auth/me` payload: `pages: string[]` (effective
  page ACL из ACCESS-301). Не тащить passwordHash (уже stripped).
ШАГ 3 — Frontend CapabilitiesService / page filter читает pages
  (координация с ACCESS-302/304).
ШАГ 4 — Executor report.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. RBAC-CONTRACT документирует user:read vs user:admin.
2. GET /auth/me возвращает pages[] (пустой массив допустим до seed).
3. Jest/supertest: me shape; no secrets.
4. Executor report.

known_limitation: Director checkbox UI = ACCESS-302. Не строить
отдельный /users/me CRUD в этом TZ.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
