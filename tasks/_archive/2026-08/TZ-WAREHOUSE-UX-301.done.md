═══════════════════════════════════════════════════════════════
TZ-WAREHOUSE-UX-301: Dashboard dedupe + movements warehouse filter + type help — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-06
closed_by: Buffy (Freebuff executor)
acceptance_status: PASS
commit: 65a936f
verification:
  - frontend tsc -p tsconfig.app.json --noEmit: PASS по зоне TZ (остаётся только pre-existing catalog-дрейф materials.page.ts ← catalog-group-chips.ts — зона параллельного потока CATALOG-320/311, не входила в scope)
  - jest --testPathPattern="inventory|storage-items|stock-movement|warehouse": 5 suites / 25 tests PASS
  - inventory-dashboard.page.spec: 1/1 PASS (после удаления кнопок)
  - git diff --check: clean
protected_files:
  - frontend/src/app/pages/inventory/inventory-dashboard.page.ts
  - frontend/src/app/pages/inventory/stock-movements.page.ts
  - frontend/src/app/pages/inventory/warehouse-group-chips.ts
  - frontend/src/app/pages/inventory/warehouse-group-chips.spec.ts
  - frontend/src/app/pages/inventory/warehouse-form-dialog.component.ts
  - docs/pages/inventory-dashboard.page.md
  - docs/pages/stock-movements.page.md
  - docs/pages/warehouses.page.md (создан)
  - docs/SECTION-READINESS.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/agent-checklists/TZ-WAREHOUSE-UX-301.md
checklist: docs/agent-checklists/TZ-WAREHOUSE-UX-301.md
lock: .mimocode/locks/TZ-WAREHOUSE-UX-301-archive.lock
source_was: tasks/_backlog/warehouse/TZ-WAREHOUSE-UX-301-dashboard-dedupe-movements-filter.md

---

## Summary

- `/inventory`: убраны три кнопки-дубля TOC из `tools` (Склады/Остатки/Движения); остался счётчик «N складов · M позиций» + KPI cards.
- `/stock-movements`: фильтр склада по паттерну Остатков — chips ≤8 / select >8; `warehouseId` + `type` уходят в GET /stock-movements; type chips дополнительно подключены через `(chipClick)` → навигация с `{type, warehouseId}` (раньше queryParams чипов игнорировались shared workspace'ом).
- Warehouse form: default create = `main` (как BE), RU-подсказка под полем type (1–2 предложения: когда main/production/transit/branch/other). Табличные лейблы уже были ясные.
- Пофикшен pre-existing TS2353 (`queryParams` отсутствовал в `GroupChip` после DICT-312 chrome refactor) — новый тип `QueryGroupChip`.
- Остатки не тронуты (spec 11 тестов PASS).

## Conflict disclosure

- В `git status` на старте и после работы остаётся pre-existing tsc-дрейф в catalog-зоне:
  `frontend/src/app/pages/materials/materials.page.ts` импортирует `CATALOG_ENTITY_SECTION_CHIPS`/`CATALOG_TOC_CHIPS`,
  которых нет в `catalog-group-chips.ts` (только `CATALOG_SECTION_CHIPS`). Существовал до этой TZ на origin/main;
  принадлежит параллельному потоку CATALOG-320/311. Не трогал.
- Type chips раньше не передавали queryParams при клике (shared workspace рендерит только route) — в этой TZ
  подключены на странице Движений через `chipClick`; на Остатках (storage-items) тот же ограничитель остаётся как был.

## Feature checklist

- Новых route нет — Feature Integration Checklist N/A (как в TZ, ШАГ 4).
