# TZ-NX-GANTT-G2-READ-MODEL checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-09/TZ-NX-GANTT-G2-READ-MODEL.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T22:40:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (нет Team Room CLI в этом контуре)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] `_NOW.md` + `tasks/_active/` — чужой active: TZ-NX-DOCSTUDIO-S37 (doc-studio keys); пересечений нет
- [x] TZ / эталон (legacy model/facade/context + specs) / NX data-access прочитаны
- [x] Claim slot заполнен; `tasks/_active/TZ-NX-GANTT-G2-READ-MODEL.md` на месте

## Acceptance (из TZ)

- [x] 1. Facade грузит активные заказы (`confirmed|in_production|ready`) без crash
- [x] 2. Specs ported/adapted PASS (model 1:1 + facade NX + data-access clients)
- [x] 3. `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения: module (data-access) + page (production read)
- [x] FIC §A данными не трогаем (только клиенты/чтение); §E N/A (нет MCP)
- [x] page.md / PAGE-TZ-INDEX: N/A (документация волны — G7)
- [x] Чужой WIP не в коммите (S37 staged-файлы не трогал)
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

```
cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit
→ PASS, exit 0

cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/production libs/data-access/src
→ PASS, 15 suites / 123 tests (включая data-access)

cd frontend-nx && pnpm exec jest apps/kppdf-web/src/app/pages/production
→ PASS, 3 suites / 59 tests (page скорректированными фейками)

cd frontend-nx && pnpm exec nx build kppdf-web
→ PASS, exit 0 (LAST)
```

## Executor report

- **Data-access additions** (`libs/data-access`):
  - `PiOrdersService.patchEstimateDays/patchEstimateStart` + types `EstimateDayOverride/EstimateStartOffset/PatchEstimateDaysPayload/PatchEstimateStartPayload` + specs.
  - `PiProductsService.getByIds` / `PiModulesService.getByIds` (bulk) + specs.
  - New `WorkType` client (`pi-work-types.service.ts`, `work-type.types.ts`) — read-only, envelopes raw array.
  - New `PiPeopleService` (`/workers`) + `Person` types + `personDisplayName` (люди по работе later в G6).
  - `ProductModule.workTypes` тип `WorkTypeInModule` (попulated) добавлен.
- **Pages/production port:**
  - `gantt-bar.model.ts` — 1:1 порт legacy (1423 строки; только импорт `OrderStatus` → `@kppdf/data-access`). Убран обрезанный placeholder.
  - `gantt-bar.model.spec.ts` — 1:1 порт (OrderStatus import).
  - `production-cockpit.context.ts` — 1:1 порт сигналов (selectedOrderId, фильтры, zoom, expanded*Ids, orderMeta, scroll-контракт G4).
  - `production-read.facade.ts` — порт на NX-клиенты (orders/products/modules/work-types/workers), cache+inflight+retsry 429/503, prefetch bulk по 50, `ProductionReadState` signals; фото-URL-обогащение убрано (нет NX photo client — известно G7).
  - `production-read.facade.spec.ts` — порт (NX-моки).
  - `production-cockpit.page.ts` — G2: читает через facade (loadOrders→loadBarsForOrders), состояние loading/error/activeCount, deep-link `?orderId=`, tool Обновить → reload.
  - `production-cockpit.page.spec.ts` — 6 кейсов (рендер, tools, deep-link, activeCount=2, error, clear-on-destroy).
- **Conflict disclosure:** S37 staged-файлы (docs/evidence) из чужой работы не трогал; коммичу только свои пути.
- **Known limits:** thumbnails фото — later; `production:write` capability проверим G5.

## Closeout

- [x] archive + удалить `_active`; Status = DONE
- closed_at: 2026-09-04T23:50:00+03:00