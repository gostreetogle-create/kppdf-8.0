# TZ-DESK-440: tray CTA — только живые действия

> Existing implementation: `e835003b`
> Closeout docs: `0b52a7cb`
> Checklist: `docs/agent-checklists/TZ-DESK-440.md`

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-25T20:27:06+03:00
closed_by: Buffy / Freebuff

## Outcome

The existing pushed DESK-440 implementation restricts the tray primary CTA to draft confirmation, removes fake later-action buttons for non-draft statuses, keeps the existing ready shipment control, replaces siteId-facing copy with Russian wording, and adds focus rings to primary/ship/cancel controls. Ship and cancel write paths were preserved.

## Evidence

- product commit: `e835003b` (`feat(desk): tray primary CTA — only live actions (TZ-DESK-440)`)
- closeout commit: `0b52a7cb` (`docs(desk): TZ-DESK-440 closeout — checklist READY FOR REVIEW, progress entry`)
- Cursor/PO PASS accepted from supplied evidence: FE tsc PASS; order-hub-tray 20/20 PASS; manager-desk 37/37 PASS; lint PASS; architecture failure limited to unrelated materials/supply violations.

## Verification

- acceptance criteria: PASS
- typecheck: PASS
- tests: PASS (order-hub-tray 20/20; manager-desk 37/37)
- lint: PASS (0 errors; pre-existing warnings recorded in checklist)
- architecture: known unrelated FAIL recorded in checklist
- checklist: UPDATED to DONE; Integrity slot already complete
- progress.md: UPDATED
- status synchronization: PASS

## Known limits

Live `/desk` smoke was accepted by Cursor/PO evidence; no backend, shipping page, or order status semantics were changed. The active/root TZ markers are removed only after this archive was written.
