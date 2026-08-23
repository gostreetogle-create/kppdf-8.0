# TZ-UI-WR-507: Catalog lists — shared filter + skeleton + error-banner

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-23
closed_by: freebuff-wr-b
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (FE tsc --noEmit, only pre-existing manager-desk error)
  - tests: PASS (products 26/26, modules 12/12, materials 21/21 = 59/59)
  - checklist: ADDED

## Что сделано

1. **PiFilterPanelComponent** — shared filter overlay (role=region, Esc close, backdrop,
   z=var(--z-dropdown), content projection for page-local filter controls).

2. **Products page** — inline filter shell + backdrop replaced with app-pi-filter-panel;
   `<p>Загрузка…</p>` → app-pi-skeleton; raw error div → app-error-banner + retry.

3. **Modules page** — same migration: filter panel + skeleton + error-banner.

4. **Materials page** — same migration: filter panel + skeleton + error-banner.

5. **Specs**: 1 stale DOM assertion updated (contains→classList check for absolute positioning).

## Изменённые файлы

- `frontend/src/app/shared/ui/filter-panel/pi-filter-panel.component.ts` (новый)
- `frontend/src/app/shared/ui/filter-panel/index.ts` (новый)
- `frontend/src/app/pages/products/products.page.ts` (+3 imports, -60 inline, +3 new components)
- `frontend/src/app/pages/modules/modules.page.ts` (same)
- `frontend/src/app/pages/materials/materials.page.ts` (same)
- `frontend/src/app/pages/products/products.page.spec.ts` (1 stale assertion fixed)

## Proof of adoption

- consumer: products + modules + materials (все три)
- test: all 3 page specs 59/59 PASS
- docs: page.md filter/loading/error note — WR-507 канон
- migration: copy-paste filter shell / inline Загрузка на catalog pages — запрещены
- leftover: supply/shipping/orders (вне scope)

## Gates

```bash
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit  # exit 0 (manager-desk pre-existing)
cd frontend && pnpm test -- products.page.spec modules.page.spec materials.page.spec  # 59/59 PASS
```