# PROMPT — Claude: подготовка NX-деплоя (НЕ деплой)

Скопируй агенту Claude Code / executor целиком.  
PO потом другому агенту скажет только: **«сделай деплой по документации»**.

```text
Ты executor kppdf-8.0 (agent_id: claude). Workspace: D:\kppdf-8.0. UNATTENDED.

GOAL: закрыть подготовку к prod-деплою **сайта NX** так, чтобы следующий агент
только читал deploy/synology/README.md + DEPLOY-READY и запускал warm deploy.
Сейчас ДЕПЛОЙ / wipe / SSH-запись на VM/VPS — ЗАПРЕЩЕНЫ.

Канон: docs/ops/DEPLOY-NX-PROD.md
TZ: tasks/_ready/TZ-OPS-DEPLOY-NX-STATIC.md
Checklist: docs/agent-checklists/TZ-OPS-DEPLOY-NX-STATIC.md
Evidence: docs/agent-checklists/PRE-DEPLOY-2026-09-07-NX.md
Stamp: docs/agent-checklists/DEPLOY-READY.md

0) git fetch; checkout main; pull --ff-only; status clean enough (чужой WIP не стейдж).
   Claim TZ-OPS-DEPLOY-NX-STATIC → tasks/_active/ + Claim slot.

1) Реализуй TZ: deploy.py build_frontend =
   cd frontend-nx && pnpm exec nx build kppdf-web
   → copy frontend-nx/dist/apps/kppdf-web/browser/* → frontend/browser/
   Desktop publish_desktop_installer без смены контракта.
   НЕ трогай docker-compose.prod.yml mount.
   Обнови README.md / DEPLOY.md / RUNBOOK.md (prod static = NX).

2) ПОЛНЫЕ ГЕЙТЫ на HEAD (после cutover commit или до штампа — на tip с NX path):
   cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test && pnpm lint
   pnpm architecture:check
   cd frontend-nx && pnpm exec nx build kppdf-web
   Красный вне baseline debt → мини-фикс в scope ИЛИ STOP с отчётом.
   Заполни таблицу Gates в PRE-DEPLOY-2026-09-07-NX.md.

3) ДАННЫЕ: wipe_default=false (warm). В штамп явно:
   wipe_reason: same Nest API; additive schemas since 4d55d0ea — keep Mongo/uploads
   Не предлагай wipe без падения health после будущего деплоя.

4) DESKTOP: desktop_zip: accept-stale (если нет свежего zip в downloads).

5) Перепиши DEPLOY-READY.md:
   status: READY
   frontend_target: nx
   wipe_default: false
   deploy_sha_target: <полный SHA tip после твоих коммитов>
   prepared_at / prepared_by / evidence / debt / mixed_commit: no
   В блоке «Для агента деплоя» оставь warm deploy.ps1 без -Wipe;
   упомяни smoke docs/ops/DEPLOY-NX-PROD.md §4.

6) Archive TZ → tasks/_archive/2026-09/TZ-OPS-DEPLOY-NX-STATIC.done.md
   Очисти _active; обнови _NOW: Claude IDLE, next=ждать «деплой по документации».
   Commit + push. Отчёт PO: «Deploy-Ready NX на <sha>. Можно: сделай деплой по документации.»
   STOP. Не запускай deploy.ps1.
```
