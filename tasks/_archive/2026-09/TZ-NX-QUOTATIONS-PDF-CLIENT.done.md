# TZ-NX-QUOTATIONS-PDF-CLIENT

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-17
closed_by: freebuff
verification:
  - acceptance criteria: PASS
  - focused data-access spec: PASS (1 suite / 9 tests)
  - typecheck/build integrity: PASS via nx build kppdf-web
  - lint: N/A for this S task; compile/build passed
  - checklist: ADDED
  - progress.md: N/A (no progress.md in active contract)
  - status synchronization: PASS

Changes:
- `PiQuotationsService.downloadPdf(id)` posts to `/quotations/:id/pdf` with blob response.
- Unit coverage verifies endpoint, POST method, responseType and blob.
- Backend and generated-document archive endpoint unchanged.
