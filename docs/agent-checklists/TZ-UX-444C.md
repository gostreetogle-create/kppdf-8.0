# TZ-UX-444C checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-UX-444C.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff-1
- claimed_at: 2026-08-27T18:18:25Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — Team Room не в этой сессии; claim в marker/checklist

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — 445E чужой CLAIM (gantt), keys disjoint
- [x] TZ / канон / deps прочитаны (444A DONE, status-banner exists)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → DONE
- [x] `tasks/_active/TZ-UX-444C.md` был на месте (removed at archive)

### Preflight Check Output
- **Context read:** `tasks/TZ-UX-444C-catalog-banner-info-links.md`; `docs/PO-CANON.md`; `docs/AI-UI-CONTRACT.md`; `docs/pages/product-detail.page.md`; `docs/pages/material-detail.page.md`; `frontend/src/app/shared/ui/status-banner/status-banner.component.ts`; `frontend/src/app/pages/products/product-detail.page.ts`; `frontend/src/app/pages/materials/material-detail.page.ts`; `frontend/src/app/pages/orders/order-detail.page.ts` (banner pattern); `docs/GIT-POLICY.md`; `docs/FEATURE-INTEGRATION-CHECKLIST.md` §G
- **Key Constraints:** Claim + conflict keys; no styles.css token values; material banner skip; no 445E zone
- **Planned Deliverable:** product banner tones; data-link info classes; AI-UI + page.md; focused jest
- **Validation Path:** FIC §G Integrity + FE tsc/jest/eslint owned files

## Acceptance

- [x] Product status banner via app-pi-status-banner (draft/archived/new; active = no banner)
- [x] Data-links → text-info pattern on product-detail + material-detail
- [x] AI-UI-CONTRACT one-liner; page.md; focused jest + tsc

## Integrity slot (до READY / archive)

- [x] FIC §G: page.md updated; AI-UI-CONTRACT; PAGE-TZ-INDEX already listed 444C; coupling N/A (status display only, no meaning change)
- [x] No backend / styles.css token edits / price history / gantt

## Gates (факт)

- FE tsc (`tsconfig.app.json --noEmit`) → PASS
- Jest product-detail + material-detail → 2 suites / 17 tests PASS
- ESLint 4 owned files → PASS
- Prettier owned product-detail files → write/check clean
- Deploy: NO

## Executor report

- DONE: product draft/archived/new banners; active silent; material/product data-links = text-info; docs + tests.
- Archive: `tasks/_archive/2026-08/TZ-UX-444C.done.md`
- Lock: `.mimocode/locks/TZ-UX-444C-catalog-banner-info-links.lock`
- Active marker removed.
