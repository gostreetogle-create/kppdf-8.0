# PROMPT — Claude: деплой NX (только по команде PO)

> PO говорит агенту: **«сделай деплой по документации»** — достаточно.  
> Ниже — полный блок, если нужен copy-paste в Claude без устной фразы.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

═══ ДЕПЛОЙ ═══
Читай ПЕРВЫМ: deploy/synology/README.md — блок «Если PO сказал сделать деплой по документации».
Штамп: docs/agent-checklists/DEPLOY-READY.md — status MUST be READY + frontend_target: nx.
Канон: docs/ops/DEPLOY-NX-PROD.md.

Действия:
1) git fetch && checkout main && pull --ff-only
2) Если штамп не READY → STOP, скажи PO «нужна подготовка»
3) Warm deploy по README (Mongo KEEP, wipe_default false) — без jest/tsc matrix, без правок кода
4) Smoke §4 DEPLOY-NX-PROD (health, login, NX shell)
5) Штамп → INVALID + why_invalid: deployed <sha> <date> + commit docs only
6) Executor report: URL/smoke/SHA

НЕ: dropDatabase; wipe без явного PO; правки frontend-nx/backend mid-deploy; force-push.
```
