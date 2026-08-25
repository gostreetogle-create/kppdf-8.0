# TZ-SUPPLY-443 — Org add button canon

## Claim
- **agent_id:** freebuff-executor
- **claimed_at:** 2026-08-26T00:27:51+03:00
- **workspace:** D:\kppdf-8.0

## Acceptance Criteria
- [ ] On `/supply` quick order → expand row → "Организация" → `+` = green square like Категория/Материал (not plain text)
- [ ] Dropdown on `+` works (supplier menu)
- [ ] `pi-select-add-btn` styles are in live `src/styles.css` (SoT)
- [ ] No duplicate styles in component or dead `src/app/styles.css`
- [ ] `pi-focus-ring` on supply org add button
- [ ] `AI-UI-CONTRACT.md` updated with PiSelectAddBtn row

## Integrity Checks
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [ ] `cd frontend && pnpm exec jest src/app/pages/supply/supply-quick-order.component.spec.ts src/app/shared/ui/select-add-row/pi-select-add-row.component.spec.ts --no-coverage --runInBand` — PASS
- [ ] `cd frontend && pnpm lint` — 0 new errors
- [ ] `pnpm architecture:check` — 0 new violations

## Gate Results
( filled after implementation )

## Report
( filled after implementation )

## Status
**CLAIMED**
