═══════════════════════════════════════════════════════════════
TZ-ACCESS-303: App routes → pageKey + capability/page CanMatch
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/audits/2026-08-02-rbac-capability-gap-audit.md Finding 1
MAP: docs/product-vision-lite.md «route→capability» table

РОЛЬ АГЕНТА: Frontend routes + thin guard glue
ЗАВИСИМОСТИ: TZ-ACCESS-301 (PAGE_KEYS + /auth/me pages[]); TZ-RBAC-302
LAYER: 3

CONFLICT KEYS:
frontend/src/app/app.routes.ts;
frontend/src/app/core/capabilities/capability-route.guard.ts
  (или page-route.guard successor);
docs/product-vision-lite.md;
docs/agent-checklists/TZ-ACCESS-303.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Peer count 2026-08-02: **22** AppLayout leaf pages без capability/page
gate; только `admin/users` + `admin/roles` используют
`capabilityRouteGuard` (`app.routes.ts:271–283`). Deep-link на
`/materials` и т.д. доступен любому authenticated user.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Для каждого row таблицы route→page в product-vision-lite
  добавить `data: { pageKey: '…' }` (или `capabilities: ['page:…']`
  — выбрать ОДИН shape per RBAC-302 / ACCESS-301).
ШАГ 2 — CanMatch: нет page в effective pages → `/forbidden`
  (reuse capabilityRouteGuard или thin pageGuard).
ШАГ 3 — Исключения: `login`, `forbidden`, `/kit/*`, redirects.
ШАГ 4 — Jest/smoke: worker без `materials` → /forbidden.
ШАГ 5 — Executor report.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Все 22 formerly-ungated leafs имеют pageKey + guard (кроме явных
   exceptions в known_limitation).
2. Admin routes сохраняют user:admin / role:read.
3. Таблица vision ↔ routes синхронна.
4. Executor report.

known_limitation: Не invent fine button ACL. People/KP routes — когда
появятся в app.routes, добавить в ту же таблицу successor-строкой.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
