# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| **0 READY** | Desktop ZIP с semver в имени (+ next deploy checklist) | `TZD-46` · `PROMPT-TZD-46-ZIP-VERSION.md` | **код сейчас; деплой later (VPN)** |
| **0b READY** | Перенос данных КП3→КП8 (extract+map → MCP) | `migrate-kp3/` · MIG-301 → 302 · `PROMPT-KP3-MIG-301.md` | после/рядом |
| **0c READY** | PDF имя = `КП-{number}.pdf` (audit+fix) | `TZ-SALES-369-kp-pdf-filename.md` | thin |
| — | Create КП editor + chrome + print + no-savebar | 359–367 | **DONE** на `main` (`41b00c97`+) |
| — | Desktop фон (WIP · TZD-40 · TZD-45) | `PROMPT-BACKGROUND-DESKTOP` | **DONE** |
| — | Навигация return + gutters | WAVE-NAV-RETURN 316→317 | **DONE** |
| — | Печать без гейта фирмы | TZ-SALES-368 | **DONE** |
| **После PASS + VPN off** | Warm deploy (+ desktop tauri publish versioned) | `deploy.ps1` + canon audit desktop-download | слово «деплой» |
| — | Авто-PDF на lifecycle (Принято/Оплачено) | successor после 368 | PARK идея |
| — | Просмотр готового КП | идея | PARK |
| — | 320 пачка бланков | `_park` | PARK |

**Канон:** idle — **TZD-46** (PO боль «скачал 0.5 / нет версии в zip»), иначе MIG-301, иначе 369.  
Wipe запрещён без русского подтверждения. Deploy — только по слову PO **и** VPN off.

## Не брать

- `_archive/` / `_park/` без команды PO  
- Параллель на `proposal-create*` / `app-layout` без claim Team Room  
- wipe / auto-deploy / `ruvector.db`
