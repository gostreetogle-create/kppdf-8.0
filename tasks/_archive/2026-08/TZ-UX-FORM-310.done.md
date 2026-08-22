TZ-UX-FORM-310: Module FullEditor — field packing
═══════════════════════════════════════════════════════════
Status: DONE
Agent: freebuff
Completed: 2026-08-23

What changed:
- module-form-dialog.component.ts: name/article → md:grid-cols-12 (name col-span-8, article col-span-4), not 50/50
- Dimensions + weight: single band row using CSS grid with formGroupName.contents wrapper
  W/H/Depth max-w:5.5rem, text-right, tabular-nums; unit max-w:7rem; weight max-w:5.5rem in same row
- Section title: "Габариты и вес" (combined)
- Notes: rows=3 unchanged
- Photos + work types: not inflated
- module-form-dialog.component.spec.ts: new TZ-UX-FORM-310 test asserts 12-col grid, no grid-cols-2, max-w + tabular-nums, same data-test

Gates:
- FE tsc PASS
- Jest module-form-dialog 7/7 PASS
- Lint 0 errors

Known limitation: app-pi-input doesn't forward host classes → used inline styles for max-w/text-align/tabular-nums.
