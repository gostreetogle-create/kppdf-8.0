# PRE-DEPLOY — 2026-09-07 (NX cutover prep)

**Goal:** после закрытия `TZ-OPS-DEPLOY-NX-STATIC` + гейтов штамп READY, чтобы любой агент по фразе  
«сделай деплой по документации» выкатил **NX** warm без правок кода.

**deploy_sha_target:** _(заполнит executor после cutover — полный HEAD)_  
**prepared_at:** 2026-09-07T22:30:00+03:00  
**prepared_by:** Cursor (architect) — **pipeline ещё BLOCKED** до Claude executor  
**frontend_target:** `nx` (обязательно)  
**wipe_default:** `false`  
**desktop_zip:** accept-stale (web warm; пересборка installer — только по слову PO)

### Preflight Check Output

- **Context read:** `docs/ops/DEPLOY-NX-PROD.md`, `docs/ops/DANGEROUS-OPS.md`, `deploy/synology/README.md`, `deploy/synology/deploy.py`, `docker-compose.prod.yml`, `docs/agent-checklists/DEPLOY-READY.md`, `docs/agent-checklists/PRE-DEPLOY-2026-09-03.md`, `tasks/PROMPT-DEPLOY-READY.md`, `frontend-nx/apps/kppdf-web/project.json`, `frontend-nx/apps/kppdf-web/src/app/app.config.ts`
- **Key Constraints:** prod UI = NX; warm Mongo by default; no deploy/wipe in prep; secrets local only
- **Planned Deliverable:** NX static in deploy.py + READY stamp on tip main
- **Validation Path:** PROMPT-CLAUDE-DEPLOY-PREP-NX gates + `nx build kppdf-web`

## Data decision (locked)

| Check | Result |
|-------|--------|
| Same Nest API / Mongo DB name `kppdf` | yes |
| Schemas since prod `4d55d0ea` | additive (SupplyRequest fields, Warehouse.isDefault, photos, studio, contracts, …) |
| Breaking migration requiring empty DB | **not identified** |
| **Default deploy flag** | **`WIPE=false` (warm)** |
| Wipe escalate | only if health/login fails post-warm **or** PO: `да, разрешаю wipe после бэкапа` |

## Blockers before READY

| # | Blocker | Owner |
|---|---------|-------|
| 1 | `deploy.py` still builds legacy FE | `TZ-OPS-DEPLOY-NX-STATIC` |
| 2 | Full BE+FE+architecture gates on tip HEAD | Claude prep prompt |
| 3 | Stale stamp READY on `7eac057c` (pre-NX waves) | invalidate → re-stamp |
| 4 | `preflight.ps1` SSH probe | deploy agent at deploy time (VPN off) |

## Gates (executor fills)

| Gate | Result |
|------|--------|
| `main` tip | |
| BE tsc | |
| BE jest | |
| BE lint | |
| FE tsc (legacy, still required until cutover policy says otherwise) | |
| FE jest | |
| FE lint | |
| `architecture:check` | |
| `nx build kppdf-web` | |
| `_active` XOR archive | |
| deploy.py ships NX → `frontend/browser/` | |

## §Debt

_(executor: only baseline warnings, no silent product fixes)_

## Agent deploy instructions (after READY)

1. VPN **off**, LAN → `192.168.1.103:22`
2. `.\deploy\synology\deploy.ps1` (**no** `-Wipe`)
3. Smoke: `docs/ops/DEPLOY-NX-PROD.md` §4
4. Stamp → `INVALID` + commit

§F wipe: **not planned**.
