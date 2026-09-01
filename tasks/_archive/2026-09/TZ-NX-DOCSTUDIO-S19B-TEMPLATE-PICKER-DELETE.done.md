# TZ-NX-DOCSTUDIO-S19B-TEMPLATE-PICKER-DELETE — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-02
closed_by: cursor-executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS via nx build kppdf-web
  - tests: N/A (UI picker; build gate)
  - lint: NOT RUN
  - checklist: ADDED
  - status synchronization: PASS

Template picker: per-row delete with AlertDialog, `onDeleted` callback refreshes templates via `studio-list.page.ts` `loadActiveTemplates()`.
