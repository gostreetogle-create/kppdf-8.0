# TZ-PRODUCTION-STUDIO-B — DONE

**Status:** DONE / READY FOR REVIEW  
**Closed:** 2026-08-15  
**Score contribution:** +25 (wave score 40/99)

## Delivered

- `/production` wrapped in `PiGroupWorkspace` with `PRODUCTION_SECTION_CHIPS` and `flushBody`;
- duplicate local section chip/path chrome removed;
- local `leftTool` / `rightTool` signals and mutually-exclusive shell methods added;
- `PiGroupWorkspace` remains unaware of Gantt, inspector, rails, context and facade;
- existing docked rail, toolbar, selection, filters, zoom, refresh, `?orderId=` and read-only behavior preserved;
- production page test covers one-flyout invariant.

## Gates

- frontend TypeScript PASS;
- production Jest: **21/21 PASS**;
- Prettier PASS;
- ESLint: 0 errors, one existing page `OnInit` architecture warning;
- `git diff --check` PASS;
- no backend, facade, context estimate, WorkType.days or model changes.

## Known limitation

Visual layout remains docked until Wave C. Geometry gate belongs to Wave D.
