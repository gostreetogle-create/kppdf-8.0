═══════════════════════════════════════════════════════════════
TZ-CATALOG-305: Product → Product (комплекс) + unitPriceOverride
═══════════════════════════════════════════════════════════════

> Канон: `tasks/TZ-CATALOG-300.md` D1, §3.3–3.4.  
> Тяжесть: **средняя** · Риск: **средний** · Код: другой ИИ → Cursor spot-check  
> Параллель: **нет**. После 304 DONE.

РОЛЬ АГЕНТА: Backend Developer

ЗАВИСИМОСТИ: TZ-CATALOG-304 DONE  
LAYER: 4

CONFLICT KEYS:
  backend/src/modules/product/product.schema.ts ;
  backend/src/modules/product/product.service.ts ;
  backend/src/modules/product/product.controller.ts ;
  backend/src/modules/product/dto/* ;
  backend/src/modules/catalog-graph/* ;
  backend/test/jest/catalog-graph-guard.spec.ts ;
  backend/test/e2e/products-attach-modules.e2e-spec.ts (или новый products-composition e2e)

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Расширить lineType enum: `'module' | 'material' | 'product'`.
  - `unitPriceOverride?: number` (≥0, RUB) — только при lineType=product.
  - На Module composition по-прежнему запрещён lineType=product → 400.

ШАГ 2: POST product composition с lineType=product:
  - refId → существующий Product;
  - quantity > 0;
  - unitPriceOverride optional;
  - **не** мутировать listPrice/basePrice дочернего Product;
  - cycle/depth guard (303) обязан ловить Product↔Product циклы.

ШАГ 3: API/DTO: при GET product возвращать вычисляемое
  `isComplex: boolean` (= есть ≥1 lineType=product). Не хранить отдельное
  поле в Mongo Phase 1.

ШАГ 4: Tests: complex A→B ok; A→B→A fail; override не меняет child.listPrice;
  isComplex true/false.

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. Product→Product линии работают с qty + unitPriceOverride.
2. isComplex вычисляется.
3. Цикл Product→Product → ошибка guard.
4. tsc + tests PASS.
5. Cursor spot-check.

НЕ: UI бейдж «Комплекс» (Wave 2); auto cost rollup; Excel.

═══════════════════════════════════════════════════════════════
ПРОМПТ ИСПОЛНИТЕЛЮ
═══════════════════════════════════════════════════════════════

```text
GEMINI.md + TZ-CATALOG-300 D1 + TZ-CATALOG-305.md.
Только Product→Product. Не UI. Checklist + Executor report.
```
