# TZ-UX-321: универсальная левая chrome-панель (←→ внутри)

```
РОЛЬ АГЕНТА: executor (Buffy / local)
ЗАВИСИМОСТИ: TZ-UX-320 LANDED — interim 64px fixed; PO не принял
LAYER: 2 (app shell)
PAGES: (app shell)
PAGE_DOCS: page-chrome.md ; docs/audits/2026-08-12-nav-return-gutters-canon.md
CONFLICT KEYS: frontend/src/app/layout/app-layout.component.ts ; frontend/src/app/layout/app-layout.component.spec.ts ; docs/pages/page-chrome.md ; docs/audits/2026-08-12-nav-return-gutters-canon.md ; docs/pages/PAGE-TZ-INDEX.md ; docs/agent-checklists/TZ-UX-321.md
```

**Проверено:** `app-layout` — ←→ сейчас `position:fixed; left/right:64px` (свободные кнопки, не панель); шапка `pi-edge-bleed`, бренд «KPPDF · 8.0» стартует на вертикали padding шапки; `pi-page-frame` `--screen-max: 1400px`. PO screenshot 2026-08-15 (красный контур): вертикальная полоска ~1.5–2 см от вертикали перед/у «KPPDF» вниз; стрелку перенести **в** эту полоску; туда же позже — глобальные кнопки страниц (фильтр и т.п.).

**Dictation:** «панель» = **реальный chrome-rail в shell**, не сдвиг fixed-кнопки по calc. «Универсальная» = слот для shell + будущих page-tools (фильтр = successor, не этот TZ).

## ИСХОДНОЕ

1. Агенты двигали ←→ пикселями (14 → 64 → планировали calc к колонке). PO не просил пиксельный твик: нужна **полоска-панель**.
2. Красный контур PO: верх — у начала бренда KPPDF; две вертикали вниз → узкая полоса в левом поле; ← увести с края окна **внутрь полосы**.
3. Фильтр на `/modules` PO назвал кандидатом в ту же панель — **не переносить в этом TZ** (нужен page→shell contract).

## ЧТО ДЕЛАТЬ

1. **Создать левый universal chrome rail в `app-layout`** (DOM, не только CSS у кнопок):
   - контейнер `data-test="app-chrome-rail-left"` (имя стабильное);
   - ширина **56–72px** (≈1.5–2 см); узкая колонка, не карточка-дашборд;
   - **левая вертикаль** = та же, что начало бренда «KPPDF» в шапке (линия `pi-edge-bleed` content-start, сегодня ≈64px на ≥1024);
   - **верх** = под шапкой (не перекрывает header);
   - высота: вниз по viewport / main (до низа shell), внутри scroll не обязателен в v1;
   - виден когда есть реальное левое поле (**порог ≥1680px** как у текущих gutters); на узких — `display:none` (как сейчас ←→).
2. **Переселить ← и → внутрь rail** (stacked вертикально: ← сверху, → снизу или наоборот — оба в панели):
   - убрать свободный `position:fixed` якорь `left/right: 64px` у кнопок как «плавающих в воздухе»;
   - кнопки — дети rail; сохранить `data-test="app-nav-back|app-nav-forward"`, disabled/aria, `AppHistoryStore`.
3. Зеркальный правый rail **не обязателен** в этом TZ (PO контур только слева). Правый fixed → можно временно оставить у правого края поля **или** спрятать → только в левом rail — выбрать вариант A: **оба ←→ только в левом rail** (проще, совпадает с красным контуром).
4. Spec: есть rail; back/forward внутри него; нет контракта «left: 64px fixed на кнопке» как цели; click/disabled PASS.
5. Docs: `page-chrome.md` + audit — канон «universal left chrome rail»; UX-320 = interim; PAGE-TZ-INDEX.
6. Browser smoke 1920 `/modules`: скрин — стрелка **внутри** полосы под вертикалью бренда, не у края окна; self-score ≥98. Deploy НЕ.

## ИЗМЕНЯТЬ

- `frontend/src/app/layout/app-layout.component.ts` (+ styles/template)
- `frontend/src/app/layout/app-layout.component.spec.ts`
- `docs/pages/page-chrome.md`
- `docs/audits/2026-08-12-nav-return-gutters-canon.md` (коротко: rail, не floating)
- `docs/pages/PAGE-TZ-INDEX.md`
- checklist / archive / lock / progress

## НЕ ИЗМЕНЯТЬ

- Не переносить фильтр / page-local toolbar в rail (→ **TZ-UX-322** successor)
- Не строить «боковую навигацию» разделов (Каталог и т.д. остаются в header)
- Не менять AppHistoryStore логику
- Backend / deploy
- Не раздувать rail >72px и не делать card-shadow dashboard

## КРИТЕРИИ ПРИЁМКИ

- [ ] В DOM есть `data-test="app-chrome-rail-left"` шириной 56–72px, под шапкой, левый край на вертикали бренда KPPDF
- [ ] ← и → **внутри** rail; не плавают у края окна
- [ ] ≥1680 видно; &lt;1680 скрыто
- [ ] tsc + app-layout Jest PASS
- [ ] Browser smoke + скрин; score ≥98
- [ ] Docs; archive; deploy НЕ

## known_limitation

- Page tools (фильтр, другие глобальные кнопки страниц) → **TZ-UX-322** (projection/slot API).
- Правый rail / симметрия — только если PO попросит отдельно.

## Финализация

Root archive `tasks/_archive/2026-08/TZ-UX-321.done.md` + lock. Land только UX-321 paths.
