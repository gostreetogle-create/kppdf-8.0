# TZ-NX-DOCSTUDIO-S8-TABLE-ERP-BIND

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-01
closed_by: Claude

## Outcome
- Added `PiStudioDocumentsService.putDataSet` for the existing backend revision-gated endpoint.
- Added table row-source selector: `Вручную`, `Из КП`, `Из заказа`.
- Persisted source selection under `table-<blockId>` and displayed missing-context hints.
- Updated document-studio page documentation.

## Verification
- Acceptance criteria: PASS for data-access API, source UI, revision-gated persistence, and hints.
- `nx test kppdf-web --testPathPattern=studio-table`: PASS, 54 suites / 294 tests passed, exit 0.
- `nx build kppdf-web`: PASS, exit 0; final gate. Existing Angular warnings only.
- Checklist: `docs/agent-checklists/TZ-NX-DOCSTUDIO-S8-TABLE-ERP-BIND.md` completed.
- Known limitation: backend resolver supplies live ERP rows to preview; canvas editing remains the existing local/manual path.
