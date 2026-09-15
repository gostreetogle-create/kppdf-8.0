═══════════════════════════════════════════════════════════════
TZ-NX-DECOMP-DEBT-CLOSEOUT
═══════════════════════════════════════════════════════════════
SIZE L · LAYER 3 · PACK B5
ЗАВИСИМОСТИ: TZ-NX-COMPOSITION-TO-FEATURES archived
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/** ; frontend-nx/apps/kppdf-web/src/app/pages/orders/order-hub*.ts ; frontend-nx/libs/features/src/lib/registry-forms/** ; frontend-nx/libs/features/src/lib/order-hub/** ; frontend-nx/apps/kppdf-web/src/app/pages/supply-requests/** ; frontend-nx/libs/features/src/lib/supply/** ; frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-items* ; frontend-nx/libs/features/src/lib/warehouse/**
IMPLICIT: nx build kppdf-web

ЧТО: After composition is in features — finish previously blocked moves (as-is):
1) material/module/product form dialogs (+ facades if still in app) → `@kppdf/features/registry-forms` (CategoryFormDialog: move to registry-forms or shared features path if still blocking — prefer move with category dialog into registry-forms and fix doc-studio/text-block imports)
2) order-hub-tray + OrderHubFacade → `@kppdf/features/order-hub` if now clean
3) any remaining supply-requests / storage-items facades+dialogs still in app from B2 deviations — move if unblocked
Document any still-blocked item as known_limitation; do not invent new architecture.

AC: affected specs green; nx build last 0.
Successor: TZ-NX-SHIPPING-PAGE-FACADE
