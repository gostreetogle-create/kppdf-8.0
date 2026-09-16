═══════════════════════════════════════════════════════════════
TZ-NX-REGISTRIES-PAGE-TO-FEATURES
═══════════════════════════════════════════════════════════════

SIZE: S
LAYER: 3
ЗАВИСИМОСТИ: TZ-NX-REGISTRIES-PAGE-FACADE archived DONE
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.ts; frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.facade.ts; frontend-nx/libs/features/src/lib/registries-platform/**; frontend-nx/tsconfig.base.json

### ЧТО ДЕЛАТЬ
1. Move `RegistriesPageFacade` (+ pure helpers if any) into `@kppdf/features/registries-platform` (уже есть types — туда же) **или** отдельный `@kppdf/features/registries-shell` если platform только types; предпочтение: **registries-platform** без дубля alias.
2. Page in app imports facade from features; routes stay in app.
3. No behavior change. Specs + nx build LAST.
4. Archive. B9 chain STOP after this unless PO opens next wave.

### НЕ ТРОГАТЬ
counterparties · studio-list · order-hub · move of all data/*.registry.ts

### AC
Facade from features path; build green; archive; `_active` empty.

CLAIM:
agent_id:
claimed_at:
