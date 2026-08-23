# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою»).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod до деплоя: `c8ebdeb6` (2026-08-11).

```yaml
status: READY
# Гейты прогнаны на ancestor; tip main = deploy target после pull.
deploy_sha_target: b683e178b58b69e911cc75aa75d0e56ff95744b4
prepared_at: 2026-08-23T23:35:00+03:00
prepared_by: cursor-orchestrator
evidence: docs/agent-checklists/PRE-DEPLOY-2026-08-23-evening.md
known_debt:
  - backend catalog-314.archive.spec.ts (baseline)
  - backend users-admin.controller.spec.ts (baseline)
  - BE pnpm lint unused-imports (not a READY gate)
  - desktop_zip accept-stale (TZD-67 on HEAD; zip not rebuilt)
  - KP/supply browser smoke — PO optional after warm
mixed_commits: false
why_ready: >
  Tip b683e178: SUPPLY-318 strict category picker + full material edit dialog.
  Prior gates on ancestor; supply smoke PASS on commit. §F deploy not run.
  Deploy agent: README only — no jest/tsc. VPN off. Warm deploy.ps1.
```