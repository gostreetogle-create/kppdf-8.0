═══════════════════════════════════════════════════════════════
TZ-DESK-401: каркас стола менеджера (fixture)
═══════════════════════════════════════════════════════════════

PAGES: /desk ; /
PAGE_DOCS: manager-desk.page.md ; dashboard.page.md ; page-chrome.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/openai-gpt-5.6-luna

result:
- Root `/` now redirects to the standalone `ManagerDeskPage` at `/desk`; `/dashboard` remains the KPI overview.
- Added exactly three local fixture orders with RU client/status labels, selectable center innards, two text composition placeholders, and disabled status CTAs.
- Projected create/filter/summary and selected-order client/BOM/docs/supply/studio tools through `PiChromeToolsService`; the flyout is a single right overlay with backdrop, close, Esc, and `orderId`/`panel` query restore.
- Disabled Gantt/Combine tools are marked for DESK-404; no orders API, write path, embedded Gantt, or composition tree was added.
- Brand aria/title is `Рабочий стол — главная`; `/desk` uses dense main chrome.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (ManagerDesk + AppLayout + app.routes, 3 suites / 20 tests)
  - lint: PASS (focused ESLint, exit 0)
  - diff-check: PASS
  - checklist: DONE
  - page index: existing `/desk` row verified; no duplicate added
  - order API / `/api/orders`: untouched
  - deploy/wipe: not run

known_limitation:
- CTA, create form, and Gantt/Combine navigation remain disabled until PO says «раскладка ок» and DESK-402/404 are authorized.

commit: pending
