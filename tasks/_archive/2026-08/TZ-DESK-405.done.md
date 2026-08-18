═══════════════════════════════════════════════════════════════
TZ-DESK-405: стол — раскладка rev.2 (crumbs, expand-row, L/R flyout)
═══════════════════════════════════════════════════════════════

PAGES: /desk
PAGE_DOCS: manager-desk.page.md

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-18
closed_by: Buffy/openai-gpt-5.6-luna

result:
- Replaced the 401 header/selected-order block with `app-pi-page-chrome`, daily workflow links, and path crumbs.
- Moved the fixture order details into an extracted `desk-order-tray` rendered directly under the expanded row; one row expands at a time and the queue scrolls independently.
- Added left/right flyout side metadata and classes: create/filter/summary open left; client/bom/docs/supply open right.
- Put the disabled primary CTA plus Снабжение/Документы stubs in the tray while retaining projected chrome rail tools.
- Kept the page fixture-only: no `/api/orders`, order form, composition tree, Gantt embed, production-cockpit, desktop, or deploy changes.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (focused direct Jest, 1 suite / 5 tests)
  - requested `pnpm test -- --testPathPattern=manager-desk.page`: wrapper FAIL/no tests due extra `--`; direct equivalent PASS
  - lint: PASS (focused manager page + tray ESLint, exit 0)
  - diff-check: PASS
  - checklist: DONE
  - foreign WIP: not staged
  - deploy/wipe: not run

known_limitation:
- Gantt, live API, notes, and write actions remain successor work; the Gantt workflow item is a disabled DESK-407 stub.

commit: pending
