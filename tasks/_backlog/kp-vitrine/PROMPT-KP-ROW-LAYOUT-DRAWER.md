# PROMPT — isolated executor TZ-SALES-370

Работай непрерывно до review-ready результата. Это отдельная параллельная ветка; не трогай AUTH-wave и не мержи себя в `main`.

## Источник задания

Главный workspace может иметь незакоммиченный spec из-за параллельного AUTH-агента:

- `D:\kppdf-8.0\tasks\TZ-SALES-370-kp-row-layout-drawer.md`
- `D:\kppdf-8.0\docs\agent-checklists\TZ-SALES-370.md`

Сначала прочитай оба файла по абсолютному пути, затем скопируй их в свой isolated worktree как часть своей ветки. Выполняй project rules `GEMINI.md`, `OrchestratorKit/AGENTS.md` и `.agents/skills/kppdf-executor-continuous/SKILL.md`.

## Задача

Реализуй row-level drawer в редакторе таблицы КП:

- chevron в правом жёлобе строки;
- detail-row непосредственно под строкой;
- одновременно открыта одна;
- только визуальные настройки конкретной строки:
  1. авто/компактная/крупная высота;
  2. обычная/акцент;
  3. разделитель сверху;
  4. с новой страницы;
  5. показывать описание на бланке;
  6. фото inherit/contain/cover при наличии фото;
- постоянный индикатор non-default состояния;
- сохранение `QuotationItem.rowPresentation` и применение в live table, browser print, server PDF.

Не прячь и не переноси коммерческие данные: название, qty, unit, price, sum, discount, `Опц.` остаются в основной строке. Width остаётся в header caret. Не меняй shared TableTemplate, верхний toolbar, auth, Desktop/MCP или deploy.

## Работа

1. Preflight + Team Room + claim; если task ID ещё не зарегистрирован в комнате, зафиксируй это как orchestration limitation, но не подменяй номер.
2. Прочитай фактический vertical path до правок.
3. Implement smallest end-to-end slice с backward defaults.
4. Напиши focused tests до/вместе с реализацией.
5. Запусти все gates из TZ.
6. Проведи browser smoke и приложи screenshots/DOM evidence.
7. Самопроверка по checklist.
8. Остановись в `review`, если нужен Cursor/PO visual PASS. После PASS — closeout/archive/commit.
9. Commit и push только свою isolated branch. Не checkout/merge/push `main`.

## Обязательный финальный отчёт

Коротко:

- что изменено;
- focused gates с числами PASS;
- путь к screenshots/evidence;
- branch + commit SHA;
- какие файлы конфликтуют при будущем merge;
- что требует PO/Cursor visual PASS;
- явно: `main не изменял, deploy не выполнял`.

Не заканчивай вопросом «продолжить?». Если нет настоящего blocker — доводи до review-ready сам.
