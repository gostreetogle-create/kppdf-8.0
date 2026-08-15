# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-15T23:20:00+03:00
hygiene: `docs/audits/2026-08-15-tasks-queue-hygiene.md`

## ACTIVE

_(empty — TZ-PRODUCTION-335 DONE)_

## NEXT (PO paste prompt)

_(empty — 335 DONE)_

_(HARDEN 324–328 DONE 98/100; POLISH 329–330 DONE; 331 siteId/plan DONE; 332 day weekday ticks DONE; 333 optimistic drag DONE; 334 workers limit 100 DONE; 335 Gantt start-sort + meta auto-save DONE)_

## Queue hygiene (not live)

- **TZ-AUTH-307** → `tasks/_park/` (глубокий cleanup после 308)
- **TZ-FRONTEND-304** → backlog
- Backlog: SALES-377 — не брать без PO.
- Chrome page-tools migrate: UX-326+ — по PO (`WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE`)
- Gantt left-edge / a11y polish — parked 308/310; successor after PO

## DONE / LANDED (recent)

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

- Queue: **empty**; TZ-PRODUCTION-335 DONE; готово предложить деплой по явной команде PO — автоматически не деплоить.
- Deploy app: НЕ — не автодеплой
