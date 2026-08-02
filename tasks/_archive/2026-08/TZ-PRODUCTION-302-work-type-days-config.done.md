# TZ-PRODUCTION-302 — WorkType.days config (calendar days) — DONE

```
ARCHIVE_MARKER: TZ-PRODUCTION-302-work-type-days-config
status: DONE
date: 2026-08-02
executor: buffy
source_task: tasks/_backlog/TZ-PRODUCTION-302-work-type-days-config.md
checklist: docs/agent-checklists/TZ-PRODUCTION-302.md
```

## Outcome

WorkType.days (календарные дни) для Gantt-оценки. Round-trip create/update,
null допустим (stuck path для PRODUCTION-304), >0 при заполнении.
Миграция не требуется (аддитивное nullable-поле, default null).

## Files (только мои)

Backend:
- `backend/src/modules/work-type/work-type.schema.ts` — `days?: number | null` (default null).
- `backend/src/modules/work-type/dto/create-work-type.dto.ts` — `@IsOptional() @IsInt() @Min(1) days?: number | null`.
- `backend/src/modules/work-type/work-type.service.ts` — update(): round-trip days.
- `backend/src/modules/work-type/work-type.service.spec.ts` — NEW, 7 тестов
  (create/update round-trip, null, legacy без days, 404).

Frontend:
- `frontend/src/app/shared/services/pi-work-types.service.ts` — `WorkType.days`.
- `frontend/src/app/pages/work-types/work-type-form-dialog.component.ts` — поле
  «Дней (календарных)» (0/empty → null; standalone `daysValidator` int ≥ 1).
- `frontend/src/app/pages/work-types/work-types.page.ts` — колонка «Дней»
  (sort key `days`, поиск по дням).

Docs: `docs/data-model.md` (WorkType.days), `docs/pages/work-types.page.md`,
`docs/pages/PAGE-TZ-INDEX.md`.

## Not done (known_limitation)

- `Module.totalDays` (суксессор) — НЕ в scope.
- Work-day calendar (рабочий календарь) — later.

## Gates

backend tsc ✓ · frontend tsc ✓ · backend jest 7/7 ✓ · frontend jest 5/5 ✓ ·
ng build ✓ · git diff --check ✓

## Executor report (auto)

См. `docs/agent-checklists/TZ-PRODUCTION-302.md` → `## Executor report (auto)`.
Push/commit не выполнялись (правило: только по запросу PO).
