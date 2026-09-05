# TZ-NX-GANTT-G9-RANGE-REFIT-FORWARD

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: Freebuff (Buffy)
verification:
  - acceptance criteria: PASS (forward range widening, backward preservation, worker read-only guards)
  - tests: PASS (frontend-nx production, 7 suites / 81 tests)
  - typecheck: PASS (kppdf-web app)
  - targeted lint: PASS (0 errors; existing warnings only)
  - kppdf-web build: PASS (final P3 gate)
  - docs integrity: PASS (production page contract updated; no route/API/permission change)
  - status synchronization: P3 marked [x] in WAVE

## Delivered

- `production-cockpit.page.ts`: `refitRangeAfterShift` now derives both moved-order edges, applies one-day padding symmetrically, widens `rangeEnd` for forward drags, and re-anchors the moved row after either edge changes.
- `gantt-bars.component.spec.ts`: forward-out-of-range rendering regression and worker-summary move/resize read-only assertions.
- `production-cockpit.page.write.spec.ts`: positive planned-date drag verifies `rangeEnd` growth and a reachable bar scroll target.
- `docs/pages/production-cockpit.page.md`: documented the P3 range and worker-mode contract.

## Scope disclosure

- Backend and Order org-scope files were not changed.
- No visual/zoom redesign or L1+ production feature was introduced.
- Concurrent Claude backend work and unrelated dirty workspace files were not staged.
