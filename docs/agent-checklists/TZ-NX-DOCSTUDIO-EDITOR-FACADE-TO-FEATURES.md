# TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-09/TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-14T19:38:11Z (backfilled — implementation started earlier in this continuous session; see Executor report)
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] `git branch --show-current` → `main`
- [x] Зависимость: `TZ-NX-DOCSTUDIO-EDITOR-UI-MOVE` archived (9f50403d / 84653204) + build green
- [x] Baseline `nx build kppdf-web` → exit 0 (Phase 3's closing state)

## Acceptance

- [x] 1. No `studio-editor.facade.ts` under `pages/studio/`
- [x] 2. Facade imported from `@kppdf/features/doc-studio`; still page-provided instance (`providers: [StudioEditorFacade]`, unchanged)
- [x] 3. `rg "from '.*apps/kppdf-web" libs/features/src/lib/doc-studio` → 0 hits (verified)
- [x] 4. Specs green: full `nx test kppdf-web --testPathPattern=studio-editor` — 117/117 suites, 840/847 tests (7 pre-existing skip, 0 fail); TestableEditor still on page, zero spec rewrites
- [x] 5. Dirty guard / chrome tools / rename & save-as-template & shared table/text library save still work — covered by the regression suite (finalize/chrome-ia/write-serial/etc. specs); shared-dialog save flows moved to page per ШАГ2, see Executor report
- [x] 6. `nx build kppdf-web` last exit 0
- [x] 7. Archive; WAVE 1-4 marked DONE in WAVE-MAP

## Integrity slot

- [x] Тип изменения: pure FE structure (facade relocation + two type-ownership fixes), без нового route/permission/module
- [x] FIC — N/A
- [x] Чужой WIP не в коммите — `studio-list.page.ts`/`.spec.ts` not touched this phase (still carrying the same pre-existing bulk-delete WIP from earlier phases, diff unchanged)
- [x] Conflict keys: TZ listed 4 files; this phase also touched `studio-data-panel.component.ts` and `studio-data-vitrina.component.ts` (necessary type-ownership fix, not anticipated by the TZ text — see Executor report), a deliberate, documented scope expansion in the same spirit as Phase 2/3's build-config fixes

## Build integrity

- [x] Baseline: `nx build kppdf-web` → exit 0 (Phase 3 close-out state)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**`
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

```
tsc -p apps/kppdf-web/tsconfig.app.json --noEmit         → PASS (0 output)
nx test kppdf-web --testPathPattern=studio-editor          → PASS 117/117 suites, 840/847 (7 pre-existing skip, 0 fail)
nx test features                                            → PASS 14/14 suites, 152/152 tests
nx build kppdf-web                                           → PASS exit 0
rg "from '.*apps/kppdf-web" libs/features/src/lib/doc-studio → 0 hits
```

## Executor report

**Root cause / what:** moved `studio-editor.facade.ts` (the whole domain
brain extracted in Phase 1, ~2400 LOC) from `apps/kppdf-web/.../pages/studio/`
to `libs/features/src/lib/doc-studio/studio-editor.facade.ts`, exported from
the barrel, kept `@Injectable()` without `providedIn: 'root'` — page still
provides it via `providers: [StudioEditorFacade]`.

**Two things the TZ's own text anticipated only partially — both found by
actually reading the facade's full import list / running the build, same
pattern as every prior phase in this wave:**

1. **Shared registry dialogs** (`TableTemplateFormDialogComponent`,
   `TextBlockFormDialogComponent` under `app/doc-studio/dialogs/`) — the TZ
   explicitly flagged this one (ШАГ2) and gave the fix shape: split each
   `open*` method into a facade-side "what to prefill"
   (`buildSaveTableTemplateDraft`/`buildSaveTextBlockDraft`) and a
   facade-side "what to do with the result"
   (`applySavedTableTemplate`/`applySavedTextBlock`), with the actual
   `PiDialogService.open(...)` + `onDialogCloseOnce` call moved to two new
   page methods of the same name. Not one byte of the original prefill-
   payload or save logic changed, only where the `dialog.open` call itself
   lives.
2. **NOT anticipated by the TZ:** the facade also imported 4 plain TYPES
   (`StudioDataCategory`, `StudioDataPanelCategoryJump` from
   `studio-data-panel.component`; `StudioCatalogSelections`,
   `StudioShowcaseKind` from `studio-data-vitrina.component`) — both of
   which Phase 3 had to leave in `apps/kppdf-web` (their own, unrelated
   cross-feature/build-boundary coupling — see that phase's checklist).
   Moving the facade without fixing this would have re-created exactly the
   "facade imports apps/kppdf-web" violation ШАГ2 exists to prevent, just
   via types instead of dialog components. Fix: relocated all 4 type
   definitions into the facade file itself (their natural single owner now)
   and pointed `studio-data-panel.component.ts`/`studio-data-vitrina.component.ts`
   (still in app) to import them back from `@kppdf/features/doc-studio` —
   same shape, single definition, same pattern already used for
   `StudioWsRailItem`/`StudioWsLucideIcon` in Phase 2/3.

**Also found (not anticipated by anyone until the build actually ran):**
once the facade itself moved inside `libs/features/doc-studio/`, its two
big re-export blocks that Phase 2/3 had pointed at the package alias
`@kppdf/features/doc-studio` (because the facade used to live outside that
package, in the app) became a **self-import of its own barrel** — same
`TS2303` circular-alias class of bug fixed for `studio-workspace-shell.component.ts`
in Phase 3. Fixed by switching those two imports to plain relative paths
(`./ui`, `./util`) now that the facade is a direct sibling of both.

**Files changed:**
- `libs/features/src/lib/doc-studio/studio-editor.facade.ts` (moved + import fixes + type relocations + dialog-flow split)
- `libs/features/src/lib/doc-studio/index.ts` (exports facade)
- `apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts` (facade import path, new `openSaveTableTemplateDialog`/`openSaveTextBlockDialog` implementations, new injects: `PiDialogService`, `DestroyRef`, `Injector`)
- `apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts`, `studio-data-vitrina.component.ts` (import the 4 relocated types back from the lib)
- `docs/agent-checklists/TZ-NX-DOCSTUDIO-EDITOR-FACADE-TO-FEATURES.md` (this file, new)

**Not touched:** routes/guard/list-templates-page location, queue/retry/
liveRows algorithms, dumb UI internals, `app/doc-studio/dialogs/**` file
location, Phase 5 (still PARK), the bulk-delete WIP in `studio-list.page.ts`/`.spec.ts`.

commit: (filled after commit below)

## Review handoff

- [x] Continuous wave, PO-issued prompt authorizes closeout without separate Cursor Verdict
- [x] Archive after gates PASS — this is also the wave's final phase; WAVE-MAP/tracker/`_NOW.md` closed out in the same commit batch

## Closeout

- [x] archive + WAVE-MAP.md (all 1-4 DONE) + tracker (all rows DONE) + `_NOW.md` (Claude IDLE) + `_active` очищен
- [x] Status = DONE
- closed_at: 2026-09-14T19:45:00Z
