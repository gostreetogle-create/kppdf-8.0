# TZ-PRODUCTION-350.done — Gantt mono milk ladder (no rainbow)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T22:36:00+03:00
closed_by: composer-executor-350 (kppdf-executor-loop)
TZ: TZ-PRODUCTION-350
WAVE: WAVE-GANTT-IA-PRODUCT-MODULE (mono ladder after 349)
DEP: TZ-PRODUCTION-349 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- --testPathPattern="gantt-bars.component" --no-coverage` — 53/53)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- Replaced 349 rainbow hues (85/240/70/145) with one warm paper family (~82–90).
- Row washes: order `oklch(0.92 0.022 86)`, product `oklch(0.945 0.016 84)`, module `oklch(0.965 0.012 82)`, work `oklch(0.985 0.006 85)`.
- Summary barFill denser same family: order `oklch(0.90 0.028 86)`, product `oklch(0.925 0.022 84)`, module `oklch(0.945 0.016 82)`.
- Product/module frame accents retargeted to hue 84/82; WT bars keep accentHue.
- Spec TZ-350 asserts mono ladder + no rainbow tokens.

## Critical files

- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-350-gantt-mono-milk-ladder.lock`

## Summary bar colors (shipped)

- order: `oklch(0.90 0.028 86)`
- product: `oklch(0.925 0.022 84)`
- module: `oklch(0.945 0.016 82)`

---

# Original TZ

# TZ-PRODUCTION-350: Gantt — монохромная «молочная» лестница (без радуги)

STATUS: READY  
РОЛЬ АГЕНТА: local executor  
ЗАВИСИМОСТИ: TZ-PRODUCTION-349 DONE  
LAYER: 2  
PAGES: /production  
PAGE_DOCS: production-cockpit.page.md  
CONFLICT KEYS: frontend/src/app/pages/production/blocks/gantt-bars.component.ts ; frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts

Проверено: PO — 349 принял идею уровней, но **hue прыгает** (cream 85 / blue 240 / sand 70) → «цветофор». Нужны **переходные** оттенки одной семьи.

## Канон (design)

Один base hue paper сайта (**≈ 82–90**), меняем только **L** (светлее вниз) и чуть **C** (тише вниз). Не крутить hue на 150°+.

Референс: OKLCH lightness ladder + analogous ≤30° ([oklch cheatsheet](https://shademix.com/guides/oklch-cheatsheet.html), analogous UI).

### Целевые токены (light) — подогнать ±0.01 глазом

| Уровень | Row / summary fill |
|---------|-------------------|
| Заказ | `oklch(0.92 0.022 86)` |
| Изделие | `oklch(0.945 0.016 84)` |
| Модуль | `oklch(0.965 0.012 82)` |
| Вид работ (row) | `oklch(0.985 0.006 85)` |
| WT **полоса** | без изменений (accentHue) |

Summary bars: те же hue, чуть плотнее chroma/L чем row того же уровня (читаемость на сетке), но **в той же семье**.

Dark: тот же hue, L≈0.22–0.28, C чуть выше.

## ЧТО ДЕЛАТЬ

1. Заменить CSS vars / `barFill` из 349 на монохромную лестницу выше (одна семья).
2. Убедиться, что заказ/изделие/модуль **ещё отличимы** рядом (не одинаковые) — если слабо, увеличить шаг L, **не** разводить hue.
3. Specs обновить ожидаемые oklch. Gates FE tsc + jest gantt-bars. Deploy нет.

## НЕ ИЗМЕНЯТЬ

- Tree, toolbar, nest indent px, WT bar accents, 347 filter

## КРИТЕРИИ

1. Нет синего/розового/жёлтого «прыжка» между уровнями — всё тёплое milk/paper.
2. 4 уровня всё ещё читаются (светлее вниз).
3. Gates PASS; archive; push.

## Промпт

``text
Прочитай GEMINI.md + tasks/TZ-PRODUCTION-350-gantt-mono-milk-ladder.md.
PO: 349 слишком радуга — одна hue-семья paper (~86), лестница L/C.
CLAIM → заменить vars/barFill → jest → archive → push. Deploy запрещён.
``
