# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою»).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod до деплоя: `c8ebdeb6` (2026-08-11).

```yaml
status: READY
deploy_sha_target: 4108d191a39aa9d792ee8dceecbf7d46f9d8bc61
prepared_at: 2026-08-23T17:55:00+03:00
prepared_by: cursor-orchestrator
evidence: docs/agent-checklists/PRE-DEPLOY-2026-08-23.md
known_debt:
  - backend catalog-314.archive.spec.ts (baseline)
  - backend users-admin.controller.spec.ts (baseline)
  - KP manual smoke 10-step — PO browser (VPN/dev-server)
  - keyboard-only-pass — PO optional
  - workspace/proposal-create inset sweep deferred (DEN-505.done.md)
desktop_zip: stale — verify before Desktop link
mixed_commits: false
why_ready: >
  Closeout 410+354+505 on main; FE 1958/1958; DEN-505 desk inset fixed.
  PO spot-check /desk /proposals/workspace /production before «кати».
```
