# PRE-DEPLOY — 2026-09-03 (READY)

**deploy_sha_target:** `99a040e4d08b0aa3d0639b2474ef3067beeb1f3c`
**prepared_at:** 2026-09-03T21:55:00+03:00
**prepared_by:** claude (executor, TZ-OPS-DEPLOY-PREP-2026-09-03)
**PO smoke:** done by Cursor (browser) during this prep — see `docs/agent-checklists/SMOKE-2026-09-03-CURSOR.md`
**desktop_zip:** accept-stale (no installer zip in `frontend/downloads/`; web warm only — unchanged since 2026-08-27)

### Preflight Check Output

- **Context read:** `deploy/synology/README.md`, `tasks/PROMPT-DEPLOY-READY.md`, `tasks/_ready/TZ-OPS-DEPLOY-PREP-2026-09-03.md`, `docs/agent-checklists/DEPLOY-READY.md`, `docs/agent-checklists/PRE-DEPLOY-2026-08-27.md`
- **Key Constraints:** warm only (`WIPE=false`); no `deploy.ps1` / SSH-write / wipe in this prep session; docs + mini-fix only if gates red outside baseline
- **Planned Deliverable:** READY stamp on tip `main` after KP Family S40–S48, ARCH cross-page imports, lint slice-2/slice-3
- **Validation Path:** full tsc/jest/lint/architecture:check (BE+FE) + `nx build kppdf-web`

## Gates on HEAD `99a040e4`

| Gate | Result |
|------|--------|
| `main` tip | `99a040e4` (lint:ui-tokens slice-3) |
| BE tsc (`tsconfig.build.json --noEmit`) | **PASS** |
| BE full jest | **126 suites / 1157 tests PASS** (0 fail) |
| BE lint | **0 errors**, 197 warnings (`no-explicit-any`, baseline debt) |
| FE tsc (`tsconfig.app.json --noEmit`) | **PASS** |
| FE full jest | **196 suites / 2091 tests PASS** (0 fail) |
| FE lint (eslint + `lint:ui-tokens`) | **0 errors**, 17 warnings (`no-implements-oninit-in-pages`, baseline debt); `lint:ui-tokens` **0 violations** (was 35 before this session's slice-3, `99a040e4`) |
| root `architecture:check` | **PASS** — 1396 files; baseline 17 keys; **15 live** (all `fe-page-cross-component`, unchanged debt); **2 resolved since baseline** (`materials/material-form-dialog.component.ts:52`, `products/product-form-dialog.component.ts:52` — fixed by `305eec58`) |
| `frontend-nx` `nx build kppdf-web` | **PASS** (5/5 tasks, local cache) — only pre-existing budget/`NG8102` warnings, no errors |
| `_active` XOR archive | PASS — `_active/` cleared to `.gitkeep` after this TZ's archive |
| Browser smoke (Cursor, this session) | legacy `:4200` clean login, no TS overlay after dev-server restart; NX `:4201` login + `/proposals` + `/orders` (data) + `/studio` editor OK — see `SMOKE-2026-09-03-CURSOR.md` |
| preflight.ps1 (SSH/tooling probe) | **not run** — out of scope for this prep session per explicit no-SSH instruction; deploy agent runs it per `deploy/synology/README.md` at deploy time |

## Transient blocker investigated (non-issue)

Peer session reported a browser TS2304 overlay (`CategoryFormDialogComponent` not found,
`product-form-dialog.component.ts:808`) via a stale `:4200` dev server. Verified: `tsc`
clean, target file/export exist and predate `305eec58`, focused jest green (4 suites/54
tests). Root cause was the running dev-server process (PID 29524, not started by this
session), not a source defect — confirmed by peer after a hard restart: clean login, no
overlay. No code change was needed or made for this.

## §Debt (baseline — do not fix in deploy)

```text
Проверено на: 99a040e4  date: 2026-09-03T21:55:00+03:00
BE: no-explicit-any warnings (197, pre-existing, multiple modules)
FE: no-implements-oninit-in-pages warnings (17, pre-existing pages, see lint output)
architecture: 15× fe-page-cross-component (commercial/proposals/* + desk/manager-desk +
  supply/supply-quick-order → materials/products/organizations/counterparties/modules/
  desktop/doc-constructor dialogs) — unchanged from before this wave; 2 baseline keys
  (materials, products form-dialogs) resolved by 305eec58, not re-broken
```

## Wave since prior READY `fd416e40` / last deployed tip `4d55d0ea`

KP Family NX S40–S48 (types/API/hide-variants/expand/attach-orgs/sync/variant-studio/
convert-guard/operator-docs), Sales NX S30–S39 canon, Contract file wave C1–C5, Auth RBAC
ROLE-PERMS, nested-i18n validation, catalog BOM-in-tree, QA Gates Q1–Q4b, ARCH cross-page
imports fix (`305eec58`), `no-raw-ui-values` lint slice-2 (`87499100`), `lint:ui-tokens`
slice-3 (`99a040e4`). 503 non-spec `.ts` files changed since `fd416e40` — full BE+FE test
suites (not just diff-derived subset) run and green, exceeding the incremental
spec-coverage check.

## Agent deploy instructions (for next chat)

1. Stamp READY below → `git pull --ff-only` on `main`
2. VPN **off**, LAN to `192.168.1.103:22`
3. `.\deploy\synology\deploy.ps1` (**no** `-Wipe`)
4. Smoke per `deploy/synology/README.md`
5. Set stamp INVALID + commit

§F not run (no wipe).
