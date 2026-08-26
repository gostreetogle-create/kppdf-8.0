# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою»).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod до этой выкладки: `24a0d74a` / product `565c630d` (warm 2026-08-25).

```yaml
status: INVALID
why_invalid: deployed 78de2801 2026-08-26 (warm deploy.ps1, WIPE=false; Deploy complete + Auth OK + Frontend 200 + LAN/https health/ready ok)
deployed_by: claude terminal (PO prompt «сделай деплой по документации»)
deploy_sha_target: 631f96e0d0b53cdaeaf91cc28cb22421e3fd8d58
prepared_at: 2026-08-26T06:20:00+03:00
prepared_by: cursor-architect
evidence: docs/agent-checklists/PRE-DEPLOY-2026-08-26.md
known_debt:
  - backend catalog-314.archive.spec.ts (baseline)
  - backend users-admin.controller.spec.ts (baseline)
  - FE jest 8 fail / 2043 pass (terms/orders/materials/workspace — baseline)
  - architecture:check fe-page-cross-component (2)
  - desktop_zip accept-stale (no zip in frontend/downloads)
  - SSH may need VPN off + LAN at deploy time
mixed_commits: inherited-waive-from-prior-stamp
why_ready: >
  TZ-TEST-422 fixed categories.page.spec ActivatedRoute (a01730fb + 631f96e0).
  FE/BE tsc PASS. New-outside-baseline red cleared. SUPPLY-443 XOR fixed.
  FE 8 / BE 2 / arch 2 = documented baseline only. §F not run.
  Warm deploy.ps1 only (WIPE=false). Desktop accept-stale.
```

## Для агента деплоя

1. `status` = **READY** → можно.
2. `git fetch` && `git checkout main` && `git pull --ff-only`.
3. `git merge-base --is-ancestor 631f96e0 HEAD` must succeed; deploy from **tip HEAD**.
4. VPN **off**. `.\deploy\synology\deploy.ps1` (no `-Wipe`).
5. Smoke per `deploy/synology/README.md`. Then set this stamp `INVALID` + commit.
