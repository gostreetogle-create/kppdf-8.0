═══════════════════════════════════════════════════════════════
TZ-NX-DOCSTUDIO-DATA-PANEL-TO-FEATURES
═══════════════════════════════════════════════════════════════
SIZE S · LAYER 3 · PACK B7
ЗАВИСИМОСТИ: TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES archived
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-panel.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/studio/studio-data-vitrina.component.ts ; frontend-nx/libs/features/src/lib/doc-studio/**
IMPLICIT: nx build kppdf-web

ЧТО: Move data-panel + vitrina (+ specs) → `@kppdf/features/doc-studio`. Update editor page imports. STOP — leftovers closed.

AC: data-panel/vitrina/studio-editor specs; nx build last 0.
