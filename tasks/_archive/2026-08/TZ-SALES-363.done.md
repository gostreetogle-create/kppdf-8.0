# TZ-SALES-363 DONE — polish содержимого панелей студии Create КП

```
ARCHIVE_MARKER
task: TZ-SALES-363
outcome: DONE
date: 2026-08-12
agent: freebuff-kppdf-8.0-d8650b12
workspace: D:\kppdf-8.0 (Freebuff worktree d8650b12)
```

- Scope: Wave WAVE-KP-STUDIO-CHROME, пункт 363 — content-polish дочерних панелей Create КП (LAYER 2, PARALLEL OK). `proposal-create.page.ts`, composition, table-studio, table-editor и backend **не тронуты** (diff только по CONFLICT KEYS).
- Условия: пустое состояние сокращено с «Добавьте первое условие или возьмите заготовку из библиотеки.» до «Добавьте первое условие.» — библиотека и так видна кнопкой «Взять из библиотеки» в шапке, CTA «Добавить условие…» рядом (дубль подсказки убран).
- Шаблон: убран `<p data-test="kp-tpl-picker-name">` под селектом — имя выбранного шаблона уже показывает trigger `PiOverflowSelect` (повтор заголовка/имени).
- Получатель: клиент снова выбирается одним searchable `PiOverflowSelect` (канон 334, searchable="auto" при ≥10), вместо дубля «поле поиска + native select» с длинными именами; удалены `search` signal и `filteredCounterparties`.
- Параметры (inspector): три повтора «только в этом КП» сведены к одной конкретной подсказке про наценку («Меняет цены только в этом КП; каталог не трогаем.»); убраны подзаголовки «Настройки сохраняются только в этом КП.» и «Скидка действует только в этом КП». `tableOnly` ветка не раздувалась (её уберёт 359). «Документ»/«Сроки» подзаголовки сохранены.
- Product rail: не менялся (TZ: только внутренние отступы/пустое состояние при явном шуме — шума нет; ширина flyout = 362).
- Gates: FE tsc PASS; focused Jest proposal-create + terms 38/38 PASS; ESLint changed files PASS; `git diff --check` PASS; `git diff` не содержит `proposal-create.page.ts`.
- Browser DOM self-verify PASS (dev server worktree :4203): Условия/Получатель/Шаблон/Параметры проверены вживую — overflow-select открывается, выбор клиента гидратирует реквизиты, имя шаблона не дублируется, дубли хинтов отсутствуют; console без ошибок.
- Docs: `docs/pages/proposals-create.page.md` — строка про chrome 363.
- Known limitation: Prettier репо-базово не чист (untouched файлы тоже warn); изменения стилю окружающего кода не противоречат (diff по prettier-нормализованным версиям = только намеренные правки).
- NEXT: TZ-SALES-362 (тиры S/L + иконка Условий) после merge 359 на page.ts. Deploy НЕ.
