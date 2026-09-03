# TZ-OPS-DEPLOY-PREP-2026-09-03: Deploy-Ready на текущий HEAD

**РОЛЬ:** Executor (Claude)  
**LAYER:** ops + gates  
**CONFLICT KEYS:** `docs/agent-checklists/DEPLOY-READY.md`; `docs/agent-checklists/PRE-DEPLOY-2026-09-03.md`; mini-fix product files only if gates fail outside known baseline

## Цель

По `tasks/PROMPT-DEPLOY-READY.md` → штамп `DEPLOY-READY.md` = **READY** на tip `main`, commit+push docs (+ мини-фиксы если красные гейты вне baseline).

## ЧТО ДЕЛАТЬ

1. `git pull --ff-only`; HEAD == origin/main.
2. Полные гейты:  
   `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit && pnpm test && pnpm lint`  
   `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit && pnpm test && pnpm lint`  
   root `pnpm architecture:check`  
   `cd frontend-nx && pnpm exec nx build kppdf-web`
3. Красное вне known_debt → минимальный фикс + focused retest (не раздувать scope).  
   Known debt → в штамп, не чинить молча.
4. Evidence `docs/agent-checklists/PRE-DEPLOY-2026-09-03.md` (deploy_sha_target = full HEAD).
5. Переписать `DEPLOY-READY.md` → status READY + sha/date/agent/debt.
6. Stage **только** deploy docs + свои мини-фиксы. Чужой WIP (DARK-THEME, docker-compose, data/, crm_*, untracked zip) **не** стейджить.
7. Commit + push. Отчёт: Deploy-Ready на `<sha>`.

## НЕ

- `deploy.ps1` / SSH / wipe / production
- `git add -A`

## Archive

`tasks/_archive/2026-09/TZ-OPS-DEPLOY-PREP-2026-09-03.done.md`
