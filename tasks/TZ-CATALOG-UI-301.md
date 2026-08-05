═══════════════════════════════════════════════════════════════
TZ-CATALOG-UI-301: Catalog Group Chip Workspace cutover
═══════════════════════════════════════════════════════════════

PAGES: /products ; /modules ; /materials ; /work-types ; /people
PAGE_DOCS: products.page.md ; modules.page.md ; materials.page.md ; work-types.page.md ; people.page.md (update on close)

РОЛЬ АГЕНТА: FE executor
ЗАВИСИМОСТИ: dictionaries Group Chip live (DICT-308…312); table kit 301–305; SoT 2026-08-05-group-chip-workspace-canon.md
LAYER: 3 (layout + catalog list pages)
CONFLICT KEYS: frontend/src/app/layout/app-layout.component.ts ; frontend/src/app/pages/products/products.page.ts ; frontend/src/app/pages/modules/modules.page.ts ; frontend/src/app/pages/materials/materials.page.ts ; frontend/src/app/pages/work-types/work-types.page.ts ; frontend/src/app/pages/people/people.page.ts ; frontend/src/app/pages/catalog/catalog-group-chips.ts

Проверено: app-layout NAV_CATEGORIES; PiGroupWorkspace; dictionary-group-chips; products expandable+grid; materials photo cells.

ИСХОДНОЕ СОСТОЯНИЕ:
- Каталог = dropdown в top-nav; list pages = PiPageHeader + PiToolbar + PiSection.
- Справочники уже на Group Chip + TOC; dropdown ещё дублировал группы.
- Table kit: Flat / Expandable / Tree; Card grid = body mode on products.

ЧТО ДЕЛАТЬ:
1. Canon docs: 2026-08-05-group-chip-workspace-canon.md + DEVELOPMENT-PATTERNS §18.
2. Top-nav: entryPath for catalog + reference (no dropdown).
3. denseMain for catalog list routes (not /:id).
4. Migrate 5 list pages → PiGroupWorkspace + CATALOG_SECTION_CHIPS.
5. Table mapping: products Expandable+Card grid; others Flat (+ photo cell materials).
6. Gates: tsc + page specs.

НЕ ИЗМЕНЯТЬ: detail pages; backend; Catalog Wave 2 BE (310+); deals/warehouse/docs dropdowns; wipe/deploy.

КРИТЕРИИ ПРИЁМКИ:
- [ ] Click «Каталог» / «Справочники» — no chevron menu; lands on workspace.
- [ ] Catalog chips switch 5 peers; no H1 chrome on lists.
- [ ] pi-table-surface on kit tables; products grid toggle preserved.
- [ ] cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
- [ ] jest for the five page specs (+ layout if added) PASS

Финализация: archive tasks/_archive/2026-08/TZ-CATALOG-UI-301.done.md + progress + lock.
