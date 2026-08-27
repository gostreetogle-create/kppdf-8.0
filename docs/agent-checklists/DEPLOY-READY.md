# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою»).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod до этой выкладки: deployed `4d55d0ea` 2026-08-27 (warm). Prior deployed `78de2801` 2026-08-26.

```yaml
status: INVALID
deploy_sha_target: fd416e40ff02b8fb3b37ebf44bb2734986c546a8
deployed_sha: 4d55d0ea
prepared_at: 2026-08-27T22:10:00+03:00
prepared_by: cursor-architect
deployed_at: 2026-08-27T19:25:00+03:00
deployed_by: buffy-executor
evidence: docs/agent-checklists/PRE-DEPLOY-2026-08-27.md
why_invalid: deployed 4d55d0ea 2026-08-27 warm (WIPE=false)
```

## Для агента деплоя

1. `status` = **READY** → можно.
2. `git fetch` && `git checkout main` && `git pull --ff-only`.
3. `git merge-base --is-ancestor fd416e40 HEAD` must succeed; deploy from **tip HEAD**.
4. VPN **off**. Confirm `deploy/synology/config.env` + `CREDENTIALS.md` exist on the deploy machine (not in git).
5. `.\deploy\synology\deploy.ps1` (no `-Wipe`).
6. Smoke per `deploy/synology/README.md`. Then set this stamp `INVALID` + commit.
