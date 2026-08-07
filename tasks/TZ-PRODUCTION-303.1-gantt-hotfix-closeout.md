═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-303.1: Gantt hotfix closeout + orders ?q= deep-link
═══════════════════════════════════════════════════════════════

STATUS: READY (исполнителю сегодня) — не путать с DONE TZ-PRODUCTION-303
ACTIVE: создать `tasks/_active/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md` при CLAIM
CHECKLIST: `docs/agent-checklists/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md`
HANDOFF: `tasks/HANDOFF-PRODUCTION-303.1-executor-prompt.md`
PLAN: stabilize-then-split (Cursor 2026-08-07)
SOURCE: docs/audits/2026-08-07-first-look-project-audit.md;
  docs/audits/2026-08-06-production-gantt-verdict-response.md

РОЛЬ АГЕНТА: Frontend executor (Angular 20) — closeout WIP + deep-link
ЗАВИСИМОСТИ: TZ-PRODUCTION-303 DONE on main
LAYER: 3

PAGES: /production ; /orders
PAGE_DOCS: production-cockpit.page.md ; orders.page.md (если есть)

CONFLICT KEYS:
frontend/src/app/pages/production/blocks/gantt-bars.component.ts;
frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts;
frontend/src/app/pages/production/blocks/order-inspector.component.ts;
frontend/src/app/pages/production/blocks/orders-rail.component.ts;
frontend/src/app/pages/production/gantt-bar.model.ts;
frontend/src/app/pages/production/gantt-bar.model.spec.ts;
frontend/src/app/pages/production/production-cockpit.context.ts;
frontend/src/app/pages/production/production-cockpit.page.ts;
frontend/src/app/pages/orders/orders.page.ts;
frontend/src/app/pages/orders/orders.page.spec.ts;
docs/pages/production-cockpit.page.md;
docs/audits/2026-08-06-production-gantt-verdict-response.md;
docs/agent-checklists/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md;
progress.md;
STATUS.md

Проверено: order-inspector `[queryParams]="{ q: order().number }"`;
  orders.page.ts фильтрует только `search.debouncedSearch()` без queryParamMap;
  working tree ~298 строк hotfix поверх 303 (фильтры, confirm days, bar context).

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. PRODUCTION-303 на main DONE; локально uncommitted hotfix (см. verdict-response).
2. Ссылка «Открыть в списке заказов» шлёт `/orders?q=<number>`, но `/orders` игнорирует `q`.
3. Deploy сегодня **запрещён** без явной команды PO.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — CLAIM до кода  
  `_active` + checklist Status CLAIMED + claim slot (agent_id, claimed_at ISO).  
  Конфликт на тех же keys → DEFER.

ШАГ 2 — Довести hotfix (не переписывать с нуля)  
  Сверить working tree с `docs/audits/2026-08-06-production-gantt-verdict-response.md`:  
  sync фильтров rail↔bars, confirm+rollback PATCH WorkType.days, контекст полос,  
  легенда, toolbar, ACL UX. Зафиксировать page doc + verdict audit в commit.

ШАГ 3 — Deep-link `/orders?q=`  
  В `orders.page.ts`: читать `q` из `ActivatedRoute.queryParamMap` и прокинуть в  
  существующий search (тот же путь, что UI input). Spec: при `?q=…` фильтр применяется.  
  URL-контракт inspector не менять без нужды.

ШАГ 4 — Gates + commit + push (без deploy)  
  См. КРИТЕРИИ ПРИЁМКИ. Conventional commit:  
  `fix(production): close Gantt hotfix + orders ?q= deep-link`

ШАГ 5 — Archive  
  progress.md + `_archive/2026-08/TZ-PRODUCTION-303.1-….done.md` + lock +  
  Executor report (auto) с SHA. Deploy НЕ делать.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ: только CONFLICT KEYS.

НЕ ИЗМЕНЯТЬ / НЕ ДЕЛАТЬ:
- drag / resize / reschedule Ганта
- PRODUCTION-304…310 реализация
- shipping / YouGile import / backend schema
- deploy.ps1 / FE-only deploy
- `git add .`
- lint `--fix` как «доказательство чистоты» (mutating)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Hotfix + deep-link в git (pushed); working tree чист по CONFLICT KEYS.
2. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
3. Targeted jest: production gantt specs + orders deep-link / `?q=` PASS
4. `git diff --check` на своих файлах PASS
5. Lint: если гоняется — **без** `--fix`, или отдельно в report: `fix applied: <files>`
6. Checklist Executor report (auto) с `commit:` SHA; deploy не выполнялся
7. Archive + progress; `_active` удалён

known_limitation: BE WorkType всё ещё `@Roles`; order-level days — TZ-PRODUCTION-309.
Review: Cursor/PO PASS желателен перед демо; archive по GEMINI closeout.

Финализация: root → `tasks/_archive/2026-08/` + GEMINI.md closeout.
