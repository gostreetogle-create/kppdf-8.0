# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| — | Create КП editor + chrome + print + no-savebar | 359–367 | **DONE** на `main` (`41b00c97`+) |
| — | Desktop фон (WIP · TZD-40 · TZD-45) | `PROMPT-BACKGROUND-DESKTOP` | **DONE** |
| **PO** | Локальная проверка Create КП | — | |
| **READY** | Печать без гейта фирмы | `TZ-SALES-368` + `PROMPT-KP-OUTPUT-GATES-368.md` | print свободен; PDF/архив отдельно |
| **После PASS** | Warm deploy | `deploy.ps1` | слово «деплой» |
| — | Авто-PDF на lifecycle (Принято/Оплачено) | successor после 368 | PARK идея |
| — | Просмотр готового КП | идея | PARK |
| — | 320 пачка бланков | `_park` | PARK |

**Канон:** не выдумывать z-series / склад без PO. Idle-агенту без новой TZ — только smoke/docs или ждать.  
Wipe запрещён без русского подтверждения. Deploy — только по слову PO.

## Не брать

- `_archive/` / `_park/` без команды PO  
- Параллель на `proposal-create*` пока PO проверяет локально (если даёте код — согласовать)  
- wipe / auto-deploy / `ruvector.db`
