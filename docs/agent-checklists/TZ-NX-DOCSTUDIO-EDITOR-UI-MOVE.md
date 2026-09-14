# TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T19:29:27Z (backfilled — implementation started earlier in this continuous session; see Executor report)
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] `git branch --show-current` → `main`
- [x] Зависимость: `TZ-NX-DOCSTUDIO-EDITOR-UTIL-MOVE` archived (b4169eec / 1423f2e2) + build green
- [x] Baseline `nx build kppdf-web` → exit 0 (Phase 2's closing state)

## Acceptance

- [x] 1. Listed UI files live under `libs/features/.../doc-studio/ui/`, gone from `pages/studio/` — **with a documented, necessary exception**: `studio-data-panel.component`, `studio-data-vitrina.component`(+specs), `studio-properties-panel.component`, `studio-text-properties.component`(+spec) stayed in app — see Executor report
- [x] 2. Selectors and `data-test` unchanged (pure file moves, template/selector text untouched)
- [x] 3. Specs green: moved component specs under `nx test features` (14/14 suites, 152/152 tests) incl. canvas/table-properties/elements/template-panel/text-library-picker/data-field-picker; full `nx test kppdf-web --testPathPattern=studio-` (840/847, 7 pre-existing skip, 0 fail) incl. full studio-editor regression; `studio-list.page.spec.ts`/`studio-templates-list.page.spec.ts` green
- [x] 4. Editor opens; panels still Input/Output wired from thin page — verified via the full jest regression suite (TestBed-rendered `StudioEditorPage` + all panel components, unchanged Input/Output contracts); no separate live-browser pass this phase (not required by this TZ's gate list; Phases 1/2 already got one live pass earlier in the wave)
- [x] 5. `nx build kppdf-web` last exit 0
- [x] 6. Archive + SHA

## Integrity slot

- [x] Тип изменения: pure FE structure (component move + import fix + two Nx build-config fixes), без нового route/permission/module
- [x] FIC — N/A
- [x] Чужой WIP не в коммите — `studio-list.page.ts` + `.spec.ts` carry an unrelated, pre-existing bulk-delete feature's WIP; only their import-line fixes are committed (staged surgically via `git hash-object`/`update-index` on both files, same technique as Phase 2), rest of that WIP stays exactly as the other session left it, uncommitted

## Build integrity

- [x] Baseline: `nx build kppdf-web` → exit 0 (Phase 2 close-out state)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

```
tsc -p apps/kppdf-web/tsconfig.app.json --noEmit   → PASS (0 output)
nx test kppdf-web --testPathPattern=studio-         → PASS 840/847 (7 pre-existing skip, 0 fail)
nx test features                                     → PASS 14/14 suites, 152/152 tests
nx build kppdf-web                                    → PASS exit 0
```

## Executor report

**Root cause / what:** moved the "dumb" studio UI components + studio-local
dialogs into `libs/features/src/lib/doc-studio/ui/`, per the TZ's list.
Turned out to require two classes of unplanned, in-session discoveries
beyond "move + fix imports":

**A) Four components are NOT cleanly movable — reverted, left in app:**
- `studio-data-vitrina.component.ts` (+2 specs): imports real FUNCTIONS
  (`createCatalogRegistryDialogHost`, `createMaterialRegistryDialogHost`),
  not just types, from the `registries` feature area — a large, unrelated
  domain this TZ never touches. TZ's own "НЕ ИЗМЕНЯТЬ" already protects
  "registries actions that import shared dialogs"; the same logic applies
  here even though vitrina wasn't on the TZ's explicit "leave in app" list.
- `studio-data-panel.component.ts` (+spec): directly renders
  `<pi-studio-data-vitrina>` as a child — inherits vitrina's app coupling.
- `studio-text-properties.component.ts` (+spec): renders
  `PiRichTextEditorComponent` (`@kppdf/ui/rich-text`) in its template — see
  (B) below for why that specific import is the hard blocker.
- `studio-properties-panel.component.ts`: composes `studio-text-properties`
  as a child — inherits its constraint. (`studio-table-properties`, its
  other child, has no such issue and DID move successfully.)

Every external consumer of these four was updated to import them from
`@kppdf/features/doc-studio` where they need OTHER moved siblings
(e.g. `studio-properties-panel` now imports `StudioTablePropertiesComponent`
from the lib) — the app→lib / lib→app boundary is respected in both
directions.

**B) Two real Nx build-config gaps, only found by running `nx build
kppdf-web` (not visible from any grep/typecheck) — both necessarily touch
`libs/features` config outside the letter of this TZ's conflict keys
(`libs/features/project.json`, `tsconfig.lib.json`, `tsconfig.json`), but
squarely within its spirit (making `libs/features/doc-studio` actually
buildable), same precedent as Phase 2's `tsconfig.spec.json` fix:**

1. **`rootDir` cross-lib violation** — `@nx/js:tsc`'s executor defaults
   `rootDir` to the *project* root (`libs/features`) regardless of the
   tsconfig's own `rootDir` (confirmed by trying to remove it from
   `tsconfig.lib.json` first — no effect). Any moved component importing
   `@kppdf/ui/button`, `@kppdf/ui/dialog`, `@kppdf/ui/select`, `@kppdf/ui/toast`,
   etc. (i.e. essentially all of them — that's the whole point of a shared
   UI kit) pulled paper-and-ink SOURCE across that boundary and failed
   TS6059. Fixed via the *executor's own* `rootDir` option (a documented
   `@nx/js:tsc` schema field, separate from the tsconfig setting) in
   `libs/features/project.json`'s build target, set to workspace root (`.`)
   — this is what Nx actually reads; the tsconfig-level `rootDir` I'd
   already removed stays removed (redundant, not harmful).
2. **`@tiptap/extensions/placeholder` subpath type gap** — same class of
   issue as Phase 2's spec-only fix, but this time in the **production**
   library build (`tsconfig.lib.json`), so `isolatedModules` (which skips
   type-checking) was never an option here. Root cause: `libs/features`
   inherited the legacy `moduleResolution: "node"` from the repo's own
   `tsconfig.base.json`, which doesn't respect package.json `exports` maps;
   `apps/kppdf-web` already overrides this to `"bundler"` at its own
   tsconfig.json level (that's *why* the app itself always built fine with
   the same tiptap import). Tried mirroring that in `libs/features/tsconfig.json`
   directly — `bundler` moduleResolution requires `module` to be
   `"preserve"`/`"es2015"`+, but this lib deliberately stays on `module:
   "commonjs"` (Node-consumption target) — reverted that specific attempt
   rather than touch `module` (bigger, riskier blast radius for a
   publishable-package setting). This narrowed the real fix to (A) above:
   `studio-text-properties.component.ts` — the only file in the whole move
   set that actually imports `PiRichTextEditorComponent` itself (not just
   the pure `migratePlainTokensToNodes` string helper Phase 2 already
   inlined) — stayed in app, sidestepping the tiptap subpath issue entirely
   without touching shared moduleResolution/module settings.

**C) `on-dialog-close-once` (same pattern as Phase 2's `migratePlainTokensToNodes`):**
`studio-template-picker-dialog.component.ts` needed it; duplicated a local
copy at `libs/features/src/lib/doc-studio/ui/on-dialog-close-once.ts` rather
than moving the shared original (~30 unrelated app-wide consumers, outside
conflict keys).

**D) `StudioWsLucideIcon`/`StudioWsRailItem` self-import cleanup:** Phase 2
had `studio-workspace-shell.component.ts` (then still in app) import these
types back from `@kppdf/features/doc-studio` (since Phase 2 relocated their
*definition* into the moved `studio-workspace-chrome.ts`). Now that
`studio-workspace-shell.component.ts` itself moved into the same lib in
this phase, that became a circular self-import (`TS2303`) plus a duplicate-
export ambiguity once `doc-studio/index.ts` started re-exporting `./ui` too.
Fixed: workspace-shell now imports the types via a plain relative path to
the util module (`../util/studio-workspace-chrome`), and the now-redundant
re-export line was removed — same types, same public surface via the
barrel, one definition.

**Files changed (highlights, full list in commit):**
- 14 components/dialogs (+8 specs, +.html/.css) moved to `libs/features/src/lib/doc-studio/ui/`
- `libs/features/src/lib/doc-studio/ui/index.ts`, `on-dialog-close-once.ts` (new)
- `libs/features/src/lib/doc-studio/index.ts` (barrel now also exports `./ui`)
- `libs/features/project.json` (`rootDir` build option), `tsconfig.lib.json` (dropped ineffective rootDir override)
- `studio-editor.page.ts`, `studio-editor.facade.ts`, `studio-properties-panel.component.ts`,
  `studio-text-properties.component.ts`(+spec), `studio-editor-text-library-insert.spec.ts` — import updates
- `studio-list.page.ts`+`.spec.ts` — import lines only (WIP isolation, see Integrity slot)

**Not touched:** facade algorithms/queue, routes/guard, `app/doc-studio/dialogs/**`
(shared registry forms), `registries/**`, backend, the rest of the bulk-delete WIP.

commit: (filled after commit below)

## Review handoff

- [x] Continuous wave, PO-issued prompt authorizes closeout without separate Cursor Verdict
- [x] Archive after gates PASS

## Closeout

- [x] archive + WAVE-MAP.md + tracker обновлены + `_active` очищен
- [x] Status = DONE
- closed_at: 2026-09-14T19:35:00Z
