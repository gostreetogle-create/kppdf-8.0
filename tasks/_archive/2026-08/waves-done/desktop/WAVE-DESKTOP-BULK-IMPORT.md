═══════════════════════════════════════════════════════════════
WAVE: Desktop bulk-import — «умный опт» Excel → ERP (READY)
═══════════════════════════════════════════════════════════════

STATUS: **DONE — 2026-08-08** (волна закрыта непрерывным исполнителем, все 7 TZ на main)
<!-- прошлый статус: READY · стартовать непрерывным исполнителем без ожидания «поехали» -->
AUDIT: docs/audits/2026-08-08-desktop-bulk-import-vision-audit.md
CHECKLIST: docs/agent-checklists/SESSION-WAVE-2026-08-08-desktop-bulk-import.md

## Что значит «умный опт готов» (Definition of Done волны)

Админ на Windows:

1. Ставит десктоп, pairing, копирует mcp.json в Cursor/LM Studio.
2. Кидает Excel/CSV в Inbox → «Создать задачу для ИИ» (ImportTask).
3. Агент (через MCP): классифицирует колонки ready/unfit → при unfit
   reshape без смены смысла → matching new|skip|update|doubt →
   отчёт в чат → **ждёт ok** → propose → пользователь confirm → SoT.
4. Материалы и **изделия (product)** можно заливать этим путём (HITL).
5. Если нужен печатный тип без шаблона — MCP создаёт **draft** шаблона
   + todo менеджеру в вебе.
6. Файлы до ~1k–10k строк не умирают на N× round-trip (batch).
7. Нет второй БД; journal propose/confirm; Orders/КП **не** в этой волне.

## Порядок исполнения (строго)

| # | ID | Файл | Зачем |
|---|-----|------|-------|
| 1 | TZD-23 | `TZD-23-ai-import-matching-hitl.md` | Мозг: match + HITL → propose materials |
| 2 | TZD-26 | `TZD-26-column-ready-reshape.md` | ready/unfit + reshape |
| 3 | TZD-18 | `TZD-18-mcp-batch-scale.md` | Batch + cap >500 |
| 4 | TZD-19 | `TZD-19-mcp-graph-integrity.md` | BOM / where_used до product mass |
| 5 | TZD-27 | `TZD-27-journal-product-writes.md` | product.create/update journal |
| 6 | TZD-28 | `TZD-28-doc-constructor-mcp.md` | draft шаблонов через MCP |
| 7 | TZD-29 | `TZD-29-manager-import-todos.md` | todos менеджеру |

После каждого TZ: gates → archive → lock → **commit+push main** → сразу следующий.
Не спрашивать «можно дальше?». Deploy — только по отдельной команде PO.

## Явно НЕ входит (не изобретать)

- Bulk import **Order** / коммерческое **КП** (`/proposals`)
- Silent SoT write; вторая Mongo на десктопе
- Auto-write `~\.cursor\mcp.json`
- PDF importer; in-app Ollama pipeline (TZD-01/02)
- Angular redesign; Gantt writes

## После волны

Checkpoint `_active-map`: DONE wave desktop bulk-import · NEXT idle ·
«готово предложить деплой» (desktop ZIP + BE вместе — только если PO скажет задеплой).

## Checkpoint 2026-08-08 (closeout)

- [x] TZD-23 matching+HITL → propose materials · gates ✅ · archive · main
- [x] TZD-26 column classify + reshape · gates ✅ · archive · main
- [x] TZD-18 batch + cap 2000 · gates ✅ · archive · main
- [x] TZD-19 graph read tools + integrity · gates ✅ · archive · main
- [x] TZD-27 journal product.* + MCP product · gates ✅ · archive · main
- [x] TZD-28 doc drafts через MCP · gates ✅ · archive · main
- [x] TZD-29 import-todos BE+MCP+thin page · gates ✅ · archive · main
- [x] `_active` пуст; `_active-map` = DONE wave desktop bulk-import · NEXT idle
- [x] `tasks/_backlog/desktop/README.md` status DONE
- [ ] Deploy — НЕ выполнен (только по команде PO)
