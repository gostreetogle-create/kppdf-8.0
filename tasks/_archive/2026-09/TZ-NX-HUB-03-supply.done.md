# TZ-NX-HUB-03-supply: dense registry table + compact actions — `/supply`

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude
**ЗАВИСИМОСТИ:** `TZ-NX-HUB-02-orders` DONE
**LAYER:** 3 · **SIZE:** L
**PAGES:** `/supply`
**PAGE_DOCS:** `supply.page.md`

Source: `tasks/_ready/nx-hub/supply/TZ-NX-HUB-03-supply.md`.
Full checklist: `docs/agent-checklists/TZ-NX-HUB-03-supply.md`.

## ЧТО СДЕЛАНО

1. ▸/▾ chevron + denser rows + expanded accent (mirrors HUB-02).
2. New «Создано» column; raw `orderLineId` subtitle removed from main column.
3. Row actions: one compact `.pi-outline-btn` per status (was wide `app-pi-button`).
4. Expand enriched: honest материал/модуль placeholders, ObjectId-masked line key, обновлено, order chip link.
5. Specs + docs synced.

## Gates

- `nx test kppdf-web` → PASS (106/106, 720 passed, 7 skipped)
- `nx lint kppdf-web` → zero new issues (pre-existing baseline unrelated)
- `nx build kppdf-web` → PASS, exit 0 (last command)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-10
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: PASS (touched file: no new issues)
  - checklist: ADDED
  - progress.md: N/A (redirect file)
  - status synchronization: PASS
