═══════════════════════════════════════════════════════════════
TZ-NX-REGISTRIES-PAGE-TO-FEATURES
═══════════════════════════════════════════════════════════════
SIZE S · LAYER 3 · PACK B10
ЗАВИСИМОСТИ: TZ-NX-REGISTRIES-PAGE-FACADE archived
CONFLICT KEYS: frontend-nx/libs/features/src/lib/registries-platform/** or registry-forms/** ; frontend-nx/tsconfig.base.json ; frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.facade.ts
IMPLICIT: nx build kppdf-web

ЧТО: Move facade into existing `@kppdf/features/registries-platform` (preferred) or `registry-forms`; thin page stays in app. No apps/ imports from features.

AC: registries specs; nx build last 0.
Successor: TZ-NX-STUDIO-EDITOR-PAGE-THIN
