# TZ-UI-THEME-331 checklist

> Status: **READY** (не claimed) · TZ-UI-LIGHT-330 DONE (`35cfc6e3`)
> TZ: `tasks/_backlog/TZ-UI-THEME-331-dark-depth-and-on-gold.md`
> Промпт: `tasks/prompts/TZ-UI-THEME-331-PROMPT.md`
> Триггер PO: «подготовь ТЗ и для тёмной темы, пока есть контекст».
>
> ⚠️ **P0:** 330 уехал в `main` с `bg-gold text-ink` — в тёмной теме главная кнопка
> нечитаема (≈1:1). Токен `--color-on-gold` вводится здесь, правкой 0.

## Claim slot

- agent_id: —
- claimed_at: —
- closed_at: —
- workspace: D:\kppdf-8.0

## Pre-flight

- [ ] TZ-UI-LIGHT-330 **выполнен и заархивирован** (иначе фрагменты «НАЙТИ» не совпадут)
- [ ] В `styles.css` есть `--color-paper-raised-override`; `--color-on-gold` пока **нет**
- [ ] `_active/` пуст ИЛИ никто не держит `frontend/src/styles.css` (Layer 3 → иначе DEFER)
- [ ] Baseline: `pnpm exec jest checkbox select-option pi-pagination pi-nav-dropdown --no-coverage`
- [ ] Скриншоты «до» в **обеих** темах: шапка с активным чипом, пагинация, селект, чекбокс,
      дерево состава, диалог

## Acceptance

- [ ] 0. `--color-on-gold` объявлен; кнопка `default` использует `text-on-gold` и читаема в dark
- [ ] 1. Поиск `bg-sunrise-warm text-paper` по `frontend/src` → 0 совпадений
- [ ] 2. Каждой `[class.bg-sunrise-warm]="X"` соответствует `[class.text-on-gold]="X"`
- [ ] 3. Light: активный чип / опция селекта / пагинация / чекбокс читаемы (тёмный на золоте)
- [ ] 4. Dark: те же элементы не сломались
- [ ] 5. Шаг лестницы dark ровный ≈0.04 (`0.175 / 0.215 / 0.25 / 0.29 / 0.33`)
- [ ] 6. `--shadow-executive` в dark содержит `inset`-блик
- [ ] 7. `--color-muted-strong` в репо отсутствует
- [ ] 8. Выделение текста в light золотистое, в dark не сломалось
- [ ] 9. Скроллбар dark: покой графит, ховер золото (раньше ховер не работал из-за слоёв)
- [ ] 10. Иерархия текста dark различима на трёх уровнях

## Gates

- [ ] `pnpm exec tsc -p tsconfig.app.json --noEmit` → exit 0
- [ ] `pnpm exec jest checkbox select-option pi-pagination pi-nav-dropdown --no-coverage`
- [ ] `pnpm exec jest --no-coverage --runInBand` → без новых падений
- [ ] `pnpm exec ng build --configuration=development` → exit 0

## Closeout

- [ ] progress.md + ARCHITECTURE.md
- [ ] `.mimocode/locks/TZ-UI-THEME-331-dark-depth-and-on-gold.lock`
- [ ] archive `tasks/_archive/2026-08/TZ-UI-THEME-331.done.md` + удалить из `_active/`
- [ ] `_active-map.md` checkpoint + commit/push
- [ ] Скриншоты «после» обеих тем → PO
