═══════════════════════════════════════════════════════════════
TZ-NX-REGISTRIES-PAGE-FACADE
═══════════════════════════════════════════════════════════════
SIZE S · LAYER 3 · PACK B10
CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.ts ; frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.facade.ts
IMPLICIT: nx build kppdf-web

ЧТО: Extract RegistriesPageFacade in-place (route param/expand/scroll/group signals as-is); page thin; keep `provideRegistriesCatalog()` on page or facade providers as needed. No master-table UX change.

AC: registries-page.spec + registries-a11y + registries.routes.spec green; nx build last 0.
Successor: TZ-NX-REGISTRIES-PAGE-TO-FEATURES
