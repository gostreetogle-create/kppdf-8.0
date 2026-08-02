ARCHIVE_MARKER
outcome: DEFERRED
closed_at: 2026-08-02
closed_by: Buffy
commit: none
reason: browser environment unavailable (no live dev-stack credentials)
browser: MANUAL_BROWSER_CHECK_REQUIRED

═══════════════════════════════════════════════════════════════
TZ-DOC-274: Builder — browser acceptance после TZ-DOC-268…273
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: QA-валидатор (ручная браузерная проверка)

ЗАВИСИМОСТИ: TZ-DOC-268, TZ-DOC-269, TZ-DOC-270, TZ-DOC-271,
TZ-DOC-272, TZ-DOC-273 (все должны быть DONE в архиве)

LAYER: 3 (проверка существующих компонентов; production-код НЕ менять)

CONFLICT KEYS:
(нет — задача read-only, только браузерные проверки)

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

1. Builder реализован в `frontend/src/app/pages/doc-constructor/builder/`.
2. TZ-DOC-268…273 реализованы и покрыты unit-тестами (FE 192/192, tsc 0,
   ng build 0, BE tsc 0, BE document-template 58/58).
3. Браузерная проверка не выполнялась — это первый интеграционный прогон.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Подготовка
- Запустить frontend (dev) и backend (Mongo), войти под ролью с
  доступом к `/doc-constructor/builder` и `/doc-constructor/templates`.
- Использовать ТОЛЬКО тестовые данные. Production-данные не менять.

ШАГ 2: Прогнать 21 чекпойнт (desktop viewport ~1440px)
1.  Создание шаблона одним кликом из `/doc-constructor/builder`;
2.  Диалог закрывается после «Создать»;
3.  text block — добавление/редактирование;
4.  table block — добавление;
5.  image block — добавление (canonical positioned + legacy overlay);
6.  нижний resize image;
7.  верхний/боковые/corner resize;
8.  строгие selection borders (hairline → толстая рамка при выборе);
9.  grid скрыт по умолчанию, snap работает;
10. guides;
11. overlap image/text/table;
12. z-order actions (На передний/задний план, Выше, Ниже);
13. marquee selection (в обе стороны, Escape);
14. group/ungroup (editor-only);
15. background color;
16. opacity;
17. refresh/persistence (F5, размеры/позиция/zIndex/цвет совпадают);
18. desktop viewport;
19. viewport 375px (нет горизонтального overflow);
20. browser console (0 ошибок за сценарий);
21. failed network requests (0).

ШАГ 3: Зафиксировать каждый дефект
Для каждого дефекта: маршрут; роль; точные шаги; expected; actual;
console error; network error; screenshot, если доступен.
Новые production-дефекты → отдельные небольшие successor TZ
(НЕ расширять TZ-DOC-274).

═══════════════════════════════════════════════════════════════
ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
═══════════════════════════════════════════════════════════════

ИЗМЕНЯТЬ:
- Нет production-файлов. Только отчёт о проверке + successor TZ.

НЕ ИЗМЕНЯТЬ:
- frontend/src/app/pages/doc-constructor/builder/* (production-код)
- backend/src/modules/document-template/*
- progress.md, ARCHITECTURE.md, _templates/*

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Все 21 чекпойнта пройдены без дефектов ИЛИ каждый дефект
   зафиксирован с маршрутом/шагами/expected/actual/evidence.
2. Console и network лог зафиксированы для каждого сценария.
3. Каждый найденный production-дефект превращён в отдельный
   successor TZ (не вложен в этот).
4. Сгенерированный документ (generate → html) визуально совпадает
   с preview: цвет фона блока и opacity перенесены.

ВАЖНО: если браузерная среда недоступна — НЕ объявлять задачу DONE,
не выдумывать результат; зафиксировать MANUAL_BROWSER_CHECK_REQUIRED
и точный сценарий для человека.
