# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою»).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod до деплоя: `c8ebdeb6` (2026-08-11).

```yaml
status: READY
# Product fix @ 828ccb9f; tip may be +docs. Deploy tip after pull.
# Ancestor check: deploy_sha_target ≤ HEAD.
deploy_sha_target: 828ccb9fca2c3b66acd7306e763842d3b4db24ab
prepared_at: 2026-08-24T00:10:00+03:00
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
  SUPPLY-320 on main: live material categories (Комплектующие/Металлы),
  backend categoryId string|ObjectId filter, no mock categories in picker,
  empty category = all materials. Gates: FE supply 47, BE material 30,
  supply-smoke 23 PASS. §F deploy not run. VPN off. Warm deploy.ps1 only.
```
