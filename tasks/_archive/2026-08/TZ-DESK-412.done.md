═══════════════════════════════════════════════════════════════
TZ-DESK-412: extract shared order-hub-tray (orders + desk)
═══════════════════════════════════════════════════════════════

PAGES: /desk ; /orders
PAGE_DOCS: manager-desk.page.md ; orders.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/codebuff-freebuff

result:
- New standalone `OrderHubTrayComponent` (`order-hub-tray.component.ts`) is the single tray for `/orders` expand (`mode="hub"`) and `/desk` row expand (`mode="desk"`).
- Hub host: orders.page `#expandedTpl` is now a thin `<app-order-hub-tray>` binding; all page-owned lazy state (composition forest, supply, reservations) flows in via inputs and interactions via outputs. orders.page.spec HUB-302/303/304 passes unchanged (zero regression).
- Desk host: `desk-order-tray.component.ts` deleted; desk renders the same tray with desk-only primary CTA + supply/docs buttons (outputs wired to toast stubs until 403/411).
- Composition block shell unified: hub renders the lazy tree; desk renders an item line list until 403 adds tree/combine — no forked template.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (orders.page 17/17, manager-desk 7/7, order-form-panel 10/10 — 34 total)
  - lint: PASS (eslint changed files, 0 errors; 1 pre-existing page OnInit warning)
  - checklist: DONE
  - foreign WIP: not staged (orders.page.md / _NOW.md / PAGE-TZ-INDEX.md left uncommitted)
  - deploy/wipe: not run (VPN off)

known_limitation:
- Desk composition = line list until 403 (tree + combine + lazy supply); desk primary CTA / supply / docs are stubs emitting outputs handled by toast.

commit: pending
