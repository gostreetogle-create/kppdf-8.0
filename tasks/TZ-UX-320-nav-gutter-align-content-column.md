# TZ-UX-320: Стрелки ←→ в поля рядом с колонкой контента (не у края окна)

РОЛЬ АГЕНТА: Frontend UI / layout (Angular 20, Paper & Ink)

ЗАВИСИМОСТИ: TZ-UX-317 DONE (кнопки уже есть)

LAYER: 3

PAGES: shell (все operational pages)
PAGE_DOCS: `docs/pages/page-chrome.md`

CONFLICT KEYS:

- `frontend/src/app/layout/app-layout.component.ts` ;
  `frontend/src/app/layout/app-layout.component.spec.ts` ;
  `docs/pages/page-chrome.md` ;
  `docs/audits/2026-08-12-nav-return-gutters-canon.md` ;
  `docs/agent-checklists/TZ-UX-320.md`

Не пересекать с TZ-FRONTEND-304 (composition). Parallel OK.

## ИСХОДНОЕ СОСТОЯНИЕ

Проверено:

- Глобальные ← → живут в `app-layout.component.ts` (классы `app-nav-gutter--back|forward`,
  `data-test="app-nav-back|app-nav-forward"`), история — `AppHistoryStore` (не менять логику).
- Сейчас CSS: `position: fixed; left: 14px` / `right: 14px` — кнопки у **края окна**.
- Канон PO (скрин + устно 2026-08-15): кнопки должны стоять в **вертикальных полях**
  слева/справа от белой колонки контента — там же, где у шапки боковой padding
  (в DevTools «зелёная» зона ~отступ шапки). Это место для будущих глобальных
  меню/кнопок; ←→ — первые жильцы этой зоны.
- Порог видимости ≥1680px и поведение disabled без истории **сохранить**.
- Геометрия колонки: `pi-page-frame` ≈ max-width **1400px** + горизонтальные паддинги
  (в комментарии layout: `2×64`); поле = `(100vw − ширина колонки) / 2`.

## ЧТО ДЕЛАТЬ

1. Isolated worktree от `origin/main`. Claim checklist + `_active` до кода.
2. Не менять `AppHistoryStore` / click handlers / aria / data-test ids.
3. Пересчитать CSS позицию:
   - убрать привязку к `14px` от края viewport;
   - разместить кнопку **внутри** левого/правого поля (между краем окна и колонкой
     контента), визуально на линии бокового отступа шапки (как красные столбцы PO);
   - допустимо: центр полосы-поля **или** у внутреннего края поля (ближе к контенту),
     с зазором ≥8px от колонки и ≥8px от края окна;
   - на `min-width: 1680px` по-прежнему `display: inline-flex`, иначе скрыто.
4. Обновить комментарий в layout + одну секцию в `page-chrome.md` и коротко
   audit `nav-return-gutters-canon.md` (где стоят кнопки).
5. Spec: на wide viewport кнопка не имеет `left/right: 14px`; позиция в поле
   (assert через computed style или class contract). Существующие click/disabled
   тесты сохранить.
6. Gates: tsc, focused `app-layout` Jest, eslint changed, architecture:check,
   diff-check. Browser smoke ≥1680: ←→ видны в полях, не у самых краёв экрана,
   light/dark, не перекрывают таблицу материалов.
7. Archive/lock/progress/commit/push. Deploy НЕ.

## НЕ ИЗМЕНЯТЬ

- Логику history back/forward;
- Create КП studio rails / builder palette;
- Backend, RBAC, TZ-FRONTEND-304 composition;
- Deploy.

## КРИТЕРИИ ПРИЁМКИ

1. На широком экране ← и → стоят в полях у колонки контента (как красные зоны PO), не у края окна.
2. На узком (<1680) скрыты как сейчас.
3. Disabled / aria / data-test без регрессий; layout specs PASS.
4. Docs page-chrome обновлены одной правдой.
5. Deploy НЕ.

## ФИНАЛИЗАЦИЯ

`tasks/_archive/2026-08/TZ-UX-320.done.md` + lock + progress + push.
