# TZ-NX-GANTT-G8-CALENDAR-WASH

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: Freebuff (Buffy)
verification:
  - acceptance criteria: PASS (calendar wash + TOC-chip controls, light/dark)
  - typecheck: PASS (frontend-nx kppdf-web app)
  - tests: PASS (focused 2 suites / 6 tests)
  - lint: PASS (targeted P2 files, 0 errors; one existing warning)
  - kppdf-web build: PASS (final gate)
  - checklist: ADDED and completed
  - docs integrity: PASS (production page contract updated; no route/FIC/coupling change)
  - status synchronization: P2 marked [x] in WAVE

## Delivered

- `production-scale-controls.component.ts`: grouping and zoom/fit controls now use the compact TOC-chip language from `PiGroupWorkspace`: ink active chip with paper text, muted inactive chip, no joined bordered ghost box, and explicit `aria-pressed` on selectable group/zoom controls.
- `gantt-bars.component.ts`: timeline/calendar pane has a cool token-based `bg-paper-2` wash, while the sticky order/worker label pane stays `bg-paper`; dark mode uses a color-mix variant.
- Existing `gantt-group-*`, `gantt-zoom-*`, and `gantt-fit` data-test IDs and all event emits remain unchanged.
- Added focused regression coverage for chip classes/state/events and calendar-vs-label pane separation.
- Updated `docs/pages/production-cockpit.page.md` with the P2 visual contract.

## Evidence

- Live `:4201/production`: active `По заказам` and `День` chips expose `aria-pressed="true"`; inactive controls expose `false`; computed light surfaces differ (`label oklch(0.962…)`, calendar `oklch(0.932…)`) and dark surfaces differ (`label oklch(0.175…)`, calendar `oklch(0.4108…)`).
- Light-theme screenshot shows the gray calendar wash separated from the warm label column and ink active chips.
- Final build completed successfully; Angular emitted only existing warnings (studio nullish-coalescing and Gantt style budget).

## Known baseline

- Full workspace lint still has unrelated pre-existing accessibility errors in Gantt/Studio files; targeted P2 lint has 0 errors.
- Concurrent Claude backend Order-scope work was not staged or committed by this TZ.
