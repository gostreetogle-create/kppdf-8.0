# TZ-SALES-371 DONE — реальное фото изделия в КП

```
ARCHIVE_MARKER
task: TZ-SALES-371
outcome: DONE
closed_at: 2026-08-14
closed_by: Buffy (predeploy executor)
workspace: D:\\kppdf-8.0
implementation_sha: cbf2e2fe14dc674e688623b332299e85a1c66146
verification:
  - acceptance criteria: PASS (см. checklist docs/agent-checklists/TZ-SALES-371.md)
  - frontend tsc: PASS
  - proposal-create Jest: 45/45 PASS
  - backend tsc: PASS
  - quotation/table-template/quotation-output Jest: 44/44 PASS
  - document-template assets Jest: 5/5 PASS
  - changed-file ESLint: PASS (no errors; baseline warnings only)
  - architecture:check: PASS
  - git diff --check: PASS
  - controlled real-photo/no-photo fixture path: PASS
  - checklist: DONE
  - progress.md: closeout update required
  - active marker: removed after archive
  - deploy: NOT EXECUTED
```

## Delivered

- Populated `Product.photoIds` uses the existing `photoListUrl` thumb/medium selection and carries the real URL plus description into `ProposalDraftLine` and persisted `QuotationItem` snapshots.
- The request-scoped КП layout exposes a visible `Фото` column with synchronized FE/BE aliases, explicit hide/show/reorder/width behavior, and no shared TableTemplate mutation.
- Live preview, browser print and saved quotation rebuild preserve `photoUrl`, `sheetLayout`, row presentation and neutral missing-photo output.
- Server PDF adds a safe backend base URL, waits for image load/error with a bounded timeout, and allows only own `/uploads/...`, configured own HTTP origins and image data assets.
- Missing or blocked assets render `Нет фото`; no demo image or fake KP3 data was introduced.
- Catalog identity snapshot metadata is persisted for the next explicit resolution workflow; inline edits do not call Product API.

## Evidence and known limits

Focused Angular/Nest suites cover the populated photo, no-photo, URL-security, image-cell mapping and saved-output paths. KP3 historical rows still lack attached photos; mass population remains the explicit `TZD-47 → TZ-MIG-303` dependency. Production, deploy, SSH, nginx, migration and wipe were not executed.
