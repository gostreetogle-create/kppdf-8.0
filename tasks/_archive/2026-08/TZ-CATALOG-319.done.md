═══════════════════════════════════════════════════════════════
TZ-CATALOG-319: Catalog docs sync — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: Cursor (docs-only, parallel to CATALOG-302/316)
acceptance_status: PASS
verification:
  - docs-only; no product code
  - modules.page.md: hard-delete Module documented
  - module-detail.page.md: /product-module-photos
  - product-detail.page.md stub created
  - PAGE-TZ-INDEX + materials.page.md + backlog README updated
protected_files:
  - docs/pages/modules.page.md
  - docs/pages/module-detail.page.md
  - docs/pages/product-detail.page.md
  - docs/pages/products.page.md
  - docs/pages/materials.page.md
  - docs/pages/PAGE-TZ-INDEX.md
  - docs/pages/README.md
  - tasks/_backlog/catalog/README.md
checklist: docs/agent-checklists/TZ-CATALOG-319.md
lock: .mimocode/locks/TZ-CATALOG-319-catalog-docs-sync.lock

---

## Summary

Выровнены page docs с кодом (soft-delete Module ложь; photo API;
индекс каталога + readiness/316/317 ссылки). Product detail stub добавлен.
