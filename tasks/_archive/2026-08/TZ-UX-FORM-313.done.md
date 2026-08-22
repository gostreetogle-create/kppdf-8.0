TZ-UX-FORM-313: Order form flyout — narrow fields
═══════════════════════════════════════════════════════════
Status: DONE
Agent: freebuff
Completed: 2026-08-23

What changed:
- order-form-panel.component.ts:
  - variant=full basics: Number max-w:16rem, Date max-w:11rem, Priority/Status max-w:12rem (not full flyout width)
  - Quick party: sm:grid-cols-3 → sm:grid-cols-12 with name col-span-5, phone col-span-3 max-w:14rem, address col-span-4
  - variant=items: Qty max-w:5.5rem + text-align:right + tabular-nums, Price max-w:7rem + text-align:right + tabular-nums
  - FormControl names: unchanged
  - Payload: unchanged
- order-form-panel.component.spec.ts: new TZ-UX-FORM-313 test asserts max-w + tabular-nums on short fields

Gates:
- FE tsc PASS
- Jest order-form-panel 12/12 PASS
- Lint: 3 pre-existing errors in people-form-dialog.component.spec.ts (not our file)
