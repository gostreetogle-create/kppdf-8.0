# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-16T12:50:00+03:00
hygiene: `docs/audits/2026-08-16-task-ledger-hygiene-audit.md`; orphan root DONE specs UX-326/332/TZD-48 merged into archive + prompts spent removed

## ACTIVE

- **TZ-PHOTO-304** — photo frame meta (WAVE; Freebuff framing).
- **TZ-UX-328** — `/materials` chrome page-tools (READY FOR REVIEW pending Cursor PASS).

## NEXT (PO paste prompt)

- **Единая пагинация:** WAVE #1–#3 **DONE** (**UX-340**, **UX-341**, **UX-342**).
- Deploy **нет**. **TZ-PRODUCTION-337 DONE**; **TZ-CATALOG-375 DONE**; **TZ-UX-344 DONE**; **TZ-UX-342 DONE**; **TZ-UX-331 DONE**; **TZ-CATALOG-374 DONE**; **TZ-UX-340 DONE**; **TZ-UX-341 DONE**; TZ-UX-326 DONE; **TZ-UX-328 READY** (materials chrome).

_(HARDEN 324–328 DONE 98/100; POLISH 329–330 DONE; 331–335 Gantt polish DONE; **336 order-form Save/site/freeze DONE**; **337 composition pencil/forest DONE**)_

## Queue hygiene (not live)

- **TZ-AUTH-307** → `tasks/_park/` (глубокий cleanup после 308)
- **TZ-FRONTEND-304** → DONE; archive + lock prepared
- Backlog: SALES-377 — не брать без PO.
- Chrome page-tools migrate: UX-326+ — по PO (`WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE`)
- Gantt left-edge / a11y polish — parked 308/310; successor after PO

## DONE / LANDED (recent)

## [2026-08-16] — TZ-PRODUCTION-337 DONE — workshop ACTIVE exclude draft

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-337.done.md`; lock `TZ-PRODUCTION-337-workshop-exclude-draft.lock`; Cursor PASS. Deploy нет. known_limitation: draft `?orderId=` selected bypass.

## [2026-08-16] — TZ-CATALOG-375 DONE — materials list expandable preview

- Archive: `tasks/_archive/2026-08/TZ-CATALOG-375.done.md`; code `1322248d`; lock `TZ-CATALOG-375-materials-list-expand.lock`; Cursor PASS. Deploy нет.

## [2026-08-16] — TZ-UX-344 DONE — showcase photo contain

- Archive: `tasks/_archive/2026-08/TZ-UX-344.done.md`; code `0dec96e9`; lock `TZ-UX-344-showcase-photo-contain.lock`; Cursor PASS. Deploy нет.

## [2026-08-16] — TZ-UX-342 DONE — KP rail pager + dead totals

- Archive: `tasks/_archive/2026-08/TZ-UX-342.done.md`; code `db689987`; lock `TZ-UX-342-pager-dead-totals.lock`; Cursor PASS. WAVE pagination #3. Deploy нет.

## [2026-08-16] — TZ-UX-331 DONE — Brand home chip → Комбайн

- Archive: `tasks/_archive/2026-08/TZ-UX-331.done.md`; code `9e410338`; lock `TZ-UX-331-brand-home-combine.lock`; Cursor PASS. Deploy нет.

## [2026-08-16] — TZ-UX-340 DONE — PiPagination канон + pi-table footer

- Archive: `tasks/_archive/2026-08/TZ-UX-340.done.md`; closeout `dc3491c6`; code `a36120d4`; default 10; size 10/25/50. Deploy нет.

## [2026-08-16] — TZ-CATALOG-374 DONE — `/modules` list expandable состав

- Archive: `tasks/_archive/2026-08/TZ-CATALOG-374.done.md`; row-click expand tray; detail via name; tsc + 24 modules.page tests. Deploy нет.

## [2026-08-16] — TZ-UX-326 DONE — `/products` chrome page-tools

- Archive: `tasks/_archive/2026-08/TZ-UX-326.done.md`; фильтр в app-chrome-rail; w-12 снят. Deploy нет.

## [2026-08-16] — TZ-UX-332 DONE — Product edit `_id` + RU not-found

- Archive: `tasks/_archive/2026-08/TZ-UX-332.done.md`; dashboard findById; RU not-found; photo filename. Deploy нет.

## [2026-08-16] — TZ-PRODUCTION-336 DONE — Gantt skip orders without modules

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-336.done.md`; no empty-module orders on Gantt; rail marker; toast on attempt.

## [2026-08-15] — TZ-ORDERS-337 DONE — Composition-tree pencil + list forest

- Archive: `tasks/_archive/2026-08/TZ-ORDERS-337.done.md`; pencil on tree rows; list expand = live catalog forest; «Паспорт»→«Заказ».

## [2026-08-15] — TZ-ORDERS-336 DONE — Order form productId + default Site + freeze

- Archive: `tasks/_archive/2026-08/TZ-ORDERS-336.done.md`; Save writes productId; empty CP gets default Site; freeze payload/UI.

### TZ-PRODUCTION-335 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-335.done.md`; Gantt/rail sort by startDate; meta auto-save.

### TZ-PRODUCTION-334 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-334.done.md`; workers list `limit: 100` (BE `@Max(100)`).

### TZ-PRODUCTION-333 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-333.done.md`; optimistic Gantt drag; silent PATCH; revert on fail.

### TZ-PRODUCTION-332 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-332.done.md`; Day ticks DD.MM + ПН…ВС; headers h-10.

### TZ-PRODUCTION-331 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-331.done.md`; plan fields through ready; siteId heal; demo seed siteId.

### TZ-PRODUCTION-330 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-330.done.md`; Месяц zoom + RU ticks; Сегодня always recenters.

### TZ-PRODUCTION-329 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-329.done.md`; Filters Counterparty select; tabs removed; Gantt follows select.

### TZ-PRODUCTION-328 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-328.done.md`; page/spec SoT synced; final estimate-studio score 98/100.

### TZ-PRODUCTION-327 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-327.done.md`; one dumb scale-controls extract; 70 production tests PASS.

### WAVE-PRODUCTION-GANTT-CASCADE — DONE 2026-08-15

- **321–323:** work-detail cascade · kill bottom card · one full-width meta

### WAVE-PRODUCTION-GANTT-TREE — DONE 2026-08-15

- 314–320: expand · bottom card · offsets · keep orders · sheet viewport · card IA · **split expand vs card**

### TZ-AUTH-305 — DONE / CUTOVER 2026-08-15

### WAVE-UX-CHROME-GANTT-TOOLS — DONE (100)

## NEXT

1. AUTH-307 park — только после PO
2. App warm deploy — только по «деплой»
3. Chrome page-tools migrate wave — по PO

## HEAD / queue

- Queue: **empty for today**; AUTH-307 remains deploy/smoke gated; deploy НЕ — не автодеплой.
- Deploy app: НЕ — не автодеплой
