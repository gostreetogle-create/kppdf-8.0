# TZ-NX-DOCSTUDIO-ELEMENT-CREATION-AND-RAIL-FIX checklist

> Status: **DONE**
> Context: `docs/architecture/nx-doc-studio.md` §6 (S4–S6 territory) — not a single
> planned slice, a live bugfix+closeout pass on top of another session's
> in-progress, uncommitted work (see Claim slot).
> Commit/push: per `docs/GIT-POLICY.md` — claimed executor, gates green → commit this step

## Claim slot

- Implementation (bulk): Cursor session, same day, uncommitted — real-time edits
  observed up to `2026-08-30T16:56:45+03:00` (file mtimes), confirmed stopped
  before this session touched anything (two mtime checks ~6 minutes apart,
  identical). PO confirmed by chat: "там просто ещё курсор у меня работал...
  вроде остановился" — expected, not a rogue process.
- Independent verification + 2 bugfixes + closeout: `agent_id: claude`,
  `claimed_at: 2026-08-30T17:00:00Z`, `workspace: D:\kppdf-8.0`,
  `team_room_claim: unavailable`

## What Cursor built (this session, verified working, not independently line-reviewed given scale — ~1700 LOC across 9 modified + 12 new files)

- Real inline table editor (`studio-table-editor.component.ts`): editable
  grid cells, add/remove rows, wired into the properties panel — live-verified:
  created a table, typed into two cells, added a row, values persisted
  correctly in both the canvas thumbnail and the properties panel.
- Elements/Layers/Properties rail panels restructured (`studio-elements-panel.component.ts`
  is new; `studio-layers-panel.component.ts` / `studio-properties-panel.component.ts`
  substantially expanded) — layers list with drag-reorder, lock, visibility,
  z-order all rendering with real chrome (not the unstyled plain-text state
  from earlier today's audit).
- App-shell tool rail generalized from static per-app arrays to a shared
  `ShellToolRailService` (new) so a page like Studio can register its own
  rail tools instead of the shell hardcoding them — necessary infrastructure
  for the Elements/Layers/Properties rail buttons to exist at all.
- `studio-workspace-shell.component.*` (new, `.ts/.html/.css`) + `studio-workspace-chrome.ts`
  + `studio-layout.ts` (+ specs) — workspace shell restructuring.
- `studio-block-helpers.ts` (+ spec) — extracted block helpers, already tested (2/2).

## Bugs found live and fixed (this pass)

### 1. "+ Текст" / "+ Фото" were dead on any document with zero existing layers

`studio-elements-panel.component.ts`'s two buttons were bound
`[disabled]="!activeLayerId() || previewMode()"`. On a **brand-new document**
— the single most common first action — there is no active layer yet, so
both buttons rendered `disabled` (`pointer-events-none`), full stop. Only
the Table button worked (it had no such gate and already self-creates a
layer). Confirmed via Playwright: on a fresh doc, the "+ Текст" button
resolved with a real `disabled` DOM attribute and a 30s click timeout.

Root cause, once found, was almost cosmetic: `studio-editor.page.ts` already
had a complete, correct `createTextLayer()` private method — and
`addImageToActiveLayer()` already correctly fell back to its own
`createImageLayer()` when no image layer was active — but
`addTextToActiveLayer()` was never wired to call `createTextLayer()`; it
just showed a `toast.error('Выберите текстовый слой')` and did nothing.
Fixed by mirroring the already-working image pattern exactly, and removed
the now-unnecessary `!activeLayerId()` gate from both buttons in the panel
(Table never had it; there's no reason Text/Photo should either, now that
both self-bootstrap correctly). Renamed the labels "Текст на слое"/"Фото на
слое" → "+ Текст"/"+ Фото" to match Table's "+" convention now that all
three genuinely create-on-demand.

**Live-verified after the fix:** fresh document, zero prior layers, click
"+ Текст" → real "Слой 1" appears in the Layers panel, real positioned text
box "Новый текст" appears on the canvas, zero console errors. Screenshot in
session scratchpad.

### 2. App-shell tool rail regression, app-wide (not Studio-specific)

`app-shell.component.spec.ts`'s `'renders demo tool buttons as disabled
placeholders on rails'` test started failing — pre-existing before this
session touched anything (first observed during A4, wrongly assumed at the
time to be an unrelated concern and parked in `_NOW.md`; it was not
unrelated, it was Cursor's own necessary refactor with a side effect left
unresolved). Root cause: `ShellToolRailService`'s default state was
`{ left: [], right: [] }` — any page that doesn't explicitly call
`setTools()` (i.e. every page except Studio) now shows an **empty** rail,
where every page used to show the same static disabled demo placeholders
(`LEFT_TOOL_RAIL_ITEMS`/`RIGHT_TOOL_RAIL_ITEMS`, still defined in
`tool-rail-definitions.ts`, just no longer wired to the new dynamic service).

Fixed by making the service's default (and `clear()`-restored) state the
same placeholder set, mapped into the new `ShellToolRailItem` shape
(`disabled: true`, inert `onClick`). Studio's own `setTools()`/`clear()`
lifecycle (already correctly called in `ngOnInit`/`ngOnDestroy`) now
correctly overrides on entry and correctly **restores the defaults** on
exit, instead of leaving the rail empty.

**Live-verified:** swept `/registries`, `/admin/devices`, and `/studio`
(list view) — all three show exactly 3 left + 2 right rail icons (the
default placeholder set), 0 console errors on any of them.

## Noted, not fixed (cosmetic, disclosed)

- Build output shows one `NG8102` warning in `studio-table-editor.component.ts`
  (`row[colIdx] ?? ''` — the left side is never nullable, so `??` is a no-op).
  Harmless, not a runtime error, doesn't affect behavior — a one-line
  cleanup for whoever's next in that file, not worth a separate touch here.

## Explicitly NOT done this pass (disclosed, not silently dropped)

Per the earlier live capability audit (this same session): table column
configuration (rename/add/remove columns, not just rows), save-as-template
UI wiring (backend ready, zero frontend), PDF/Archive ribbon buttons
(backend ready, zero frontend), image data-binding / tiled watermark
backgrounds (not built anywhere, needed for the passport use case
specifically) all remain open. This pass fixed two concrete, high-confidence
regressions found live — it is not a claim that S4–S8 or the passport
capability are complete.

## Integrity slot

- [x] Тип изменения: **page** (Studio pages) + **module** (shared
      `ShellToolRailService`, app-wide but behavior-preserving/restoring, not new)
- [x] FIC §A/§B/§C/§E — N/A (no route, permission, backend, or MCP change)
- [x] page.md — N/A, no route/contract change
- [x] Чужой WIP не в коммите — this commit **is** Cursor's WIP, taken over
      explicitly by PO instruction ("давай ты и дальше доделай"), verified
      working, and closed out properly rather than left uncommitted
- [x] Coupling map — N/A

## Gates (factual)

```
pnpm exec nx build kppdf-web → exit 0
pnpm exec nx test kppdf-web → 50/50 suites, 269/276 tests (7 skipped), 0 failures
  — including the previously-failing app-shell.component.spec.ts, now green,
  and the new studio-elements-panel.component.spec.ts (4/4 new tests)
eslint on every touched/new file → 0 problems (fixed one no-empty-function
  error in shell-tool-rail.service.ts's placeholder onClick, added an
  explanatory comment)

Live (Playwright, admin session):
  - Fresh doc + "+ Текст" with zero prior layers → real layer created,
    zero console errors (previously: disabled button, unclickable)
  - Table block: create → edit 2 cells → add row → values correct in both
    canvas and properties panel, zero console errors
  - Rail sweep across /registries, /admin/devices, /studio → 3+2 default
    icons everywhere, zero console errors
```

## Executor report

- What was verified: build, full test suite, and targeted live interaction
  covering the two fixed bugs plus a broad app-wide rail sweep. Did NOT
  line-review the full ~1700 LOC Cursor contributed (table editor internals,
  workspace-shell restructuring) — outcome-verified via build/test/live
  interaction instead, proportionate to the size of a single-session review.
- Known limits: see "Explicitly NOT done" above.
- Conflict disclosure: confirmed via two file-mtime checks (~6 min apart,
  identical) that the other session had genuinely stopped before any edit
  here; PO explicitly authorized taking over.

## Review handoff

- No wave inbox configured; this checklist + live evidence is the review artifact.

## Closeout

- [x] `_NOW.md` synced
- Status = DONE
- closed_at: 2026-08-30T17:21:01Z
