# TZ-TEST-422: categories.page.spec — mock ActivatedRoute

PAGES: `/dictionaries/categories`
PAGE_DOCS: (dictionaries / classification if present)

РОЛЬ АГЕНТА: executor (Freebuff)
ЗАВИСИМОСТИ: none
LAYER: 1 (tests only)
CONFLICT KEYS: `frontend/src/app/pages/dictionaries/categories.page.spec.ts`

## Domain preflight
- Проверено: `categories.page.ts` injects `ActivatedRoute` for `?type=` filter (CATALOG-377).
- Spec still creates component without route provider → `NG0201` ×5.
- Не путать с product API: URL остаётся `GET /api/categories/tree`.

## ИСХОДНОЕ СОСТОЯНИЕ
- `categories.page.ts` ~L157–163: `inject(ActivatedRoute)` + `parseTypeFilter(queryParamMap.get('type'))`.
- `categories.page.spec.ts`: нет `ActivatedRoute` / `provideRouter` → все 5 it падают на createComponent.
- Gate evidence: `docs/agent-checklists/PRE-DEPLOY-2026-08-26.md`.

## ЧТО ДЕЛАТЬ
1. В `categories.page.spec.ts` добавить провайдер `ActivatedRoute` с `snapshot.queryParamMap.get` → `null` (или `'all'`).
2. Опционально: 1 it на `type=material` query → filter стартует material (если дешёво).
3. Прогнать: `cd frontend && pnpm exec jest --config jest.config.js src/app/pages/dictionaries/categories.page.spec.ts`
4. Не трогать product `.ts` кроме случая, если mock невозможен (не должен понадобиться).

## ИЗМЕНЯТЬ
- `frontend/src/app/pages/dictionaries/categories.page.spec.ts`
- checklist closeout только этой TZ

## НЕ ИЗМЕНЯТЬ
- `categories.page.ts`, catalog BE, deploy scripts, другие failing specs (orders/terms/materials/workspace — baseline)

## КРИТЕРИИ ПРИЁМКИ
- [ ] `categories.page.spec.ts` — 0 fail
- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] Нет правок вне CONFLICT KEYS без записи в checklist
- Archive: `tasks/_archive/2026-08/TZ-TEST-422-categories-spec-activated-route.done.md` + `sha:`

## Финализация
Root archive + GEMINI closeout. После DONE — PO снова: «подготовь к деплою».
