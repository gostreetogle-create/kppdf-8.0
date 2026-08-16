# TZ-GANTT-401: Gantt «По рабочим» (read-only) — DONE

> Source: `tasks/TZ-GANTT-401-gantt-by-workers-readonly.md`

## OUTCOME

DONE 2026-08-16. `/production` → Масштаб-флайаут содержит toggle
«По заказам | По рабочим». «По рабочим» = read-only вид Ганта: строки
группируются по `workerLabel` (People×WorkType уже на барах), без назначения
(`—`/empty) → группа «Не назначен» (последней); каждая группа = сводная
строка (span min…max детей) + всегда развёрнутые дочерние work-бары. В
worker-режиме нет resize-handle, body-drag и order-meta (нельзя PATCH).
ACTIVE filter, `buildGanttBars` и read-facade не изменены. Deploy НЕ.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm exec tsc -p tsconfig.spec.json --noEmit` PASS
- `pnpm exec jest --config jest.config.js --testPathPattern="gantt-bar.model|gantt-bars.component|production-cockpit.page" --no-coverage` — PASS (3 suites / 91 tests)

## Files

- `frontend/src/app/pages/production/gantt-bar.model.ts` (+ `.spec.ts`)
- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts` (+ `.spec.ts`)
- `frontend/src/app/pages/production/blocks/production-scale-controls.component.ts`
- `frontend/src/app/pages/production/production-cockpit.context.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts` (+ `.spec.ts`)
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## known_limitation

- Worker-группы всегда развёрнуты (без per-worker collapse).
- `workerLabel` с несколькими людьми (через запятую) считается одной группой.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T15:10:00+03:00
closed_by: deepseek/deepseek-v4-pro (Freebuff closeout)
TZ: TZ-GANTT-401
COMMIT: 036b5fd5cde0de407d2a9b41cb0d884cceb8601c
layer: 2
conflict_keys: frontend/src/app/pages/production/gantt-bar.model.ts; frontend/src/app/pages/production/blocks/gantt-bars.component.ts; frontend/src/app/pages/production/blocks/production-scale-controls.component.ts; frontend/src/app/pages/production/production-cockpit.context.ts; frontend/src/app/pages/production/production-cockpit.page.ts; docs/pages/production-cockpit.page.md; docs/pages/PAGE-TZ-INDEX.md
protects: gantt by-workers read-only grouping
next: TZ-TEST-GANTT-402 (specs deepen) · auto-assign/ship templates вне scope
