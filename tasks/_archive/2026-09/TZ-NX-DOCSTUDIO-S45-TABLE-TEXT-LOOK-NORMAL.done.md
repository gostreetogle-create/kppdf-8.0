# TZ-NX-DOCSTUDIO-S45-TABLE-TEXT-LOOK-NORMAL — DONE

- agent_id: freebuff
- claimed_at: 2026-09-06T22:40:00+03:00
- archived_at: 2026-09-06T23:39:00+03:00
- implementation_sha: 3e45e6803671250015fefdf9d959b2d7708e6843
- status: DONE

## What shipped (per TZ steps)

**ШАГ 1 — row-edit off the canvas** (`studio-blocks-canvas.component.ts`):
the `@if (... manual) { .table-edit }` admin-grid (Вкл / inputs / × / + Строка)
is deleted from the A4 sheet; the document-like `table-preview` renders **always**.
Empty tbody now shows a placeholder row «Нет строк — добавьте в Свойствах»
(`@empty` + `.table-preview__empty`), not a bare thead. Dead code removed:
`table-edit*` styles, `tableRowsAll/tableRowSource/visibleColumnIndices` wrappers,
`onTableCell/toggleTableRow/addTableRow/removeTableRow` canvas methods, the
`studio-block--table-editing` class binding, and the now-unused
`tableRowsChange/tableDisabledRowsChange` outputs.

**ШАГ 2 — rows in Свойства** (`studio-table-properties.component.ts`):
new «Строки таблицы» section (`data-test="studio-table-rows-editor"`) with Вкл
checkboxes, cell inputs, row ×, and **+ Строка** — the canvas UI moved 1:1 into the
right panel. Emits `rowsChange` / `disabledRowsChange` (wired via
`patchTableRows` / `patchTableDisabledRows` in the editor, same write path as
before → no backend change). Live-source tables get a read-only hint instead of a
duplicate write path. Old hint «Строки редактируйте на листе A4» removed.

**ШАГ 3 — select → Свойства** (`studio-editor.page.ts` + canvas):
canvas table click now additionally emits `tableEditRequest`, handled by
`openLayerProperties($event)` → right panel opens on «Свойства» with the table's
column/source/rows editor. Drag/resize work from the first pointerdown — no
inputs left on the sheet to fight with.

**ШАГ 4 — token spacing**: `.substitution-token { margin-right: 4px }` added to
`paper-and-ink` global stylesheet + mirrored via `::ng-deep` on the canvas
(`pi-rich-text-editor.component.ts` margin `0 1px` → `0 4px 0 1px`). Single
mechanism (chip margin) — content never gets double spaces.

**ШАГ 5 — tests + page.md**:
- new `studio-blocks-canvas.component.spec.ts` (3): selected manual table keeps
  document-like preview, no `.table-edit`/rows-editor on canvas, emits
  `tableEditRequest`; empty manual table renders placeholder, not bare thead;
  no inputs on the sheet (drag first-gesture).
- new `studio-table-properties.component.spec.ts` (4): rows editor present for
  manual with + Строка emitting row matrix; cell edit emits updated matrix; row
  remove remaps disabled indices; live-source shows hint instead of editor.
- page.md: canvas is print-like, click = selection + auto-Свойства, row edits
  only in Properties (see below).

## S44 preserved

`table-preview` rendering for catalog/quotation/order sources untouched; only
the manual-source inline editor was removed (replaced by Properties panel).

## Gates (order per executor-loop)

- `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — 0 errors
- Focused jest — studio suites: **21 suites, 111 passed / 0 failed**
  (incl. 7 new S45 specs; S44/S46 suites green)
- ESLint on changed files (direct ESLint API) — **0 errors**, 19 pre-existing
  warnings. NOTE: `pnpm lint` full-project shows 32 pre-existing template
  errors in production/gantt + studio shell files NOT touched by this task
  (verified identical on HEAD~ via stash) — pre-existing, not S45's.
- `nx build kppdf-web` LAST — exit 0

## Constraints honoured

- no backend/preview pipeline changes; D55/D56 IA untouched; Chrome C1–C4
  untouched; no warehouse, no desktop, no foreign WIP staged.
