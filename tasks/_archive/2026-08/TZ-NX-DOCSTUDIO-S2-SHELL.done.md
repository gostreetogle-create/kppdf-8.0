# TZ-NX-DOCSTUDIO-S2-SHELL

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-30
closed_by: freebuff-docstudio-s2
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: focused PASS; full suite has stale parallel-wave failures
  - lint: PASS with warnings
  - checklist: ADDED
  - progress.md: not updated because shared checkout contains foreign WIP
  - status synchronization: checklist updated

Implemented NX Studio S2 shell: typed studio document service, `/studio` list/create/delete, `/studio/:id` empty A4 sheet, fixed 480px overlay panel, left/right rails, ribbon, read-only template orientation, PATCH orientation for ordinary documents, and geometry evidence with a non-null stage rect.

Known limitations:
- Live authenticated browser screenshots were unavailable; static evidence is at `docs/agent-checklists/evidence/TZ-NX-DOCSTUDIO-S2-SHELL/_geometry.json`.
- Full Nx tests include stale registry tests from the parallel CRUD wave.
- `architecture:check` reports three pre-existing violations in forbidden `frontend/**`.
- S3 blocks and S8 PDF/archive actions are out of scope.
