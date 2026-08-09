# TZ-UI-LIGHT-330 checklist

> Status: **READY** (не claimed)
> TZ: `tasks/TZ-UI-LIGHT-330-light-theme-harmony.md`
> Триггер PO: «светлая тема слишком светлая, режет глаза; привести в порядок цвета
> панелей / кнопок / выпадающих списков / полей + шрифты в каркасе».

## Claim slot

- agent_id: —
- claimed_at: —
- closed_at: —
- workspace: D:\kppdf-8.0
- baseline: `_active/` пуст на момент создания TZ (см. `_active-map.md` checkpoint 2026-08-09T03:50Z)

## Pre-flight

- [ ] `_active/` пуст ИЛИ ни один активный TZ не держит `frontend/src/styles.css` (Layer 3 → иначе DEFER)
- [ ] Baseline тестов снят ДО правок (`jest button --no-coverage`) — у `button.component.spec.ts`
      есть pre-existing fail, зафиксированный в `TZ-PRODUCTS-303.done.md`
- [ ] Скриншоты «до»: список с таблицей, form-диалог, overflow-select, шапка — light **и** dark

## Acceptance

- [ ] 1. `--color-paper` light = `oklch(0.962 …)`, чистый белый в токенах отсутствует
- [ ] 2. Шапка / диалог / dropdown светлее канвы (raised), не темнее
- [ ] 3. `bg-tertiary` в репо нет; `secondary` имеет видимый фон
- [ ] 4. `default` = золотая заливка + ink-лейбл; arbitrary `bg-[oklch(0.55_0.007_260)]` удалён
- [ ] 5. Контуры контролов на `--color-rule-strong` (≥3:1)
- [ ] 6. Три ступени muted различимы; вторичный текст ≥4.5:1
- [ ] 7. `destructive` читаем как текст и как заливка (light)
- [ ] 8. Ховер строки таблицы не жёлто-кремовый
- [ ] 9. `@utility executive-shadow` объявлен один раз
- [ ] 10. Dark без регрессий (скриншот до/после)

## Gates

- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → exit 0
- [ ] `cd frontend && pnpm exec jest button pi-overflow-select --no-coverage`
- [ ] `cd frontend && pnpm exec jest --no-coverage --runInBand` → без новых падений против baseline
- [ ] `cd frontend && pnpm exec ng build --configuration=development` → exit 0

## Closeout

- [ ] progress.md + ARCHITECTURE.md (зона темы)
- [ ] `.mimocode/locks/TZ-UI-LIGHT-330-light-theme-harmony.lock`
- [ ] archive `tasks/_archive/2026-08/TZ-UI-LIGHT-330.done.md` + удалить из `_active/`
- [ ] `_active-map.md` checkpoint + commit/push
- [ ] Показать PO скриншоты «после» (light) — приёмка на глаз за ним
