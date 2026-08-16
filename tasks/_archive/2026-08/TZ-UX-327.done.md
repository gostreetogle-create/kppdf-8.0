# TZ-UX-327: `/modules` — фильтр в app-chrome-rail (убрать w-12)

> PO: на Модулях/Материалах воронка снова в локальной полоске; на Продукции уже в chrome-rail
> (TZ-UX-326). Каждая страница — свой шаблон: автоматом не переносится. Зеркало 326.

РОЛЬ АГЕНТА: Frontend

ЗАВИСИМОСТИ: **TZ-UX-326 DONE** (эталон `products.page.ts` chrome tools)

LAYER: 3

CONFLICT KEYS: `frontend/src/app/pages/modules/modules.page.ts` ; `frontend/src/app/pages/modules/modules.page.spec.ts` ; `docs/pages/modules.page.md`

PAGES: `/modules`  
PAGE_DOCS: `docs/pages/modules.page.md`

CHECKLIST: `docs/agent-checklists/TZ-UX-327.md`  
REVIEW: required  
WAVE: `WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE` #2

---

## Domain preflight

Проверено: `modules.page.ts` — `aside.w-12` `data-test="filters-rail"` + panel; products уже `PiChromeToolsService` + flyout без колонки.  
Не трогать materials (TZ-UX-328), products, production.

---

## ЧТО ДЕЛАТЬ

1. Как products: `inject(PiChromeToolsService)`, `CHROME_OWNER = 'modules-page'`, `syncChromeTools()` в effect+untracked, clear on destroy.
2. **Left:** `filters` → toggle flyout (aria «Фильтры», active когда open/dirty).
3. **Right:** `view-list`, `view-grid`, `refresh` — те же действия что toolbar icons сейчас.
4. **Удалить** `aside.w-12` / `filters-rail` колонку. Панель фильтров = flyout overlay на layout (absolute left), backdrop закрывает; stopPropagation внутри.
5. Toolbar: убрать дубли icon view/refresh (≥1680 → chrome). Оставить search, Create, composition select если нужен на узких — или только flyout. **Запрет:** вернуть w-12.
6. Fallback &lt;1680: icon «Фильтры» в toolbar (не колонка), как products `products-chrome-fallback`.
7. Specs: нет filters-rail w-12; chrome mock/setTools; flyout open/close.
8. Docs modules.page.md + PAGE-TZ-INDEX + wave #2 DONE после closeout.

Gates:

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="modules.page" --coverage=false
```

## НЕ

- materials.page / products.page  
- CATALOG-375 expand logic (только chrome/rail layout)  
- Deploy  

## AC

- [x] `/modules` фильтр в chrome-rail под ← как `/products`  
- [x] Нет локального w-12 filters-rail  
- [x] Gates PASS  

---

## Финализация

`GEMINI.md` → `tasks/_archive/2026-08/TZ-UX-327.done.md` + lock. Deploy нет.

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16
closed_by: composer-frontend-executor (TZ-UX-327)
TZ: TZ-UX-327
WAVE: WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE (#2)
DEP: TZ-UX-326 DONE
Cursor_verdict: PASS

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (modules.page 27/27)
  - lint: N/A (focused tsc + jest; owned files)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

COMMIT: 8b59195a3a76b47f9fb81bffb685036640fcc83b

## Outcome

- `/modules`: `PiChromeToolsService` owner `modules-page`. Left «Фильтры»; right вид list/grid + «Обновить»; `clear` on destroy.
- Локальный `aside.w-12` `filters-rail` снят; flyout overlay + backdrop сохранены.
- Toolbar: поиск + composition select + «+ Создать». На &lt;1680 icon-fallback без docked 48px.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` jest `--testPathPattern="modules.page"`: PASS 27/27
- deploy: NOT RUN (PO: без деплоя)

## Files

- `frontend/src/app/pages/modules/modules.page.ts`
- `frontend/src/app/pages/modules/modules.page.spec.ts`
- `docs/pages/modules.page.md`
- `docs/agent-checklists/TZ-UX-327.md`

## known_limitation

- Materials parity → TZ-UX-328.
- Chrome rails ≥1680; узкий экран — toolbar icon-fallback.
