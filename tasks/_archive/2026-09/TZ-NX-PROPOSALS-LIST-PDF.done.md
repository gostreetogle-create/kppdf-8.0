# TZ-NX-PROPOSALS-LIST-PDF

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-17
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - focused proposals spec: PASS (1 suite / 31 tests)
  - lint: PASS (0 errors; 2 existing spec warnings)
  - nx build kppdf-web: PASS, exit 0
  - checklist: ADDED
  - page docs: UPDATED
  - status synchronization: PASS

Changes:
- Added `PDF` row action to the NX proposals list.
- Facade downloads the quotation blob through `PiQuotationsService.downloadPdf`, creates a named browser download, and reports success/errors.
- No generated-document archive call, legacy workspace, or RBAC behavior was introduced.
