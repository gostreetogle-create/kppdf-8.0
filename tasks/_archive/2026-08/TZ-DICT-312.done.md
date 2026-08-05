═══════════════════════════════════════════════════════════════
TZ-DICT-312: Group Chip Workspace polish — gap + tools CTA clip — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Buffy + Cursor Architect PASS
acceptance_status: PASS
verification:
  - fe tsc: PASS (Cursor re-run)
  - jest pi-group-workspace|dictionaries|app.routes|…: included in 119 PASS batch
protected_files:
  - frontend/src/app/shared/page/pi-group-workspace.component.ts
  - frontend/src/app/shared/page/pi-group-workspace.component.spec.ts
  - frontend/src/app/layout/app-layout.component.ts
checklist: docs/agent-checklists/TZ-DICT-312.md
lock: .mimocode/locks/TZ-DICT-312-group-chip-polish.lock

---

## Summary

denseMain for dictionary group routes; chips+tools one sticky top-0 stack;
removed 6.25rem; CTA min-width:0 protection.
