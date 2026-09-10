# TZ-NX-HUB-06-EXPAND-CARDS: expand-панели карточками как у заказчиков

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude
**ЗАВИСИМОСТИ:** `TZ-NX-SHELL-01-IDLE-RAILS` DONE

Source: `tasks/_ready/nx-shell-hub/TZ-NX-HUB-06-EXPAND-CARDS.md`.
Full checklist: `docs/agent-checklists/TZ-NX-HUB-06-EXPAND-CARDS.md`.
Audit: `docs/audits/2026-09-10-nx-hub-expand-cards.md`.

## ЧТО СДЕЛАНО

1. `/supply` expand → 4 gold-card sections (Позиция / Связь с заказом / Состав / Сроки и заметки).
2. `/warehouses` expand → 2 gold-card sections (О складе / Остатки).
3. `/orders` OrderHubTray verified — already gold markup, no change.
4. `/counterparties` untouched (reference).
5. Specs + audit + docs synced.

## Gates

- `nx test kppdf-web` → PASS (105/105, 726 passed, 7 skipped)
- `nx lint kppdf-web` → zero new issues
- `nx build kppdf-web` → PASS, exit 0 (last command)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-10
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: PASS
  - checklist: ADDED
  - progress.md: N/A (redirect file)
  - status synchronization: PASS
