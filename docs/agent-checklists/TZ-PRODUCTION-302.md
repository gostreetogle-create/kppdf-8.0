# Checklist — TZ-PRODUCTION-302 (WorkType.days calendar)

**Status:** IN PROGRESS (created before any code edits)
**Created:** 2026-08-02

## Preconditions / context

- [x] TZ прочитан: `tasks/_backlog/TZ-PRODUCTION-302-work-type-days-config.md`
- [x] Зона `backend/src/modules/work-type/` + `frontend/src/app/pages/work-types/` чистая (нет dirty, нет чужих mtime)
- [x] Зависимости: каталог WorkType существует (schema/DTO/service/controller/FE service/page/form-dialog)
- [x] No conflicting peers: DEPLOY-301 (auth/compose), RBAC (auth/common-seed) — не пересекаются

## Implementation

- [x] Backend: поле `days?: number` (nullable) в `WorkType` schema (`days?: number | null`, default null)
- [x] Backend: DTO create — `@IsOptional() @IsInt() @Min(1) days?: number | null` (UpdateWorkTypeDto наследует через PartialType)
- [x] Backend: service update — обработка `days` (round-trip, null допустим)
- [x] FE: интерфейс `WorkType.days`
- [x] FE: поле «Дней (календарных)» в form-dialog (пусто → null; валидатор standalone `daysValidator` — 0/empty → null, иначе int ≥ 1)
- [x] FE: колонка «Дней» + сортировка + поиск в work-types.page
- [x] Документация: data-model.md (WorkType.days), work-types.page.md, PAGE-TZ-INDEX

## Tests / gates

- [x] backend tsc — PASS
- [x] frontend tsc — PASS
- [x] backend jest (work-type.service.spec NEW 7/7) — PASS
- [x] frontend jest (work-types.page.spec 5/5) — PASS
- [x] ng build — PASS (template-компиляция диалога)
- [x] git diff --check — PASS

## Notes / decisions

- Migration не нужна: `days` аддитивное nullable-поле (default null), никаких данных не трогает.
- `days` = календарные дни для Gantt-оценки; null = «срок неизвестен» (stuck path для PRODUCTION-304).
- Валидатор вынесен в standalone-функцию (`daysValidator`): поле класса использовалось бы до инициализации (TS2729).
- `text-ink-3` (несуществующий токен) → `text-muted-foreground` (как hint в FormField).
- `Module.totalDays` (суксессор) НЕ в scope — по known_limitation TZ.

## Executor report (auto)

- TZ-PRODUCTION-302 выполнен: WorkType.days (calendar days) для Gantt-оценки.
- Backend: schema (nullable, default null) + create-DTO (IsInt Min 1) + service update (round-trip, null).
- Frontend: интерфейс + form-dialog поле «Дней» (0/empty → null) + колонка «Дней» (sort + search).
- Unit-покрытие: work-type.service.spec (7 тестов: create/update round-trip, null, legacy, 404).
- Gates: backend tsc ✓, frontend tsc ✓, backend jest 7/7 ✓, frontend jest 5/5 ✓, ng build ✓, diff-check ✓.
- Docs: data-model.md, work-types.page.md, PAGE-TZ-INDEX, чеклист создан до кода.
- Push/commit не выполнялись (правило: только по запросу PO).
