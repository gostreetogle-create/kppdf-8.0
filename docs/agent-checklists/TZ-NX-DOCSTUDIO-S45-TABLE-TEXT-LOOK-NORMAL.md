# TZ-NX-DOCSTUDIO-S45-TABLE-TEXT-LOOK-NORMAL checklist

> Status: **CLAIMED → IN PROGRESS**
> Marker: `tasks/_active/TZ-NX-DOCSTUDIO-S45-TABLE-TEXT-LOOK-NORMAL.md`
> Audit: `docs/audits/2026-09-06-docstudio-table-select-vs-properties-audit.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-06T22:40:00+03:00
- workspace: D:\kppdf-8.0 (continuous main checkout)

## Preflight

- [x] S46 DONE (bf90a214) — liveRows survive drag; prerequisite met
- [x] TZ + audit read; canvas `.table-edit` branch ~L132–197; `onSelect` vs `openLayerProperties`
- [x] Constraints: no inline row-edit on canvas; S44 untouched; no backend/preview changes

## Acceptance

- [x] Click on table = selection only; no `.table-edit` on A4; drag/resize from first gesture — canvas spec asserts no rows-editor/no inputs, preview stays
- [x] Select auto-opens Свойства with row editor; +Строка works there — `tableEditRequest` → `openLayerProperties`; «Строки таблицы» section in properties
- [x] Empty manual table shows placeholder, not bare thead — `@empty` → «Нет строк — добавьте в Свойствах»
- [x] Token + text have visible gap (single mechanism) — global `.substitution-token { margin-right: 4px }` + canvas ::ng-deep mirror + RTE margin
- [x] S44 regressions: none — S44 suites green in focused run
- [x] page.md: canvas print-like; row edits only in Properties

## Gates

- [x] tsc — 0 errors
- [x] Focused jest — 21 suites, 111 passed / 0 failed (7 new S45 specs)
- [x] ESLint changed files — 0 errors (direct API; full-project 32 errors pre-existing on HEAD~, untouched files)
- [x] `nx build kppdf-web` LAST — exit 0

## Executor report

- See tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-S45-TABLE-TEXT-LOOK-NORMAL.done.md
