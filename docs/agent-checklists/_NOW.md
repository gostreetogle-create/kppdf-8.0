# NOW — единственная короткая карта текущей работы

> Читать при старте/resume. Не читать целиком `_active-map.md`, `progress.md`
> или root `STATUS.md`: это исторические журналы.
>
> Обновлять существующие секции in-place. Лимит файла: 120 строк.

updated_at: 2026-08-15T16:20:00Z
hygiene: `docs/audits/2026-08-15-tasks-queue-hygiene.md`

## ACTIVE

_(empty — WAVE-PRODUCTION-GANTT-TREE sequential; 314 closing)_

## Queue hygiene (not live)

- **TZ-AUTH-307** → `tasks/_park/` (глубокий cleanup после 308)
- **TZ-FRONTEND-304** → backlog
- Backlog: SALES-377 — не брать без PO.
- Chrome page-tools migrate: UX-326+ — по PO (`WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE`)
- Gantt left-edge / a11y polish — parked 308/310; successor after PO

## DONE / LANDED (recent)

### TZ-PRODUCTION-314 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-314.done.md`
- Order summary bar + expand; child plannedDate drag off until 316

### TZ-PRODUCTION-312 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-312.done.md`
- Body-drag → plannedDate (whole chain)

### TZ-PRODUCTION-313 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-313.done.md`
- Card flyout compact (no gutter)

### TZ-PRODUCTION-311 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-311.done.md`
- Right-edge estimate resize → order `estimate-days` override

### TZ-PRODUCTION-309 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-PRODUCTION-309.done.md`

### TZ-UX-324 — DONE 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-UX-324.done.md`

### TZ-AUTH-308 — DONE (see progress)

### TZ-AUTH-305 — DONE / CUTOVER 2026-08-15

- Archive: `tasks/_archive/2026-08/TZ-AUTH-305.done.md`

### WAVE-UX-CHROME-GANTT-TOOLS — DONE (100)

## NEXT

1. **WAVE-PRODUCTION-GANTT-TREE** — 315 bottom card → 316 start offsets
2. AUTH-307 park — только после PO
3. App warm deploy — только по «деплой»
4. Chrome page-tools migrate wave — по PO

## HEAD / queue

- Executor: WAVE-PRODUCTION-GANTT-TREE (314 DONE → 315 → 316)
- Deploy app: НЕ — после волны готово предложить деплой
