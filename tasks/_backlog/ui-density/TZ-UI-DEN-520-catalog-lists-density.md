# TZ-UI-DEN-520: Catalog lists — materials, products, modules

PAGES: /materials ; /products ; /modules
PAGE_DOCS: materials.page.md ; products.page.md ; modules.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-511

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/catalog/materials/**; frontend/src/app/pages/catalog/products/**; frontend/src/app/pages/catalog/modules/**

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: List/table cells → 12px (`text-xs`); headers → 11–13px label scale

ШАГ 2: Filter rail — outer 16px, hairline-b, no card shadow

ШАГ 3: Grid vitrine — white card on paper bg; radius sm max

ШАГ 4: Pagination/footer — compact 32px controls

ШАГ 5: One primary action per toolbar (usually «Создать» = gold if sole CTA)

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Photo upload / dropzone logic
- Expandable row behavior
- Backend filters

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] `rg 'bg-white|shadow-md|rounded-lg' frontend/src/app/pages/catalog/{materials,products,modules}` → 0 or listed exceptions
- [ ] catalog page specs PASS
- [ ] tsc + lint PASS
