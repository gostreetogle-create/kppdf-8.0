# TZ-UX-321: ←→ у колонки контента (не у края окна)

```
РОЛЬ АГЕНТА: executor (Buffy / local)
ЗАВИСИМОСТИ: TZ-UX-320 LANDED (left/right 64px) — визуально НЕ принято PO
LAYER: 2 (app shell CSS)
PAGES: (app shell)
PAGE_DOCS: page-chrome.md ; docs/audits/2026-08-12-nav-return-gutters-canon.md
CONFLICT KEYS: frontend/src/app/layout/app-layout.component.ts ; frontend/src/app/layout/app-layout.component.spec.ts ; docs/pages/page-chrome.md ; docs/audits/2026-08-12-nav-return-gutters-canon.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/agent-checklists/TZ-UX-321.md
```

**Проверено:** `app-layout.component.ts` (`.app-nav-gutter--back/forward` сейчас `left/right: 64px`); канон gutters «пустое поле слева/справа от max-width колонки»; PO screenshot 2026-08-15 — стрелка у края, далеко от таблицы; `pi-page-frame` max-width **1400px**.

**Dictation:** «панель» / «поле» = пустой gutter beside content column, **не** новый UI-блок и **не** линия padding шапки 64px.

## ИСХОДНОЕ

1. TZ-UX-320 перенёс кнопки с `14px` на `64px` от края окна (= padding `pi-edge-bleed`). На ≥1680 при 1920px колонка контента начинается ≈ `(vw−1400)/2` ≈ **260px** — между стрелкой и таблицей остаётся большая дыра. PO: «переместились, но опять не там».
2. Канон (`nav-return-gutters-canon.md`): стрелки **в полях** слева/справа от max-width колонки — рядом с колонкой, не у края окна.
3. Порог видимости ≥1680px, `AppHistoryStore`, data-test, aria — не трогать.

## ЧТО ДЕЛАТЬ

1. **Позиция от колонки 1400px**, не от края окна:
   - Цель: кнопка целиком в gutter; **зазор от внешнего края колонки контента до ближайшего края кнопки ≈ 8–16px** (не налезает на `pi-page-frame`).
   - Формула-канон (half of 1400 = 700; кнопка 36px; gap 12px → offset 48px):
     - back: `left: max(8px, calc(50% - 700px - 48px));`
     - forward: `right: max(8px, calc(50% - 700px - 48px));`
   - Запрещено оставлять фиксированные `left/right: 64px` или `14px` как основную позицию на ≥1680.
2. Обновить комментарии в `app-layout.component.ts` (убрать формулировку «на линии отступа шапки 64px» как цель).
3. Spec: заменить/дополнить контракт — source содержит `calc(50% - 700px` (или эквивалент) и **не** содержит `left: 64px` / `right: 64px` как финальную позицию; сохранить click/disabled/data-test.
4. Docs: `page-chrome.md`, audit canon, `PAGE-TZ-INDEX` — зафиксировать «у колонки через calc», пометить UX-320 как interim (64px), UX-321 = visual PASS target.
5. **Browser smoke (обязателен для READY):** viewport **1920×1080**, страница со списком (напр. `/modules`):
   - измерить `getBoundingClientRect` у `[data-test=app-nav-back]` и у `.pi-page-frame` (или корневого max-width контейнера колонки);
   - `frame.left - back.right` ∈ **[8, 24]** px (зеркало справа);
   - `back.left` заметно **больше** 64 (ожидание ~200+ на 1920);
   - скрин в checklist path.
6. Quality score в checklist: цель **100**, READY только при **≥98** после visual smoke. Deploy **НЕ**.

## ИЗМЕНЯТЬ

- `frontend/src/app/layout/app-layout.component.ts` (+ styles comments)
- `frontend/src/app/layout/app-layout.component.spec.ts`
- `docs/pages/page-chrome.md`
- `docs/audits/2026-08-12-nav-return-gutters-canon.md` (короткая правка канона позиции)
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-UX-321.md` + archive/lock/progress при DONE

## НЕ ИЗМЕНЯТЬ

- Порог `@media (min-width: 1680px)`, размер кнопки, z-index, AppHistoryStore
- Backend, другие страницы, sales/KP layout
- Не изобретать видимые «боковые панели»-карточки — только позиция стрелок в существующем пустом gutter
- Deploy

## КРИТЕРИИ ПРИЁМКИ

- [ ] На 1920px стрелка визуально у колонки контента (gap 8–24px), не у края окна
- [ ] CSS через `calc(50% - 700px - …)` + `max(8px, …)`; нет финальных `64px`/`14px` как left/right
- [ ] Spec PASS; `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [ ] `pnpm exec jest --config jest.config.js --runInBand --no-coverage src/app/layout/app-layout.component.spec.ts` PASS
- [ ] Browser smoke evidence в checklist; self-score ≥98
- [ ] Docs обновлены; archive + lock; deploy НЕ

## known_limitation

- На viewport ровно у порога 1680 gutter узкий — `max(8px, …)` не даёт уехать за край; плотная посадка у колонки приоритетнее «воздуха у края окна».
- Если на отдельных studio-страницах колонка визуально уже 1400 — отдельный successor, не этот TZ.

## Финализация

Root: archive `tasks/_archive/2026-08/TZ-UX-321.done.md` + lock + checklist DONE по `GEMINI.md`.  
Land на `main` только UX-321 paths (как land UX-320) — без чужого WIP.
