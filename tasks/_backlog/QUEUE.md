# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| — | Create КП editor + chrome + print + no-savebar | 359–367 | **DONE** на `main` (`41b00c97`+) |
| — | Desktop фон (WIP · TZD-40 · TZD-45) | `PROMPT-BACKGROUND-DESKTOP` | **DONE** |
| **PO** | Локальная проверка Create КП (A4 без savebar, Вывод) | — | сейчас |
| **NEXT после PASS PO** | Warm deploy (366+367+desktop gate на прод) | `deploy/synology/deploy.ps1` | ждать слово «деплой» |
| **Готово к TZ** | Просмотр готового КП (read-only) | идея PO — TZ ещё нет | Cursor пишет TZ по команде |
| — | Печать семьи бланков | `_park/TZ-SALES-320` | PARK |
| — | Coding READY queue | — | **пуста** |

**Канон:** не выдумывать z-series / склад без PO. Idle-агенту без новой TZ — только smoke/docs или ждать.  
Wipe запрещён без русского подтверждения. Deploy — только по слову PO.

## Не брать

- `_archive/` / `_park/` без команды PO  
- Параллель на `proposal-create*` пока PO проверяет локально (если даёте код — согласовать)  
- wipe / auto-deploy / `ruvector.db`
