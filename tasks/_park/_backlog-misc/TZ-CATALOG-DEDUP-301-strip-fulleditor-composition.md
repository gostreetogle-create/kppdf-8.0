═══════════════════════════════════════════════════════════════
TZ-CATALOG-DEDUP-301: Убрать состав из Product FullEditor
═══════════════════════════════════════════════════════════════

STATUS: READY

РОЛЬ: Frontend

ЗАВИСИМОСТИ: audit docs/audits/2026-08-08-data-entry-dedupe-audit.md

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/products/product-form-dialog.component.ts;
frontend/src/app/pages/products/product-form-dialog.component.spec.ts;
docs/audits/2026-08-08-data-entry-dedupe-audit.md;
docs/agent-checklists/TZ-CATALOG-DEDUP-301.md;
docs/agent-checklists/_active-map.md;

НЕ: ProductBomPanel; QuickCreate; product-detail layout; BE; deploy

---

## ЧТО ДЕЛАТЬ

1. Из `ProductFormDialog` удалить секцию/UI состава (карточки модулей, ProductModulePicker,
   inline composition list / dual pickers) — оставить паспорт + фото + RAL/прочее non-BOM.
2. Если create-режим FullEditor ещё возможен — без BOM; create с списка остаётся QuickCreate.
3. В UI hint (одна строка): состав собирается на карточке изделия / в QuickCreate L.
4. Jest: убрать/переписать тесты BOM внутри FullEditor; passport tests живы.
5. Docs audit §5 отметить DONE.

## AC

- [ ] FullEditor не пишет composition / не открывает module multi-picker для BOM
- [ ] Detail + QC L BomPanel не тронуты
- [ ] tsc + jest product-form-dialog PASS; archive; push
