═══════════════════════════════════════════════════════════════
TZ-NX-REGISTRY-TYPES-TO-FEATURES
═══════════════════════════════════════════════════════════════
SIZE L · LAYER 3 · B9
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/registries/model/** ; frontend-nx/libs/features/src/lib/registry-forms/** (or new registries-platform) ; frontend-nx/tsconfig.base.json ; all import sites of registry.types
IMPLICIT: nx build kppdf-web
ЧТО: Move `registry.types.ts` (+ only pure model helpers if any) into features; fix all imports. Unblocks detail-panel move. No dual copies.
AC: registries* specs green; nx build last 0.
→ TZ-NX-REGISTRY-DETAIL-TO-FEATURES
