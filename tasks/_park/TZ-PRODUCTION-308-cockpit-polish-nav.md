═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-308: Cockpit polish — inspector / keyboard / scroll-today
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — **BLOCKED BY: WAVE-PRODUCTION-STUDIO-CHROME (после C/D visual PASS)**
ACTIVE: не создавать до un-park PO
ABSORBED: не запускать polish поверх docked w-56 layout; безопасные пункты будут переоценены после studio shell.
SOURCE: docs/audits/2026-08-06-production-gantt-verdict-response.md
PLAN: stabilize-then-split 2026-08-07

РОЛЬ АГЕНТА: Frontend
ЗАВИСИМОСТИ: TZ-PRODUCTION-303.1 DONE; WAVE-PRODUCTION-STUDIO-CHROME C/D visual PASS; PO browser smoke PASS
LAYER: 3

PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/blocks/order-inspector.component.ts;
frontend/src/app/pages/production/blocks/orders-rail.component.ts;
frontend/src/app/pages/production/blocks/gantt-bars.component.ts;
frontend/src/app/pages/production/production-cockpit.page.ts;
docs/pages/production-cockpit.page.md;
docs/agent-checklists/TZ-PRODUCTION-308.md;
progress.md

Проверено: hotfix 303.1 закрывает фильтры/контекст; deep-link orders в 303.1;
  этот TZ — UX polish, не drag.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Кокпит plan-estimate usable после 303.1. Не хватает: responsive inspector,
копирование номера заказа, keyboard rail↔bars, scroll-to-today в viewport.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM + checklist  
ШАГ 2 — Responsive inspector (узкий viewport не ломает rail/bars)  
ШАГ 3 — Copy order number (кнопка/жест, toast один)  
ШАГ 4 — Keyboard: фокус rail↔bars без ловушек; Enter открывает inspector  
ШАГ 5 — «Сегодня» реально скроллит timeline к today в viewport  
ШАГ 6 — Gates + archive

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- drag/resize; order-level days schema (→ 309)
- a11y grid role= (→ 310)
- shipping / YouGile / backend WorkType ACL contract (→ 309)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. AC шагов 2–5 измеримы в browser smoke + specs где уместно  
2. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS  
3. targeted jest production PASS  
4. Executor report + archive  

known_limitation: weekend shading / production calendar — не здесь (310 / later).
