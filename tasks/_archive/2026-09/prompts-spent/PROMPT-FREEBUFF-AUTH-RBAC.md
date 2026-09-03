# PROMPT — Freebuff #2: TZ-AUTH-RBAC-ROLE-PERMS (параллельно DCI)

> Backend-only. **Не** трогать `frontend-nx` / `kppdf-web` — там Live Freebuff #1 (DCI).  
> WIP уже в working tree — довести, не откатывать чужой diff молча.

```text
Ты — continuous executor kppdf-8.0. Репо: D:\kppdf-8.0 (main).
Skill: .agents/skills/kppdf-executor-loop/SKILL.md
Обязательно: GEMINI.md · docs/PO-CANON.md · docs/RBAC-CONTRACT.md (если есть)
Спека: tasks/TZ-AUTH-RBAC-ROLE-PERMS.md

ПАРАЛЛЕЛЬ: Freebuff #1 делает DCI на frontend-nx. Ты — ТОЛЬКО backend auth/RBAC.
Не трогай: frontend/**, frontend-nx/**, docker-compose.yml, studio, DocStudio S8.

════════════════════════════════════════
ШАГ 0 — СВОЙ MASTER-ЧЕКЛИСТ (ДО КОДА)
════════════════════════════════════════
Создай/обнови: docs/agent-checklists/WAVE-AUTH-RBAC.md

Обязательно:
- Status: IN_PROGRESS | DONE
- agent_id + started_at (ISO)
- RESUME: «сейчас пункт N» (обновляй после каждого шага)
- [ ] список всей волны
Если файл уже есть — resume с первого незакрытого [ ]. Не спрашивай PO «продолжать?»

════════════════════════════════════════
ОЧЕРЕДЬ (одна TZ)
════════════════════════════════════════
1) TZ-AUTH-RBAC-ROLE-PERMS

Суть: PermissionsGuard / JWT /auth/me — permissions РОЛИ (+overrides), не сырой user-only.
Uncommitted diff уже начат (permissions.guard, jwt.strategy, auth.service, rbac-contract,
jwt.strategy.spec) — ДОЙТИ ДО GREEN, не git restore без причины.

Цикл:
A. CLAIM: tasks/_active/TZ-AUTH-RBAC-ROLE-PERMS.md + claim slot в
   docs/agent-checklists/TZ-AUTH-RBAC-ROLE-PERMS.md (создай если нет)
B. Доведи код + specs: role perms vs user overrides; admin; manager; deny override
C. Gates: cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
          && pnpm test && pnpm lint
D. Archive: tasks/_archive/2026-08/TZ-AUTH-RBAC-ROLE-PERMS.done.md
   очисти _active; [x] в WAVE; commit+push по GIT-POLICY
E. QUEUE-LIVE: строка RBAC → DONE; _NOW.md обновить

Стоп только на wipe/deploy/секретах. Deploy не делать.

Конец: «RBAC ROLE-PERMS DONE · HEAD … · backend green · frontend не трогал»
```
