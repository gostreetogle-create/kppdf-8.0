═══════════════════════════════════════════════════════════════
TZ-UX-DETAIL-303: Inspector «Выбрано» — FactCard + кнопки + Редактировать
═══════════════════════════════════════════════════════════════

STATUS: READY (FACT-301; желательно после DETAIL-301/302)

РОЛЬ: Frontend

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/products/product-bom-panel.component.ts;
frontend/src/app/pages/products/product-bom-panel.component.spec.ts;
frontend/src/app/pages/modules/module-form-dialog.component.ts;
frontend/src/app/pages/products/product-form-dialog.component.ts;
frontend/src/app/pages/materials/material-form-dialog.component.ts;
docs/pages/product-detail.page.md;
docs/audits/2026-08-08-product-detail-side-panels-cost.md;
docs/agent-checklists/TZ-UX-DETAIL-303.md;

НЕ: composition-tree markup/behavior; менять состав полей FullEditor; deploy;
    дублировать форму вида работ на инспекторе (виды работ = внутри ModuleForm)

---

## ИСХОДНОЕ

Сейчас в inspector: dotted underline `<a>` «Открыть карточку…», text-button «Убрать»,
«Обновить дерево» — не `app-pi-button`. Нет «Редактировать» модуль/изделие/материал.

## ЧТО ДЕЛАТЬ

1. Секции FactCard/Stack: Что · Количество · Деньги · **Действия**.
2. Все кликабельные действия → **`app-pi-button`** (variant outline/default/destructive):
   - + Из каталога (уже button — оставить)
   - **Редактировать** — по kind выбранного узла:
     - module → `ModuleFormDialog` (data=module id/load)
     - product (вложенный или root если уместно) → `ProductFormDialog`
     - material → `MaterialFormDialog`
     После close с success → reload tree (+ emit parent refresh если нужно).
   - Открыть карточку — secondary outline button (routerLink или navigate), не plain `<a>` text
   - Убрать из состава — destructive/outline button
   - Обновить дерево — ghost/outline button
3. Не показывать «Редактировать» если нет id / нет прав (если ACL уже есть — уважать).
4. Виды работ / себестоимость модуля — **только** внутри ModuleFormDialog, не новый UI в inspector.
5. Дерево состава не менять.

## AC

- [ ] Нет dotted text-links для действий; везде PiButton
- [ ] У выбранного модуля есть «Редактировать» → FullEditor модуля
- [ ] Аналогично product/material по kind
- [ ] «Открыть карточку» остаётся отдельной кнопкой (навигация)
- [ ] Tree untouched; jest bom-panel; tsc; archive; push
