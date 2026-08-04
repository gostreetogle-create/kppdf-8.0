═══════════════════════════════════════════════════════════════
TZ-DICT-310: Group screens — Классификация / Оформление / Документы — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Cursor Architect (deploy-day slim)
acceptance_status: PASS
verification:
  - fe tsc: PASS
  - jest dictionaries+routes: 105/105 PASS
protected_files:
  - frontend/src/app/pages/dictionaries/dictionary-group-chips.ts
  - frontend/src/app/pages/dictionaries/categories.page.ts
  - frontend/src/app/pages/dictionaries/color-references.page.ts
  - frontend/src/app/pages/dictionaries/document-template-categories.page.ts
  - frontend/src/app/pages/dictionaries/text-block-categories.page.ts
  - frontend/src/app/app.routes.ts
  - frontend/src/app/layout/app-layout.component.ts
checklist: docs/agent-checklists/TZ-DICT-310.md
lock: .mimocode/locks/TZ-DICT-310-group-screens.lock

---

## Summary

Slim approach: leaf pages use PiGroupWorkspace + shared chips;
group alias routes redirect to first chip; nav has 4 groups only
(no text-block leaf). Documents group has 2 chips.
