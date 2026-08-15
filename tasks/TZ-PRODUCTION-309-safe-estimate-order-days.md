═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-309: Safe estimate — production:write + order-level days
═══════════════════════════════════════════════════════════════

STATUS: READY (un-parked 2026-08-15 by PO «запусти агенты»)
SOURCE: tasks/_park/TZ-PRODUCTION-309-safe-estimate-order-days.md;
  docs/audits/2026-08-15-gantt-bar-resize-drag-audit.md
РОЛЬ АГЕНТА: Backend + Frontend
ЗАВИСИМОСТИ: TZ-PRODUCTION-303 DONE; WAVE-PRODUCTION-STUDIO-CHROME PASS
LAYER: 3 (FE production) / 4 (BE order + work-type) — **один агент sequential**
PAGES: /production ; /work-types
PAGE_DOCS: production-cockpit.page.md ; work-types.page.md

CONFLICT KEYS:
backend/src/modules/order/** ;
backend/src/modules/work-type/work-type.controller.ts ;
backend/src/common/seed/permissions.constants.ts (только если нужен comment/seed note) ;
frontend/src/app/pages/production/** ;
frontend/src/app/pages/orders/** (только если OrdersService типы) ;
docs/pages/production-cockpit.page.md ;
docs/agent-checklists/TZ-PRODUCTION-309.md ;
docs/pages/PAGE-TZ-INDEX.md ;
progress.md

Проверено: order.schema.ts — нет estimate days override; WorkType.days глобален;
  work-type.controller PATCH только @Roles(admin|manager); FE inspector confirm «для всех»;
  production:write уже в PERMISSIONS catalog; buildGanttBars берёт wt.days из каталога;
  audit 2026-08-15-gantt-bar-resize-drag-audit.md.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

- Длительность полосы Ганта = `WorkType.days` (каталог). PATCH меняет **все** заказы.
- Inspector: `window.confirm` + `workTypesApi.update` — честно, но не order-safe.
- Drag/resize **запрещён** до order-level SoT (этот TZ).
- FE `canEditCatalog` уже учитывает `production:write`; BE WorkType — нет.

═══════════════════════════════════════════════════════════════
SCHEMA LOCK (зафиксировать до кода)
═══════════════════════════════════════════════════════════════

На `Order` добавить:

```ts
estimateDayOverrides: Array<{
  orderItemIndex: number;   // index в order.items
  moduleId: ObjectId;
  workTypeId: ObjectId;
  days: number;             // int >= 1
}>
```

Composite key upsert: `(orderItemIndex, moduleId, workTypeId)`.
`days: null` в API = **удалить** override (вернуться к каталогу).

Endpoint (предпочтительно dedicated, не раздувать UpdateOrderDto):

`PATCH /orders/:id/estimate-days`
Body: `{ orderItemIndex, moduleId, workTypeId, days: number | null }`
Auth: `@Permissions('production:write')` (admin `*` проходит).
Также `@Roles('admin','manager')` **не** ставить вместе как AND — только Permissions,
либо явно document OR: если оставляете Roles, добавьте production:write в role seed manager.

Response: обновлённый Order (с массивом overrides).

Loose wording → канон: «дни на заказе» = `estimateDayOverrides`, не новый WorkType.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 0 — CLAIM (см. handoff): `_active` + checklist + conflict scan.

ШАГ 1 — BE schema + DTO + service upsert/clear + controller + unit tests.

ШАГ 2 — BE WorkType `PATCH`/`POST` (mutate days): требовать `@Permissions('production:write')`.
  Не ломать read GET. Тест: user без ключа → 403; с ключом / admin * → 200.

ШАГ 3 — FE OrdersService: метод `patchEstimateDays(...)`.
  Facade `buildGanttBars` input: для каждого wt применить override если ключ совпал,
  иначе catalog days. Pure helper в `gantt-bar.model.ts` предпочтителен + jest.

ШАГ 4 — Inspector: поле дней по умолчанию пишет **order override** (этот заказ).
  Отдельная явная действие/ссылка «Изменить в справочнике (все заказы)» → старый
  confirm + WorkType PATCH. Copy RU честная. Нет confirm «для всех» на override-пути.

ШАГ 5 — Gates + docs page + PAGE-TZ-INDEX + progress + checklist Executor report.
  Archive `tasks/_archive/2026-08/TZ-PRODUCTION-309.done.md` + lock.
  **Не** делать drag UI (это TZ-PRODUCTION-311).

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Order schema/DTO/service/controller (+spec)
- WorkType controller auth for mutate
- production facade / gantt-bar.model apply overrides
- order-inspector days UX
- docs/pages/production-cockpit.page.md (коротко)
- checklist / progress / PAGE-TZ-INDEX

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- drag/resize handles на полосах (311)
- ProductionOrder / OrderTask / check-in / 304–307
- shipping, catalog composition math
- чужой WIP вне conflict keys

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `PATCH /orders/:id/estimate-days` round-trip; clear null removes override.
2. `buildGanttBars` / facade uses override for matching bar; other orders unchanged.
3. Inspector default edit = override; catalog path still confirm «для всех».
4. WorkType mutate requires `production:write` (or admin `*`); без ключа 403.
5. Gates:
   - `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit`
   - `cd backend && pnpm test -- order` (или точечные spec override + work-type)
   - `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
   - `cd frontend && pnpm exec jest --testPathPattern=gantt-bar|production-read|order-inspector --no-coverage`
6. Checklist Integrity + Executor report (full SHA). Archive + remove `_active`.

known_limitation: N+1 estimate facade; left-edge / move drag = 311; fact production out.

FINALIZE: root `GEMINI.md` + `tasks/_archive/2026-08/` (не OrchestratorKit).
