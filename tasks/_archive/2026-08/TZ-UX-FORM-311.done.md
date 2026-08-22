TZ-UX-FORM-311: Material FullEditor — field packing
═══════════════════════════════════════════════════════════
Status: DONE
Agent: freebuff
Completed: 2026-08-23

What changed:
- material-form-dialog.component.ts:
  - Основные: sm:grid-cols-2 → md:grid-cols-12, name col-span-8, article col-span-4
  - Unit = md:col-span-2 (xs), SKU = md:col-span-4 (sm), Kind = md:col-span-4 (sm)
  - Weight = md:col-span-2 (nano) + max-width:5.5rem + text-align:right + tabular-nums
  - Price = md:col-span-2 (xs) + max-width:7rem + text-align:right + tabular-nums
  - Дополнительно: sm:grid-cols-3 → md:grid-cols-12, assortment/standard/grade each md:col-span-4
  - Dimensions value: added max-width:5.5rem + text-align:right + tabular-nums
  - Description/notes: rows=2 unchanged
  - Sections Основные/Дополнительно/Габариты: preserved (ui-form-sections-canon)
  - FormControl names: unchanged
- material-form-dialog.component.spec.ts: new TZ-UX-FORM-311 test asserts 12-col grid, no 50/50, max-w + tabular-nums

Gates:
- FE tsc PASS
- Jest material-form-dialog 47/47 PASS
- Lint 0 errors

Known limitation: app-pi-input doesn't forward host classes → used inline styles for max-w/text-align/tabular-nums.
