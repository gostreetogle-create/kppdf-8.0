# TZ-PRODUCTION-347.done — Gantt hide assembly/packaging noise

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T21:45:00+03:00
closed_by: composer-executor-347 (kppdf-executor-loop)
TZ: TZ-PRODUCTION-347
DEP: TZ-PRODUCTION-342 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- --testPathPattern=gantt-bar.model --no-coverage` — 37/37)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN
  - mongo wipe / catalog delete: NOT RUN (forbidden)

## Outcome

- Exported `isGanttShopFloorNoiseName(name)` — `/сборк|упаков/i` on trimmed name.
- `buildGanttBars` skips matching modules and work types; sequential cursor does not advance for skipped rows.
- Only-noise orders → `[]` bars → `orderHasGanttEstimate` false (336 skip path).
- «Крепёжный», рама/полка, резка/сварка/покраска/гибка remain.
- Catalog/Mongo/seeds untouched; gantt-bars CSS (346) untouched.

## Critical files

- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/agent-checklists/TZ-PRODUCTION-347.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-347-gantt-hide-assembly-pack.lock`

---

# Original TZ

# TZ-PRODUCTION-347: Gantt — убрать «сборку/упаковку» из дерева

STATUS: READY  
РОЛЬ АГЕНТА: local executor  
ЗАВИСИМОСТИ: TZ-PRODUCTION-342 DONE  
LAYER: 2  
PAGES: /production  
PAGE_DOCS: production-cockpit.page.md  
CONFLICT KEYS: frontend/src/app/pages/production/gantt-bar.model.ts ; frontend/src/app/pages/production/gantt-bar.model.spec.ts

Проверено: PO — «Финишная сборка» / упаковка на Ганте лишние; сборка путает (всегда в конце, разные места); пока **не** показывать на Ганте. Каталог/Комбайн не обязательно удалять сущности — достаточно фильтра оценки Ганта. Seed `scripts/seed-catalog-data.mjs` / `local-demo` имеют `Финишная сборка`, WT Сборка/Упаковка.

## ЧТО ДЕЛАТЬ

1. В `buildGanttBars` (или сразу после collect modules): **не создавать** bars для модулей и видов работ, чьи имена (trim, case-insensitive) матчат шум цеха:
   - модуль: `/сборк|упаков/` (покроет «Финишная сборка», «Сборка», «Упаковка…»)
   - вид работ: то же
   - не трогать «Крепёжный» и обычные WT (резка/сварка/покраска/гибка)
2. Экспорт helper `isGanttShopFloorNoiseName(name)` + unit tests (positive/negative).
3. Если после фильтра у позиции не осталось bars — существующий skip/ineligible путь.
4. **Не** удалять модули из Mongo/каталога в этом TZ (no wipe). Опционально комментарий в page.md: сборка на Ганте скрыта до складской волны.
5. Gates: FE tsc + jest gantt-bar.model. Deploy нет. Seeds **не** обязательны (live data тоже чистится фильтром); seed WIP чужой не stage.

## НЕ ИЗМЕНЯТЬ

- gantt-bars chrome (346), Combine boardLane, BE delete APIs, wipe

## КРИТЕРИИ

1. На Ганте нет строк «Финишная сборка» / «Упаковка» / WT «Сборка» из demo-имён.
2. Рама/полка/резка остаются.
3. Gates PASS; archive; push.
