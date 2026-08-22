# TZ-STRAT-01A DONE — безопасно убрать cross-page imports между `/desk` и `/orders`

```
ARCHIVE_MARKER
task_id: TZ-STRAT-01A
outcome: DONE
closed_at: 2026-08-22T11:05:00+03:00
agent_id: claude
workspace: D:\kppdf-8.0
branch: main
verification:
  - acceptance criteria: PASS
  - architecture:check: PASS (978 files; baseline 6 known commercial line keys)
  - typecheck: PASS
  - tests: PASS (66/66, 6 suites)
  - build:dev: PASS
  - lint: PASS (0 errors, 18 pre-existing warnings)
  - git diff --check: PASS
  - re-gate before closeout (2026-08-22): tsc + focused Jest re-run, unchanged 66/66 PASS — gates did not drift
  - checklist: docs/agent-checklists/TZ-STRAT-01A-desk-order-boundary.md
  - status synchronization: docs/agent-checklists/_NOW.md updated
  - PO/Cursor review verdict: PASS (relayed by PO)
```

## Цель

Устранить два нарушения `architecture:check`: `manager-desk.page.ts` (`/desk`)
импортировал `OrderFormPanelComponent`/`OrderHubTrayComponent` напрямую из
`pages/orders`. Поведение `/desk` и `/orders` менять было нельзя.

## Что сделано

- Канонический `OrdersService` вынесен в `shared/services/orders.service.ts`;
  `pages/orders/orders.service.ts` — compatibility-only реэкспорт, второго
  write-path нет.
- `OrderFormPanelComponent`, `OrderHubTrayComponent`, BOM-хелперы
  (`order-composition-forest`, `open-catalog-composition-edit`) и их specs
  перенесены в `shared/orders/` под общий order-слой.
- Зависимость от `Users` в shared-коде больше не тянется из page-импортов.
- Backend, Desktop, production, supply, legacy, migration, deploy — не тронуты.

## Claim history

Изначальный claim перехвачен `Buffy` у остановленной Gemini-CLI сессии (лимит
модели) 2026-08-21T00:27:12+03:00; продуктовый код до перехвата не менялся.
Closeout выполнен `claude` 2026-08-22T11:05:00+03:00 по прямому поручению PO
(предыдущая сессия Buffy неактивна, статус был READY FOR REVIEW, не IN
PROGRESS) — перед archive гейты (tsc + focused Jest на shared order файлы)
перепроверены заново, расхождений не найдено.

## Gates

- `pnpm architecture:check` → PASS
- `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` → PASS
- Focused Jest (order-form-panel, order-hub-tray, orders.service, orders.page,
  manager-desk, order-composition-forest) → PASS, 66/66
- `pnpm --dir frontend build:dev` → PASS
- `pnpm --dir frontend lint` → PASS
- `git diff --check` → PASS

## Известные ограничения

- Browser smoke не прогонялся при исходной реализации (backend/Mongo были
  недоступны) — покрытие через Angular build + focused-тесты.
- Два коммерческих cross-page нарушения архитектуры остаются намеренно вне
  этого TZ (задокументированы в architecture baseline).
