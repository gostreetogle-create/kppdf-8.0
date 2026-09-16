═══════════════════════════════════════════════════════════════
TZ-NX-WAREHOUSE-TO-FEATURES: warehouse pages → @kppdf/features/warehouse
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend Architect
ЗАВИСИМОСТИ: TZ-NX-WAREHOUSE-PAGES-FACADE archived
**SIZE:** S · **PACK:** DECOMP-B2 · LAYER: 3
PAGES: /warehouse/*

CONFLICT KEYS: frontend-nx/libs/features/src/lib/warehouse/** ; frontend-nx/tsconfig.base.json ; frontend-nx/apps/kppdf-web/src/app/pages/warehouse/**

IMPLICIT CONFLICT: nx build kppdf-web

## ЧТО ДЕЛАТЬ
1. `@kppdf/features/warehouse` — facades + dialogs + any dumb list UI + specs.
2. Thin pages remain in app.
3. No apps/ imports from features.

## AC
- Warehouse specs green; nx build last 0; B2 DONE

Successor: Block 3 proposals
