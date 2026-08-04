═══════════════════════════════════════════════════════════════
TZ-DICT-308: Group Chip Workspace — shell + nav groups — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: Buffy + Cursor Architect PASS
acceptance_status: PASS
verification:
  - fe tsc: PASS (Cursor)
  - jest dictionaries + shell + measurements-group: 83/83 PASS (Cursor)
protected_files:
  - frontend/src/app/shared/page/pi-group-workspace.component.ts
  - frontend/src/app/pages/dictionaries/measurements-group.page.ts
  - frontend/src/app/pages/dictionaries/measurements-group.page.spec.ts
  - frontend/src/app/app.routes.ts
  - frontend/src/app/layout/app-layout.component.ts
  - frontend/src/app/shared/page/index.ts
checklist: docs/agent-checklists/TZ-DICT-308.md
lock: .mimocode/locks/TZ-DICT-308-group-chip-workspace.lock

---

## Summary

PiGroupWorkspace shell (yellow chips, sticky, no H1/path) + nav groups +
pilot MeasurementsGroupPage (Единицы). Next: DICT-309…311 group screens / hub redirect.
