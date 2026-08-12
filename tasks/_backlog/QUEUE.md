# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| **0 READY** | Перенос данных КП3→КП8 (extract+map → MCP) | `migrate-kp3/` · MIG-301 → 302 · `PROMPT-KP3-MIG-301.md` | **стартовать с 301** |
| — | Create КП editor + chrome + print + no-savebar | 359–367 | **DONE** на `main` (`41b00c97`+) |
| — | Desktop фон (WIP · TZD-40 · TZD-45) | `PROMPT-BACKGROUND-DESKTOP` | **DONE** |
| **1 READY** | Навигация: edit→builder + возврат + ←→ в полях | `WAVE-NAV-RETURN` 316→317 · `PROMPT-NAV-RETURN.md` | **PO блокер** до дальнейших смотров |
| **2 READY** | Печать без гейта фирмы | `TZ-SALES-368` + `PROMPT-KP-OUTPUT-GATES-368.md` | после/рядом (не picker) |
| **После PASS** | Warm deploy | `deploy.ps1` | слово «деплой» |
| — | Авто-PDF на lifecycle (Принято/Оплачено) | successor после 368 | PARK идея |
| — | Просмотр готового КП | идея | PARK |
| — | 320 пачка бланков | `_park` | PARK |

**Канон:** не выдумывать z-series / склад без PO. Idle-агенту — **MIG-301** если PO открыл перенос КП3; иначе NAV-RETURN, иначе 368.  
Wipe запрещён без русского подтверждения. Deploy — только по слову PO.

## Не брать

- `_archive/` / `_park/` без команды PO  
- Параллель на `proposal-create*` / `app-layout` без claim Team Room  
- wipe / auto-deploy / `ruvector.db`
