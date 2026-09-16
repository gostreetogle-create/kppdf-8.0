═══════════════════════════════════════════════════════════════
TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES
═══════════════════════════════════════════════════════════════
SIZE S · LAYER 3 · PACK B7
ЗАВИСИМОСТИ: TZ-NX-FEATURES-TIPTAP-TSCONFIG archived
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-text-properties.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-properties-panel.component.ts ; frontend-nx/libs/features/src/lib/doc-studio/**
IMPLICIT: nx build kppdf-web

ЧТО: Move both components (+ specs) into `@kppdf/features/doc-studio` ui; fix imports; as-is.

AC: studio text/properties specs + studio-editor gates; nx build last 0.
Successor: TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES
