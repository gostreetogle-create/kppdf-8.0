# TZ-DOC-336 checklist — Texts/Tables shell + dialog FormField canon

> Created **before** first product code edit. Audit: DOC-334 §P1 #7–8, P2 #15–18.

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Texts + Tables use PiPageHeader + PiToolbar + PiSection | ✅ |
| 2 | Tables without promo aside | ✅ |
| 3 | Table dialog: isActive via pi-switch; fields via form-field | ✅ |
| 4 | Setup dialog chips: aria-pressed + pi-focus-ring | ✅ |
| 5 | Text align: three distinct Lucide icons + aria-label | ✅ |
| 6 | Templates duplicate via copyLabel/(copy) not documentLabel | ✅ |
| 7 | Gates: tsc + jest pattern | ✅ |
| 8 | Docs: texts.page.md, tables.page.md, PAGE-TZ-INDEX | ✅ |

## Conflict keys

- `frontend/.../texts/texts.page.ts` (+ spec)
- `frontend/.../texts/text-block-editor.component.ts` (+ spec)
- `frontend/.../tables/tables.page.ts` (+ spec)
- `frontend/.../tables/table-template-dialog.component.ts` (+ spec)
- `frontend/.../builder/template-setup-dialog.component.ts` (+ spec)
- `frontend/.../templates/templates.page.ts`
- `docs/pages/texts.page.md`, `tables.page.md`, `PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-DOC-336.md`

## Out of scope

- builder-inspector (DOC-332), builder-tool-pane/canvas (except template-setup-dialog)
- backend, auth, deploy, inventory
- full text-block-editor → modal migration

## Results

- tsc: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`) — unblocked by optional `pageKey` on `PiNavDropdownItem` (pre-existing layout usage)
- jest: PASS — 95 tests / 6 suites
- browser smoke: SKIPPED (no live server)
- commit SHA: `1b62f7387b730ffcec96eae7bf4a7b9969af3600`
- archive: `tasks/_archive/2026-08/TZ-DOC-336-texts-tables-shell-dialog-canon.done.md`
- outcome: DONE
- pushed: main
