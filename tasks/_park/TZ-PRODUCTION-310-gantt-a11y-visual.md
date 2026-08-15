═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-310: Gantt visual + a11y (grid / focus / non-color)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — **BLOCKED BY: WAVE-PRODUCTION-STUDIO-CHROME (после C/D visual PASS)**
ACTIVE: не создавать до un-park PO
ABSORBED: не запускать a11y/visual polish поверх docked w-56 layout; безопасные пункты переоценить после shell.
SOURCE: docs/audits/2026-08-06-production-gantt-verdict-response.md
PLAN: stabilize-then-split 2026-08-07

РОЛЬ АГЕНТА: Frontend a11y
ЗАВИСИМОСТИ: WAVE-PRODUCTION-STUDIO-CHROME C/D visual PASS; затем отдельная a11y-реализация
LAYER: 3

PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS:
frontend/src/app/pages/production/blocks/gantt-bars.component.ts;
frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts;
frontend/src/app/pages/production/production-cockpit.page.ts;
docs/pages/production-cockpit.page.md;
docs/agent-checklists/TZ-PRODUCTION-310.md;
progress.md

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM  
ШАГ 2 — `role=grid` (или согласованный pattern) на полосах + Enter/Space  
ШАГ 3 — focus-visible rings (pi-focus-ring), без ловушек  
ШАГ 4 — паттерны/подписи не только цветом (легенда уже есть — усилить)  
ШАГ 5 — weekend shading **только если** есть производственный календарь SoT;
  иначе explicit НЕ делать и known_limitation  

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- drag/resize; order-level days (309)
- invent production calendar в этом TZ

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Keyboard-only smoke полосы → inspector  
2. tsc + targeted jest PASS  
3. Archive + report  

known_limitation: weekend shading без календаря — out.
