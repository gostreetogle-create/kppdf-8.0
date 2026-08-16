# TZ-PRODUCTION-343.done — Gantt IA RU labels + product/module frames

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T21:20:45+03:00
closed_by: local-executor-composer (kppdf-executor-loop)
TZ: TZ-PRODUCTION-343
WAVE: WAVE-GANTT-IA-PRODUCT-MODULE
DEP: TZ-PRODUCTION-342 DONE; TZ-PRODUCTION-344 DONE (no overlap hold)
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm exec jest --testPathPattern="gantt-bars.component.spec"` — 45/45)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- Kind-aware expand aria/title: order = «состав на Ганте»; product = «модули изделия»; module = «виды работ»; worker = «модули рабочего».
- Label header when expanded: `Заказ · изделие` (was `Заказ · работа`); «По заказам» unchanged.
- Nested frames: `gantt-product-group-*` / `gantt-module-group-*` wash+inset inside order frame (readable vs mid-rows).
- Visible labels: изделие = name (+qty, font-medium); модуль = moduleName; WT unchanged.
- Hint/legend polish for Order→Product→Module path.
- Tree structure (342) and worker IA (344) untouched.

## known_limitation

- Product-without-modules polish = 345.

## Critical files

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `docs/pages/production-cockpit.page.md`
