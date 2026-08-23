# PRE-DEPLOY — 2026-08-23

> Target SHA for warm deploy. **Deploy not executed** (§F empty).

```yaml
deploy_sha_target: 4108d191a39aa9d792ee8dceecbf7d46f9d8bc61
prepared_at: 2026-08-23T17:55:00+03:00
prepared_by: cursor-orchestrator
prod_before: c8ebdeb6 (2026-08-11)
```

## Delta themes (c8ebdeb6..c6ec9981)

- KP Single Workspace wave 401–409 DONE; `/proposals/create` = workspace
- DEN-552 KP workspace density; panel hairline fix
- **KP-WS-410** empty viewport hotfix + deals chip
- **PRODUCTION-354** gantt truncated-label-peek
- UI canon: AI-UI-CONTRACT, truncated-label-peek, KP-WORKSPACE-SMOKE checklist

## Gates (HEAD c6ec9981)

| Gate | Result |
|------|--------|
| FE `tsc -p tsconfig.app.json` | PASS |
| FE `pnpm test` | **1958/1958** PASS |
| FE `pnpm lint` | PASS (0 errors, 17 warnings baseline) |
| BE `tsc -p tsconfig.build.json` | PASS |
| BE `pnpm test` | **968/970** — 2 baseline failures (§Debt) |
| `pnpm architecture:check` | PASS (992 files) |

## §Debt (baseline — do not fix in deploy-prep)

- `backend/src/modules/catalog/catalog-314.archive.spec.ts` (~L79)
- `backend/src/modules/admin/users-admin.controller.spec.ts` (~L114)

## §F Deploy

**Not run.** No `deploy.ps1`, SSH, or wipe.

## PO before «кати»

1. Browser: `/desk`, `/proposals/workspace?new=1`, `/production` (gantt peek)
2. **DEN-505** framed inset — queued (`PROMPT-FREEBUFF-DEN-505.md`)
3. `UI-DENSITY-GUARDS.md` 5-route sign-off
4. `keyboard-only-pass.md` scenarios A/B (optional gate)

## Desktop

Not rebuilt this session — check `desktop/` delta vs last zip before installer link.
