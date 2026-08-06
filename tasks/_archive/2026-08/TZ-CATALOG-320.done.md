═══════════════════════════════════════════════════════════════
TZ-CATALOG-320: FE composition gap — cascade + details + complex — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-06
closed_by: Buffy (implement) + Cursor (review / closeout / tsc waive)
acceptance_status: PASS
verification:
  - focused Jest: PASS (5 suites / 53 tests — pi-product-modules, product-form,
    product-composition-picker, module-materials, module-form)
  - scoped ESLint + Prettier: PASS
  - git diff --check: PASS
  - full-app tsc: WAIVED by Cursor — pre-existing errors only in
    inventory/warehouse-group-chips.ts + materials.page.ts (group-chips WIP);
    no TZ-320 conflict-key file in error list
  - browser smoke: not run (no stack in session)
checklist: docs/agent-checklists/TZ-CATALOG-320.md
lock: .mimocode/locks/TZ-CATALOG-320-composition-gap.lock
source_was: tasks/_active/TZ-CATALOG-320.md
feat_commit: 07ced5f (cherry-pick of worktree 4104bea)
next: TZ-CATALOG-311 (CompositionTree)

---

## Summary

1. FE composition types: `module | material | product`; `unitPriceOverride >= 0` product-only.
2. Module dialog: materials + child modules, self-exclude, RU kind labels.
3. Product form/detail + composition picker: module + non-raw material + product; raw blocked; derived «Комплекс».
4. Module form: `formGroupName="dimensions"` (missing-control fix).
5. Four page docs + soft note: module-detail table still materials-only (child modules in dialog; full list → 311).

## Known limits

- Full-app tsc red from unrelated group-chips WIP (waived).
- Module detail page does not list child-module lines yet → 311 / optional polish.
- No CompositionTree / depth UI → TZ-CATALOG-311.
