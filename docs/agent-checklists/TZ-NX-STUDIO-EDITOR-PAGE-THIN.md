# TZ-NX-STUDIO-EDITOR-PAGE-THIN checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-STUDIO-EDITOR-PAGE-THIN.md` (removed on closeout)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T15:09:46Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment)

## Preflight Check Output

- **Context:** WAVE-MAP.md (B10) + WAVE-DECOMP-B10.md tracker + GEMINI.md read. `_active/` was empty; no conflicting claim.
- **Conflict guard:** touched only `studio-editor.page.ts`, new sibling app file `studio-editor-shell-tools.ts`, new external `studio-editor.page.css`, and `libs/features/src/lib/doc-studio/ui/` (new `studio-preview-frame.component.ts` + `ui/index.ts` export). No `catalogWriteChain` algorithm touched.
- **Delivered:** 785 → 594 LOC in the page file (~24%), via three safe, behavior-preserving moves — see Executor report.
- **Final gate:** `nx build kppdf-web` PASS.

## Acceptance

- [x] Page further thinned without behavior change (no template/DOM/data-test regressions)
- [x] ShellToolRail wiring stays "in app" (moved to sibling app file `studio-editor-shell-tools.ts`, not into doc-studio lib — `ShellToolRailService` is app-only)
- [x] Shared registry dialog openers (table template / text block) stay in app, on the page — untouched
- [x] TestableEditor surface for specs preserved: same signal refs + delegate method names on `StudioEditorPage`
- [x] `catalogWriteChain` / algorithms untouched
- [x] `testPathPattern=studio-editor` full pass; `studio-list` pass
- [x] `nx build kppdf-web` — last gate, exit 0

## Integrity slot

- [x] Тип изменения: page (internal refactor, no route/behavior change)
- [x] FIC §A–E: N/A — pure internal decomposition, no user-facing/product change
- [x] page.md / PAGE-TZ-INDEX: N/A (route/behavior unchanged, decomp-only, same pattern as prior B-wave TZs)
- [x] DOMAIN-MAP: N/A (no module/route/page contour change)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity

- [x] Baseline до кода: `nx build kppdf-web` → exit 0
- [x] `_active/` пуст перед claim — no implicit conflict
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `nx test kppdf-web --testPathPatterns=studio-editor` (ran full 555-test suite — nx's `@nx/jest:jest` executor does not filter by this flag in this project, confirmed by 80/80 suites always running regardless of pattern syntax tried) — **PASS** for all 17 `studio-editor-*.spec.ts` + `studio-list.page.spec.ts` + `studio-templates-list.page.spec.ts`. 2 unrelated failures in `app-shell.component.spec.ts` (quicknav chip count off-by-one, e.g. expected 8 got 9) — pre-existing baseline drift from unrelated in-flight nav work elsewhere in the tree, confirmed unrelated (zero touched files overlap; failure is about `NAV_CATEGORIES` chip count, nothing to do with studio/doc-studio/shell-tool-rail).
- `nx build kppdf-web` — **PASS**, exit 0. Same pre-existing Angular/budget warnings as baseline (bundle budget, `gantt-bars.component.ts` CSS budget, 2× NG8102 in `studio-table-rows-editor.component.ts`, all pre-existing/unrelated).
- `nx lint kppdf-web` + `nx lint features` — baseline FAIL (187 / 234 problems), all pre-existing (`@nx/enforce-module-boundaries` lazy-boundary + a11y click-handler violations elsewhere). Confirmed zero new issues: the 2 errors attributed to `studio-editor.page.ts` are the *same* pre-existing lazy-import + a11y-click lines that existed before this TZ, just shifted by line number; the 2 new files (`studio-editor-shell-tools.ts`, `studio-preview-frame.component.ts`) don't appear in either lint output at all (0 problems).

## Executor report

Thinned `StudioEditorPage` from 785 → 594 LOC via three zero-behavior-change moves (verified against the existing `studio-editor-chrome-ia.spec.ts` source-text IA lock, which was intentionally left untouched — the ribbon-crumbs markup stayed inline in the page for that reason):

1. **External stylesheet.** Moved the inline `styles: [...]` array to `studio-editor.page.css` (`styleUrl`) — same convention already used by `studio-workspace-shell.component.ts` in the same lib. Dropped two dead CSS rule blocks in the process (`page-nav*`, `.page-geometry-control` — confirmed zero matches in the current template, leftover from an earlier decomp phase) and moved the 3 preview-only rules (`.studio-preview-frame`, `.preview-state`, `.preview-state--error`) to the new component below (view-encapsulation requires styles to live with the template that uses them).
2. **New `StudioPreviewFrameComponent`** (`libs/features/src/lib/doc-studio/ui/studio-preview-frame.component.ts`, exported via `ui/index.ts`) — extracted the preview-mode loading/error/iframe branch (the `.studio-canvas-host` wrapper + `#sheetHost` viewChild ref stayed on the page, since `syncSheetSize()` needs it). Pure presentational, inputs only (`loading`, `error`, `html`, `width`, `height`, `scale`), identical data-test attributes preserved.
3. **New `studio-editor-shell-tools.ts`** (sibling file in `apps/kppdf-web/.../pages/studio/`, NOT in the doc-studio lib, since `ShellToolRailService` is app-only per hard rule) — extracted the ~90-line chrome-rail-wiring `effect()` + its 13 lucide icon imports into `registerStudioShellTools(shellTools, deps)`, called synchronously from the page constructor (stays in the same injection-context call stack, so `effect()` still registers correctly — verified by the chrome-ia + preview-zoom + outside-click specs all passing, which exercise the rail wiring directly via `ShellToolRailService`).
4. Removed dead `chevronLeft`/`chevronRight` fields + their `lucide-angular` imports and the `LucideAngularModule` import (none were referenced anywhere in the page's own template — confirmed via repo-wide grep; only the removed `.page-nav` block would have used them).

**Hit a real bug during implementation, self-fixed:** the JSDoc comment above `StudioPreviewFrameComponent` originally had a backtick pair around `` `.studio-canvas-host` `` *inside* the component's `styles: [...]` template literal — same class of bug flagged in project memory (`pitfall_backtick_in_styles_template_literal`). It didn't break Jest (type-only, TS parses it as valid-but-wrong-typed template-literal boundaries) but did break `features:build` (`@nx/js:tsc`) with confusing cascading TS2322/TS2339/TS2304 errors. Removed the backticks from the comment; rebuilt clean.

**Not attempted:** the "aim ≪400 LOC if safe" stretch target. The remaining ~594 lines are: facade signal passthroughs (~55 lines) + one-line delegate methods (~115 lines) — both explicitly required to stay by the TZ ("keep TestableEditor surface for specs"); the two shared-dialog openers (~50 lines) and the ShellToolRail `registerStudioShellTools` call site (~15 lines) — both explicitly required to stay "in app" by the TZ; plus imports/decorator/lifecycle/HostListener scaffolding (~90 lines) and the remaining template (~155 lines, mostly per-section panel bindings that are genuinely page-specific composition, not reusable chunks). Getting under 400 would mean either breaking the explicit "keep in app" constraints or fragmenting page-specific composition into single-use wrapper components for no real reuse benefit — judged not worth the risk for a "if safe" stretch goal once the mechanical safe wins were exhausted.

## Closeout

- [x] archive + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T15:17:02Z

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing, zero new issues)
  - checklist: ADDED
  - progress.md: N/A (refactor-only)
  - status synchronization: PASS
