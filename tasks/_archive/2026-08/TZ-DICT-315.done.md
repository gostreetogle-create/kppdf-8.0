# TZ-DICT-315 — Form profiles settings UI (Справочники)

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous claim)

## Delivered

- `FormProfilesService` + spec → GET/PUT `/api/form-profiles` (DICT-314)
- Page `/dictionaries/form-profiles`: entity overflow-select, S|M|L chips,
  FieldKey checkbox matrix, LockedRequired disabled+checked, RU labels
- Save → PUT; toast on error; empty/error with «Повторить» / menu hint
- Route + nav «Профили быстрых форм» + dense workspace path
- Page doc `docs/pages/form-profiles.page.md`
- STRICT carve: peer dirty dict pages untouched; TOC leaf local to page

## НЕ (as scoped)

- QuickCreate wire (316), FullEditor, catalog-appearance, peer WIP, deploy

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T08:20:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (frontend tsc -p tsconfig.app.json --noEmit)
  - tests: PASS (jest form-profiles service+page 13/13)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
