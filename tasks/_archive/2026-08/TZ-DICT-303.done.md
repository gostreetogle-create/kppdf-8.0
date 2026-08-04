═══════════════════════════════════════════════════════════════
TZ-DICT-303: Dictionaries hub + nav groups + units route — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: buffy + Cursor Architect PASS
acceptance_status: PASS
verification:
  - fe tsc: PASS
  - jest dictionaries: 65/65 PASS
protected_files:
  - frontend/src/app/pages/dictionaries/dictionaries-hub.page.ts
  - frontend/src/app/pages/dictionaries/units.page.ts
  - frontend/src/app/app.routes.ts
  - frontend/src/app/layout/app-layout.component.ts
  - frontend/src/app/shared/ui/menu/pi-nav-dropdown.component.ts
checklist: docs/agent-checklists/TZ-DICT-303.md
lock: .mimocode/locks/TZ-DICT-303-hub-nav.lock

---

## Summary

/dictionaries = hub; Units = /dictionaries/units; nav groups with separatorLabel.
Next: parallel shell cutovers DICT-304…307.
