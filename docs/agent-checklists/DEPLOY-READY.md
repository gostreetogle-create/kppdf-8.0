# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою»).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod до этой выкладки: deployed `78de2801` 2026-08-26 (warm). Prior READY was `631f96e0`.

```yaml
status: READY
deploy_sha_target: fd416e40ff02b8fb3b37ebf44bb2734986c546a8
prepared_at: 2026-08-27T22:10:00+03:00
prepared_by: cursor-architect
evidence: docs/agent-checklists/PRE-DEPLOY-2026-08-27.md
desktop_zip: accept-stale
mixed_commits: none-blocking (sequential TZ commits; 444C/445E co-stage disclosed earlier)
known_debt:
  - backend catalog-314.archive.spec.ts (baseline)
  - backend users-admin.controller.spec.ts (baseline)
  - FE jest 6 fail / 2086 pass (proposal-create-terms; material-form-dialog; proposal-workspace)
  - architecture:check 3× fe-page-cross-component (materials/products prior + inventory←materials from QA-445B)
  - desktop_zip accept-stale (no zip in frontend/downloads)
  - SSH needs VPN off + LAN at deploy time
why_ready: >
  Tip fd416e40 includes UX-444 C+D, QA-445 A–H, UX-445I (nested composition collapsed).
  FE/BE tsc PASS. Full jest red = documented baseline only (FE improved 8→6 fails).
  preflight.ps1 PASS with config.env+CREDENTIALS restored on this machine from _001.
  Warm deploy.ps1 only (WIPE=false). Desktop accept-stale. §F not run.
```

## Для агента деплоя

1. `status` = **READY** → можно.
2. `git fetch` && `git checkout main` && `git pull --ff-only`.
3. `git merge-base --is-ancestor fd416e40 HEAD` must succeed; deploy from **tip HEAD**.
4. VPN **off**. Confirm `deploy/synology/config.env` + `CREDENTIALS.md` exist on the deploy machine (not in git).
5. `.\deploy\synology\deploy.ps1` (no `-Wipe`).
6. Smoke per `deploy/synology/README.md`. Then set this stamp `INVALID` + commit.
