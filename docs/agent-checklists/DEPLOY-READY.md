# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою» / NX prep).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod last warm: `4d55d0ea` 2026-08-27.  
> **NX cutover:** канон `docs/ops/DEPLOY-NX-PROD.md`. До закрытия `TZ-OPS-DEPLOY-NX-STATIC` — **не** деплоить.

```yaml
status: BLOCKED
frontend_target: nx
wipe_default: false
wipe_reason: "same Nest API; additive schemas since 4d55d0ea — keep Mongo/uploads (warm)"
deploy_sha_target: null
blocked_reason: "deploy.py still builds legacy frontend; TZ-OPS-DEPLOY-NX-STATIC + full gates pending"
prepared_at: 2026-09-07T22:30:00+03:00
prepared_by: cursor-architect
evidence: docs/agent-checklists/PRE-DEPLOY-2026-09-07-NX.md
prep_prompt: tasks/PROMPT-CLAUDE-DEPLOY-PREP-NX.md
debt: []
desktop_zip: accept-stale
mixed_commit: no
```

## Для агента деплоя

1. Если `status` **не** `READY` → **STOP**. PO: «штамп не READY — нужна подготовка» (`PROMPT-CLAUDE-DEPLOY-PREP-NX.md`).
2. Если `READY` и `frontend_target: nx` → `git fetch` && `git checkout main` && `git pull --ff-only`.
3. `git merge-base --is-ancestor <deploy_sha_target> HEAD` must succeed; deploy from **tip HEAD**.
4. VPN **off**. `config.env` + `CREDENTIALS.md` на машине деплоя (не в git).
5. Warm only: `.\deploy\synology\deploy.ps1` (**no** `-Wipe`), unless PO separately `да, разрешаю wipe после бэкапа`.
6. Smoke: `docs/ops/DEPLOY-NX-PROD.md` §4 + `deploy/synology/README.md`. Затем `INVALID` + commit.
