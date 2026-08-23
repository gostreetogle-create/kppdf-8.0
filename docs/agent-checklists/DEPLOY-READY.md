# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою»).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod до деплоя: `c8ebdeb6` (2026-08-11).

```yaml
status: READY
deploy_sha_target: 167865c9be944b3f9c4f6dd6154a960137ad477b
prepared_at: 2026-08-23T23:40:00+03:00
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
  HEAD 167865c9: FE 2015/2015, BE 969/971 (2 baseline), arch PASS,
  SUPPLY-316/317 + MECH/PLUS/KP-WS waves on main. §F deploy not run.
  Deploy agent: README only — no jest/tsc. VPN off. Warm deploy.ps1.
```
