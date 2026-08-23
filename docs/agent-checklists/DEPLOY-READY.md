# DEPLOY-READY — живой штамп

> Единственный «светофор» перед деплоем.  
> Пишет подготовка («подготовь к деплою»).  
> Читает любой ИИ по `deploy/synology/README.md` → «сделай деплой по документации».
>
> Prod до деплоя: `c8ebdeb6` (2026-08-11).

```yaml
status: READY
# Гейты прогнаны на ancestor; tip main = deploy target после pull.
deploy_sha_target: 828ccb9f
prepared_at: 2026-08-24T00:05:00+03:00
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
  Tip 828ccb9f: SUPPLY-320 material categories wired to the live catalog
  (backend ?categoryId= filter matched only ObjectId while PATCH persisted a
  string; picker read only the API cache; mock categories polluted the
  dropdown). Gates on tip: FE supply specs 47 PASS + tsc, BE material 30 PASS,
  supply-gate focused jest 58 PASS, supply-smoke 23 PASS on :3000.
  §F deploy not run. Deploy agent: README only — no jest/tsc. VPN off.
```