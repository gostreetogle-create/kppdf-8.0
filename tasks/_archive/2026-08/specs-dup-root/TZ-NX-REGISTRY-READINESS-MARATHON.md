# TZ-NX-REGISTRY-READINESS-MARATHON

## Objective

Close the remaining Registry/Constructor readiness gaps through an orchestrated, evidence-based sequence. Do not call the wave complete unless every registry has a visible route, honest filters/pagination, functional actions, and documented blockers.

## Inputs

- `tasks/_archive/2026-08/TZ-NX-REGISTRIES-FULL-CLOSEOUT.done.md`
- `tasks/_archive/2026-08/TZ-NX-REGISTRIES-SUPPLY-PASSPORT-AUDIT.done.md`
- `tasks/_archive/2026-08/TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION.done.md`
- `tasks/_archive/2026-08/TZ-NX-REGISTRIES-COMPOSITION-DIALOG-REVIEW.done.md`
- `tasks/TZ-NX-COMPOSITION-ARCHITECTURE-DECISION.md`
- `data/Снабжение.xlsx`
- `data/Pasports.xlsx`

## Required sequence

1. Verify and archive the supply/passport matrix if absent; create it from the existing audit without inventing findings.
2. Resolve or explicitly record PO decisions for status mapping, supplier matching, passport Product matching, invoice number and ambiguous requester fields. No import writes.
3. Verify the existing registry matrix: Units, Materials, Details, Modules, Products, derived Complex handling, Departments demo.
4. Verify the deferred Units DELETE backend fix status. Do not wire DELETE until the fix and tests pass.
5. Review and harden registry actions, icon semantics, filters, pagination, dialog lifecycle and composition nested-parent behavior.
6. Keep `/constructor` until registry dialogs fully cover all supported create/edit flows; then only prepare a redirect proposal, never remove it silently.
7. Produce final readiness report with PRESENT/PARTIAL/BLOCKED/MISSING and next implementation order.

## Parallel lanes

- Lane A: NX registry/browser readiness, frontend-nx only.
- Lane B: supply/passport analysis and documentation, no code/import.
- Lane C: backend integrity audit/fixes only after explicit TZ and independent backend conflict keys.

No lane may modify the same files as another lane. Each subtask needs claim, checklist, gates, archive and explicit handoff.

## Forbidden

No bulk import, no production deploy, no credentials, no new entities without decision, no fake pagination/filtering, no legacy frontend edits, no silent backend schema changes, no separate Complex/Part collection, no dead buttons.
