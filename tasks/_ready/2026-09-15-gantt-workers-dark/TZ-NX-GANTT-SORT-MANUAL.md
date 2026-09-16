# TZ-NX-GANTT-SORT-MANUAL: ручная сортировка строк Ганта

> **SIZE:** S · **PACK:** WAVE-GANTT-DARK-2026-09-15  
> **PAGES:** `/production`  
> **PAGE_DOCS:** `docs/pages/production-cockpit.page.md`  
> **LAYER:** 3 · **IMPLICIT CONFLICT:** `nx build kppdf-web`  
> **CONFLICT KEYS:** `frontend-nx/libs/features/src/lib/production/util/gantt-bar.model.ts`; `gantt-bar.model.spec.ts`; `production-cockpit.context.ts`; `production-cockpit.facade.ts`; `ui/gantt-bars.component.ts`; `gantt-bars.facade.ts`; `*.spec.ts` рядом; опционально `ui/production-scale-controls.component.ts` если чипы рядом с легендой  
> **DEPENDENCIES:** после `TZ-NX-GANTT-UNASSIGNED-AUTOEXPAND` (keys пересекаются → sequential)

## BUILD INTEGRITY

`nx build kppdf-web` baseline + LAST. STOP на чужой kppdf-web claim.

## Domain preflight

Проверено: `buildGanttTreeBars` (PRODUCTION-335) сортирует order-groups по `summary.startDate`, tie `orderNumber` — см. `gantt-bar.model.ts` ~606–614; spec «plannedDate shift … reorders vertically».  
PO live: смена «Начало плана» → строка прыгает. Нужна **ручная** сортировка; default = **номер заказа**. UI компактно у легенды видов работ.  
N/A: Counterparty / BE schema (только FE sort order).

### Сбои оператора
1. Правит дату → теряет место строки / expand-контекст «прыгает».  
2. Не понимает, почему ORD-… выше/ниже.  
3. Хочет иногда смотреть «кто раньше по плану» — без автопринуждения.

## ИСХОДНОЕ

- Default rank: startDate ASC (авто при любом optimistic date shift).  
- Легенда: `data-test="gantt-worktype-legend"` — одна строка, справа пусто.  
- Workers tree: `groupBarsByWorker` RU-sort + unassigned last (отдельный контур).

## ЧТО ДЕЛАТЬ

### 1. Sort mode signal
`GanttSortMode = 'orderNumber' | 'startDate'`  
Default: **`orderNumber`**.  
Хранить в `production-cockpit.context` (session signal ok; localStorage optional, не обязателен).  
Прокинуть в `buildGanttTreeBars` (или wrapper) как параметр.

### 2. Rank logic (orders mode)
- `orderNumber`: `localeCompare(ru)` по `summary.orderNumber` (stable; при tie — orderId).  
- `startDate`: как сейчас PRODUCTION-335 (startDate ASC, tie orderNumber).  
Смена plannedDate **не** меняет порядок, пока mode=`orderNumber`.

### 3. UI (компактно у легенды)
В той же полосе, что легенда (`gantt-worktype-legend` row): справа `ml-auto` компактный контроль:
- label «Сортировка» (xs / muted) + native `<select>` **или** 2 TOC-chip: «№ заказа» | «По дате плана».  
- Не отдельная toolbar-строка. Не модалка.  
- `data-test="gantt-sort-mode"`.  
Виден в режиме «По заказам». В «По рабочим»: либо скрыть, либо те же режимы для worker-groups (по label / по min start) — **предпочтительно показать оба**, workers: `orderNumber`→sort by workerLabel RU; `startDate`→min child startDate.

### 4. Specs (переписать 335 expectations)
- Default mode → tree order by orderNumber (не startDate).  
- Mode startDate → прежний порядок по дате.  
- Optimistic plannedDate shift при mode=orderNumber → **вертикальный порядок стабилен**.  
- UI: смена select/chip меняет порядок без reload.

### 5. Docs
`production-cockpit.page.md`: PRODUCTION-335 default superseded — default № заказа; date sort opt-in.  
PAGE-TZ-INDEX one-liner.

## НЕ
- Сортировка по priority/важности (канон: не)  
- Drag-reorder строк  
- BE API sort  
- Deploy  
- Трогать wash/dark tokens (другие TZ пакета)

## AC
1. Default: заказы по номеру; правка «Начало плана» не прыгает строкой.  
2. Режим «По дате плана» — как старый 335.  
3. Контрол у легенды, компактный, `data-test="gantt-sort-mode"`.  
4. Specs PASS; `nx build kppdf-web` LAST.

### Gates
```bash
cd frontend-nx && pnpm exec nx test features --testPathPattern="gantt-bar.model|gantt-bars|production-cockpit" --skip-nx-cache
cd frontend-nx && pnpm exec nx build kppdf-web
```

### known_limitation
Natural/numeric order «3-2026-007» vs «ORD-2026-022» = `localeCompare(ru)` без parse префиксов — successor если PO захочет smart numeric.
