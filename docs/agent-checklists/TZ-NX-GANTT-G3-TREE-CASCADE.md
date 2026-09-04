# TZ-NX-GANTT-G3-TREE-CASCADE checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-09/TZ-NX-GANTT-G3-TREE-CASCADE.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T22:55:00+03:00
- workspace: D:\kppdf-8.0
- conflict keys held: `frontend-nx/apps/kppdf-web/src/app/pages/production/**` (blocks + page), `app.routes.ts` (production route providers), `project.json` (component-style budget), IMPLICIT `nx build kppdf-web`

## Preflight Check Output

- **Context read:** TZ spec + G0 audit; legacy `gantt-bars.component.ts` (2414), `orders-rail.component.ts` (344), `production-scale-controls.component.ts` (82), `order-inspector.component.ts` (22), legacy page (898); NX page/facade/context/model из G2.
- **Key Constraints:** порт 1:1 визуала (Paper & Ink уже в токенах legacy); без write-path (G5); без bottom-карточки; flyouts — studio overlays; shell tools через `ShellToolRailService`.
- **Planned Deliverable:** blocks port (gantt-bars + orders-rail + scale-controls + order-inspector helper) → page shell (Gantt + flyouts + deep-links + select/meta) → focused jest (expand/cascade smoke) → gates.
- **Validation Path:** FIC §A/§E-чтение + Build integrity (LAST build).

## Что сделано

1. `blocks/gantt-bars.component.ts` — 1:1 порт (tree build, cascade meta/detail, label overlay, resize/move sessions, today pulse, group frames; импорт типов из `@kppdf/data-access`).
2. `blocks/orders-rail.component.ts` — 1:1 порт (search/filters/list, thumbs-совместимый input, no-plan маркер); `statusLabel/isReadOnly` принимают `OrderStatus | undefined` (NX Order.status опционален).
3. `blocks/production-scale-controls.component.ts` + `blocks/order-inspector.component.ts` (prompt helper) — verbatim.
4. `production-cockpit.page.ts` — полный shell-порт: Gantt binding (все inputs/outputs), flyouts Заказы/Фильтры (studio overlay + backdrop + Escape), deep-link `?orderId=`/`?from=desk` hint/return-state, select → meta strip, readOnly по hard-frozen статусам, «Обновить»/«Сегодня»/«Вместить» wiring, shell tools sync (active/filters-dirty). Write-path коммиты (estimate/planned/offset/meta/catalog) — G5-стабы на месте с точной формой payload.
5. `production-cockpit.page.spec.ts` — 8 кейсов: Gantt root + toolbar, summary→product→module→work каскад smoke, flyout open/close, select → meta strip (disabled при caps=false), deep-link hint, error state, rail cleanup on destroy.
6. `app.routes.ts` — `ProductionReadFacade` поднят на route-level providers (иначе компонентный provider затенял TestBed-подмену в спеках).
7. `project.json` — `anyComponentStyle` 4/8kb → **8/16kb** (parity с `frontend/angular.json`; гант — style-heavy by design).
8. `gantt-bar.model.ts` — `filterOrdersForRail` constraint `status: OrderStatus` → `status?: OrderStatus` (NX-типы), default `draft` в фильтре.

## Gates (факт)

```
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit → PASS
cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/production → PASS, 3 suites / 62 tests
cd frontend-nx && pnpm exec jest → 840 passed, 2 failed — ПРЕДСУЩЕСТВУЮЩИЙ baseline:
  registries.catalog.spec (vat-rate/formulas не внесены в spec коммитом 59bcf499, не мой conflict key)
cd frontend-nx && pnpm exec nx build kppdf-web → PASS (LAST)
```

## Финализация

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: freebuff (Buffy)
verification:
  - acceptance criteria: PASS (дерево ▸ Заказ→Изделие→Модуль→WT + meta/detail как legacy; визуал 1:1 порт токенов; nx build PASS)
  - typecheck: PASS
  - tests: PASS (production 62; app-wide 840 passed / 2 pre-existing failures вне wave)
  - lint: N/A (nx lint baseline; новые файлы консистентны)
  - checklist: ADDED (этот файл)
  - status synchronization: PASS
