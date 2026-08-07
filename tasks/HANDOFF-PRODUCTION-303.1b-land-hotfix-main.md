# HANDOFF — land 303.1 onto main + remaining Gantt WIP

Скопируй блок ниже **целиком** второму ИИ.

---

```text
Ты — исполнитель kppdf-8.0. Прочитай:
- GEMINI.md
- docs/PO-DIARY.md §1–§4
- docs/audits/2026-08-07-first-look-project-audit.md
- tasks/TZ-PRODUCTION-303.1-gantt-hotfix-closeout.md
- docs/agent-checklists/CURSOR-WAIT-303.1.md

КОНТЕКСТ (Cursor review 2026-08-07):
TZ-PRODUCTION-303.1 на ветке freebuff частично DONE:
- PASS: deep-link /orders?q= (commits f731957 + closeout 982bfdf)
  branch: origin/freebuff/task-d94febd3-7ea4-472f-a613-7e45ccc654a0
- FAIL/INCOMPLETE vs TZ scope: Gantt hotfix (~фильтры rail↔bars, confirm WorkType.days,
  контекст полос, легенда) всё ещё ТОЛЬКО в dirty working tree на canonical main,
  НЕ в freebuff-коммитах и НЕ в origin/main.
- main сейчас на b115a6c (catalog polish); freebuff НЕ влит в main.
- Deploy запрещён.

МИССИЯ: TZ-PRODUCTION-303.1b-land-hotfix-main
Рабочая папка: D:\kppdf-8.0 (canonical), НЕ только worktree freebuff.

CLAIM первым:
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/TZ-PRODUCTION-303.1b-land-hotfix-main.md + checklist
   docs/agent-checklists/TZ-PRODUCTION-303.1b-land-hotfix-main.md
3) Status CLAIMED; claim slot agent_id + claimed_at ISO
4) Чужой CLAIM на production/** или orders.page.ts → STOP

ШАГИ:
A) git fetch origin
B) Убедись на main, чисто относительно чужого: НЕ делай git add .
C) Влей deep-link в main:
   - git merge origin/freebuff/task-d94febd3-7ea4-472f-a613-7e45ccc654a0
   - или cherry-pick f731957 затем 982bfdf
   - разреши конфликты осторожно: сохрани И deep-link orders/?q= И любой
     уже существующий catalog polish на main (products не трогать)
D) Закоммить оставшийся Gantt hotfix из working tree (если ещё dirty после merge):
   frontend/src/app/pages/production/blocks/gantt-bars.component.ts
   frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts
   frontend/src/app/pages/production/blocks/orders-rail.component.ts
   frontend/src/app/pages/production/blocks/order-inspector.component.ts
   frontend/src/app/pages/production/gantt-bar.model.ts
   frontend/src/app/pages/production/gantt-bar.model.spec.ts
   frontend/src/app/pages/production/production-cockpit.context.ts
   frontend/src/app/pages/production/production-cockpit.page.ts
   docs/pages/production-cockpit.page.md
   docs/audits/2026-08-06-production-gantt-verdict-response.md (untracked → add)
   Сверь с docs/audits/2026-08-06-production-gantt-verdict-response.md
   (фильтры sync, confirm+rollback days, bar context, легенда, toolbar).
E) Gates на зоне production+orders:
   - cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   - targeted jest: production gantt + orders.page.spec
   - eslint без --fix на тронутых файлах
   - git diff --check
F) Commit conventional, напр.:
   fix(production): land Gantt hotfix + merge 303.1 deep-link to main
G) push origin main (или PR → main если так принято; цель — hotfix+deeplink на main)
H) progress + archive TZ-PRODUCTION-303.1b; удали _active; lock; Executor report (auto) с SHA
I) Deploy НЕ делать. В отчёте PO: «готов к smoke docs/pages/production-cockpit-smoke-303.1.md»

ЗАПРЕЩЕНО:
- drag/resize, PRODUCTION-304…310, shipping, YouGile, products/**
- lint --fix / prettier --write как «доказательство»
- git add .
- deploy.ps1

Если merge ломает catalog commits на main — STOP + needs_help с diff.
```
