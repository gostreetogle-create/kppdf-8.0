# TZ-NX-DOCSTUDIO-S19B-TEMPLATE-PICKER-DELETE — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-02
closed_by: cursor-executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS via nx build kppdf-web
  - tests: NOT RUN
  - lint: NOT RUN

Template picker delete: row delete button → AlertDialog → PiDocumentTemplatesService.remove(); onDeleted callback refreshes parent list.
