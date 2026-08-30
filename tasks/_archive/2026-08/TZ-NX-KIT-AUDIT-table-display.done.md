# TZ-NX-KIT-AUDIT-table-display — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: claude

## Origin

PO audit request: "на какой стадии UI Kit" (Forms & Tables screenshot showed the
data-table overflowing the viewport — Кол-во/Статус columns pushed off-screen).

## Root cause

`TableComponent` (`pi-table.component.ts`, selector `app-pi-table`) was the only
top-level `app-pi-*` component in `paper-and-ink` whose `styles` array omitted
`:host { display: block; }`. Every sibling (`pi-section`, `pi-table-tree`, `card`,
etc.) sets it explicitly — Angular custom elements default to `display: inline`
otherwise. With the host inline, the child `.pi-table-surface`
(`overflow-x-auto`, meant to scroll the table horizontally inside its own
bordered box) never got a proper block containing-block width from the host,
so the table's natural content width escaped containment and the page grew a
horizontal scrollbar instead of the table scrolling internally.

## Result

- Added `:host { display: block; }` to `pi-table.component.ts` (single rule,
  first entry in the `styles` array, matching the established sibling pattern).
- No API/behavior change; no other files touched.
- Scoped strictly to `libs/ui/paper-and-ink/**`; did not touch
  `frontend-nx/apps/kppdf-web/**` or `frontend-nx/libs/data-access/**`, both
  under active concurrent work by `TZ-NX-F3-data-access` (freebuff-nx-f3) —
  confirmed live via mtime probe (files in `libs/data-access/**` modified
  seconds before this check, 2026-08-29T10:11).

## Verification

```text
tsc -p libs/ui/paper-and-ink/tsconfig.lib.json --noEmit   → PASS (0 errors)
nx lint paper-and-ink                                     → PASS (0 errors, 36 pre-existing warnings, unchanged)
nx test paper-and-ink --passWithNoTests                   → 6 suites / 3 tests failing — PRE-EXISTING, unrelated to this change
```

## known_limitation (pre-existing, out of scope for this fix)

`nx test paper-and-ink` has 6 failing suites (`card`, `badge`,
`pi-toast.service`, `pi-table-tree`, `pi-alert-dialog`,
`pi-showcase-card`) — none touch `pi-table.component.ts` or anything
downstream of a `:host` CSS rule; failure signature is an Angular
signal/`@if`-control-flow change-detection timing issue in test fixtures
(`ɵɵconditional` in the stack), not a table/display regression. F2a's
closeout checklist verified `tsc`/`build`/`lint` but never actually ran
`nx test paper-and-ink` to green, so this gap was already latent before
today's change. Flagged to PO in the audit reply; not fixed here — separate
task, separate files, would need its own claim.

## Broader audit findings (reported to PO, not actioned — see chat)

- `PiSelectAddRowComponent` (`select-add-row/`, TZ-UI-PLUS-605 — the "+" add-
  option-inline-with-select pattern) and `TableTreeComponent`
  (`pi-table-tree.component.ts` — expandable/tree table) both exist, both
  migrated into `paper-and-ink` in F2a, both proven in production (25 legacy
  `frontend/` call sites for select-add-row), but neither has a single usage
  in `frontend-nx/apps/kppdf-web` — the kit showcase pages don't demonstrate
  them despite "Формы и таблицы" being labeled "Статус: canonical" on
  `/kit/overview`.
- `pi-table.component.ts` itself supports `expandedRow`, `rowActions`,
  `selectionMode`, sticky columns — none demoed on `/kit/forms`.
- `/kit/overlays` docblock claims to showcase "10 primitives" but a code
  comment admits several (Sheet, Drawer, Tooltip, Popover, HoverCard,
  ContextMenu) are simulated via Toast calls for demo simplicity rather than
  actually exercised.
- Wiring real demos for the above requires editing
  `frontend-nx/apps/kppdf-web/**`, which is live-claimed by
  `TZ-NX-F3-data-access` right now — deferred to a follow-up TZ once F3
  archives.
