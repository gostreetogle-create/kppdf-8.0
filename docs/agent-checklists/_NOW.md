# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-16T12:16:00+03:00
hygiene: `docs/audits/2026-08-16-task-ledger-hygiene-audit.md`

## ACTIVE

- **TZ-CATALOG-374** READY FOR REVIEW — cursor-composer — `/modules` list expandable состав (как products). Gates PASS (tsc + 24 tests). Archive после Cursor PASS. Keys: `modules.page.ts` / `modules.page.spec.ts` / `modules.page.md`.
- **TZ-UX-326** READY FOR REVIEW — cursor-grok-4.6 — `/products` фильтр в app-chrome-rail, w-12 снят. Keys: `products.page.ts` / `products.page.spec.ts` / `products.page.md`. Gates: tsc PASS, products.page 24/24. Archive после Cursor PASS.

## NEXT (PO paste prompt)

- **Единая пагинация (новая волна):** старт `TZ-UX-340` → `tasks/_backlog/PROMPT-TZ-UX-340.md` (аудит `docs/audits/2026-08-16-pagination-unification-audit.md`)
- Deploy **нет**. Archive TZ-CATALOG-374 / TZ-UX-326 только после Cursor/PO PASS.

_(HARDEN 324–328 DONE 98/100; POLISH 329–330 DONE; 331–335 Gantt polish DONE; **336 order-form Save/site/freeze DONE**; **337 composition pencil/forest DONE**)_

## Queue hygiene (not live)

- **TZ-AUTH-307** → `tasks/_park/` (глубокий cleanup после 308)
- **TZ-FRONTEND-304** → DONE; archive + lock prepared
- Backlog: SALES-377 — не брать без PO.
- Chrome page-tools migrate: UX-326+ — по PO (`WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE`)
- Gantt left-edge / a11y polish — parked 308/310; successor after PO

## DONE / LANDED (recent)

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

### TZ-PRODUCTION-323 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-323.done.md`

### TZ-PRODUCTION-322 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-322.done.md`

### TZ-PRODUCTION-321 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-321.done.md`


### TZ-PRODUCTION-320 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-320.done.md`

### TZ-PRODUCTION-319 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-319.done.md`

### TZ-PRODUCTION-318 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-318.done.md`

### TZ-AUTH-305 — DONE / CUTOVER 2026-08-15

### WAVE-UX-CHROME-GANTT-TOOLS — DONE (100)

## NEXT

1. AUTH-307 park — только после PO
2. App warm deploy — только по «деплой»
3. Chrome page-tools migrate wave — по PO

## HEAD / queue

- Queue: **empty for today**; AUTH-307 remains deploy/smoke gated; deploy НЕ — не автодеплой.
- Deploy app: НЕ — не автодеплой
