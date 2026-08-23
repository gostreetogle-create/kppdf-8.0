# TZ-UI-DEN-531: Catalog FullEditor forms density

PAGES: /materials/:id ; /products/:id ; /modules/:id
PAGE_DOCS: material-detail.page.md ; product-detail.page.md ; module-detail.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-502; TZ-UI-DEN-520

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/catalog/**/**-full-editor*; frontend/src/app/pages/catalog/**/**-form*

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

Compact form sections: 16px section padding, 8px field stack, hairline separators.

BOM/composition panels — 12px tree text; no shadow frames (use hairline ink frame if needed).

Apply `hintTone="ai"` only where AI helper text exists.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- BOM tree logic / composition API
- Photo lightbox

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] product/material/module form specs PASS
- [ ] tsc + lint PASS
