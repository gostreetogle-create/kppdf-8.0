# HANDOFF — TZ-PRODUCTION-303.1 (второй ИИ / executor)

Скопируй блок ниже **целиком** в чат исполнителя (Gemini / Buffy / local).  
Cursor product-код **не** пишет. Deploy **не** делать.

---

```text
Ты — исполнитель kppdf-8.0 (Gemini/local). Прочитай целиком:
- GEMINI.md
- OrchestratorKit/AGENTS.md (если kit-flow)
- docs/PO-DIARY.md §1–§4
- docs/audits/2026-08-07-first-look-project-audit.md
- docs/audits/2026-08-06-production-gantt-verdict-response.md
- docs/audits/2026-08-07-peer-audit-delta.md
- .agents/skills/kppdf-executor-loop/SKILL.md
- tasks/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md + checklist
   docs/agent-checklists/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md по _TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP / DEFER
5) Team Room: node OrchestratorKit/team-room/cli.mjs join && inbox; claim best-effort
Затем выполни tasks/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md до archive.

МИССИЯ СЕГОДНЯ (одна claim, без новых фич):
Закрыть uncommitted Gantt hotfix PRODUCTION-303 + починить deep-link заказов.
Имя задачи: TZ-PRODUCTION-303.1-gantt-hotfix-closeout

КОНФЛИКТ KEYS (только эти пути):
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
STATUS.md (только строка этой задачи)

ЧТО УЖЕ В WORKING TREE (не переписывай с нуля — доведи и закоммить):
Hotfix: sync фильтров rail↔bars, confirm+rollback PATCH WorkType.days,
контекст полос (номер/изделие/status), легенда, toolbar, ACL UX production:write.
Сверь с docs/audits/2026-08-06-production-gantt-verdict-response.md.

ДОПИСАТЬ В ЭТОЙ ЖЕ CLAIM:
Deep-link: order-inspector уже ведёт на /orders?q=<number>, но orders.page.ts
игнорирует queryParam q (search только локальный signal).
Сделай: прочитать q из ActivatedRoute.queryParamMap и прокинуть в существующий search
(тот же механизм, что поле поиска). Spec: при ?q=… фильтр применяется.
Не меняй URL-контракт ссылки в inspector без нужды.

GATES (обязательно, evidence в checklist):
- cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
- targeted jest: production gantt + orders deep-link specs
- НЕ использовать lint --fix как доказательство чистоты (mutating). Если нужен lint — без --fix или отдельно отметить «fix applied: files…»
- git diff --check на своих файлах

ЗАПРЕЩЕНО:
- drag/resize/reschedule Ганта
- PRODUCTION-304…310 реализация
- shipping / YouGile import / backend schema
- любые файлы вне CONFLICT KEYS
- deploy.ps1 / production deploy
- git add .
- «поехали» стопы — работай до archive этой задачи

ФИНАЛ:
1. commit conventional: fix(production): close Gantt hotfix + orders ?q= deep-link
2. push в tracked branch
3. progress.md запись + archive tasks/_archive/2026-08/TZ-PRODUCTION-303.1-….done.md
4. STATUS / _active синхрон; verify-status если применимо
5. Executor report (auto) в checklist с commit SHA
6. Отчёт PO одной фразой: что закоммичено, SHA, gates PASS/FAIL, deploy НЕ делался

Если acceptance невозможно — needs_help + факт, не silent partial.
```
