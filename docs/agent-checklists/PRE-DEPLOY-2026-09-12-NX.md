# PRE-DEPLOY — 2026-09-12 (NX, post PO-SWEEP + desktop verify)

**Goal:** refresh the stale `DEPLOY-READY.md` stamp (`deploy_sha_target: d76e4fa7`,
prepared 2026-09-08) to tip `main` after `WAVE-NX-PO-SWEEP-2026-09-12` COMPLETE
(`41c758d0`) and `TZ-DESKTOP-FULL-VERIFY-2026-09-12` COMPLETE (`73e335c3`).
NX cutover itself is already closed (`TZ-OPS-DEPLOY-NX-STATIC`, see prior
evidence `PRE-DEPLOY-2026-09-07-NX.md`) — this is a **prep refresh**, no
`deploy.py`/pipeline code changed.

**deploy_sha_target:** `73e335c3`
**prepared_at:** 2026-09-12T18:00:00+03:00
**prepared_by:** claude (executor) — full gates green on tip, stamp refreshed
**frontend_target:** `nx` (unchanged)
**wipe_default:** `false` (warm — unchanged, canon default per `DEPLOY-NX-PROD.md` §2)
**desktop_zip:** `accept-stale` (v0.5.10) — from `TZ-DESKTOP-FULL-VERIFY-2026-09-12` (`73e335c3`), see `docs/audits/2026-09-12-desktop-full-verify.md`

### Preflight Check Output

- **Context read:** `docs/ops/DEPLOY-NX-PROD.md`, `docs/agent-checklists/DEPLOY-READY.md`, `docs/agent-checklists/PRE-DEPLOY-2026-09-07-NX.md` (template/precedent), `docs/agent-checklists/DESKTOP-VERIFY-2026-09-12.md`, `docs/audits/2026-09-12-desktop-full-verify.md`, `tasks/PROMPT-CLAUDE-DEPLOY-PREP-NX.md`
- **Key Constraints:** prep only — no deploy.ps1, no wipe, no SSH; warm stays canon default; stamp must move to tip HEAD, not an intermediate SHA
- **Planned Deliverable:** full gates green evidence on tip `73e335c3` + refreshed `DEPLOY-READY.md` (new `deploy_sha_target`, `prepared_at`, `evidence` path)
- **Validation Path:** gate commands below; no code changed, so no new tests needed beyond re-running existing suites

## Data decision (unchanged from 2026-09-07)

| Check | Result |
|-------|--------|
| Same Nest API / Mongo DB name `kppdf` | yes |
| Schemas since prod `4d55d0ea` | additive only (Supply/Warehouse/Photos/Studio/Contract fields — no drop) |
| Breaking migration requiring empty DB | not identified |
| New schema changes since `d76e4fa7` (previous prep tip) | none — the `d76e4fa7`→`73e335c3` range is PO-SWEEP (studio UX/canvas/chrome-rail) + desktop verify (test-only), no BE schema touched |
| **Default deploy flag** | **`WIPE=false` (warm)** |
| Wipe escalate | only if health/login fails post-warm **or** PO: `да, разрешаю wipe после бэкапа` |

## Gates (tip `73e335c3`)

| Gate | Result |
|------|--------|
| `main` tip | `73e335c3` (`git merge-base --is-ancestor` trivially true — it *is* HEAD) |
| BE `tsc -p tsconfig.build.json --noEmit` | PASS — 0 errors |
| BE `pnpm test` | PASS — 133 suites / 1318 tests |
| BE `pnpm lint` | PASS — 0 errors, 202 warnings (pre-existing `no-explicit-any` baseline, was 198 in the 2026-09-07 prep — small drift from PO-SWEEP/desktop-verify test additions, not a new debt category) |
| FE-NX `nx build kppdf-web` | PASS — cache-hit on unchanged tip (last real build ran during PO-SWEEP stage closeout at this same SHA); 2 pre-existing warnings (NG8102 in `studio-table-properties.component.ts`, CSS budget on `gantt-bars.component.ts`), 1 pre-existing initial-bundle-budget warning (+3.27kB, from `@kppdf/ui/photo` reuse in #05/#06) |
| FE-NX `nx test kppdf-web` | PASS — 119 suites / 836 tests (7 skipped), 0 failed |
| `pnpm architecture:check` | PASS — 1486 files; baseline 17; resolved since baseline: 2 |
| `_active` empty | PASS — `tasks/_active/` only `.gitkeep` |

## §Debt (found, not blocking — out of this prep's gate scope)

`nx lint kppdf-web` was run as an extra check (not in this task's explicit
gate list, which only names backend lint + frontend-nx build/tests) and
found **38 pre-existing errors** (mostly `@angular-eslint/template`
accessibility rules — `click-events-have-key-events`,
`interactive-supports-focus`, one `label-has-associated-control`, one
`eqeqeq`) across 6 files: `studio-table-properties.component.ts`,
`studio-text-properties.component.ts`, `studio-workspace-shell.component.html`,
`supply-requests.page.ts`, `supply.page.ts`, `storage-items.page.ts`,
`warehouses.page.ts`. Verified via `git log -- <file>` that **none of the
flagged lines were touched by any PO-SWEEP or desktop-verify commit this
session** — confirmed pre-existing baseline debt, not a regression from
`d76e4fa7`→`73e335c3`. Not fixed here: out of conflict-key scope for this
prep, and this task's own gate list did not request FE lint. Flagging for
PO visibility / a future dedicated TZ, not blocking `READY`.

## Blockers before READY

None. All required gates green; the FE-lint finding above is documented
debt, not a blocker (deploy canon requires build+tests, not lint-as-error
parity for frontend-nx in this task's own gate list).

## Agent deploy instructions (after READY)

1. VPN **off**, LAN → `192.168.1.103:22`
2. `.\deploy\synology\deploy.ps1` (**no** `-Wipe`)
3. Smoke: `docs/ops/DEPLOY-NX-PROD.md` §4
4. Stamp → `INVALID` + `why_invalid: deployed <sha> <date>` + commit

§F wipe: **not planned**.
