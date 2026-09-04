# TZ-NX-GANTT-G3-TREE-CASCADE: дерево + полосы + каскад (визуал)

**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** production
**PAGE_DOCS:** `docs/pages/production-cockpit.page.md`
**DEPENDENCIES:** G2
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.ts`; `…/orders-rail.component.ts`; `…/production-scale-controls.component.ts`; `…/production-cockpit.page.ts`; styles co-located; IMPLICIT `nx build kppdf-web`

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T22:55:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет Team Room CLI в этом контуре)

## Preflight Check Output

- **Context read:** TZ + G0 audit; legacy blocks (gantt-bars 2414 строк, orders-rail, scale-controls, order-inspector) и legacy page (898) — полностью; NX-сторона G2 (page/facade/context/model).
- **Key Constraints:** 1:1 порт визуала в Paper & Ink (токены уже в legacy-компонентах), write-path — НЕ (G5), flyouts через shell tools + studio overlay.
- **Planned Deliverable:** blocks + page shell + focused jest → gates (tsc/jest/build LAST).
- **Validation Path:** FIC §A/§E + Build integrity.

## Что сделано (кратко)

- Порт `GanttBarsComponent` / `OrdersRail` / `ScaleControls` + `order-inspector` helper 1:1; типы из `@kppdf/data-access`.
- Страница: полный Gantt binding, flyouts (Заказы/Фильтры), deep-link ?orderId=/from=desk, select → order-meta strip, readOnly frozen, tools (Заказы/Фильтры/Обновить/Сегодня) через `ShellToolRailService`; write-коммиты — G5-стабы.
- `ProductionReadFacade` → route-level providers (иначе компонентный provider затеняет TestBed-подмену).
- `anyComponentStyle` budget 8/16kb (parity с legacy `frontend/angular.json`).
- `filterOrdersForRail` — `status?` под NX-типы (default draft).

## Gates

- tsc (app tsconfig) — PASS
- jest production — PASS 3 suites / 62 tests
- jest all — 840 passed; 2 pre-existing failures `registries.catalog.spec` (chужой коммит 59bcf499, вне conflict keys)
- `nx build kppdf-web` — PASS (LAST)

## Archive

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: freebuff (Buffy)
