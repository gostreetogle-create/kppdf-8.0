# TZ-CATALOG-DEDUP-301 — strip FullEditor composition

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (PO CLAIM)  
**Source:** `tasks/_backlog/TZ-CATALOG-DEDUP-301-strip-fulleditor-composition.md`

## Delivered

- Removed BOM UI from `ProductFormDialog` (module cards, pickers, syncModules)
- Passport + photos + RAL retained
- Hint: состав на карточке / QuickCreate L
- Jest: BOM tests removed; DEDUP-301 hint + passport submit tests added
- Audit §5 row 301 marked DONE

## НЕ

- ProductBomPanel / QuickCreate / product-detail / BE / deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T09:45:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsconfig.app --noEmit)
  - tests: PASS (product-form-dialog.component.spec 22/22)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: deploy NO; next DEDUP-302
