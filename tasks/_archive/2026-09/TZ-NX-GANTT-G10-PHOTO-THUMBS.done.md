# TZ-NX-GANTT-G10-PHOTO-THUMBS

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff (Buffy)
verification:
  - acceptance criteria: PASS (populated product/module photo thumbs in rail and Gantt tree; empty refs safe)
  - focused tests: PASS (frontend-nx Nx Jest target, 70 suites / 448 tests passed)
  - typecheck: PASS (`pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`)
  - lint: BASELINE FAIL (kppdf-web target has 32 pre-existing errors / 197 warnings across existing production, registries, and studio files; no G10-specific issue isolated)
  - kppdf-web build: PASS (final gate; existing Angular/style-budget warnings only)
  - docs integrity: PASS (production page read path documented; no route/API/permission/capability change)
  - checklist: PASS (`docs/agent-checklists/TZ-NX-GANTT-G10-PHOTO-THUMBS.md`)
  - status synchronization: PASS (P5 marked [x] in `WAVE-NX-GANTT-POLISH.md`)

## Delivered

- `production-read.facade.ts`: safe `firstPhotoUrl` helper for populated refs, linked thumb variants, and empty/unpopulated values; product/module estimate and order-rail hydration.
- `gantt-bar.model.ts`: carries product/module photo URLs through work bars and derived summary bars.
- `gantt-bars.component.ts`: renders compact product/module/order summary thumbnails only when a usable URL exists.
- `orders-rail.component.ts` / `production-cockpit.page.ts`: existing rail input is hydrated in a non-blocking background path; no layout or estimate blocking.
- Focused facade, model, and DOM regressions cover populated and empty photo states.

## Scope disclosure

- No backend, API, route, permission, legacy frontend, upload UI, or L1+ production changes.
- Concurrent Claude `TZ-NX-GANTT-G14-BAR-ASSIGNEE` remains backend-only and was not staged.
- Unrelated dirty workspace files were not staged.

## Commit

- commit: 0c8216bf
