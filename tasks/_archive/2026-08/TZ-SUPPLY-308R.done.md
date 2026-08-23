# TZ-SUPPLY-308R DONE — Быстрый заказ: отдельные ▸-полоски (Option A)

```
ARCHIVE_MARKER
task_id: TZ-SUPPLY-308R
outcome: DONE
closed_at: 2026-08-23T21:55:00+03:00
agent_id: cursor-composer-executor
workspace: D:\kppdf-8.0
po_choice: A
sha: e8c5a54a9b69268380def6546f7e1bc52930a626
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc)
  - tests: PASS (29/29 supply-quick-order --runInBand)
  - lint: PASS (eslint quiet on conflict keys)
```

## Что сделано

- Вернуты ▸ Поставщик / ▸ Детали и статус; Позиция всегда видна при expand.
- ▸ Ещё остаётся optional.
- Signals `whereExpanded` / `detailsExpanded` + `maybeAutoExpandWhere` (после выбора материала).
- CSS: вертикальный stack full-width strips (не 3 колонки рядом); dense auto-fit fields.
- Зелёные `supply-quick-order__add-btn` (канон 309) не трогали.
- Specs: 308R gated-toggles; 306/308/309/310/312 открывают where/details перед DOM asserts.

## Файлы

- `frontend/src/app/pages/supply/supply-quick-order.component.ts`
- `frontend/src/app/pages/supply/supply-quick-order.component.spec.ts`
- `docs/agent-checklists/TZ-SUPPLY-308R.md`
