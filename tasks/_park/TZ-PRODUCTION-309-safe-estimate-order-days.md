═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-309: Safe estimate — production:write + order-level days
═══════════════════════════════════════════════════════════════

STATUS: **UNPARKED 2026-08-15** → executable `tasks/TZ-PRODUCTION-309-safe-estimate-order-days.md`
ACTIVE: см. `tasks/_active/TZ-PRODUCTION-309.md` + WAVE-PRODUCTION-GANTT-RESIZE
ABSORBED: park file historical; do not duplicate work here.
SOURCE: docs/audits/2026-08-06-production-gantt-verdict-response.md; PO-DIARY «мышью чётко»
PLAN: stabilize-then-split 2026-08-07

РОЛЬ АГЕНТА: Backend + Frontend (split ok: BE first)
ЗАВИСИМОСТИ: TZ-PRODUCTION-303.1 DONE; WAVE-PRODUCTION-STUDIO-CHROME C/D visual PASS; 308 не является обязательным child этой wave
LAYER: 3 (FE) / 4 (BE) — если параллель: два child или строго sequential BE→FE

PAGES: /production
PAGE_DOCS: production-cockpit.page.md

CONFLICT KEYS (черновик — уточнить при un-park):
backend/src/modules/work-type/**;
backend permissions / Roles → capability production:write на mutate WorkType.days;
frontend/src/app/pages/production/** (estimate edit path);
docs/agent-checklists/TZ-PRODUCTION-309.md;
progress.md

Проверено: FE hotfix уже confirm «для всех заказов» + production:write UX;
  BE WorkType mutate всё ещё `@Roles` (admin/manager), не capability.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

PATCH WorkType.days глобален для всех заказов. Order-level override отсутствует.
Без order-level days drag/resize **запрещён** продуктово.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM; domain preflight: где жить order-level days (Order line / composition
  snapshot / отдельное поле) — зафиксировать «Проверено:» schema до кода  
ШАГ 2 — BE: mutate WorkType.days требует capability `production:write` (не только Roles)  
ШАГ 3 — BE+FE: order-level duration override read/write; UI не врёт «для всех»  
ШАГ 4 — Tests read-only user cannot PATCH; write user can  
ШАГ 5 — Gates + archive; **не** включать drag UI в этом TZ

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- drag/resize UI (отдельный TZ после 309 DONE)
- PRODUCTION-304…307
- shipping

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Capability contract на BE для days mutate  
2. Order-level override round-trip + UI copy честная  
3. `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS  
4. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS  
5. targeted jest BE+FE PASS; Executor report  

known_limitation: N+1 GET /production/estimate facade — optional 303.1-batch, не блокер.
