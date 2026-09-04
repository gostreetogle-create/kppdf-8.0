# TZ-NX-GANTT-G6-WORKERS-VIEW checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-09/TZ-NX-GANTT-G6-WORKERS-VIEW.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-05T00:05:00+03:00
- workspace: D:\kppdf-8.0
- conflict keys held: `blocks/gantt-bars.component.ts` (read-only path — без правок), `production-scale-controls.component.ts` (без правок), `gantt-bar.model.ts` (без правок), IMPLICIT `nx build kppdf-web`

## Preflight Check Output

- **Context read:** TZ + TZ-GANTT-401/344 в `docs/pages/production-cockpit.page.md` + `buildWorkerTreeBars`/`groupBarsByWorker` (порт G2) + workers-ветка gantt-bars (порт G3).
- **Key Constraints:** read-only (нет resize/body-drag); «Не назначен» последней; переключатель уже в ScaleControls (G3).
- **Planned Deliverable:** spec режима (tree build, unassigned, read-only) → gates.
- **Validation Path:** FIC §A + Build integrity.

## Что сделано

Функциональность уже покрыта 1:1 портом (G2/G3): переключатель «По заказам | По рабочим» (ScaleControls), `buildWorkerTreeBars` (Worker → Module(+контекст) → WT), «Не назначен» последняя, `canResizeBar/canMoveBar` отсекают всё в `groupByWorkers`, drag/resize ручки не рендерятся. Добавлен спека-файл `gantt-workers-view.spec.ts`:
- группировка по workerLabel, summary до module-rows;
- «Не назначен» (UNASSIGNED_WORKER_LABEL) последняя, остальные RU-sorted;
- `workerGroupKeyOf` маппинг «—»/'' → «Не назначен»;
- worker-summary не является work-баром (нет редактируемой цели).

## Gates (факт)

```
tsc -p apps/kppdf-web/tsconfig.app.json --noEmit → PASS
jest apps/kppdf-web/src/app/pages/production → PASS 6 suites / 75 tests
nx build kppdf-web → PASS (LAST)
```

## Финализация

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff (Buffy)
verification:
  - acceptance criteria: PASS (загрузка по людям видна; в workers mode drag → нет PATCH-цели; build PASS)
  - typecheck: PASS; tests: PASS (75)
  - checklist: ADDED; status synchronization: PASS
