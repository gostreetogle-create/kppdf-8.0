# WAVE checklist — AUTH RBAC (ведёт Freebuff #2)

> Промпт: `tasks/PROMPT-FREEBUFF-AUTH-RBAC.md`
> Обрыв → resume с первого незакрытого `[ ]`.

Status: **DONE**
agent_id: `buffy-gpt-5.6-luna`
started_at: `2026-08-31T20:00:00+03:00`
completed_at: `2026-08-31T20:18:10+03:00`
**RESUME:** закрыто; следующий шаг — обычный review/merge процесса

## Волна

- [x] 0. Master-чеклист заполнен
- [x] 1. `git status` — подтвердить WIP только в backend auth/guard/contract (не трогать FE)
- [x] 2. CLAIM `TZ-AUTH-RBAC-ROLE-PERMS` → `_active/` + checklist claim slot
- [x] 3. Довести guard/JWT/`/auth/me` + specs (role perms + overrides)
- [x] 4. Gates: backend typecheck и Jest PASS; изменённая RBAC/auth область lint PASS; полный `pnpm lint` заблокирован 45 baseline-ошибками вне scope
- [x] 5. Archive `.done.md` · очистить `_active`
- [x] 6. QUEUE-LIVE + `_NOW` · Status=DONE · отчёт PO одной строкой

## Conflict

- Свои keys: `backend/.../permissions.guard.ts`; jwt.strategy; auth.service; rbac-contract
- ЧУЖОЕ (Freebuff #1): `frontend-nx/**` — не открывать на запись

## Closeout note

`frontend-nx/**`, `frontend/**`, `docker-compose.yml` и чужая документация в
рабочем дереве не включаются в RBAC-коммит. Полный backend lint остаётся
красным на pre-existing baseline-файлах; target lint для всех изменённых
RBAC/auth-файлов не содержит ошибок.
