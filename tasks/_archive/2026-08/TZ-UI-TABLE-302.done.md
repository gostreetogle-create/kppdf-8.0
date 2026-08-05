═══════════════════════════════════════════════════════════════
TZ-UI-TABLE-302: Tree variant in pi-table + categories migrate — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Buffy + Cursor Architect PASS
acceptance_status: PASS
verification:
  - fe tsc: PASS (Cursor re-run)
  - jest pi-table|categories|pi-table-tree: included in 119 PASS batch
protected_files:
  - frontend/src/app/shared/ui/pi-table-tree.component.ts
  - frontend/src/app/shared/ui/pi-table-tree.component.spec.ts
  - frontend/src/app/pages/dictionaries/categories.page.ts
  - frontend/src/app/pages/dictionaries/categories.page.spec.ts
checklist: docs/agent-checklists/TZ-UI-TABLE-302.md
lock: .mimocode/locks/TZ-UI-TABLE-302-tree-kit.lock

---

## Summary

PiTableTreeComponent (2-level MVP, dragReorder flag); CategoriesPage migrated;
PiGroupWorkspace chrome unchanged.
