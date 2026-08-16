# TZ-UX-328: `/materials` — фильтр в app-chrome-rail (убрать w-12)

> Зеркало TZ-UX-326 / 327 для Материалов. PO: одинаковый chrome на всём каталоге.

РОЛЬ АГЕНТА: Frontend

ЗАВИСИМОСТИ: **TZ-UX-326 DONE**; можно параллельно с 327 (другие keys)

LAYER: 3

CONFLICT KEYS: `frontend/src/app/pages/materials/materials.page.ts` ; `frontend/src/app/pages/materials/materials.page.spec.ts` ; `frontend/src/app/pages/materials/materials.page-373.spec.ts` (если ломает layout) ; `docs/pages/materials.page.md`

PAGES: `/materials`  
PAGE_DOCS: `docs/pages/materials.page.md`

CHECKLIST: `docs/agent-checklists/TZ-UX-328.md`  
REVIEW: required  
WAVE: `WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE` #3

---

## Domain preflight

Проверено: `materials.page.ts` — `aside.w-12` filters-rail; products = эталон chrome.  
Не трогать modules (327) / products.

---

## ЧТО ДЕЛАТЬ

1. `PiChromeToolsService`, `CHROME_OWNER = 'materials-page'`, sync effect, clear destroy.
2. Left: filters flyout toggle. Right: view-list, view-grid, refresh.
3. Удалить w-12 `filters-rail` aside; flyout overlay + backdrop (как products).
4. Toolbar: убрать icon дубли view/refresh; search + Create + kind filter toolbar/flyout по аналогии products (не раздувать).
5. Fallback &lt;1680: icon Фильтры в toolbar, не колонка.
6. Specs + docs + PAGE-TZ-INDEX.

Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="materials.page" --coverage=false
```

## НЕ

- modules.page / products.page  
- PHOTO frame / expand tray semantics  
- Deploy  

## AC

- [x] `/materials` chrome как products  
- [x] Нет w-12 filters-rail  
- [x] Gates PASS  

Archive после Cursor PASS.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16
closed_by: cursor-composer (TZ-UX-328 closeout)
TZ: TZ-UX-328
WAVE: WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE (#3)
DEP: TZ-UX-326 DONE
Cursor_verdict: PASS

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (materials.page 27/27)
  - lint: N/A (focused tsc + jest; owned files)
  - checklist: UPDATED
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

COMMIT: e7b3c88ba550333c7c581fb6ae87e8ce6c417abb

## Outcome

- `/materials`: `PiChromeToolsService` owner `materials-page`. Left «Фильтры»; right view-list/view-grid/refresh; `clear` on destroy.
- Локальный `aside.w-12` `filters-rail` снят; flyout overlay + backdrop сохранены.
- Toolbar: search + kind + Create; &lt;1680 `materials-chrome-fallback` без docked 48px.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` jest `--testPathPattern="materials.page"`: PASS 27/27
- deploy: NOT RUN (PO: без деплоя)

## Files

- `frontend/src/app/pages/materials/materials.page.ts`
- `frontend/src/app/pages/materials/materials.page.spec.ts`
- `frontend/src/app/pages/materials/materials.page-373.spec.ts`
- `docs/pages/materials.page.md`
- `docs/agent-checklists/TZ-UX-328.md`

## known_limitation

- Chrome rails ≥1680; узкий экран — toolbar icon-fallback.
- Modules parity → TZ-UX-327 (wave #2).
