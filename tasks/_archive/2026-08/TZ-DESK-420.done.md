# TZ-DESK-420 — Плитка заказа: убрать дублирующие/лишние надписи

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-22
closed_by: claude

result:
- Удалён отдельный heading `Состав` с повторным счётчиком; единственным названием/контролом осталась toggle-строка `Состав заказа` с одним counter.
- Удалена повторная фраза `Открыть раздел „Отгрузка“` из shipping stub; link сохранён, ограничение сокращено до одного факта.
- Expand/collapse, `aria-expanded`, `aria-controls` и существующие `data-test` сохранены.
- Структура shared tray и бизнес-логика не менялись; TZ-DESK-421 IA не реализовывалась.

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`, exit 0)
  - tests: PASS (`cd frontend && pnpm test -- order-hub-tray --runInBand --silent`, 2/2, exit 0)
  - lint: PASS (`cd frontend && pnpm lint`, 0 errors; 18 existing warnings)
  - scoped eslint: PASS (tray TS/spec)
  - prettier: PASS (tray component)
  - architecture: PASS (`pnpm architecture:check`)
  - browser: PASS (authenticated local Puppeteer, `/desk` and `/orders`, 1440x900)
  - diff-check: PASS
  - checklist: ADDED and DONE (`docs/agent-checklists/TZ-DESK-420.md`)
  - progress.md: N/A (file absent in repository; `_NOW.md` updated)
  - status synchronization: PASS (`docs/agent-checklists/_NOW.md`)
  - lock: `.mimocode/locks/TZ-DESK-420-tray-label-cleanup.lock`
  - deploy/wipe: NOT RUN

conflict_disclosure:
- TZ-SUPPLY-314 and its frontend files were not touched.
- TZ-DESK-421 was docs-only and archived before this claim; no audit files were changed.
- Existing unrelated dirty WIP was not staged.
