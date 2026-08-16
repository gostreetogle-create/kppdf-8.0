# TZ-UX-341 DONE вЂ” catalog grid pager в†’ app-pi-pagination

```
ARCHIVE_MARKER
task_id: TZ-UX-341
outcome: DONE
closed_at: 2026-08-16T09:50:00Z
agent_id: cursor-composer (TZ-UX-341 frontend executor)
workspace: D:\kppdf-8.0
branch: main
```

## Р§С‚Рѕ СЃРґРµР»Р°РЅРѕ

- Products / modules / materials: custom `grid-pager` (РќР°Р·Р°Рґ/Р”Р°Р»РµРµ) в†’ `<app-pi-pagination>` (РєР°РЅРѕРЅ UX-340).
- Products `PAGE_SIZE` 15 в†’ `PI_DEFAULT_PAGE_SIZE` (10); server `limit` follows `pageSizeSig`.
- `pageSizeChange` on grid + pi-table в†’ update size + reset page 1 (all three pages).
- Modules grid now slices via `paginatedRows()` (was showing full `data()`).
- Specs: products + modules + materials-373 pager tests; page.md + PAGE-TZ-INDEX.

## Gates

- `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `pnpm test -- --testPathPattern="products.page.spec|modules.page.spec|materials.page" --coverage=false` PASS (69 tests)

## РќРµ С‚СЂРѕРіР°Р»Рё

- Chrome filters-rail, backend, UX-342 pages, app-layout. Deploy РЅРµС‚.

## Review

REVIEW not required in TZ в†’ archive after gates PASS.

---

## Original TZ

# TZ-UX-341: РљР°С‚Р°Р»РѕРі вЂ” РµРґРёРЅС‹Р№ pager РЅР° grid + PAGE_SIZE=10

Р РћР›Р¬ РђР“Р•РќРўРђ: Frontend

Р—РђР’РРЎРРњРћРЎРўР: **TZ-UX-340 DONE**; РµСЃР»Рё UX-326 РµС‰С‘ IN WORK РЅР° `products.page.ts` вЂ” **STOP/DEFER** РґРѕ РµС‘ archive

LAYER: 3

CONFLICT KEYS: `frontend/src/app/pages/products/products.page.ts` ; `frontend/src/app/pages/products/products.page.spec.ts` ; `frontend/src/app/pages/modules/modules.page.ts` ; `frontend/src/app/pages/modules/modules.page.spec.ts` ; `frontend/src/app/pages/materials/materials.page.ts` ; `frontend/src/app/pages/materials/materials.page.spec.ts` ; page.md С‚СЂРѕР№РєРё РїСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё

PAGES: `/products` ; `/modules` ; `/materials`  
PAGE_DOCS: products.page.md ; modules.page.md ; materials.page.md

CHECKLIST: `docs/agent-checklists/TZ-UX-341.md`

---

## Р§РўРћ Р”Р•Р›РђРўР¬

1. РЈРґР°Р»РёС‚СЊ custom `grid-pager` СЂР°Р·РјРµС‚РєСѓ РЅР° С‚СЂС‘С… СЃС‚СЂР°РЅРёС†Р°С… в†’ `<app-pi-pagination>` (С‚РѕС‚ Р¶Рµ РєР°РЅРѕРЅ, С‡С‚Рѕ table).
2. Products: `PAGE_SIZE` **15 в†’ 10**; server `limit` = 10.
3. РџСЂРё `pageSizeChange` (РµСЃР»Рё РІРєР»СЋС‡РµРЅРѕ): РѕР±РЅРѕРІРёС‚СЊ limit/slice Рё СЃР±СЂРѕСЃРёС‚СЊ page=1.
4. List-mode СѓР¶Рµ С‡РµСЂРµР· pi-table вЂ” РїРѕСЃР»Рµ 340 РґРѕР»Р¶РµРЅ СЃРѕРІРїР°СЃС‚СЊ РІРёР·СѓР°Р»СЊРЅРѕ; РїСЂРѕРІРµСЂРёС‚СЊ.
5. Specs: grid pager tests в†’ РЅРѕРІС‹Рµ data-tests РєР°РЅРѕРЅР°.

Gates: tsc + focused products/modules/materials page specs.

## РќР•

- Chrome filters-rail (UX-326/327/328)  
- Backend schema  

## AC

- [ ] Grid Рё table РЅР° С‚СЂС‘С… РєР°С‚Р°Р»РѕРіР°С… вЂ” РѕРґРёРЅ РІРёРґ РїР°РіРёРЅР°С†РёРё  
- [ ] Products РїРµСЂРІРѕР№ СЃС‚СЂР°РЅРёС†РµР№ 10, РЅРµ 15  
- [ ] Gates PASS  

