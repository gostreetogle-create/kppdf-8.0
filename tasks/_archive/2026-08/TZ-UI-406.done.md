# TZ-UI-406 — Проект (design/combine) group-workspace TOC parity

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude

summary:
- PO-flagged gap from TZ-UI-404 (only covered Клиенты/Каталог/Снабжение/Цех): `/design`
  and `/design/combine` used two different nav shells entirely (group-workspace gold chips
  vs page-chrome breadcrumbs). Unified both under `app-pi-group-workspace [toc]`, same
  `DESIGN_SECTION_CHIPS`, gold row empty.
- `dashboard.page.ts` (Комбайн board) dropped `PiPageChromeComponent`/`PageCrumb`.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (29/29, design + dashboard.page suites)
  - lint: PASS (0 problems)
  - browser (primary): PASS — CDP smoke, both routes show correct TOC + empty gold row
  - checklist: ADDED and DONE (`docs/agent-checklists/TZ-UI-406.md`)
  - status synchronization: PASS (`docs/agent-checklists/_NOW.md`)
  - deploy/wipe: NOT RUN

known_limitation:
- Pre-existing unrelated `NG0101 ApplicationRef.tick called recursively` console.error noise
  in `dashboard.page.spec.ts` (caught, non-fatal, suite still 29/29 PASS) — not introduced by
  this TZ, flagged for a separate cleanup pass if PO wants it silenced.
