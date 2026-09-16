# Audit: Цех → По рабочим — «чёрная пустота» + один бежевый 38д

**Date:** 2026-09-15  
**Source:** live PO screenshot `/production` · tab «По рабочим» · zoom «День»  
**Mode:** Cursor diagnose (no product patch)

## Verdict

Не краш рендера. Три слоя одной картины:

1. **Данные:** все видимые работы без исполнителя. Баннер честный: *«Без исполнителя: 4 видов работ — назначьте в Люди — Гибочные… Покраска… Резка… Сварка»*. `workerLabel` на барах берётся из Worker.skills (`workTypeIds`); ни у кого в реестре нет этих 4 WT → всё в группу «Не назначен».
2. **Схлоп по умолчанию:** `expandedWorkerIds = ∅` → дерево показывает только worker-summary. Summary span = min(start)…max(end) всех unassigned → один бежевый бар **«38д»** на весь горизонт (wash TZ-353, `accentHue: null`). Цвета легенды на этом ряду не используются — ожидаемо для unassigned summary, но для оператора выглядит как «один бесполезный брус».
3. **Чёрная зона:** строк мало → тело Ганта ниже одной строки пустое (нет empty-state / заливки сетки на всю высоту). Визуально = «сломалось», хотя это пустой viewport.

## Не баг отдельно

- Легенда 4 цветов при одном бежевом баре — следствие п.2, не сломанная legend.
- Режим «По рабочим» read-only по назначению (`groupByWorkers` глушит worker-assignment в detail) — by design G6; путь = ссылка «Люди» → `/registries/workers` (навыки), не клик по бару.

## Что сломано для менеджера (smell)

| # | Smell | Severity |
|---|--------|----------|
| A | При 100% unassigned экран = 1 blob + чёрнота; нельзя увидеть 4 вида работ без клика expand | P1 UX |
| B | Баннер зовёт в «Люди», но не говорит «раскройте Не назначен» / не auto-expand unassigned | P2 |
| C | Пустой низ без empty-state («Нет рабочих с навыками…» / сетка на высоту) | P2 polish |

## Root pointers (code)

- `buildWorkerTreeBars` / `buildWorkerSummaryBar` — `frontend-nx/libs/features/src/lib/production/util/gantt-bar.model.ts`
- default expand — `production-cockpit.context.ts` `expandedWorkerIds = signal(new Set())`
- banner + Люди link — `gantt-bars.component.ts` `gantt-unassigned-banner`
- workerLabel join — design `docs/superpowers/specs/2026-08-06-production-gantt-inspector-design.md`

## Suggested thin TZ (не стартовать, пока hotfix-wave занята)

1. **Auto-expand** группы «Не назначен» при входе в «По рабочим», если `unassignedSummary.barCount > 0` (или всегда expand единственной worker-группы).
2. Empty-state / min-height grid wash под timeline, когда rows < N.
3. (optional) В баннере: «раскройте „Не назначен“ или назначьте навыки в Люди».

Conflict keys: `frontend-nx/**/gantt-bars*`, `gantt-bar.model.ts`, `production-cockpit.context.ts`.

## Preflight Check Output

- **Context read:** screenshot; `gantt-bar.model.ts`; `gantt-bars.component.ts`; `production-cockpit.context.ts`; `gantt-workers-view.spec.ts`; `docs/pages/production-cockpit.page.md`
- **Key Constraints:** Mode A · no product patch · не рвать PO-hotfix Claude/Freebuff
- **Planned Deliverable:** этот audit; TZ по запросу PO
- **Validation Path:** FIC UI § + visual smoke `/production?` workers tab
