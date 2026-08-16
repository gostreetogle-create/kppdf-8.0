# TZ-PRODUCTION-349.done — Gantt 4-level milk palette + distinct summary barFill

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T22:28:00+03:00
closed_by: composer-executor-349 (kppdf-executor-loop)
TZ: TZ-PRODUCTION-349
WAVE: WAVE-GANTT-IA-PRODUCT-MODULE (palette after 348)
DEP: TZ-PRODUCTION-348 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- --testPathPattern="gantt-bars.component" --no-coverage` — 52/52)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- Host CSS vars `--gantt-level-order|product|module|work` + `--gantt-bar-*` (light milk + dark).
- Summary `barFill` distinct: order cream / product milk-blue / module sand (`GANTT_SUMMARY_BAR_FILL`); WT bars keep accentHue.
- `gantt-order-expanded` no longer beige-flattens children (`!important` background removed); frame box-shadow kept.
- Label + timeline both get `gantt-level-*`; work rows keep paper wash under module/product mid frames.
- Spec TZ-349 asserts distinct fills + CSS vars.

## Critical files

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-349-gantt-level-palette.lock`

## Summary bar colors (shipped)

- order: `oklch(0.90 0.028 85)`
- product: `oklch(0.90 0.028 240)`
- module: `oklch(0.90 0.032 70)`

---

# Original TZ

# TZ-PRODUCTION-349: Gantt — 4 уровня, 4 светлых «молочных» цвета

STATUS: READY  
РОЛЬ АГЕНТА: local executor  
ЗАВИСИМОСТИ: TZ-PRODUCTION-348 DONE  
LAYER: 2  
PAGES: /production  
PAGE_DOCS: production-cockpit.page.md  
CONFLICT KEYS: frontend/src/app/pages/production/blocks/gantt-bars.component.ts ; frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts

Проверено: PO скрин — заказ/изделие/модуль на timeline все одним серо-голубым (`barFill` → один `oklch(0.88 0.01 250)` для любого summary); row washes 346/348 перебиваются `gantt-order-expanded` / group-start `!important` → всё бежевое, уровни не читаются.

## Канон палитры (зафиксировать в CSS variables на host)

Светлые, paper/milk, гармоничный спуск hue сверху вниз (не кислотные):

| Уровень | Роль | Light row / summary bar (ориентир oklch) |
|---------|------|------------------------------------------|
| **Заказ** | L0 | тёплый cream `~0.94–0.96 / chroma 0.02–0.03 / hue 85` |
| **Изделие** | L1 | холодный milk-blue `~0.95–0.97 / 0.02–0.03 / hue 240` |
| **Модуль** | L2 | тёплый sand `~0.95–0.97 / 0.025–0.035 / hue 70` |
| **Вид работ** | L3 | почти paper + цвет полосы = **существующий** accent WT (не перекрашивать WT bars в mono) |

Dark: те же hue, L≈0.24–0.28, chroma чуть выше для читаемости.

## ЧТО ДЕЛАТЬ

1. CSS vars: `--gantt-level-order`, `--gantt-level-product`, `--gantt-level-module` (и dark overrides).
2. **Row backgrounds** по `data-row-kind` / `gantt-level-*`: заказ (order summary + mid order rows), product, module, work — **различимы глазом** рядом. Снять или сузить `!important` у `gantt-order-expanded` / group washes так, чтобы **не красить всех детей одним бежевым**; рамка группы заказа может остаться box-shadow без заливки всего блока одним цветом.
3. **`barFill`:** order summary / product summary / module summary / worker summary — **разные** fills из той же палитры (не один grey). Work bars — без изменений (accentHue).
4. Timeline row cells (правая колонка) — тот же level wash, что слева (сейчас часто только label tint).
5. Spec: assert distinct fills or CSS vars; snapshot-style class checks. Gates FE tsc + jest gantt-bars. Deploy нет.

## НЕ ИЗМЕНЯТЬ

- Tree structure, toolbar 348, estimate, 347 filter, WT legend colors for work bars

## КРИТЕРИИ

1. На одном раскрытом заказе: заказ ≠ изделие ≠ модуль по цвету строки **и** сводной полосы.
2. WT полосы цветные как сейчас; не mono.
3. Светлая milk-эстетика сайта; dark читаем.
4. Gates PASS; archive; push.
