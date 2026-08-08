═══════════════════════════════════════════════════════════════
TZ-UX-DIALOG-304: Photo attach add-and-continue
═══════════════════════════════════════════════════════════════

> Canon: docs/pages/ui-add-and-continue.md · predecessor TZ-UX-DIALOG-303 DONE.
> PO: same pain as composition — add several photos without reopening dialog.

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UX-DIALOG-303 DONE

LAYER: 3

PAGES: /products/:id ; /modules/:id (photo sections)
PAGE_DOCS: product-detail.page.md ; module-detail.page.md ; ui-add-and-continue.md

CONFLICT KEYS: frontend/src/app/pages/products/product-detail.page.ts; frontend/src/app/pages/modules/module-detail.page.ts; (any photo-picker dialog opened from them); docs/pages/ui-add-and-continue.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ
═══════════════════════════════════════════════════════════════

1. Composition picker already add-and-continue (303).
2. Photos: audit current UX (URL field / file picker / dialog). If single-shot
   close after one attach — apply same pattern: Add keeps UI open, session list,
   Закрыть when done.
3. If photos are already inline multi without dialog — document N/A + thin AC
   (improve batch UX: add URL → clear field stay on page; multi-file input).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Audit photo attach paths on product + module detail (grep addPhoto / photo).
ШАГ 2: Apply add-and-continue where a dialog/modal closes per photo; else improve
  inline flow (clear input, toast, stay, list grows).
ШАГ 3: Specs + docs note under ui-add-and-continue.md § Photos.

НЕ: BomPanel rewrite; desktop; supply; FACT-304 material keys if parallel;
  S3 infra changes beyond existing upload API.

AC:
1. Can attach ≥3 photos in one sitting without reopening a modal (or N/A justified).
2. tsc + touched specs PASS; archive; push.
3. Manual light product+module detail.
