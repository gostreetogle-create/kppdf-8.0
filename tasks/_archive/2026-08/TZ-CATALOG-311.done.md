═══════════════════════════════════════════════════════════════
TZ-CATALOG-311: Unified CompositionTree + CompositionEditor — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-06
closed_by: Buffy (implement) + Cursor (PASS / land / closeout)
acceptance_status: PASS
verification:
  - focused Jest composition|pi-product-modules: PASS (agent reported 4/54; soft expand+module-add coverage)
  - FE tsc: PASS on land base (chips hygiene already on main)
  - scoped eslint/prettier: PASS (agent)
feat_commit: c36eebf (cherry-pick of cd900c4)
checklist: docs/agent-checklists/TZ-CATALOG-311.md
lock: .mimocode/locks/TZ-CATALOG-311-composition-tree.lock
source_was: tasks/_active/TZ-CATALOG-311.md
next: TZ-CATALOG-315 optional polish; Production 303 independent

---

## Summary

Shared CompositionTree + CompositionEditor; getProductTree/getModuleTree; lazy depth-refetch with preserved expand; product/module detail integration; depth>5 warn; RU API errors; soft fixes (expanded state, child-module tests, stale successor docs).

## Soft

Module-detail table vs tree: tree is SoT UI on detail. Dialogs from 320 remain flat quick-edit.
