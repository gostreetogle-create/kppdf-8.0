═══════════════════════════════════════════════════════════════
TZ-UX-FORM-306: QuickCreate Module L — состав как у изделия (FORM-304)
═══════════════════════════════════════════════════════════════

STATUS: READY

ЗАВИСИМОСТИ: FORM-304 DONE; DEDUP-302 предпочтительно (один BOM path)

LAYER: 3

CONFLICT KEYS:
frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.ts;
frontend/src/app/shared/ui/quick-create/quick-create-dialog.component.spec.ts;
frontend/src/app/pages/products/product-bom-panel.component.ts;
docs/audits/2026-08-08-data-entry-dedupe-audit.md;
docs/audits/2026-08-08-quickcreate-L-full-passport.md;
docs/agent-checklists/TZ-UX-FORM-306.md;

НЕ: product-form-dialog; ModuleMaterials; BE schema; deploy

---

## ЧТО ДЕЛАТЬ

1. Mirror product FORM-304: `entity==='module' && size==='L'` → после create не закрывать;
   показать `ProductBomPanel` с `rootKind="module"` на новом id.
2. Footer «Готово»; состав опционален.
3. Чуть шире dialog как у product L composition mode.
4. Jest: module L stay + panel; product L не сломать.

## AC

- [ ] Module L: create → BOM в том же окне
- [ ] Reuse BomPanel; jest + tsc; archive; push
