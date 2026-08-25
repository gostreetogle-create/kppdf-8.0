# TZ-SUPPLY-443 — Org add button canon

## Claim
- **agent_id:** freebuff-executor
- **claimed_at:** 2026-08-26T00:27:51+03:00
- **workspace:** D:\kppdf-8.0

## Acceptance Criteria
- [x] On `/supply` quick order → expand row → "Организация" → `+` = green square like Категория/Материал (not plain text)
- [x] Dropdown on `+` works (supplier menu)
- [x] `pi-select-add-btn` styles are in live `src/styles.css` (SoT)
- [x] No duplicate styles in component or dead `src/app/styles.css`
- [x] `pi-focus-ring` on supply org add button
- [x] `AI-UI-CONTRACT.md` updated with PiSelectAddBtn row

## Integrity Checks
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `cd frontend && pnpm exec jest src/app/pages/supply/supply-quick-order.component.spec.ts src/app/shared/ui/select-add-row/pi-select-add-row.component.spec.ts --no-coverage --runInBand` — PASS 46/46
- [x] `cd frontend && pnpm lint` — 0 new errors (17 pre-existing warnings)
- [x] `pnpm architecture:check` — 0 new violations (2 pre-existing: material-form-dialog, product-form-dialog)

## Gate Results
| Gate | Result |
|------|--------|
| tsc | PASS |
| jest (supply + select-add-row) | PASS 46/46 |
| lint | 0 errors |
| architecture:check | 0 new violations |
| SUPPLY-GATE | PASS 58/58 |
| pre-push typecheck | PASS |

## Report
Commit `a95b1ea9` — `fix(supply): pi-select-add-btn global styles — org + button canon (TZ-SUPPLY-443)`
Pushed to `origin/main`. Visual smoke pending dev stack.

## Status
**DONE**
