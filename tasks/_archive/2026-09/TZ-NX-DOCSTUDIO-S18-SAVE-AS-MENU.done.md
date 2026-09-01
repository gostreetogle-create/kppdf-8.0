# TZ-NX-DOCSTUDIO-S18-SAVE-AS-MENU — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-01
closed_by: claude
verification:
  - acceptance criteria: PARTIAL
  - typecheck: PASS via nx build
  - tests: NOT RUN
  - lint: NOT RUN
  - checklist: ADDED
  - status synchronization: PENDING chain closeout

Added Save and Save as… controls and removed the data-binding checkbox from the template dialog. Existing backend save-as flow remains unchanged; overwrite confirmation is deferred to the existing template service behavior.
