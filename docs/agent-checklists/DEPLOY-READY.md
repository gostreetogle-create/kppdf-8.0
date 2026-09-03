# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою»).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod до этой выкладки: deployed `4d55d0ea` 2026-08-27 (warm). Prior deployed `78de2801` 2026-08-26.

```yaml
status: READY
deploy_sha_target: 99a040e4d08b0aa3d0639b2474ef3067beeb1f3c
prepared_at: 2026-09-03T21:55:00+03:00
prepared_by: claude-executor
evidence: docs/agent-checklists/PRE-DEPLOY-2026-09-03.md
debt:
  - "BE: no-explicit-any warnings (197, pre-existing)"
  - "FE: no-implements-oninit-in-pages warnings (17, pre-existing)"
  - "architecture: 15x fe-page-cross-component (pre-existing, unchanged; see PRE-DEPLOY)"
desktop_zip: accept-stale (no installer zip in frontend/downloads/; web warm only)
mixed_commit: no
```

## Для агента деплоя

1. `status` = **READY** → можно.
2. `git fetch` && `git checkout main` && `git pull --ff-only`.
3. `git merge-base --is-ancestor fd416e40 HEAD` must succeed; deploy from **tip HEAD**.
4. VPN **off**. Confirm `deploy/synology/config.env` + `CREDENTIALS.md` exist on the deploy machine (not in git).
5. `.\deploy\synology\deploy.ps1` (no `-Wipe`).
6. Smoke per `deploy/synology/README.md`. Then set this stamp `INVALID` + commit.
