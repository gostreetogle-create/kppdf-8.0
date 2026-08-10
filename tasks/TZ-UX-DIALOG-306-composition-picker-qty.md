═══════════════════════════════════════════════════════════════
TZ-UX-DIALOG-306: Composition picker — количество
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend UI Engineer
ЗАВИСИМОСТИ: PRODUCTS-310 DONE (shared bom/picker files)
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/products/product-composition-picker-dialog.component.ts; frontend/src/app/pages/products/product-composition-picker-dialog.component.spec.ts; frontend/src/app/pages/products/product-bom-panel.component.ts; docs/pages/ui-add-and-continue.md; docs/agent-checklists/TZ-UX-DIALOG-306.md

PAGES: /products/:id (состав)
PAGE_DOCS: products.page.md ; ui-add-and-continue.md

Проверено: picker без qty; BomPanel `applyCompositionLine` hardcodes `quantity: 1`; qty только в inspector после add.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: UI
  - Под селектом модуля/материала/изделия — поле **Количество** (number ≥ 0.001, default 1).
  - Грамотно: одна строка с overflow-select выше, qty узкое поле + label «Кол-во» (ёмкость поля — PO diary).
  - Session list «Добавлено сейчас» показывает qty.

ШАГ 2: Wire
  - Result type включает `quantity`.
  - BomPanel `onAdded` / apply path использует result.quantity (не 1).
  - Add & continue: после Add сбросить select, **qty вернуть в 1** (или оставить последнее — предпочтение reset to 1).

ШАГ 3: Spec + canon doc update ui-add-and-continue.md.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Checkbox multi for composition (canon forbids when per-line qty)
- unitPriceOverride logic beyond existing product-line field

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Add module with qty 3 → composition line quantity=3.
2. Можно добавить несколько подряд с разными qty без закрытия диалога.
3. Gates: FE tsc + jest picker/bom-panel; archive + report.
