═══════════════════════════════════════════════════════════════
TZ-UI-WR-507: Catalog lists — shared filter + skeleton + error-banner
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Frontend Component Engineer
ЗАВИСИМОСТИ: TZ-UI-WR-501 (z/return-focus); TZ-UI-WR-505 (ErrorBanner string API).
  Бывший WR-511 влит (те же products/modules/materials pages).
LAYER: 3
CONFLICT KEYS: frontend/src/app/shared/ui/filter-panel/pi-filter-panel.component.ts; frontend/src/app/shared/ui/filter-panel/pi-filter-panel.component.spec.ts; frontend/src/app/pages/products/products.page.ts; frontend/src/app/pages/modules/modules.page.ts; frontend/src/app/pages/materials/materials.page.ts; frontend/src/app/pages/products/products.page.spec.ts; frontend/src/app/pages/modules/modules.page.spec.ts; frontend/src/app/pages/materials/materials.page.spec.ts

PAGES: /products ; /modules ; /materials
PAGE_DOCS: products.page.md ; modules.page.md ; materials.page.md

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — `app-pi-filter-panel` (Esc/backdrop/role=region/z=var(--z-dropdown));
  заменить shell на 3 страницах; поля фильтров page-local.
ШАГ 2 — list loading → app-pi-skeleton; load error → app-error-banner + retry;
  убрать `<p>Загрузка…</p>` / raw list errors.
ШАГ 3 — Specs filter + loading/error; page.md one-liner канон.

НЕ: manager-desk; PiSelect migrate; supply/orders; detail pages (optional skip).

## Proof of adoption
- consumer: products + modules + materials (все три)
- test: pi-filter-panel + page specs
- docs: page.md loading/error/filter note
- migration: copy-paste filter shell / inline Загрузка на catalog lists — запрещены
- leftover: supply/shipping/orders

Finalization: archive TZ-UI-WR-507.done.md (WR-511 merged).
