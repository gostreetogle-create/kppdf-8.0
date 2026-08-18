═══════════════════════════════════════════════════════════════
TZ-DESK-403: состав заказа в центре стола
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/codebuff-freebuff

result:
- `OrderHubTrayComponent` is now self-contained: it owns the live catalog composition forest (lazy on toggle via `loadOrderCompositionForest`) and lazy supply counters (HUB-303 pattern, loaded on expand) — no host copy-paste.
- Desk reveals the composition-tree on `/desk` without routing to `/orders/:id`; the tree pencil reuses `open-catalog-composition-edit` (stay on /desk).
- Added a read-only Комбайн-strip (item → effective board lane) and a «Создать документ» desk action reusing the hub handler.
- Empty composition on desk shows RU «Нет изделий» + «Добавить линию» CTA → existing edit flyout.
- orders.page now hosts the tray with only its HUB-304 reservations input; supply + composition logic moved out of the page.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (orders.page 17/17, manager-desk 7/7, order-form-panel 10/10 — 34 total)
  - lint: PASS (eslint changed files, 0 errors; 1 pre-existing page OnInit warning)
  - checklist: DONE
  - foreign WIP: not staged (orders.page.md / _NOW.md / PAGE-TZ-INDEX.md left uncommitted)
  - deploy/wipe: not run (VPN off)

known_limitation:
- Комбайн-strip read-only (DnD lane = 407 combine view); supply/docs buttons still toast stubs (410/411 wire panels); status CTA remains disabled until successor wave.

commit: pending
