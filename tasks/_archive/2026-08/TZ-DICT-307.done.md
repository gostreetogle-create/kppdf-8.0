═══════════════════════════════════════════════════════════════
TZ-DICT-307: Doc-template + text-block categories — Shell cutover — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: buffy + Cursor Architect PASS
acceptance_status: PASS
verification:
  - fe tsc: PASS
  - jest both pages: 26/26 PASS
protected_files:
  - frontend/src/app/pages/dictionaries/document-template-categories.page.ts
  - frontend/src/app/pages/dictionaries/document-template-categories.page.spec.ts
  - frontend/src/app/pages/dictionaries/text-block-categories.page.ts
  - frontend/src/app/pages/dictionaries/text-block-categories.page.spec.ts
checklist: docs/agent-checklists/TZ-DICT-307.md
lock: .mimocode/locks/TZ-DICT-307-doc-text-cats-shell.lock

---

## Summary

Both category pages on PiDictionaryShell; sticky search+CTA; genitive totalLabel.
DICT Wave 1 cutovers: only DICT-304 may remain.
