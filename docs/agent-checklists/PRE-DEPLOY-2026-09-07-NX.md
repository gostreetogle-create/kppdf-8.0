# PRE-DEPLOY — 2026-09-07 (NX cutover prep)

**Goal:** после закрытия `TZ-OPS-DEPLOY-NX-STATIC` + гейтов штамп READY, чтобы любой агент по фразе  
«сделай деплой по документации» выкатил **NX** warm без правок кода.

**deploy_sha_target:** заполнено в `DEPLOY-READY.md` (executor commit, см. archive TZ-OPS-DEPLOY-NX-STATIC)  
**prepared_at:** 2026-09-08T04:00:00+03:00  
**prepared_by:** claude (executor) — pipeline switched to NX, full gates green, stamp READY  
**frontend_target:** `nx` (обязательно)  
**wipe_default:** `false`  
**desktop_zip:** свежий — `frontend/downloads/kppdf-desktop-setup-v0.5.10.exe` найден и опубликован локальным `build_frontend()` прогоном (не stale; accept-stale остаётся каноном на случай будущего дрейфа)

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

| # | Blocker | Owner | Status |
|---|---------|-------|--------|
| 1 | `deploy.py` still builds legacy FE | `TZ-OPS-DEPLOY-NX-STATIC` | **CLOSED** — `build_frontend()` now `nx build kppdf-web` |
| 2 | Full BE+FE+architecture gates on tip HEAD | Claude prep prompt | **CLOSED** — all green, see table below |
| 3 | Stale stamp READY on `7eac057c` (pre-NX waves) | invalidate → re-stamp | **CLOSED** — re-stamped this run |
| 4 | `preflight.ps1` SSH probe | deploy agent at deploy time (VPN off) | open — deploy-time only, out of prep scope |

## Gates (executor fills)

| Gate | Result |
|------|--------|
| `main` tip (pre-cutover-commit) | `ce5d2bc3` |
| BE tsc | PASS — clean, 0 errors |
| BE jest | PASS — 130 suites / 1257 tests |
| BE lint | PASS — 0 errors, 198 warnings (pre-existing `no-explicit-any` baseline) |
| FE tsc (legacy, still required until cutover policy says otherwise) | PASS — clean, 0 errors |
| FE jest | PASS — 196 suites / 2091 tests |
| FE lint | PASS — 0 errors, 17 warnings (pre-existing `no-implements-oninit-in-pages` baseline) + UI token check passed |
| `architecture:check` | PASS — 1465 files; baseline 17; resolved since baseline: 2 |
| `nx build kppdf-web` | PASS — 2 pre-existing baseline warnings (NG8102 nullish-coalescing in `studio-table-properties.component.ts`; CSS budget on `gantt-bars.component.ts`), no errors |
| `_active` XOR archive | PASS — `tasks/_active/TZ-OPS-DEPLOY-NX-STATIC.md` removed at closeout, archived under `tasks/_archive/2026-09/` |
| deploy.py ships NX → `frontend/browser/` | PASS — ran `build_frontend()` locally (`python -c "...deploy.build_frontend(...)"`): `frontend-nx/dist/apps/kppdf-web/browser/index.html` built, copied byte-identical into `frontend/browser/index.html` (contains `kppdf-web` marker, not legacy Angular title), `publish_desktop_installer` found and published a **fresh** `v0.5.10` installer (not stale) |

## §Debt

None introduced by this TZ. Pre-existing baseline-only: BE 198 `no-explicit-any` warnings, FE 17 `no-implements-oninit-in-pages` warnings, NX build 2 pre-existing bundle/template warnings (unrelated files, untouched by this TZ).

## Agent deploy instructions (after READY)

1. VPN **off**, LAN → `192.168.1.103:22`
2. `.\deploy\synology\deploy.ps1` (**no** `-Wipe`)
3. Smoke: `docs/ops/DEPLOY-NX-PROD.md` §4
4. Stamp → `INVALID` + commit

§F wipe: **not planned**.
