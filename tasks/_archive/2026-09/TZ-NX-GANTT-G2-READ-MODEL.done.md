# TZ-NX-GANTT-G2-READ-MODEL: facade + bar model + data-access

**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** production
**PAGE_DOCS:** `docs/pages/production-cockpit.page.md`
**DEPENDENCIES:** G1
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/production/production-read.facade.ts`, `…/gantt-bar.model.ts`, `…/production-cockpit.context.ts`, `frontend-nx/libs/data-access/src/lib/sales/**`, products/modules/work-types/workers clients; IMPLICIT `nx build kppdf-web`

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T22:40:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет Team Room CLI в этом контуре)

## Preflight Check Output

- **Context read:** `tasks/_ready/nx-gantt/TZ-NX-GANTT-G2-READ-MODEL.md`, G0 audit, legacy `gantt-bar.model.ts` (1423), `production-read.facade.ts` (591), `production-cockpit.context.ts` (341), их specs, legacy services (`orders.service.ts`, `pi-product-modules.service.ts`, `pi-work-types.service.ts`, `pi-workers.service.ts`), NX `libs/data-access` (catalog/sales клиенты, types, barrels), `pi-orders.service.spec.ts` (как писать NX specs).
- **Key Constraints:** чистый порт 1:1 model/context (только imports); facade на NX-клиенты с cache+inflight+retry; photo-URL-обогащение убрано; не трогать BE schema; не создавать второй write-path.
- **Planned Deliverable:** data-access (estimate методы, bulk getByIds, work-types/people клиенты) → port model/context/facade + specs → page loading/error/activeCount → gates (tsc/jest/nx build LAST).
- **Validation Path:** FIC §A/§E-чтение + Build integrity (baseline → LAST build).

## Что сделано

В `libs/data-access`:
1. `PiOrdersService.patchEstimateDays/patchEstimateStart` (PATCH `/orders/:id/estimate-days|estimate-start`) + `order.types.ts` (EstimateDayOverride, EstimateStartOffset, PatchEstimate*Payload) + spec.
2. `PiProductsService.getByIds` / `PiModulesService.getByIds` (GET `/products|modules/bulk?ids=`) + spec.
3. Новые `PiWorkTypesService` (read-only `/work-types`, обёртка `{items,total}` как legacy) + `work-type.types.ts`.
4. Новые `PiPeopleService` (`/workers`, limit 100) + `person.types.ts` (+ `personDisplayName`), barrel `people`.
5. `ProductModule.workTypes` тип `WorkTypeInModule` добавлен в product-module.types.

В `apps/kppdf-web/src/app/pages/production`:
6. `gantt-bar.model.ts` — 1:1 порт legacy (Order→Product→Module→WT, summary/worker trees, optimistic helpers, hue buckets, filters) с импортом `OrderStatus` из `@kppdf/data-access`. Убран placeholder из прерванной сессии.
7. `gantt-bar.model.spec.ts` — 1:1 порт.
8. `production-cockpit.context.ts` — 1:1 порт сигналов (selectedOrderId, search/activeOnly/zoom/фильтры, expanded*Ids, expandedWorkBarId, orderMetaOpen, scroll-контракт).
9. `production-read.facade.ts` — порт на NX-клиенты (list → getByIds bulk, retry 429/503 c backoff 300/800/1500, inflight-дедуп, prefetch по 50); `ProductionReadState` (loading/error/warnings/orders/bars/ineligible).
10. `production-read.facade.spec.ts` — порт (NX-моки сервисов).
11. `production-cockpit.page.ts` — G2 wiring: reload через facade, activeCount (по `isActiveCommercialOrderStatus`), loading/error RU, deep-link select, tool «Обновить» → reload; chrome tools сохранены (заказы/фильтры/сегодня — G3/G4).
12. `production-cockpit.page.spec.ts` — 6 кейсов.

## Gates (факт)

```
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit → PASS (exit 0)
cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/production libs/data-access/src
  → PASS, 15 suites / 123 tests
cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/production
  → PASS, 3 suites / 59 tests
cd frontend-nx && pnpm exec nx build kppdf-web → PASS, exit 0 (LAST)
```

## Финализация

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: freebuff (Buffy)
verification:
  - acceptance criteria: PASS (facade грузит active orders; specs портированы/адаптированы PASS; nx build PASS)
  - typecheck: PASS (app tsconfig)
  - tests: PASS (15 suites / 123 + page 3/59)
  - lint: N/A (nx lint pre-existing baseline S41/S37B; новые файлы консистентны)
  - checklist: ADDED (`docs/agent-checklists/TZ-NX-GANTT-G2-READ-MODEL.md`)
  - progress.md: REDIRECT (статус — `_NOW.md` / QUEUE-LIVE)
  - status synchronization: PASS