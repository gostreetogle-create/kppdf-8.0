═══════════════════════════════════════════════════════════════
TZ-NX-REGISTRIES-DIALOG-HOSTS-TO-FEATURES
═══════════════════════════════════════════════════════════════
SIZE L · LAYER 3 · PACK B7
ЗАВИСИМОСТИ: TZ-NX-DOCSTUDIO-TEXT-PROPS-TO-FEATURES archived
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/registries/data/catalog-registry-dialog-host.ts ; frontend-nx/apps/kppdf-web/src/app/pages/registries/data/material-registry-dialog-host.ts ; related registries data files that only need import path updates ; frontend-nx/libs/features/src/lib/registry-forms/** OR new `@kppdf/features/registries-hosts` path
IMPLICIT: nx build kppdf-web

ЧТО: Move the dialog-host factories that block studio data-panel/vitrina into features (prefer `@kppdf/features/registry-forms` or `@kppdf/features/registries-hosts`). Update all consumers (~15). As-is behavior. Do not relocate entire registries catalog.

AC: registries + studio data-panel/vitrina specs still green; nx build last 0.
Successor: TZ-NX-DOCSTUDIO-DATA-PANEL-TO-FEATURES
