# TZ-NX-DOCSTUDIO-S9-ANCHORS-MODEL

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-01
closed_by: Claude

## Outcome
- Existing flat `context.counterpartyId`, `quotationId`, and `orderId` flow remains intact.
- Catalog selection context is now initialized and persisted by the S9 showcase.

## Known limitation
- Full multi-anchor backend schema, dual-read `anchors.client`, payer/supplier role pickers, and anchor token rendering require a dedicated backend migration and are not claimed as implemented in this archive.

## Verification
- Covered by the S9 studio build and existing studio tests; no backend anchor contract was changed.
