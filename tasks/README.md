# Tasks — канон порядка

| Папка / файл | Что здесь |
|--------------|-----------|
| **`PROMPT-RESUME-ANY.md`** | Обрыв / новый чат |
| **`PROMPT-UNIVERSAL-CONTINUOUS.md`** | Полный канон исполнителя |
| **`PROMPT-FREEBUFF-TASKS-DRAIN.md`** | Слить живую очередь (после drain — spent) |
| **`PROMPT-FREEBUFF-FORMS-NUMBER.md`** | Волна форм 314–317 (spent, archive after) |
| **`PROMPT-FREEBUFF-DESK-401.md`** | Каркас стола (spent — 401 DONE) |
| **`PROMPT-FREEBUFF-DESK-405.md`** | Раскладка rev.2 стола — **следующий** |
| **`_active/`** | 0–1 claim |
| **`_backlog/`** | Только незакрытое (см. `QUEUE.md`) |
| **`_park/`** | Отложено; не брать без PO |
| **`_archive/`** | DONE + specs-dup + prompts-spent + waves-done |

**Шпаргалка:** [`docs/PO-AGENT-FLOW.md`](../docs/PO-AGENT-FLOW.md)  
**Аудит гигиены:** [`docs/audits/2026-08-16-tasks-hygiene-drain-audit.md`](../docs/audits/2026-08-16-tasks-hygiene-drain-audit.md)

## Правила

1. В корне не копить DONE specs / spent PROMPT.  
2. Закрытая TZ → `_archive/YYYY-MM/<ID>.done.md` + lock; исходник → `specs-dup-root/`.  
3. Spent wave prompt → `prompts-spent/`; закрытая WAVE → `waves-done/`.  
4. `_park` не «чистить ради пустоты» — это память отложенного.

## Сейчас живо

1. **Схемы на origin не полные:** [`PROMPT-FREEBUFF-CORE-304-LAND-SOFTDELETE-2026-08-22.md`](PROMPT-FREEBUFF-CORE-304-LAND-SOFTDELETE-2026-08-22.md) — запушить leftover `deletedAt` (CORE-302 Group B).
2. После CORE-304: дерево = origin, новые фичи можно. Кати — слово PO.
`_park` / TZD-60 — не без PO.

`_park` не трогать.
