# TZ-DESK-419 — Стол: список заказов заполняет высоту экрана

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude

result:
- `.manager-desk__orders` теперь использует `max-height: calc(100dvh - 9.5rem)` вместо искусственного `min(60vh, ...)`.
- Внутренний `overflow-y: auto` сохранён; expand-in-row/tray, toolbar, search и breadcrumbs не менялись.
- Изменение ограничено layout CSS в `frontend/src/app/pages/desk/manager-desk.page.ts`.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (`cd frontend && pnpm test -- manager-desk --runInBand --silent`, 22/22, exit 0)
  - lint: PASS (`cd frontend && pnpm lint`, 0 errors; 18 existing warnings)
  - diff-check: PASS
  - browser: PASS (authenticated local Puppeteer, 1440x900 and 1920x1080; queue bottom 897/900 and 1077/1080; expand/collapse kept page scroll at viewport height)
  - checklist: ADDED and DONE (`docs/agent-checklists/TZ-DESK-419.md`)
  - progress.md: N/A (file absent in repository; `_NOW.md` updated)
  - status synchronization: PASS (`docs/agent-checklists/_NOW.md`)
  - lock: `.mimocode/locks/TZ-DESK-419-queue-list-fill-height.lock`
  - deploy/wipe: NOT RUN

conflict_disclosure:
- `TZ-SUPPLY-314` and its active files were not touched.
- Existing dirty WIP in unrelated backend/desktop/frontend files was not staged.
