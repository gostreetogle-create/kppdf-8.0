═══════════════════════════════════════════════════════════════
TZ-NX-STUDIO-EDITOR-PAGE-THIN
═══════════════════════════════════════════════════════════════
SIZE L · LAYER 3 · PACK B10
ЗАВИСИМОСТИ: TZ-NX-REGISTRIES-PAGE-TO-FEATURES archived
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts ; frontend-nx/libs/features/src/lib/doc-studio/**
IMPLICIT: nx build kppdf-web

ИСХОДНОЕ: page still ~766 LOC after editor decomp — leftover template/chrome/delegates.

ЧТО: Further thin without behavior change: move remaining pure template chunks / chrome helpers that can live next to StudioEditorFacade or doc-studio ui; keep ShellToolRail + shared registry dialog openers in app; keep TestableEditor surface for specs (signal refs + delegates). Target: page clearly glue-only (aim ≪400 LOC if safe). Do NOT touch catalogWriteChain algorithms.

AC: full `testPathPattern=studio-editor` + studio-list if touched; nx build last 0.
Successor: TZ-NX-SUPPLY-PAGES-RESIDUAL-THIN
