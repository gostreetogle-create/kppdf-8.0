═══════════════════════════════════════════════════════════════
TZ-ACCESS-304: Nav — pageKey filter на ВСЕ разделы (не только admin)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/audits/2026-08-02-rbac-capability-gap-audit.md Finding 2

РОЛЬ АГЕНТА: Frontend layout
ЗАВИСИМОСТИ: TZ-ACCESS-301; TZ-ACCESS-302 (director grants UI); TZ-ACCESS-303
LAYER: 3

CONFLICT KEYS:
frontend/src/app/layout/app-layout.component.ts;
frontend/src/app/core/capabilities/;
docs/agent-checklists/TZ-ACCESS-304.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Сейчас `capabilities` на nav только у admin items
(`app-layout.component.ts` ≈ user:admin / role:read). Остальные пункты
меню видит любой залогиненный пользователь — расходится с vision
«директор галочками выдаёт разделы».

ACCESS-302 описывает filter; этот TZ — **completion AC**: каждый
nav item имеет pageKey и скрывается без grant.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Проставить pageKey/capabilities на все nav entries (1:1 с
  таблицей vision / ACCESS-301 PAGE_KEYS).
ШАГ 2 — `computed` filter: item виден iff page ∈ effective pages
  из /auth/me (после 301).
ШАГ 3 — Regression: admin items по-прежнему требуют user:admin /
  role:read (или page:admin-users).
ШАГ 4 — Executor report.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Нет «голых» nav items без pageKey (кроме явного public/kit).
2. Worker без page не видит пункт и не проходит deep-link (303).
3. Executor report.

known_limitation: Если ACCESS-302 уже закрыл 100% nav — этот TZ
становится verification-only (короткий AC pass + archive).
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
