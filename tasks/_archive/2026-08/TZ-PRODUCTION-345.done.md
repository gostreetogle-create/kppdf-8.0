# TZ-PRODUCTION-345.done — Gantt product-as-module «целиком»

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T21:26:35+03:00
closed_by: local-executor-composer (kppdf-executor-loop)
TZ: TZ-PRODUCTION-345
WAVE: WAVE-GANTT-IA-PRODUCT-MODULE
DEP: TZ-PRODUCTION-342/343/344 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm exec jest --testPathPattern="gantt-bar.model.spec|gantt-bars.component.spec"` — 2/80; cockpit 23/23 regression)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- Empty `modules: []` stays ineligible (`orderHasGanttEstimate` false) — 336 skip / toast intact; no regression of 337 draft filter.
- Whole-product estimate path: `moduleId === productId` (or `__product_whole__`) → one module-level row labeled `«{product} · целиком»` under Product; WT leaves after ▸ module.
- Helpers: `resolveEstimateModules`, `wholeProductModuleName`, `isWholeProductModuleId`; worker context uses `заказ · {product} · целиком` (no duplicate product name).
- Catalog still has no product-level WorkTypes — live orders without module ids remain rail «нет плана»; pseudo-module is ready when estimate input supplies productId + WTs.
- Order tree 342 and worker tree 344 unchanged for normal modules.

## Evidence (not N/A)

- Spec: empty modules → ineligible; whole-product input → tree kinds `summary|product|module` with moduleName `Стеллаж · целиком`.
- Component: expanded product shows label `Стол · целиком`.

## Critical files

- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `tasks/_backlog/production/WAVE-GANTT-IA-PRODUCT-MODULE.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-345-gantt-product-as-module.lock`

---

# Original TZ

STATUS: DONE  
РОЛЬ АГЕНТА: local executor  
ЗАВИСИМОСТИ: TZ-PRODUCTION-342 DONE; prefer after **343** if same bars files contested  
LAYER: 2  
PAGES: /production  
PAGE_DOCS: production-cockpit.page.md  
CONFLICT KEYS: frontend/src/app/pages/production/gantt-bar.model.ts ; frontend/src/app/pages/production/gantt-bar.model.spec.ts ; frontend/src/app/pages/production/blocks/gantt-bars.component.ts ; frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts

Проверено: WAVE-GANTT-IA; audit — изделие без модулей изготавливается целиком; skip toast если нет WT.

## ЧТО ДЕЛАТЬ

1. Если у позиции заказа нет module ids, но есть work types на «legacy»/product-level — одна строка уровня модуля с лейблом изделия + «целиком» (или имя изделия как moduleName).
2. Если нет ни модулей ни WT — поведение skip/ineligible без регресса 337.
3. Specs + gates. Deploy нет.

## НЕ ИЗМЕНЯТЬ

- Worker lens 344, estimate PATCH math, BE

If `_active` держит 343 на bars → DEFER.
