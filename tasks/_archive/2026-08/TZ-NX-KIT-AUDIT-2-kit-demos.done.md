# TZ-NX-KIT-AUDIT-2-kit-demos — DONE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: claude-nx-kit-demos

## Scope

`frontend-nx/apps/kppdf-web/src/app/pages/{kit,forms,overlays}/*.page.ts` per
claim. Did not touch `pages/login/**`, `pages/enroll/**`, `pages/forbidden/**`,
`pages/admin-*`, `app.config.ts` auth wiring, `kit-layout.component.ts`.

## ⚠ Process note: the F3 "stale claim" call was wrong

I started this task after the PO confirmed `TZ-NX-F3-data-access`'s claim
(still `CLAIMED / IN PROGRESS`, no `.done.md`) was stale — file-write activity
in its conflict keys had stopped for ~8 minutes. It had **not** actually
finished: the Freebuff session resumed and completed a real closeout at
`2026-08-29T10:56:00+03:00` (`tasks/_archive/2026-08/TZ-NX-F3-data-access.done.md`),
**while I was mid-edit** on files in this task's own scope. Evidence:
`libs/features/src/index.ts` was rewritten by F3's closeout ~30 seconds after
my own last edit to `tsconfig.base.json` that session.

No file collision resulted — F3's closeout touched `libs/features/**`
(removing admin dialog components from that library) and `libs/features/src/index.ts`
only; my edits were confined to the 3 claimed page files plus `tsconfig.base.json`
additions, which don't overlap. I verified this after the fact (content
spot-checks on all 3 pages, full re-typecheck, full re-build) rather than by
luck. But the lesson stands: **an 8-minute write-quiet window is not proof a
claim is dead** — a session can pause (rate limit, thinking time, tool
latency) and resume. The `tasks/_active/*.md` file + its own closeout process
is the only reliable signal; a quiet mtime window is circumstantial at best
and should not have been treated as equivalent to an actual archived claim.
I also independently wrote `tasks/_archive/2026-08/TZ-NX-F3-data-access.stale-claim.md`
declaring the claim stale — that file is now superseded by F3's own real
closeout and should be read as "what I believed at 10:38", not as fact.

## B-1: `/kit/forms` — real demos instead of a bare table

- Added Section III "Select + inline create": `app-pi-select-add-row`
  (TZ-UI-PLUS-605, 25 legacy call sites) wrapping `app-pi-select`, wired to a
  demo category list + toast feedback on add.
- Added Section IV "Expandable table": existing `TableComponent`'s
  `[expandedRow]` + `[expandedRowWhen]` + `(rowClick)` — one row expands at a
  time, shows supplier/last-delivery detail. This capability existed in
  `pi-table.component.ts` since TZ-104.3 but had zero demo anywhere.
- Added Section V "Tree table": `app-pi-table-tree` with a 2-level demo
  category tree (expand/collapse). Existed since its own TZ, zero prior demo.
- Added `[rowActions]` (via `app-pi-row-actions`) to the existing Data table
  section — another previously-undemoed `TableComponent` capability.
- Passport docblock extended with entries for all three (PiSelectAddRow,
  TableTree, TableComponent's expandedRow/rowActions), matching the file's
  existing documentation convention.
- Renumbered subsequent section eyebrows (III→VI, IV→VII, V→VIII) to keep the
  Roman-numeral sequence coherent.

## B-2: `/kit/overview` — status wording

Updated the "Формы и таблицы" card description to name what's actually shown
now (select + inline create, sortable/expandable/tree table) instead of the
generic "Реактивные формы, валидация, pi-table." Status stays `canonical` —
now genuinely earned rather than aspirational.

## B-3: `/kit/overlays` — dropped the overclaim

Original docblock: "Showcase 10 overlay primitives" — 8 of 10 were toast-
simulated placeholders, one (Tooltip) was a native HTML `title` attribute, and
two (HoverCard, ContextMenu) weren't in the template at all despite being
named.

- **Fixed for real** (not just relabeled): DropdownMenu was a hand-rolled
  `<div role="menu">` lookalike; swapped in the actual `app-pi-dropdown-menu`
  (`DropdownMenuComponent`) — it's a pure presentational `items`-input
  component, no CDK-overlay positioning risk, safe swap.
- **Relabeled honestly** (real wiring deferred — each needs its own host/
  config, more than a docs-page pass should improvise): Dialog, AlertDialog,
  Sheet, Drawer, Popover sections now say "placeholder · toast" in their
  `hint` and carry an inline disclaimer paragraph naming the real service/
  directive that isn't actually invoked. Tooltip section says it's native
  `title`, not `pi-tooltip.directive.ts`. A note calls out that HoverCard and
  ContextMenu have no section at all.
- Page-header description and top docblock rewritten to state the real/
  placeholder split up front instead of claiming "10 primitives... on CDK
  Overlay."

## Side effect found and fixed: `@kppdf/ui/button`, `@kppdf/ui/dialog`, bare `@kppdf/ui`

Adding `@kppdf/ui/table-tree` / `@kppdf/ui/row-actions` / `@kppdf/ui/dropdown-menu`
secondary paths (needed for B-1/B-3) surfaced that `@kppdf/ui/button`,
`@kppdf/ui/dialog`, and bare `@kppdf/ui` pointed at `dist/libs/ui/paper-and-ink/*`,
which didn't exist — **pre-existing and already broken** before this task
touched anything (it already failed identically on F3's then-new dialog files
in `libs/features`, before any edit of mine).

Nx runs a TS-path auto-sync as a side effect of ordinary `nx` commands (`nx
lint`, `nx build`, ...) in this workspace: every time I ran one, it silently
rewrote parts of `tsconfig.base.json` back toward `src/`-based paths and, in
one case, **generated a new physical barrel file**
(`libs/ui/paper-and-ink/src/lib/pi-table-index.ts`, re-exporting
`TableComponent`/`ColumnDef`/`PiRowActionsComponent`) and repointed
`@kppdf/ui/table` at it — I did not write that file or ask for it; Nx's own
sync generator did, apparently to normalize `@kppdf/ui/table` onto the same
"points at an `index.ts` barrel" convention every other secondary entry
already follows. I did not fight this — reverting it by hand only to have Nx
silently reassert it on the next command would leave the repo in a confusing,
unstable state. Flagging it here so it's not a silent surprise for whoever
reads the tsconfig diff next.

Net result: standalone `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`
went from ~50 errors (mostly `Cannot find module '@kppdf/ui/button'` etc.
cascading across nearly every page) to **0**.

## `nx build kppdf-web`: now PASSES — but not solely because of this task

Initially failed (`features:build`, `TS6059` rootDir violation — see below for
the diagnosis). It now **passes end-to-end**, including real production
bundles for `forms-page`, `overlays-page`, `kit-overview-page`. This is the
combined effect of two independent things landing close together:

1. This task's tsconfig path additions/corrections (above).
2. **F3's own closeout** (10:56, concurrent with this task — see process note)
   removed the admin dialog components from `libs/features` entirely
   (relocated to be app-local), which eliminated the cross-library
   `@kppdf/ui/button`/`@kppdf/ui/dialog` imports that were tripping the
   rootDir isolation problem in the first place.

Diagnosis for the record, since it's a real gotcha and may recur: `libs/features`
is a properly rootDir-isolated buildable library (`tsconfig.lib.json` sets
`rootDir: "."`), which under Nx convention should consume sibling libraries
via their `dist/` build output, not raw cross-project `src/`. But
`paper-and-ink`'s `project.json` declares no explicit `build` target (only
`test`/`lint`) — so at the time I checked, any `libs/features` file importing
`@kppdf/ui/*` was structurally unresolvable regardless of which way the
tsconfig path pointed (`dist/` → didn't exist; `src/` → violated rootDir
isolation, `TS6059`). I confirmed removing `libs/features/tsconfig.lib.json`'s
`rootDir` override didn't help — TS auto-infers the same restrictive rootDir
from `include: ["src/**/*.ts"]` when no override is set — so that file is back
to its original content (no net diff from this task). The build now passes
because F3 sidestepped the problem (no more offending imports in `libs/features`),
not because the underlying gap (`paper-and-ink` has no real build target) was
fixed. If a future library import of `@kppdf/ui/*` reappears inside
`libs/features` (or any other rootDir-isolated buildable library), this will
resurface. Worth a real infra task regardless.

## Verification (final, post-F3-closeout)

```text
tsc -p apps/kppdf-web/tsconfig.app.json --noEmit   → PASS, 0 errors
nx lint kppdf-web                                   → PASS, 0 errors
nx test kppdf-web --passWithNoTests                 → PASS (1/1)
nx build kppdf-web                                  → PASS — production bundles built for
                                                       forms-page, overlays-page,
                                                       kit-overview-page (and everything else)
```

Content of all 3 edited pages spot-checked intact after F3's concurrent
closeout (grep for section markers added in B-1/B-3 — all present).

## Smoke — not completed

Attempted `nx serve kppdf-web --port=4201` in background; port 4201 was
already bound by an unidentified pre-existing process (not started by this
session — did not kill it, unclear ownership) that answers HTTP 200 for
`/kit/forms` but is an SPA shell (client-rendered), so `curl` can't confirm
whether it's serving current code, and no browser-automation tool is
available in this session to drive it interactively. Did not force past
this. `nx build kppdf-web` now succeeding and producing real bundles for the
3 edited pages is meaningfully stronger evidence than at the "FAIL" point
this report originally recorded, but an actual browser check (table scrolling
inside its own box, select-add-row clickable, expandable/tree tables working,
DropdownMenu opening for real) is still a genuine follow-up — same gap F4
flagged in `tasks/_archive/2026-08/TZ-NX-F4-kit-shell.done.md`.

## Files changed

- `apps/kppdf-web/src/app/pages/forms/forms.page.ts`
- `apps/kppdf-web/src/app/pages/kit/kit-overview.page.ts`
- `apps/kppdf-web/src/app/pages/overlays/overlays.page.ts`
- `tsconfig.base.json` — added `@kppdf/ui/table-tree`, `@kppdf/ui/row-actions`,
  `@kppdf/ui/dropdown-menu`; `@kppdf/ui/button`/`@kppdf/ui/dialog`/bare
  `@kppdf/ui`/`@kppdf/ui/table` ended up repointed via Nx's own auto-sync
  (see above), including one new Nx-generated file:
  `libs/ui/paper-and-ink/src/lib/pi-table-index.ts`.

## Next

- Real infra task: give `paper-and-ink` an actual `build` target so any
  rootDir-isolated buildable library can resolve `@kppdf/ui/*` without
  depending on nobody importing it — current green state is contingent on
  F3 having removed the only offending imports, not on the gap being closed.
- Browser smoke for `/kit/forms` and `/kit/overlays` once port 4201 ownership
  is sorted out or a browser-automation tool is available in-session.
- If Dialog/Sheet/Drawer/Popover/Tooltip/HoverCard/ContextMenu should
  actually be wired for real (not just honestly labeled as placeholder), that
  is its own task — each needs a host component + config, genuinely more
  than this pass's scope.
