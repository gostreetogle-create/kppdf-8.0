═══════════════════════════════════════════════════════════════
TZ-CATALOG-302: Composition contract — schema + endpoints
                 (Module + Product; ещё БЕЗ Product→Product линий)
═══════════════════════════════════════════════════════════════

> Канон: `tasks/TZ-CATALOG-300.md` §4.  
> Audit: `docs/audits/2026-08-04-catalog-coherence-audit.md` (P0 → этот TZ).  
> Тяжесть: **тяжёлая** · Риск: **высокий** · Код: другой ИИ → **Cursor review**  
> Параллель: **нет**. Старт: **TZ-CATALOG-301 DONE** (архив есть).

РОЛЬ АГЕНТА: Backend Developer (NestJS / Mongoose)

ЗАВИСИМОСТИ: TZ-CATALOG-301 DONE  
ЗАВИСИМОСТИ-ОТ: 303/304/305

LAYER: 4

CONFLICT KEYS:
  backend/src/modules/product/product.schema.ts ;
  backend/src/modules/product/product.service.ts ;
  backend/src/modules/product/product.controller.ts ;
  backend/src/modules/product/dto/* ;
  backend/src/modules/product-module/product-module.schema.ts ;
  backend/src/modules/product-module/product-module.service.ts ;
  backend/src/modules/product-module/product-module.controller.ts ;
  backend/src/modules/product-module/dto/* ;
  backend/test/e2e/products-attach-modules.e2e-spec.ts ;
  backend/test/e2e/product-modules.e2e-spec.ts

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. Product: `productModuleIds: ObjectId[]` без qty.
2. ProductModule: `materials[]` embedded (materialId, quantity, unit,
   isPurchased, overrideDimensions, sortOrder) — `_id: false` на subdoc.
3. Material уже имеет optimisticLockPlugin — Product тоже.
4. В ЭТОМ TZ: добавить `composition[]`, endpoints, dual-read для чтения.
   **Не** удалять legacy. **Не** миграция (это 304). **Не** lineType=product
   (это 305). **Не** полные cycle/depth guards (это 303) — но базовая
   валидация D2 (raw на Product) уже здесь.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Общая CompositionLine schema (`_id: true` на строке!):

```ts
{
  _id: ObjectId,
  lineType: 'module' | 'material',  // 'product' добавит 305
  refId: ObjectId,
  quantity: number,          // > 0, decimals ok
  sortOrder: number,
  unit?: string,
  overrideDimensions?: {...}, // только material
  isPurchased?: boolean,      // только material context
  sourcePosition?: string,
  sourceCode?: string,
  notes?: string,
}
```

- На ProductModule и Product: поле `composition: CompositionLine[]` default [].
- Legacy `materials[]` / `productModuleIds[]` **оставить**.

ШАГ 2: Правила записи (service):

- Module: lineType ∈ {module, material}; material любого materialKind.
- Product: lineType ∈ {module, material}; material с kind=raw → **400**;
  material без kind / other / part / fastener / purchased — ok (как 300).
- Unique (lineType, refId) на родителе: повторный add → **увеличить quantity**.
- Max 1000 строк → 400 если превышение.
- Состав **только** через composition endpoints (не через generic PATCH
  всего документа, если PATCH уже умеет всё — заблокировать запись composition
  через PATCH или игнорировать composition в PATCH).

ШАГ 3: Endpoints (минимум):

```text
GET    /modules/:id/composition
POST   /modules/:id/composition          body: { lineType, refId, quantity, ... }
PATCH  /modules/:id/composition/:lineId
DELETE /modules/:id/composition/:lineId

GET    /products/:id/composition
POST   /products/:id/composition
PATCH  /products/:id/composition/:lineId
DELETE /products/:id/composition/:lineId
```

Optimistic lock: использовать уже существующий plugin (version / __v) —
предпочтительно `version`; если Product уже на plugin — тот же контракт
(If-Match или body.version — как принято в модуле Material; не изобретать
второй механизм).

ШАГ 4: Dual-read (временно до 304):

- GET composition: если `composition.length > 0` — вернуть его;
  иначе синтезировать из legacy (module←materials; product←productModuleIds
  с quantity=1) **без записи** обратно.

ШАГ 5: Существующий `attachModule` — сохранить поведение на legacy
  **и** при наличии composition-режима после 304 станет successor; в 302:
  attachModule продолжает писать в productModuleIds; опционально зеркалить
  в composition если composition уже непустой (документировать выбор в
  Executor report). Предпочтение Phase 1: attachModule пишет **только
  legacy**, composition — только через новые endpoints (проще, меньше dual-write).

ШАГ 6: Tests: CRUD composition module+product; raw на product → 400;
  duplicate → quantity++; e2e attach-modules всё ещё зелёный.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ / НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

НЕ ИЗМЕНЯТЬ: Bom write; cost-calculation полная переписка (только не сломать
  чтение materials[] — dual-read на cost если нужно минимальный fallback);
  frontend; lineType=product; migration wipe legacy.

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. composition[] на Product и ProductModule с _id строк.
2. Endpoints CRUD работают; PATCH сущности не затирает composition молча.
3. Product + raw material → 400.
4. Dedup (lineType,refId) → quantity++.
5. tsc build PASS; e2e attach-modules + composition tests PASS.
6. Cursor review перед пометкой DONE (PO: «проверь 302»).

KNOWN: cycle/depth — 303; migrate — 304; product lines — 305;
  where-used / Material detail / photo unify / soft-delete Module — Wave 2
  (310–314), см. docs/audits/2026-08-04-catalog-coherence-audit.md.
  **Запрет:** FE composition tree поверх legacy до dual-read (audit P0.1).

═══════════════════════════════════════════════════════════════
ПРОМПТ ИСПОЛНИТЕЛЮ (после DONE 301)
═══════════════════════════════════════════════════════════════

```text
Прочитай GEMINI.md, tasks/TZ-CATALOG-300.md, tasks/TZ-CATALOG-302.md.
Только 302. Не миграция legacy, не lineType=product, не полный DFS guard.
Checklist docs/agent-checklists/TZ-CATALOG-302.md. Executor report + sha.
После кода PO попросит Cursor: «проверь 302».
```
