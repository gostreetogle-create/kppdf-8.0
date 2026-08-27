# TZ-UX-444C — DONE

> Статус: DONE · Закрыт: 2026-08-27 · agent: freebuff-1
> TZ: `tasks/TZ-UX-444C-catalog-banner-info-links.md`
> PAGES: `/products/:id` ; `/materials/:id`

## Что сделано

1. **Product status banner** (`product-detail.page.ts`):
   - `app-pi-status-banner` под chrome: draft→warning, archived→destructive, new→info;
     `active` / нет status → баннер скрыт.
   - Мелкие badges сохранены.

2. **Data-links → info** (product + material detail):
   - where-used `<a>` и material stock-link: `text-info underline decoration-dotted underline-offset-4 hover:opacity-90`
   - gold / `text-primary` / `sunrise-warm` на data-links убраны; PiButton CTA не трогали.

3. **Docs**: AI-UI-CONTRACT one-liner (data-link vs CTA gold); page.md one-liners.

4. **Tests**: banner tones + active hide; info class smoke на where-used/stock.

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS**
- `pnpm test -- --testPathPattern="product-detail.page.spec|material-detail.page.spec" --no-coverage` → **2 suites / 17 tests PASS**
- `pnpm exec eslint` (4 owned page/spec files) → **PASS**
- `prettier --write` on product-detail (+spec) → formatted · `git diff --check` owned paths → clean

## Conflict disclosure

- Parallel CLAIM: `TZ-QA-445E` (freebuff-2, gantt) — disjoint keys, not touched.
- Material: no ProductStatus → banner skip (data-links only), as TZ.
- Price history / production-cockpit / gantt — not touched.

## Known limits

- Module-detail where-used links still on prior primary/gold pattern (out of 444C conflict keys).
- Kit overview banner demo already from 444A — unchanged.

## Files

- `frontend/src/app/pages/products/product-detail.page.ts` (+.spec.ts)
- `frontend/src/app/pages/materials/material-detail.page.ts` (+.spec.ts)
- `docs/AI-UI-CONTRACT.md`
- `docs/pages/product-detail.page.md` · `docs/pages/material-detail.page.md`
