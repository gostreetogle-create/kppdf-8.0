═══════════════════════════════════════════════════════════════
TZ-DICT-311: Retire dictionaries hub + redirects — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Cursor Architect (deploy-day)
acceptance_status: PASS
verification:
  - fe tsc: PASS
  - jest routes: hub redirect asserted
protected_files:
  - frontend/src/app/app.routes.ts
  - frontend/src/app/pages/dictionaries/dictionaries-hub.page.ts (DELETED)
checklist: docs/agent-checklists/TZ-DICT-311.md
lock: .mimocode/locks/TZ-DICT-311-retire-hub.lock

---

## Summary

`/dictionaries` → `/dictionaries/measurements`. Hub component deleted.
Default group = Измерения (fixed; last-selected → successor if needed).
