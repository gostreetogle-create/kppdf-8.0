═══════════════════════════════════════════════════════════════
TZ-DICT-303: Dictionaries hub + nav groups + units route
═══════════════════════════════════════════════════════════════

РОЛЬ: Frontend (routing / nav / hub)
ЗАВИСИМОСТИ: TZ-DICT-302 DONE (shell)
LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/dictionaries/dictionaries.page.ts;
frontend/src/app/pages/dictionaries/units.page.ts (new — move Units UI);
frontend/src/app/app.routes.ts;
frontend/src/app/layout/app-layout.component.ts;
docs/pages/dictionaries.page.md;
docs/pages/units.page.md (new);
docs/agent-checklists/TZ-DICT-303.md

ИСХОДНОЕ: `/dictionaries` = Units. Nav flat. Канон D3–D4.

ЧТО ДЕЛАТЬ:
1. Hub `/dictionaries`: карточки ссылок на справочники (группы), shell title «Справочники».
2. Вынести Units в `/dictionaries/units` (перенос кода со старой страницы; redirect
   со старого deep-link поведения задокументировать).
3. Nav `reference`: группы Обзор / Классификация / Измерения / Оформление / Документы
   (как в audit). Сохранить pageKey для RBAC.
4. Не ломать capabilities/pageKey ACCESS/RBAC.

AC:
1. `/dictionaries` = hub, не units table.
2. Units доступны на `/dictionaries/units`.
3. Меню сгруппировано; fe tsc + targeted jest/nav smoke.
4. Cursor PASS → archive.

НЕ: полный restyle Units (DICT-304); Categories chrome (305); backend.

ПРОМПТ: GEMINI.md + DICT-300 + 302 shell API + этот файл.
