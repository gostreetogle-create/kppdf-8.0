# WAVE — Doc Studio FINISH S27→S37

Status: **S41 CONFIRMED PASS (live) · S37 AC2 CONFIRMED FAIL (live, root cause found)** · 2026-09-04  
Live closeout evidence: `docs/audits/2026-09-04-docstudio-s37-s41-live-closeout.md`  
Earlier evidence: `docs/audits/2026-09-04-docstudio-finish-smoke.md`  
S37B: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S37B-COUNTERPARTY-TOKEN-PREVIEW.done.md`  
S41: `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S41-VITRINA-ADD-UX.done.md`  
**New hotfix: `tasks/_ready/TZ-NX-DOCSTUDIO-S37C-PREVIEW-BLOCK-LAYOUT-DROP.md`** (backend, root cause pinpointed)

## Волна A–C (S27–S36, S38–S40)

| # | TZ | Status |
|---|-----|--------|
| 01–13 | S27–S36, S38–S40 | [x] archived on main |
| 14 | S37 OPERATOR-SMOKE | **FAIL (AC2), live-confirmed** — back in `tasks/_ready/`, blocked on S37C |
| 15 | S37B | [x] DONE |
| 16 | S41 VITRINA-ADD-UX | [x] DONE `9f348118` — **live-confirmed PASS** this session (headless Chromium: 3 rapid adds, no conflict dialog, remove works) |
| 17 | S37C PREVIEW-BLOCK-LAYOUT-DROP | **new, in `_ready/`** — `applyTableAggregateTokensToBlocks` spreads a raw Mongoose Document (`{...block}`) without `.toObject()`, silently dropping `layout` for every text block → studio-canvas Preview/PDF renders an empty stage |

## Closeout

- [x] S27–S40 + S37B + S41 archived
- [x] `_active/` пуст (S37 returned to `_ready`, not left claimed)
- [ ] S37C hotfix (backend) → then re-run S37 AC2 live check → archive S37 DONE
- [ ] operator-bar — depends on S37C + S37 live closeout above
- [x] QUEUE/_NOW updated after this session

## Note for next session

The frontend-nx dev server (:4201) had gone stale for ~24h (last restart 2026-09-03,
before all of today's work) — Vite's watcher silently stopped picking up file changes.
**Restart `frontend-nx` (`pnpm start`) before any live browser check**, or you're
testing yesterday's code. Confirmed and fixed this session; see the live-closeout audit
for the exact symptom (old md-size vitrina cards, no Add/Remove buttons, despite S41
being on main).
