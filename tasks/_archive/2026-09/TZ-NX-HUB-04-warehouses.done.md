# TZ-NX-HUB-04-warehouses: expand contents + icon actions — `/warehouses`

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude
**ЗАВИСИМОСТИ:** `TZ-NX-HUB-03-supply` DONE
**LAYER:** 3 · **SIZE:** L
**PAGES:** `/warehouses`
**PAGE_DOCS:** `warehouses.page.md`

Source: `tasks/_ready/nx-hub/warehouses/TZ-NX-HUB-04-warehouses.md`.
Full checklist: `docs/agent-checklists/TZ-NX-HUB-04-warehouses.md`.
**Финал волны WAVE-NX-HUB-TABLE-PARITY (01–04 все DONE).**

## ЧТО СДЕЛАНО

1. ▸/▾ chevron + denser rows + expanded accent (mirrors 01–03).
2. Row actions: `app-pi-row-actions` (edit/delete) + standalone `★` default-toggle icon.
3. Inline expand: storage-items preview (≤8, honest empty/error) + deep-link chip to `/storage-items?warehouseId=`.
4. Specs + docs synced.

## Gates

- `nx test kppdf-web` → PASS (106/106, 725 passed, 7 skipped)
- `nx lint kppdf-web` → one new instance of a pre-existing, already-tolerated sibling pattern (disclosed in checklist)
- `nx build kppdf-web` → PASS, exit 0 (last command)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-10
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: PASS (one new instance of pre-existing tolerated pattern, disclosed)
  - checklist: ADDED
  - progress.md: N/A (redirect file)
  - status synchronization: PASS
