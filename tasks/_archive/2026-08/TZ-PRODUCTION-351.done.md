# TZ-PRODUCTION-351.done — Gantt workers FIO WT tint

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-17T00:05:00+03:00
closed_by: composer-executor-351 (kppdf-executor-loop)
TZ: TZ-PRODUCTION-351
DEP: TZ-PRODUCTION-344 DONE; TZ-PRODUCTION-350 DONE

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- --testPathPattern="gantt-bar.model.spec|gantt-bars.component.spec" --no-coverage` — 98/98)
  - checklist: DONE
  - deploy: NOT RUN

## Outcome

- `dominantWorkTypeAccentHue()` on work children (max days → tie RU name → noTerm bar count).
- `buildWorkerSummaryBar` sets `accentHue` from dominant WT; sentinel `workTypeId` unchanged.
- Worker FIO label: `workTypeWash` background + denser chip; timeline `barFill` uses WT oklch when hue set, milk fallback otherwise.
- Orders-mode mono milk ladder (350) unchanged; worker mode stays read-only.
- Tests reinforce expand worker → module rows only (344 regression).

## Critical files

- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-351-gantt-workers-fio-wt-tint.lock`

---

# Original TZ
═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-351: Gantt «По рабочим» — ФИО цветом WT + модули при ▸
═══════════════════════════════════════════════════════════════

> Перед заполнением: прочитай docs/TZ-AUTHORING.md (канон имён:
> Counterparty = покупатель ≠ Organization; unique на номер документа,
> не на FK клиента; domain preflight checklist).

РОЛЬ АГЕНТА: Frontend UI Engineer (Gantt tree)

ЗАВИСИМОСТИ: TZ-PRODUCTION-344 DONE; TZ-PRODUCTION-350 DONE

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/production/gantt-bar.model.ts; frontend/src/app/pages/production/gantt-bar.model.spec.ts; frontend/src/app/pages/production/blocks/gantt-bars.component.ts; frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts; docs/pages/production-cockpit.page.md; docs/pages/PAGE-TZ-INDEX.md

PAGES: /production
PAGE_DOCS: production-cockpit.page.md

Проверено: `gantt-bar.model.ts` `buildWorkerTreeBars` / `buildWorkerSummaryBar` / `formatWorkerModuleContextLabel` (344); `gantt-bars.component.ts` `barFill` + label template (worker = milk `GANTT_SUMMARY_BAR_FILL.order`); `production-read.facade.ts` `applyWorkerLabels` (People×WorkType → `workerLabel`); `docs/PO-CANON.md` («По рабочим» = модуль с контекстом); TZ-350 mono milk ladder для order/product/module — **не ломать** в режиме «По заказам».

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Режим «По рабочим» уже строит дерево Worker → Module(`заказ · изделие · модуль`) → WT (`buildWorkerTreeBars`, 344). Тесты model это фиксируют.

2. Проблемы / smell для PO:
   - Ячейка ФИО рабочего и сводная полоса на таймлайне — **молочный** fill как у заказа (350). Не видно, **какой вид работ** у человека (покраска / сварка…), хотя цвет WT уже есть в каталоге (`accentHue` / `workTypeOklch`).
   - При раскрытии PO ожидает **модуль** (как под заказом), не строку с названием вида работ («покраска»). Если в UI/данных первый уровень после ▸ читается как WT — починить так, чтобы всегда были module-summary rows с контекст-лейблом; WT только после ▸ модуля.

3. Контекст:
   - Worker mode read-only (GANTT-401): не включать drag/resize.
   - Multi-person comma `workerLabel` = одна группа — known limitation 401/344, не трогать в этом TZ.
   - Dominant WT = вид работ с **максимальной суммой `days`** среди work-children группы; tie-break `workTypeName` RU; если все `noTerm`/null days — max по числу баров, затем имя.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Dominant WT на worker-summary

В `gantt-bar.model.ts` при `buildWorkerSummaryBar` (или рядом helper `dominantWorkTypeOf(children)`):
  - Вычислить dominant work type среди **work** children группы.
  - Проставить на summary: `accentHue` = hue dominant WT (из child `accentHue`); сохранить id/имя dominant так, чтобы UI мог красить (достаточно `accentHue` + опционально положить dominant id в поле, которое уже есть — **не** менять `workTypeId` с `__worker_summary__` sentinel, иначе сломается `isWorkerSummaryBar`).
  - Рекомендация: добавить optional поля на `GanttBar` **только если нужно** (напр. `tintWorkTypeId?: string | null`) **или** хранить dominant hue в `accentHue` и для fill вызывать `workTypeOklch(bar.orderId /*unused*/, …, bar.accentHue)` / `workTypeOklch('worker-tint', …, accentHue)`. Предпочтительно **только `accentHue`** на summary без смены sentinel `workTypeId`.

ШАГ 2: UI tint ФИО + barFill (только worker summary)

В `gantt-bars.component.ts` при `groupByWorkers` / `isWorkerSummaryBar`:
  - Левая ячейка лейбла (кнопка ФИО): мягкий wash фона = `workTypeWash` / `workTypeOklch(..., chroma≈0.02, L≈0.94–0.96, accentHue)`.
  - Рядом с ФИО — узкий color chip (как у work-строк `w-1.5 h-5`), цвет = denser `workTypeOklch(..., 0.14, 0.76, accentHue)`, если `accentHue != null`.
  - `barFill` для `rowKind === 'worker'`: **не** milk `GANTT_SUMMARY_BAR_FILL.order`, а denser WT fill по `accentHue` (тот же family, что у work bars). Если hue null (Не назначен / нет children) — оставить milk order fill.
  - Режим «По заказам» и product/module milk ladder (**350**) **не менять**.

ШАГ 3: Раскрытие = модули, не WT

Проверить smoke + усилить тесты:
  - Expand worker → в `treeBars` / rows только worker-summary + **module** summaries; ни один child с `kind` work / с `workTypeName` «Покраска» как единственный лейбл первого уровня.
  - Лейбл module-row = `moduleName` из `formatWorkerModuleContextLabel` (`заказ · изделие · модуль` / целиком). **Запрет:** подставлять `workTypeName` в `moduleName`.
  - Если найден баг (например nest/rowKind, из‑за которого module рисуется как work) — починить в `rows()` / template.
  - Nest: worker=0, module под worker читается как module-level (глубина как сейчас или worker→module = 1 шаг визуально ок); WT только после expand module.

ШАГ 4: Docs

  - `docs/pages/production-cockpit.page.md` — «По рабочим»: ФИО/сводная полоса tint dominant WT; ▸ → модули с контекстом.
  - `docs/pages/PAGE-TZ-INDEX.md` — строка **PRODUCTION-351**.
  - Checklist Integrity; archive; lock; commit+push по GIT-POLICY. **Deploy запрещён.**

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- `frontend/src/app/pages/production/gantt-bar.model.ts` (+ spec)
- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts` (+ spec)
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-PRODUCTION-351.md` (claim → DONE)
- archive / lock / `_NOW.md` (оперативно)

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Backend / People API / WorkType CRUD
- Drag/resize / write-path в worker mode (остаётся RO)
- Milk ladder order/product/module в «По заказам» (350)
- `applyWorkerLabels` fan-out / comma multi-person grouping (401 limitation)
- Deploy / wipe
- Combine / dashboard product code

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. `buildWorkerSummaryBar` / tree: worker summary с children покраски получает non-null `accentHue` = hue покраски (из child).
2. Spec: expand worker → module context rows; **нет** raw WT как первого уровня (регресс 344 сохранён + при необходимости UI assert на `data-row-kind="module"`).
3. Spec UI: при `groupByWorkers` worker label/barFill использует WT oklch при наличии hue; без hue — milk fallback.
4. «По заказам» summary fills по-прежнему mono milk (350 asserts не краснеют).
5. Gates:
   ```
   cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
   cd frontend && pnpm test -- --testPathPattern="gantt-bar.model.spec|gantt-bars.component.spec" --no-coverage
   ```
6. Archive `tasks/_archive/2026-08/TZ-PRODUCTION-351.done.md` + lock; root TZ → specs-dup или удалить после archive per hygiene; commit+push; **не** deploy.

known_limitation:
- Multi-WT у одного человека → один dominant tint (max days); остальные WT видны цветом только на leaf после ▸ модуля.
- Comma-joined multi-person label = одна группа (401).

Финализация: root GEMINI.md + checklist; `tasks/_archive/2026-08/`.
