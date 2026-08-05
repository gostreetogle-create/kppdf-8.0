═══════════════════════════════════════════════════════════════
TZ-UI-TABLE-303: Expandable row polish — shared kit contract
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend
ЗАВИСИМОСТИ: TZ-UI-TABLE-301 DONE; products already uses expandedRow
LAYER: 2–3
PAGES: /products (reference); optional /modules if cheap
PAGE_DOCS: products.page.md

SoT: docs/superpowers/specs/2026-08-04-table-kit-design.md §1 Expandable, §6
Проверено: pi-table.component.ts expandedRow; products.page.ts consumer.

CONFLICT KEYS:
  frontend/src/app/shared/ui/pi-table.component.ts ;
  frontend/src/app/shared/ui/pi-table.component.spec.ts ;
  frontend/src/app/pages/products/products.page.ts ;
  frontend/src/app/pages/products/products.page.spec.ts ;
  docs/pages/products.page.md ;
  docs/agent-checklists/TZ-UI-TABLE-303.md ;
  tasks/_active/TZ-UI-TABLE-303.md

ЧТО ДЕЛАТЬ:
1. Зафиксировать Expandable contract в kit (a11y, toggle UX, single-expand
   default unless multi documented): без ломки products.
2. Вынести повторяющиеся куски products expandable в reusable pattern
   (helper/directive/doc+small API) — минимальный diff, не rewrite page.
3. Specs kit + products expandable; fe tsc + jest PASS.
4. Docs + ARCHIVE сам по session prompt.

НЕ: Selectable 304; raw 305 (если параллель — разные keys OK, но session
  prompt = sequential); backend; deploy.

AC:
- [ ] Expandable contract ясен в коде/spec; products зелёный.
- [ ] fe tsc + jest (pi-table + products) PASS.
- [ ] Archive DONE.

Verification:
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --testPathPattern "pi-table|products.page" --no-coverage
```
