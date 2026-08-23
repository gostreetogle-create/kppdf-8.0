# TZ-UI-DEN-521: Party lists — counterparties, organizations, categories

PAGES: /counterparties ; /organizations ; /categories
PAGE_DOCS: counterparties.page.md ; organizations.page.md ; categories.page.md

РОЛЬ АГЕНТА: Frontend UI Engineer

ЗАВИСИМОСТИ: TZ-UI-DEN-511

LAYER: 3

CONFLICT KEYS: frontend/src/app/pages/counterparties/**; frontend/src/app/pages/organizations/**; frontend/src/app/pages/categories/**

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

Same sweep as DEN-520: paper bg, hairline, 12px table, compact filter, single gold CTA on create flow entry.

Role chips / type selectors: gold fill only when single primary; else outline.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

- [ ] No shadow on list containers
- [ ] Party list specs PASS
- [ ] tsc + lint PASS
