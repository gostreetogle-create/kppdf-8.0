═══════════════════════════════════════════════════════════════
TZ-NX-REGISTRY-FORMS-FACADE
═══════════════════════════════════════════════════════════════
РОЛЬ: Frontend Architect · SIZE L · LAYER 3 · PACK DECOMP-B4
ЗАВИСИМОСТИ: TZ-NX-ROLE-FORM-TO-FEATURES archived
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/material-form-dialog.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/module-form-dialog.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form-dialog.component.ts ; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/material-form.facade.ts ; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/module-form.facade.ts ; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/product-form.facade.ts
IMPLICIT CONFLICT: nx build kppdf-web

ИСХОДНОЕ: three fat dialogs (~539–735 LOC) — photos/units/categories/composition/payload.

ЧТО: one facade per dialog in-place (`providers` on each); move domain signals/submit/photos/lookups as-is; keep CompositionPanel import pattern (shared — do not rewrite composition).

НЕ: change payload semantics; merge three entities into one mega-facade; touch shipping/studio.

AC: material/module/product form dialog specs + registries specs that open them; nx build last 0.
Successor: TZ-NX-REGISTRY-FORMS-TO-FEATURES
