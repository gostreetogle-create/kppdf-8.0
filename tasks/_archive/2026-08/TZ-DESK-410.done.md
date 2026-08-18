═══════════════════════════════════════════════════════════════
TZ-DESK-410: очередь стола — search/filter/sort (reuse /orders)
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/codebuff-freebuff

result:
- Toolbar debounced search (`desk-search-input`) reuses `createSearchState`; matches number, client (lookup name/shortName/inn), deliveryAddress, notes.
- L flyout `filter`: status multi-select (checkbox per status) + presets «Активные» (default) / «Все» + «Обновить» → `listRes.reload()`.
- L flyout `summary`: read-only counts by status computed from loaded orders (search set, no status filter), no new API.
- Default sort: date/created/updated desc (stable); «ещё N» slice pagination (20 → +20).
- `?status=` persists (comma-separated, `all` token; absent/empty = «Активные» = confirmed/in_production/ready).
- Default view excludes draft/shipped/cancelled/delivered (business-sense active queue).

verification:
  - acceptance criteria: PASS (search/filter/sort without /orders; default ≠ все)
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (manager-desk 12/12; orders.page 17/17 — 29 total desk/orders scope)
  - lint: PASS (eslint manager-desk.page.ts + spec, 0 errors)
  - checklist: DONE
  - deploy/wipe: not run (VPN off)

commit: pending
