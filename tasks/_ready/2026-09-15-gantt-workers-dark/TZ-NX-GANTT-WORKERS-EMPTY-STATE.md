# TZ-NX-GANTT-WORKERS-EMPTY-STATE: пустота под одной строкой

> **SIZE:** S · **PACK:** WAVE-GANTT-DARK-2026-09-15  
> **PAGES:** `/production`  
> **PAGE_DOCS:** `docs/pages/production-cockpit.page.md`  
> **LAYER:** 3 · **IMPLICIT CONFLICT:** `nx build kppdf-web`  
> **CONFLICT KEYS:** `frontend-nx/libs/features/src/lib/production/ui/gantt-bars.component.ts`; `gantt-bars.component.spec.ts`; связанные styles в том же файле  
> **DEPENDENCIES:** после `TZ-NX-GANTT-UNASSIGNED-AUTOEXPAND` (желательно; можно параллельно только если keys не пересекаются — здесь пересекаются → sequential)

## BUILD INTEGRITY

`nx build kppdf-web` baseline + LAST. STOP на чужой kppdf-web claim.

## Domain preflight

Проверено: audit void; gantt body ниже одной строки — solid paper/void без сетки/empty-state.  
N/A: schema.

### Сбои
1. Одна строка + чёрный низ = «сломалось».  
2. Нет рабочих с навыками → нет hint «создайте/назначьте навыки».  
3. Скроллбар есть, контента нет — путаница.

## ИСХОДНОЕ

Timeline rows = высота контента; остаток viewport — пустой `bg-paper`/`void` без day-grid и без empty-state.

## ЧТО ДЕЛАТЬ

### 1. Min-height grid wash
Тело Ганта (timeline pane) занимает доступную высоту; day/month колонки (вертикальные линии / wash) тянутся на min-height контейнера, даже если rows = 1.

### 2. Empty-state (workers)
Если `groupByWorkers` и **нет ни одной** named-worker group (только unassigned или 0 bars):  
компактный RU hint под баннером или в пустой зоне: навык в «Люди» / нет работ в фильтре.  
Не модалка. `data-test="gantt-workers-empty-hint"`.

### 3. Spec
Рендер hint при workers + only-unassigned или 0 workers; grid container min-height > row height (class/style assertion ok).

## НЕ
- Фейковые worker rows  
- Менять zoom/fit логику дат  
- Deploy  
- Новая палитра (токены wash — след. TZ)

## AC
1. При 1 строке низ не «чёрная дыра» без сетки — линии/фон на высоту pane.  
2. Empty hint виден в workers-only-unassigned кейсе.  
3. Specs + `nx build kppdf-web` LAST.

### Gates
```bash
cd frontend-nx && pnpm exec nx test features --testPathPattern=gantt-bars --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```
