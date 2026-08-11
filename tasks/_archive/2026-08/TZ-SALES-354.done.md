# TZ-SALES-354 DONE — manager self-pass / shame wave closeout

- **Status:** DONE
- **Wave:** WAVE-KP-SHAME-POLISH
- **Scope:** manager walkthrough across `/proposals` and `/proposals/create`; thin frontend copy/navigation fixes only.

## Thin fixes

- Conversion confirmation is fully Russian and explains that positions move without prices/commercial conditions; status wording is «В заказе».
- Family sync confirmation is fully Russian and replaces legacy `master` wording with «главная КП».
- List «Печать» route regression is covered and opens the existing print-capable Create studio.

## Self-pass evidence

- Journal empty/search/status/create/edit/copy/print paths are covered.
- Create flow composition is covered by existing DOM/component specs: template, products/modules/materials, quantity, custom line, terms, status, F5 hydration, multipage preview.
- Product rail chips/search/quantity/add/edit/pager/empty/error paths are covered; no dead click found.
- Focused suites: `proposals.page.spec.ts` 22/22, `proposal-create.page.spec.ts` 34/34, `proposal-product-rail.component.spec.ts` 12/12 — **68/68 PASS**.

## Gates

- FE `tsc -p tsconfig.app.json --noEmit` — **PASS**
- Changed-file Prettier — **PASS**
- Changed-file ESLint — **PASS**
- `git diff --check` — **PASS** after checklist whitespace cleanup
- DOM/component self-check — **PASS**
- Browser/authenticated smoke unavailable in this headless executor; limitation is recorded in checklist.
- Deploy was not run.
