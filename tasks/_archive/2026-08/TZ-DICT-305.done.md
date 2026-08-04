═══════════════════════════════════════════════════════════════
TZ-DICT-305: Categories — Dictionary Shell cutover — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: buffy + Cursor Architect PASS
acceptance_status: PASS
verification:
  - fe tsc: PASS
  - jest categories + shell: 11/11 PASS
protected_files:
  - frontend/src/app/pages/dictionaries/categories.page.ts
  - frontend/src/app/pages/dictionaries/categories.page.spec.ts
  - docs/pages/categories.page.md
checklist: docs/agent-checklists/TZ-DICT-305.md
lock: .mimocode/locks/TZ-DICT-305-categories-shell.lock

---

## Summary

PiDictionaryShell + sticky search/type/CTA; CDK drag kept; type filter.
Next: remaining DICT-304 / 306 / 307 (∥).
