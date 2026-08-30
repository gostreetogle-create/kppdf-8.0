# TZ-NX-COMPOSITION-PICKER-PARITY — DONE (2026-08-30)

## Outcome
Picker: материал/деталь с фильтрами; module composition 500 fix (backend).

## Changes
- `composition-picker-dialog.component.ts` — фильтры Все/Детали/Сырьё
- `composition-tree.contract.ts` (+ spec) — label «Материал / Деталь»
- `product-module.service.ts` — `resolveMaterialId()` для populated refs
- `product-module.controller.ts` — role `user` на GET composition/tree

## Gates (original session)
- `nx build kppdf-web` green
- `product-module.service.spec.ts` 11/11

## Independent live verification + closeout (Claude, 2026-08-30T15:19:08Z)

See `docs/agent-checklists/TZ-NX-COMPOSITION-PICKER-PARITY.md` for full
evidence. Confirmed this is the exact root cause of the originally-reported
"500 BSONError on module composition after restart": `getComposition()`
called `new Types.ObjectId(String(populated-object))` → `"[object Object]"`
→ BSONError. `resolveMaterialId()` unwraps the populated `_id` and skips
unresolvable rows instead of crashing.

Live-swept all 21 modules + 68 products' composition/tree endpoints
directly against `:3000` — 0 errors, confirming the fix holds against real
current data, not just the new mocked unit test. Live-added a nested
`module`-type composition line via the actual UI picker (Playwright) and
confirmed via the real `201` response body. Full backend suite 117/117
(1092 tests) and frontend kppdf-web suite 46/46 (252 tests) both green;
`nx build kppdf-web` and both files' `eslint` clean.

**Not verified this pass:** the composition tree's expand/collapse toggle
click-path for a 3rd nesting level (data/API mechanism confirmed; the
toggle UI interaction itself wasn't separately exercised).

## Next
A5 PRODUCT-COMPLEX-COMPOSITION (A4 `TZ-NX-DETAIL-MATERIAL-BOM` first per wave order)
