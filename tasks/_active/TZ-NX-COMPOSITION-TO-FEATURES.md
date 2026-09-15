═══════════════════════════════════════════════════════════════
TZ-NX-COMPOSITION-TO-FEATURES
═══════════════════════════════════════════════════════════════
SIZE L · LAYER 3 · PACK B5
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/composition/** ; frontend-nx/libs/features/src/lib/composition/** ; frontend-nx/tsconfig.base.json ; plus any import-fix sites (order-hub-tray, registry dialogs, composition-panel consumers)
IMPLICIT: nx build kppdf-web

ЧТО: Move `composition-tree`, `composition-panel`, `composition-picker-dialog`, related helpers/specs → `@kppdf/features/composition`. Update all app imports. No behavior change. Unblocks B4 F2 / order-hub full move.

AC: composition* specs + consumers (order-hub, material/module/product forms) green; nx build last 0.
Successor: TZ-NX-DECOMP-DEBT-CLOSEOUT
