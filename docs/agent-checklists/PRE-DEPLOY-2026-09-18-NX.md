# PRE-DEPLOY — 2026-09-18 (NX warm refresh)

**Goal:** refresh `DEPLOY-READY.md` after Auth smells + QA follow-up + KP list PDF
(`a2295b7f` tip after prep docs commit). Prior prod stamp was INVALID after
enroll deploy `9e1802fe` (2026-09-13). NX cutover already closed
(`TZ-OPS-DEPLOY-NX-STATIC`).

**deploy_sha_target:** (set to tip HEAD at stamp commit — see DEPLOY-READY.md)  
**prepared_at:** 2026-09-18T06:20:00+03:00  
**prepared_by:** cursor-architect (prep; gates run locally)  
**frontend_target:** `nx`  
**wipe_default:** `false` (warm — `DEPLOY-NX-PROD.md` §2)  
**desktop_zip:** `accept-stale` (v0.5.10) — files present in
`frontend/browser/downloads/` (`kppdf-desktop-setup.zip` + versioned);
`desktop/package.json` = `0.5.10`; no desktop code in this tip range → no rebuild.

### Preflight Check Output

- **Context read:** `docs/ops/DEPLOY-NX-PROD.md`, `docs/ops/DANGEROUS-OPS.md`,
  `docs/agent-checklists/DEPLOY-READY.md`, `docs/agent-checklists/PRE-DEPLOY-2026-09-12-NX.md`,
  `deploy/synology/README.md`, `tasks/PROMPT-DEPLOY-READY.md`
- **Key Constraints:** prep only — no `deploy.ps1`, no wipe, no SSH; warm default;
  tip must be ancestor of deploy after push
- **Planned Deliverable:** green gates + READY stamp + this evidence file
- **Validation Path:** commands below

## Data decision

| Check | Result |
|-------|--------|
| Same Nest API / Mongo `kppdf` | yes |
| Schemas since prod `4d55d0ea` / last warm `9e1802fe` | additive (Auth/UI/PDF client only this wave) |
| Breaking migration | not identified |
| **Default** | **`WIPE=false` (warm)** |
| Wipe escalate | only if health/login fails post-warm **or** PO: `да, разрешаю wipe после бэкапа` |

## Gates (tip product SHA `a2295b7f` + this docs stamp)

| Gate | Result |
|------|--------|
| `_active` empty | PASS (only `.gitkeep`) |
| BE `tsc -p tsconfig.build.json --noEmit` | PASS |
| BE `pnpm test` | PASS — 136 suites / 1373 tests |
| BE `pnpm lint` | PASS — 0 errors / 202 warnings (baseline `no-explicit-any`) |
| FE-NX `nx build kppdf-web --skip-nx-cache` | PASS — warnings only (NG8102, bundle budget ~504kB, gantt CSS budget) |
| FE-NX `nx test kppdf-web --skip-nx-cache` | PASS — 82 suites / 583 passed / 7 skipped |
| `pnpm architecture:check` | PASS — 1572 files; baseline 17; resolved +2 |

## §Debt (not blocking READY)

- FE `nx lint kppdf-web` historically has a11y template baseline errors (documented
  2026-09-12 prep) — not in this gate list; not re-opened.
- `POST /quotations/:id/generated-document` archive still Manual (PDF download path Verified).
- Untracked local junk (`Soup-*.zip`, `data/_tmp-*`) excluded from commits.

## Blockers before READY

None.

## Agent deploy instructions (after READY)

1. VPN **off**, follow `deploy/synology/README.md` «сделай деплой по документации»
2. `.\deploy\synology\deploy.ps1` (**no** `-Wipe`)
3. Smoke: `docs/ops/DEPLOY-NX-PROD.md` §4 (`/home` or `/orders`, `/registries`, `/studio`)
4. Stamp → `INVALID` + `why_invalid: deployed <sha> <date>` + commit

§F wipe: **not planned**.
