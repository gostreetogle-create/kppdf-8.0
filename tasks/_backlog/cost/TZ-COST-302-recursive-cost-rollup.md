═══════════════════════════════════════════════════════════════
TZ-COST-302: Рекурсивный rollup себестоимости + sync costPrice
═══════════════════════════════════════════════════════════════

> PARK until TZ-COST-301 DONE · LAYER 4 (+ лёгкий FE module detail)
>
> Аудит: `docs/audits/2026-08-08-catalog-cost-pricing-hierarchy.md`
> Цель: parent cost = sum(children); модуль без ручной «цены»;
> activate CostCalculation пишет `Product.costPrice`.

STATUS: READY after 301 (не claim параллельно с 301 на cost-calculation.service)

РОЛЬ АГЕНТА: Backend (cost-calculation + product-module preview) + тонкий FE

ЗАВИСИМОСТИ: TZ-COST-301 DONE

LAYER: 4

CONFLICT KEYS:
backend/src/modules/cost-calculation/cost-calculation.service.ts;
backend/src/modules/cost-calculation/cost-calculation.service.spec.ts;
backend/src/modules/product/product.schema.ts;
backend/src/modules/product-module/product-module.controller.ts;
backend/src/modules/product-module/product-module.service.ts;
frontend/src/app/pages/modules/module-detail.page.ts;
docs/agent-checklists/TZ-COST-302.md;
progress.md;
ARCHITECTURE.md (зона cost — одна строка канона)

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. Рекурсия: при обходе module composition — вложенные `lineType=module`
   × qty; цикл → skip + warn в snapshot infos (не 500).
2. `activate(id)`: после isActive=true → `Product.costPrice = doc.totalCost`
   (тот же productId).
3. Overhead канон (зафиксировать в коде + ARCHITECTURE одна фраза):
   **A (текущий код):** overhead % только от materials — оставить, задокументировать
   **или B:** от materials+labor — только если явно проще для цеха.
   Рекомендация аудита: **оставить A**, написать в ARCHITECTURE правду.
4. NEW read-only: `GET /api/modules/:id/cost-preview` →
   `{ materialCost, laborCost, totalCost, currency: 'RUB' }` тем же walk.
5. FE module-detail: блок «Себестоимость (расчёт)» read-only, не input.

НЕ: listPrice авто; product→product lines (successor); StorageItem price;
менять strip-commerce ORDERS.

AC: unit tests на nested module×qty; activate обновляет costPrice;
preview без POST journal; tsc backend (+ FE module page); Cursor PASS.
