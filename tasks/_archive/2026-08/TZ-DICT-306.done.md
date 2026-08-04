═══════════════════════════════════════════════════════════════
TZ-DICT-306: Color references — Dictionary Shell cutover — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: buffy + Cursor Architect PASS
acceptance_status: PASS
verification:
  - fe tsc: PASS
  - jest color-references: 18/18 PASS
protected_files:
  - frontend/src/app/pages/dictionaries/color-references.page.ts
  - frontend/src/app/pages/dictionaries/color-references.page.spec.ts
  - docs/pages/color-references.page.md
checklist: docs/agent-checklists/TZ-DICT-306.md
lock: .mimocode/locks/TZ-DICT-306-colors-shell.lock

---

## Summary

PiDictionaryShell «Цвета (RAL)» + sticky search/active/CTA; system-color contract.
Next: DICT-304 / DICT-307 remaining.
