═══════════════════════════════════════════════════════════════
TZ-NX-REGISTRIES-PAGE-FACADE
═══════════════════════════════════════════════════════════════

SIZE: L
LAYER: 3
PAGES: /registries
PAGE_DOCS: docs/pages/registries.page.md
РОЛЬ АГЕНТА: Frontend Architect (NX decomp)
ЗАВИСИМОСТИ: DETAIL panel already in `@kppdf/features/registry-forms` (`d83d0cd2`); types in registries-platform
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.ts; frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.spec.ts; frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.facade.ts

### Domain preflight
- Registry platform only; Counterparty≠Organization (N/A unless catalog text).
- НЕ: behavior/UX change; move of `data/*.registry.ts` wholesale; wipe.

### ИСХОДНОЕ
`registries-page.ts` — master table + expand + catalog inject + scroll restore. Detail panel уже из features.

### ЧТО ДЕЛАТЬ
1. Extract `RegistriesPageFacade` (signals) — query/expand/navigation orchestration as-is.
2. Page thin; `providers: [RegistriesPageFacade]` on page (не root).
3. Keep `restoreRegistryScrollPosition` export if specs import it (move with facade or keep util colocated — no dual).
4. Specs green; checklist + archive.

### НЕ ТРОГАТЬ
- `libs/features/**/registry-forms` internals beyond imports
- counterparties/** · studio/** · order-hub
- wholesale move of `pages/registries/data/**` (отдельная волна если понадобится)

### AC
1. Facade extracted; providers local.
2. registries* specs green.
3. `nx build kppdf-web` LAST PASS.
4. Archive DONE.

CLAIM:
agent_id:
claimed_at:
