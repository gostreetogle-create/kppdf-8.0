# TZ-SUPPLY-307 DONE — Быстрый заказ: компактная 3-колонки без void

```
ARCHIVE_MARKER
task_id: TZ-SUPPLY-307
outcome: DONE
closed_at: 2026-08-23T21:15:00+03:00
agent_id: cursor-executor
workspace: D:\kppdf-8.0
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (29/29 supply-quick-order)
  - lint: PASS (0 errors)
```

## Что сделано

- Убраны nested toggles `▸ Поставщик` / `▸ Детали` — при expand сразу 3 полоски в ряд.
- «Ещё» оставлен как optional collapse.
- CSS: dense grid `repeat(auto-fit, minmax(9rem,1fr))`, select+plus `1fr auto`.
- Удалены `whereExpanded` / `detailsExpanded` signals и `maybeAutoExpandWhere`.
- Specs обновлены: strip count без toggle, новый тест SUPPLY-307.

## Файлы

- `frontend/src/app/pages/supply/supply-quick-order.component.ts`
- `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts`
