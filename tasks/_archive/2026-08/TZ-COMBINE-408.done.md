# TZ-COMBINE-408: shop workType/days gate — DONE

> Source: `tasks/_backlog/TZ-COMBINE-408-shop-worktype-days-gate.md`

## OUTCOME

DONE 2026-08-16. Вход линии/модуля в колонку `shop` на Комбайне теперь
gate-ится: переход разрешён, только если у модулей линии есть хотя бы один
вид работы с оценкой дней — override заказа (`estimateDayOverrides`, ключ
`(orderItemIndex, moduleId, workTypeId)` days ≥ 1) или каталог `WorkType.days`.
Иначе 400 RU («В «Цех» можно отправить позицию только с видами работ и оценкой
дней…»). FE уже показывает тело ошибки как toast (без правок FE). Auto-assign
рабочих НЕ. Deploy НЕ.

## Gates

- `npx tsc --noEmit` (backend) — PASS
- `npx jest src/modules/order --silent` — PASS (3 suites / 83 tests; +8 новых)

## Files

- `backend/src/modules/order/order.service.ts` (+ инжект каталог-моделей, `directModuleIds`, `assertModulesShopReady`, `assertLineShopReady`, gate в `patchLineBoardLane`/`patchModuleLane`)
- `backend/src/modules/order/order.module.ts` (+ Product/ProductModule/WorkType схемы)
- `backend/src/modules/order/order.service.spec.ts` (+8 gate-кейсов, `stubShopReady`, `leanQuery`)
- `docs/COUPLING-MAP.md` (§2b + header)
- `docs/pages/design-combine.page.md` (helper «В цехе» + TZ-COMBINE-408 заметка)

## Known limits

- Gate на уровне линии проверяет «хотя бы один модуль с workType+days», а не
  «каждый модуль полностью оценён» — этого достаточно для входа в цех; детальная
  оценка по каждому бару остаётся зоной Ганта.
- FE не менялся: тост из тела 400 уже был в drop-пути линий и модулей.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T17:50:00+03:00
closed_by: freebuff (deepseek-v4-pro)
TZ: TZ-COMBINE-408
COMMIT: e2b6a88f
layer: 2
conflict_keys: backend/src/modules/order/order.service.ts; backend/src/modules/order/order.module.ts; backend/src/modules/order/order.service.spec.ts; docs/COUPLING-MAP.md; docs/pages/design-combine.page.md
protects: shop workType/days gate (line + module) на Комбайне
next: нет в очереди (WAVE-FREEBUFF-COMBINE-MODULES завершена)
