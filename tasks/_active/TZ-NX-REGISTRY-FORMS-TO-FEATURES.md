═══════════════════════════════════════════════════════════════
TZ-NX-REGISTRY-FORMS-TO-FEATURES
═══════════════════════════════════════════════════════════════
РОЛЬ: Frontend Architect · SIZE S · LAYER 3 · PACK DECOMP-B4
ЗАВИСИМОСТИ: TZ-NX-REGISTRY-FORMS-FACADE archived
CONFLICT KEYS: frontend-nx/libs/features/src/lib/registry-forms/** ; frontend-nx/tsconfig.base.json ; frontend-nx/apps/kppdf-web/src/app/pages/registries/dialogs/**
IMPLICIT CONFLICT: nx build kppdf-web

ЧТО: `@kppdf/features/registry-forms` — move facades (+ dialogs if clean); if CompositionPanel blocks full move — same deviation class as B1/B2 (facade in features or dialogs stay in app with documented note). No apps/ imports from features.

AC: specs green; nx build last 0; B4 DONE STOP.
PARK after: Studio Phase 5 · Shipping · Composition deep split.
