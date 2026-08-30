# TZ-NX-DETAIL-MATERIAL-BOM — DONE (2026-08-30)

## Outcome (original session)
Деталь: выбор сырья после сохранения (BOM в notes до backend API — disclosed stopgap).

## Changes (original session)
- `material-form-dialog.component.ts` — секция «Состав (материалы)», PiOverflowSelect
- `detail-bom-notes.ts` — serialize/parse `__DETAIL_BOM__`

## Gates (original session)
- `nx build kppdf-web` green

## Real backend cutover (Claude, 2026-08-30T15:52:14Z) — see `docs/agent-checklists/TZ-NX-DETAIL-MATERIAL-BOM.md`

The notes-hack was replaced with real backend composition, reusing the
Product/Module composition schema/service/API/UI unchanged — Материал
gets its own `composition[]` field + `GET/POST/PATCH/DELETE
:id/composition` + `GET :id/tree` (the tree deliberately isolated from the
shared recursive product/module graph-walk: Деталь BOM is raw-materials-only,
flat, no cycle risk). `detail-bom-notes.ts` deleted (0 real records used
the hack format — confirmed live, no migration needed).

Live-verified end-to-end: direct API add/reject/tree-read, then the same
flow through the real browser UI (Playwright) — composition panel renders
identically to Product/Module's, old bomLines UI confirmed gone, real
add-through-picker confirmed via network log (200 → 201 → 200).

Gates: backend 117/117 suites (1092 tests) incl. new coverage; frontend
kppdf-web 45/46 (1 pre-existing unrelated failure, not this TZ's — see
checklist); `nx build` clean on a genuinely fresh run; eslint clean.

**Known remaining gap (disclosed, not fixed):** a Деталь's own BOM doesn't
yet appear nested inside a Product's full tree view — that needs loosening
`catalog-graph.service.ts`'s shared recursive walk, bigger blast radius,
left for its own TZ.

## Next
A5 PRODUCT-COMPLEX-COMPOSITION
