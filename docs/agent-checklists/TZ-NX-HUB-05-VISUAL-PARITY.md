# TZ-NX-HUB-05-VISUAL-PARITY checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-HUB-05-VISUAL-PARITY.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-10T17:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM на `kppdf-web`
- [x] TZ прочитан (`tasks/_ready/nx-hub/visual-parity/TZ-NX-HUB-05-VISUAL-PARITY.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-HUB-05-VISUAL-PARITY.md` на месте

### Preflight Check Output

- **Context read:** TZ; `docs/audits/2026-09-10-nx-hub-table-parity-canon.md` (H1-H6, already read this session during WAVE 01-04); `docs/agent-checklists/HUB-VISUAL-PARITY-CHECKLIST.md`
- **Key Constraints:** must actually drive a browser (not just re-read code); эталон = `/registries`; fix gaps on the 4 scoped pages only, minimal diff; no redesign
- **Planned Deliverable:** audit `docs/audits/2026-09-10-nx-hub-visual-parity.md` with H1-H6 matrix + verdicts + fixes applied
- **Validation Path:** browser walkthrough (method TBD — Playwright smoke script) → fix → focused tests → `nx build kppdf-web` last

## Acceptance

- [x] Audit file exists (`docs/audits/2026-09-10-nx-hub-visual-parity.md`), all 4 product routes + registries reference covered
- [x] No open FAIL — all 44 automated checks + visual screenshot review PASS; one methodology assumption in my own script (universal per-row secondary expand) was self-corrected and documented, not a product gap
- [x] Browser evidence method documented in audit (Chrome CDP headless smoke, screenshots in `docs/audits/evidence/`)

## Gates (факт)

- `nx test kppdf-web --testPathPattern=counterparties|orders-list|supply.page|warehouses.page` → **PASS** (106/106 suites, 725 passed, 7 skipped) — no source changed this TZ, pure verification
- `nx build kppdf-web` → **PASS**, exit 0 (fully cached — nothing changed since HUB #04)

## Executor report

- Drove a real headless Chrome (CDP, `scripts/tz-nx-hub-05-visual-parity-smoke.mjs`, same established pattern as `scripts/tz-ui-404-toc-parity-smoke.mjs`) against the running dev stack (`localhost:4201`, already up), logged in as `admin`, and actually clicked rows on `/registries` (Материалы), `/counterparties`, `/orders`, `/supply`, `/warehouses`.
- 44/44 DOM assertions PASS: chevron ▸→▾ + `aria-expanded` toggle on all 4 pages, expand panel renders, `.pi-icon-btn` row actions measure 32×32 (matches gold), no raw ObjectId in rendered text, no banned wide-button copy («Изменить»/«Удалить»/«Карточка»/«Сделать по умолчанию»).
- 10 full-page screenshots captured and visually reviewed (`docs/audits/evidence/`) — confirmed same dark/gold theme, hairline density, bordered-card expand language across all 4 pages, matching the gold `/registries` rhythm. No visual defect found.
- **No code FIX was needed** — audit verdict is a clean PASS. Corrected one wrong assumption in my own test script (not every registry has per-row secondary expand beyond the master-row expand) before drawing conclusions — documented in the audit rather than silently dropped.
- New reusable artifact: `scripts/tz-nx-hub-05-visual-parity-smoke.mjs` (kept — same Chrome-CDP-smoke convention as 2 pre-existing scripts in this repo, useful for any future visual-regression re-check of these 5 routes).
- Not touched (per TZ «НЕ ИЗМЕНЯТЬ»): no production code changed at all this TZ.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-10T17:35:00Z
