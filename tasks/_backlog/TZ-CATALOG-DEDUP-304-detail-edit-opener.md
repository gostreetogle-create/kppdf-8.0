═══════════════════════════════════════════════════════════════
TZ-CATALOG-DEDUP-304: «Редактировать» на карточке → тот же FullEditor
═══════════════════════════════════════════════════════════════

STATUS: READY

ЗАВИСИМОСТИ: DEDUP-301 (FullEditor без состава)

LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/products/product-detail.page.ts;
frontend/src/app/pages/materials/material-detail.page.ts;
docs/audits/2026-08-08-data-entry-dedupe-audit.md;
docs/agent-checklists/TZ-CATALOG-DEDUP-304.md;

НЕ: новый form; composition; deploy

---

## ЧТО ДЕЛАТЬ

1. Product detail: кнопка «Редактировать» → open existing ProductFormDialog с data=product.
2. Material detail: «Редактировать» → MaterialFormDialog (сейчас detail read-only).
3. После close с успехом — reload карточки.
4. Не дублировать поля на странице.

## AC

- [ ] Edit с detail открывает тот же диалог, что список
- [ ] tsc; archive; push
