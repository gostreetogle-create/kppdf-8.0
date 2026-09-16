═══════════════════════════════════════════════════════════════
TZ-NX-PROPOSALS-TO-FEATURES: proposals → @kppdf/features/proposals
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: TZ-NX-PROPOSALS-LIST-FACADE archived
**SIZE:** S · **PACK:** DECOMP-B3 · LAYER: 3
PAGES: /proposals

CONFLICT KEYS: frontend-nx/libs/features/src/lib/proposals/** ; frontend-nx/tsconfig.base.json ; frontend-nx/apps/kppdf-web/src/app/pages/proposals/**

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ
1. Move facade + dialog + any dumb UI + specs to `@kppdf/features/proposals`.
2. Thin page in app.
3. No apps/ imports from features.

## AC
- Proposals specs green; nx build last 0; B3 DONE = batch complete

Successor: none (batch end). PARK: role-form / registry fat forms — only on new PO ask.
