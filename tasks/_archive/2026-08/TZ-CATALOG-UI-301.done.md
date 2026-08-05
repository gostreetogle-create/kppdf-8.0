═══════════════════════════════════════════════════════════════
TZ-CATALOG-UI-301: Catalog Group Chip Workspace cutover — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Cursor Architect + FE subagent
acceptance_status: PASS
verification:
  - fe tsc: PASS
  - jest: products/modules/materials/work-types page specs PASS (32 tests)
protected_files:
  - frontend/src/app/layout/app-layout.component.ts
  - frontend/src/app/pages/catalog/catalog-group-chips.ts
  - frontend/src/app/pages/products/products.page.ts
  - frontend/src/app/pages/modules/modules.page.ts
  - frontend/src/app/pages/materials/materials.page.ts
  - frontend/src/app/pages/work-types/work-types.page.ts
  - frontend/src/app/pages/people/people.page.ts
  - docs/superpowers/specs/2026-08-05-group-chip-workspace-canon.md
checklist: tasks/TZ-CATALOG-UI-301.md

## Summary

Catalog list screens use PiGroupWorkspace + CATALOG_SECTION_CHIPS.
Top-nav Каталог and Справочники are entry links (no dropdown).
Table mapping: Expandable+Card grid (products); Flat (+photo cell materials);
others Flat. Canon documented in DEVELOPMENT-PATTERNS §18.
