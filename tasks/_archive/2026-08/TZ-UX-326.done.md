# TZ-UX-326.done — `/products` chrome page-tools (фильтр в app-chrome-rail)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16
closed_by: cursor-grok-4.6 (TZ-UX-326 frontend executor)
TZ: TZ-UX-326
WAVE: WAVE-UX-CHROME-PAGE-TOOLS-MIGRATE (#1)
DEP: TZ-UX-322/323/325 DONE
Cursor_verdict: PASS

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (products.page 24/24)
  - lint: N/A (focused tsc + jest; owned files)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

## Outcome

- `/products`: `PiChromeToolsService` owner `products-page`. Left «Фильтры»; right вид list/grid + «Обновить»; `clear` on destroy.
- Локальный `aside.w-12` `filters-rail` снят; flyout overlay + backdrop сохранены.
- Toolbar: поиск + «+ Создать» + счётчик. На &lt;1680 icon-fallback без docked 48px.
- Селекты статуса/активности/категории — только в flyout.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` jest `--testPathPattern="products.page"`: PASS 24/24
- deploy: NOT RUN (PO: без деплоя)

## Files

- `frontend/src/app/pages/products/products.page.ts`
- `frontend/src/app/pages/products/products.page.spec.ts`
- `docs/pages/products.page.md`
- `docs/agent-checklists/TZ-UX-326.md`

## known_limitation

- Modules/materials parity → TZ-UX-327/328.
- Chrome rails ≥1680; узкий экран — toolbar icon-fallback.
