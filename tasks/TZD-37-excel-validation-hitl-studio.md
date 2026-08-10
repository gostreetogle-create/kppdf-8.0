═══════════════════════════════════════════════════════════════
TZD-37: Excel validation HITL в Import Studio
═══════════════════════════════════════════════════════════════

РОЛЬ АГЕНТА: Desktop + MCP/BE thin (validation + wire)
ЗАВИСИМОСТИ: TZD-36 DONE
LAYER: 3 (строго 1; пересечение с mcp — не параллелить MCP-GAP)
CONFLICT KEYS: desktop/src/**; desktop/src/importers/excel.ts; desktop/mcp/src/inbox.ts; desktop/mcp/src/inbox-tools.ts; desktop/mcp/src/import-task-tools.ts; backend/src/modules/import-task/** (только если нужен DTO/report field); docs/agent-checklists/TZD-37.md

PAGES: (desktop)
PAGE_DOCS: docs/audits/2026-08-10-desktop-excel-import-studio-audit.md

Проверено: ImportTask rows flat; HITL aiReport new/skip/update/doubt; excel = sheet[0] only; SoT match через TZD-23 tools; нет studio grid статусов.

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

PO: закинул спецификацию → быстро разложил → полная проверка дублей/коллизий → проблемные строки видны → Отправить. Опционально «проверить через ИИ» если MCP подключен.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1: Multi-sheet + column map
  - После parse: список листов книги; default 1-й или лист с эвристикой «спецификация/materials».
  - UI выбора листа + простой column map (алиасы артикул/название/ед/кол-во/…) с сохранением в task.columnMap если уже есть reshape API.

ШАГ 2: Validation engine (локально + SoT)
  На каждую строку вычислить статус (enum RU в UI):
  - `ok_new` — артикул не найден в SoT
  - `ok_update` — найден match (article/sku), поля отличаются
  - `skip` — точный дубль SoT
  - `conflict` — дубль артикула внутри файла / неоднозначный match
  - `error` — нет обязательного артикула (канон CATALOG-338) или битые числа qty
  Показать счётчики сверху; фильтр по статусу; подсветка строк.

ШАГ 3: Apply
  - «Отправить» / «Создать proposals» только для выбранных ok_new/ok_update (default: все non-error).
  - Путь: существующий journal propose → confirm (materials; products если passport-only).
  - Не silent POST в SoT.
  - Итог: toast + список созданных/подтверждённых.

ШАГ 4: «Проверить через ИИ»
  - Кнопка активна только если MCP host running + pairing ok.
  - Вызов существующих MCP/HTTP путей audit / import_task set_report (не новый LLM в MSI).
  - Результат мержится в grid (doubt/flags); если MCP down — disabled + hint «Запустите MCP на вкладке MCP».
  - Не требовать ИИ для основного validate (ШАГ 2 обязателен без ИИ).

ШАГ 5: Tests
  - Unit: duplicate-in-file → conflict; empty article → error; match → update/skip.
  - Docs note в audit/INSTALL.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- Composition lines (TZD-38)
- Commercial MCP (TZD-33)
- Web Angular catalog forms
- Forced bundled LLM

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Excel с двумя одинаковыми артикулами → обе/вторая conflict до Отправить.
2. Артикул уже в каталоге → skip или update (явно), не тихий второй create.
3. Строка без артикула → error, не уходит в propose.
4. AI-check disabled без MCP; enabled с MCP и меняет/дополняет статусы без падения UI.
5. Multi-sheet: можно выбрать не только первый лист.
6. Gates: desktop tests + mcp tests затронутых файлов; BE tsc если трогали import-task.
7. Archive + Executor report + commit/push.

known_limitation: иерархия BOM/состав изделия — TZD-38; batch 10k — не цель (cap ImportTask уважать).
