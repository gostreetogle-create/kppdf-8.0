# TZ-TEST-GANTT-402: specs «По рабочим» — DONE

> Source: `tasks/_backlog/TZ-TEST-GANTT-402-workers-view-specs.md`

## OUTCOME

DONE 2026-08-16. Усилены specs worker-вида: (1) multi-person `workerLabel`
через запятую = одна группа (пин known_limitation); (2) work-detail в
worker-режиме read-only — дни disabled, «Изменить в справочнике» скрыт.
«По заказам» default не сломан. Deploy НЕ.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm exec jest --config jest.config.js --testPathPattern="production-cockpit|gantt" --no-coverage` PASS — 3 suites / 93 tests (+2)

## Files

- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`

## known_limitation

- multi-person workerLabel остаётся одной группой (не расщепляется по людям).

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T15:26:00+03:00
closed_by: deepseek/deepseek-v4-pro
TZ: TZ-TEST-GANTT-402
layer: 1
conflict_keys: frontend/src/app/pages/production/gantt-bar.model.spec.ts; frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts
protects: gantt by-workers read-only specs
next: TZ-TEST-OPS-413 (docs link smoke)
