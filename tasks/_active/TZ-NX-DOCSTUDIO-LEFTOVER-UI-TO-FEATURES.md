═══════════════════════════════════════════════════════════════
TZ-NX-DOCSTUDIO-LEFTOVER-UI-TO-FEATURES
═══════════════════════════════════════════════════════════════
SIZE L · LAYER 3 · PACK B6
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-properties-panel.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-editor.page.ts ; frontend-nx/libs/features/src/lib/doc-studio/**
IMPLICIT: nx build kppdf-web
REF: Studio Phase 3 deviation (4 components left in app)

ЧТО: Move the four leftover studio UI components (+specs) into `@kppdf/features/doc-studio`; fix imports on editor page/facade. As-is. No UX. If a hard shared TipTap/registry blocker remains for one file — leave it, document in checklist, continue others.

AC: `nx test kppdf-web --testPathPattern=studio` + nx build last 0. Archive. STOP B6.

НЕ: forms showcase · deploy · rewrite facade queue
