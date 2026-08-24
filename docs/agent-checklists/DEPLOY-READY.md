# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою»).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod до деплоя: `c8ebdeb6` (2026-08-11).

```yaml
status: READY
deploy_sha_target: 565c630d0ba94b00b4e3b4890b366e4f6e09cf5e
prepared_at: 2026-08-24T23:52:00+03:00
prepared_by: cursor-orchestrator
evidence: docs/agent-checklists/PRE-DEPLOY-2026-08-24-wave.md
known_debt:
  - backend catalog-314.archive.spec.ts (baseline)
  - backend users-admin.controller.spec.ts (baseline)
  - FE jest 56 failures (baseline — orders/workspace/terms/materials)
  - architecture:check fe-page-cross-component (material-form-dialog imports)
  - BE pnpm lint unused-imports (not a READY gate)
  - desktop_zip accept-stale (TZD-67)
  - PO browser smoke AUDIT-530 deferred
mixed_commits: true
why_ready: >
  PO smoke wave on main: SUPPLY-431 3-col quick order + org promote,
  KP substitutions/BIND-513, PiSelectAddRow, desk fixes, dev build badge.
  FE/BE tsc PASS; supply-gate + supply-smoke 23/23 PASS on local stand.
  §F deploy not run. VPN off. Warm deploy.ps1 only.
```
