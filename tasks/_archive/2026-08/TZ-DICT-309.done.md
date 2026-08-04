═══════════════════════════════════════════════════════════════
TZ-DICT-309: Измерения — cutover (units → Group Chip Workspace) — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Cursor Architect (deploy-day closeout)
acceptance_status: PASS
verification:
  - fe tsc: PASS
  - jest app.routes + dictionaries + measurements: 93/93 PASS
protected_files:
  - frontend/src/app/app.routes.ts
  - frontend/src/app/app.routes.spec.ts
  - frontend/src/app/pages/dictionaries/dictionaries-hub.page.ts
  - frontend/src/app/pages/dictionaries/units.page.ts (DELETED)
  - frontend/src/app/pages/dictionaries/units.page.spec.ts (DELETED)
checklist: docs/agent-checklists/TZ-DICT-309.md
lock: .mimocode/locks/TZ-DICT-309-units-measurements-cutover.lock

---

## Summary

`/dictionaries/units` → redirect `/dictionaries/measurements`.
UnitsPage removed; single UX = MeasurementsGroupPage.
