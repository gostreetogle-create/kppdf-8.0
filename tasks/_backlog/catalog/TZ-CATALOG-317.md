═══════════════════════════════════════════════════════════════
TZ-CATALOG-317: FE composition client + cutover (GATE перед 304 prod)
═══════════════════════════════════════════════════════════════

STATUS: **RESERVED** in `tasks/_active/TZ-CATALOG-317.md` (Cursor handoff 2026-08-04)
  — executor must CLAIM in checklist before code; ∥ OK with CATALOG-303 backend
SOURCE: docs/audits/2026-08-04-catalog-readiness-fe-be.md P0
LAYER: 3
DEPENDS: TZ-CATALOG-302 DONE (composition CRUD + dual-read GET) ✓
HARD GATE: без этого TZ **не** делать prod-apply 304 (или 304 обязан
  временный redirect attach→composition — задокументировать в 304 report)
WHO: другой ИИ (FE) → Cursor review

CONFLICT KEYS:
frontend/src/app/shared/services/pi-product-modules.service.ts;
frontend/src/app/shared/services/products.service.ts (если трогает);
frontend/src/app/pages/products/product-form-dialog.component.ts;
frontend/src/app/pages/products/product-detail.page.ts;
frontend/src/app/pages/products/products.page.ts;
frontend/src/app/pages/modules/module-materials-form-dialog.component.ts;
frontend/src/app/pages/modules/module-detail.page.ts;
frontend/src/app/pages/modules/modules.page.ts;
docs/pages/products.page.md;
docs/pages/modules.page.md;
docs/agent-checklists/TZ-CATALOG-317.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

FE пишет состав только через:
- POST/DELETE /products/:id/modules (attach)
- PATCH module.materials[]

После 304 эти writes → 400/410. Composition endpoints появятся в 302.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

1. FE service: CRUD `/products/:id/composition`, `/modules/:id/composition`
   (SilentResult; типы CompositionLine).
2. Product form / detail: sync модулей через composition (qty), не attach.
3. Module materials dialog: читать/писать composition (lineType=material).
4. Expandable rows: предпочитать composition если непустой (dual-read зеркало GET).
5. Deprecate attachToProduct в FE (удалить вызовы; метод → throw/deprecated).
6. Минимальные specs + MANUAL_BROWSER_CHECK_REQUIRED если нет e2e FE.

НЕ: полный tree editor (**311**); lineType=product UI (**после 305**);
  Wave 2 where-used; backend migration.

═══════════════════════════════════════════════════════════════
AC
═══════════════════════════════════════════════════════════════

1. Нет вызовов attach/detach в product/module pages (rg clean).
2. Add/edit/remove composition line работает против 302 API.
3. Список/detail не падают на dual-read legacy.
4. fe tsc + targeted jest PASS.
5. Cursor PASS в CATALOG-WAVE1-REVIEW.md перед стартом 304 apply.

ПРОМПТ: GEMINI.md + DIALOG-COOKBOOK + этот файл + TZ-CATALOG-302 endpoints.
Review: docs/agent-checklists/CATALOG-WAVE1-REVIEW.md
Push: по PO.
