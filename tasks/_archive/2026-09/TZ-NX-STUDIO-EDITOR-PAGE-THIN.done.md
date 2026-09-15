# TZ-NX-STUDIO-EDITOR-PAGE-THIN — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- Thinned `StudioEditorPage`: 785 → 594 LOC, zero behavior change.
- Moved inline styles to external `studio-editor.page.css` (`styleUrl`, same convention as `studio-workspace-shell.component.ts`); dropped two dead CSS blocks (`page-nav*`, `.page-geometry-control`).
- Extracted the preview-mode loading/error/iframe branch into new `StudioPreviewFrameComponent` (`libs/features/src/lib/doc-studio/ui/`), exported via `ui/index.ts`.
- Extracted the ~90-line ShellToolRail chrome-rail-wiring `effect()` into `studio-editor-shell-tools.ts`, a sibling app file (kept "in app" per hard rule — `ShellToolRailService` is app-only, can't live in the doc-studio lib).
- Removed dead `chevronLeft`/`chevronRight` fields + unused `LucideAngularModule` import (verified unreferenced in the page's own template).
- Kept ribbon-crumbs markup inline in the page (untouched) — `studio-editor-chrome-ia.spec.ts` locks its exact source location with `readFileSync` string assertions; not worth the churn for a modest LOC win.
- Kept ShellToolRail call site + both shared registry dialog openers (table template / text block) on the page, per TZ hard rule.
- Kept `catalogWriteChain` / facade algorithms untouched.
- Self-fixed a backtick-in-styles-comment bug (broke `features:build` type-checking, not Jest) during implementation — see checklist for detail.

## Scope guard

- No `catalogWriteChain` algorithm changes.
- ShellToolRail wiring and shared registry dialog openers stayed in app.
- TestableEditor surface (signal refs + delegate methods) on `StudioEditorPage` unchanged.

## Gates

- `nx test kppdf-web` (full suite, pattern-flag filtering doesn't work with this project's `@nx/jest:jest` executor — ran all 555 tests): PASS for all studio-editor/studio-list/studio-templates-list specs; 2 unrelated pre-existing failures in `app-shell.component.spec.ts` (nav quicknav chip count drift, unrelated to this TZ).
- `nx lint kppdf-web` + `nx lint features`: baseline FAIL (pre-existing lazy-boundary/a11y violations); zero new issues from this TZ's files.
- Final `nx build kppdf-web`: PASS; same pre-existing Angular/budget warnings as baseline.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing)
  - checklist: ADDED
  - progress.md: N/A (refactor-only)
  - status synchronization: PASS
