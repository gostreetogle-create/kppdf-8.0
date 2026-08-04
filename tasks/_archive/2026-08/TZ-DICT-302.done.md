═══════════════════════════════════════════════════════════════
TZ-DICT-302: Dictionary List Shell — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-04
closed_by: buffy + Cursor Architect PASS
acceptance_status: PASS
verification:
  - fe tsc: PASS
  - jest pi-dictionary-shell: 6/6 PASS
protected_files:
  - frontend/src/app/shared/page/pi-dictionary-shell.component.ts
  - frontend/src/app/shared/page/pi-dictionary-shell.component.spec.ts
  - frontend/src/app/shared/page/index.ts
checklist: docs/agent-checklists/TZ-DICT-302.md
lock: .mimocode/locks/TZ-DICT-302-dictionary-shell.lock

---

## Summary

PiDictionaryShell: title + optional totalLabel + sticky [tools] + content.
No eyebrow/description. API ready for DICT-303…307.
