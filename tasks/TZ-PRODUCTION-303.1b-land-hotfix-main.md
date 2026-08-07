═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-303.1b: Land Gantt hotfix + merge deep-link to main
═══════════════════════════════════════════════════════════════

STATUS: READY — после Cursor CONDITIONAL review 303.1
SOURCE: freebuff f731957/982bfdf (deep-link only) + dirty main Gantt WIP
HANDOFF: tasks/HANDOFF-PRODUCTION-303.1b-land-hotfix-main.md

РОЛЬ АГЕНТА: Frontend executor + git land on main
ЗАВИСИМОСТИ: freebuff 303.1 deep-link pushed; Gantt WIP still local on canonical
LAYER: 3

PAGES: /production ; /orders
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/**;
frontend/src/app/pages/orders/orders.page.ts;
frontend/src/app/pages/orders/orders.page.spec.ts;
docs/pages/production-cockpit.page.md;
docs/audits/2026-08-06-production-gantt-verdict-response.md;
docs/agent-checklists/TZ-PRODUCTION-303.1b-land-hotfix-main.md;
progress.md;
STATUS.md

Проверено (Cursor 2026-08-07): freebuff diff vs main = deep-link only (~orders +
  inspector link). Dirty main production/** ≈ +287 строк hotfix NOT in remote.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ / НЕ ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

См. HANDOFF prompt. Merge/cherry-pick freebuff → main, затем commit remaining
Gantt hotfix + verdict audit. Gates. Push main. No deploy.

НЕ: 304–310, drag, products, mutating formatters, deploy.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. origin/main содержит ?q= deep-link + Gantt hotfix files
2. tsc + targeted jest production/orders PASS
3. working tree clean по CONFLICT KEYS
4. Executor report SHA; deploy NO
5. Archive 303.1b

Финализация: tasks/_archive/2026-08/ + GEMINI closeout.
