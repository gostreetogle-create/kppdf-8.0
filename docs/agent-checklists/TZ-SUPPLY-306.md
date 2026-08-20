# TZ-SUPPLY-306 checklist

> Status: **READY FOR REVIEW** (PO visual accept pending)
> TZ: `tasks/TZ-SUPPLY-306-quick-order-compact-layout.md`
> Design canon §12: `docs/audits/2026-08-19-supply-quick-order-design-canon.md`

## Claim slot

- agent_id: cursor design/frontend subagent
- claimed_at: 2026-08-19T18:55:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable
- conflict keys: `frontend/src/app/pages/supply/supply-quick-order.component.ts`,
  `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts`

## Preflight

- [x] TZ прочитана (`TZ-SUPPLY-306`)
- [x] Design canon 304 + PO-CANON (плотные формы, ширина = содержимое)
- [x] PO review: expand слишком рыхлый, qty/ед.изм. огромные, 4 панели = скролл

## Acceptance

- [x] Expanded tile = 4 компактные полосы + «Ещё» (одна общая рамка, hairline-делители)
- [x] qty 4.5rem right-aligned без спиннеров, ед. изм. 5.5rem, дата 9rem
- [x] 4 блока различимы: 2px левый акцент + tint через `color-mix` (light + dark одной формулой)
- [x] «Удалить» перенесена в summary-строку справа (confirm сохранён)
- [x] Примечание — одна строка `input`, textarea убран
- [x] Inline «+ Новая» / «+ Новый» — компактные dashed-панели, логика 304 не тронута
- [x] Все `data-test` hooks сохранены; добавлен regression-тест компактной вёрстки
- [x] Mock data / signals / business logic / toolbar / registry не изменены
- [ ] PO визуально принял на 1440px (light + dark) — требует скриншота на dev-сервере

## Gates

```text
cd frontend; pnpm exec tsc -p tsconfig.app.json --noEmit          — PASS
cd frontend; pnpm test -- supply --passWithNoTests                — PASS (3 suites / 10 tests)
cd frontend; pnpm exec eslint <2 changed files>                   — PASS
cd frontend; pnpm exec prettier --write <component>               — applied
```

## Files changed

- `frontend/src/app/pages/supply/supply-quick-order.component.ts` — strip layout + styles
- `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts` — +1 layout regression test
- `docs/audits/2026-08-19-supply-quick-order-design-canon.md` — §12 Compact strip layout

## Known limitation

- Всё ещё mock: без API/persist (это 305).
- Визуальная проверка в браузере в этой сессии не выполнена (порт 4200 занят чужим
  процессом, browser-инструмент недоступен) — вёрстка подтверждена рендер-тестом DOM,
  скриншот на 1440px нужен от PO/исполнителя.
