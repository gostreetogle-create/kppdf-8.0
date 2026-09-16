# PROMPT — Claude: деплой по документации (warm NX)

PO фраза уже дана: **«сделай деплой по документации»**.

```
Ты executor kppdf-8.0 (agent_id: claude). Workspace D:\kppdf-8.0. UNATTENDED.

PO сказал: «сделай деплой по документации».
Делай ТОЛЬКО по deploy/synology/README.md § «Если PO сказал…». Не ищи другие промпты. Не чини код. Не jest/tsc (prep уже DONE).

1) Открой docs/agent-checklists/DEPLOY-READY.md
   - status must be READY, frontend_target: nx. Иначе STOP.
2) git fetch origin && git checkout main && git pull --ff-only
3) git merge-base --is-ancestor 73e335c3 HEAD  (deploy_sha_target) — must succeed.
   Deploy from tip HEAD (сейчас обычно 7500f862 = stamp commit).
4) VPN off. Секреты из deploy/synology/config.env + CREDENTIALS.md — не печатать в чат.
5) Warm ONLY — wipe_default false. НЕ -Wipe. НЕ DANGEROUS wipe.

cd D:\kppdf-8.0
$env:PYTHONUTF8='1'
$env:PYTHONIOENCODING='utf-8'
.\deploy\synology\deploy.ps1

Жди === Deploy complete === (~10–20 мин).

6) Smoke: docs/ops/DEPLOY-NX-PROD.md §4 + README (health/ready, login, NX UI).
   Пароли в чат НЕ писать.
7) DEPLOY-READY.md → status: INVALID + why_invalid: deployed <tip-sha> <ISO date>
   Commit+push штамп. _NOW Claude IDLE.
8) Отчёт PO: tip SHA + warm NX deploy OK + health.

ЗАПРЕЩЕНО: wipe; второй параллельный deploy; commit секретов; новые TZ «заодно».
```
