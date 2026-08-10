═══════════════════════════════════════════════════════════════
TZ-DICT-320: Kind labels — FE wire + nav
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend UI Engineer
ЗАВИСИМОСТИ: TZ-DICT-319 DONE
LAYER: 3
CONFLICT KEYS: frontend/src/app/shared/services/pi-dictionary-labels.service.ts; frontend/src/app/pages/dictionaries/kind-labels.page.ts; frontend/src/app/layout/app-layout.component.ts; frontend/src/app/pages/dictionaries/dictionary-group-chips.ts; frontend/src/app/app.routes.ts; frontend/src/app/pages/products/product-form-dialog.component.ts; frontend/src/app/pages/materials/material-form-dialog.component.ts; frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts; frontend/src/app/pages/materials/materials.page.ts; docs/pages/dictionaries.page.md; docs/agent-checklists/TZ-DICT-320.md

PAGES: /dictionaries/kind-labels ; /products ; /materials
PAGE_DOCS: dictionaries.page.md ; products.page.md ; materials.page.md

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Страница справочника
  - Route под Справочники (classification group или отдельный chip «Виды»).
  - Tabs/chips: Виды изделий | Виды материалов.
  - Table: key (mono), label (editable), active toggle; save PATCH.
  - Nav entry + TOC chip visible from other dictionary pages.

ШАГ 2: Wire dropdowns
  - Product form + QuickCreate kind options ← `GET .../active?scope=productKind` (fallback hardcoded seed labels if API fail — toast once).
  - Material form + materials filter ← materialKind active.
  - Display rails/detail: use same service/cache, не второй hardcoded map.

ШАГ 3: Docs — page doc; audit note Phase 1 done.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Restore DICT-311 hub cards
- Status/order enums
- backend module (319)

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. В меню Справочники виден пункт видов; rename label → dropdown изделия/материала показывает новое имя без redeploy FE constants.
2. Keys в payload create/update по-прежнему `good`/`service`/… .
3. Gates: FE tsc + jest forms; archive + report.
