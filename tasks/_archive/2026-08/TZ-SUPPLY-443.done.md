---
ARCHIVE_MARKER
task_id: TZ-SUPPLY-443
title: "Org add button canon — pi-select-add-btn global styles"
outcome: DONE
closed_at: 2026-08-26T00:35:00+03:00
sha: a95b1ea9b7fc568f835b5bcb10d49289e9dd1bf1
conflict_keys:
  - frontend/src/styles.css
  - frontend/src/app/styles.css
  - frontend/src/app/shared/ui/select-add-row/pi-select-add-row.component.ts
  - frontend/src/app/pages/supply/supply-quick-order.component.ts
  - frontend/src/app/pages/supply/supply-quick-order.component.spec.ts
  - docs/AI-UI-CONTRACT.md
---

## What changed
- `.pi-select-add-btn` visual styles moved to `src/styles.css` `@layer components` (SoT)
- `pi-select-add-row.component.ts`: kept grid layout only, removed duplicate visual styles
- `src/app/styles.css`: removed dead `.pi-select-add-btn` block
- Supply org "+" button now has `pi-focus-ring`
- +1 spec test (btn has `pi-select-add-btn` class)
- `AI-UI-CONTRACT.md`: PiSelectAddBtn row added

## Gates
| Gate | Result |
|------|--------|
| tsc | PASS |
| jest (supply-quick-order + select-add-row) | PASS 46/46 |
| lint | 0 errors (17 pre-existing warnings) |
| architecture:check | 2 pre-existing violations (not my files) |
| SUPPLY-GATE | PASS (58/58 backend) |
| pre-push typecheck | PASS |
