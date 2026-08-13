# Очередь

**Шпаргалка PO:** [`docs/PO-AGENT-FLOW.md`](../../docs/PO-AGENT-FLOW.md)

**Обрыв / новый чат:** [`tasks/PROMPT-RESUME-ANY.md`](../PROMPT-RESUME-ANY.md)

## Живые потоки

| Порядок | Поток | Где | Статус |
|---------|--------|-----|--------|
| **0 ACCESS READY** | Вход по именованному компьютеру без пароля | `WAVE-AUTH-DEVICE-ACCESS.md` · `PROMPT-AUTH-DEVICE-ACCESS-CONTINUOUS.md` · 306→303→304→305→307 | **PO ДА 2026-08-13**; deploy только отдельно |
| **0 READY** | MIG-302 scoped MCP load (без фото/email/бренд) | `PROMPT-KP3-MIG-302.md` | **PO ДА 2026-08-12** |
| **0a READY** | Desktop ZIP с semver в имени | `TZD-46` · `PROMPT-TZD-46-ZIP-VERSION.md` | код; деплой later |
| **0b next** | MCP photo upload → attach KP3 photos | TZD-47 → MIG-303 | после 302 / parallel tool |
| **0c next** | CP email → Person | MIG-304 | после 302 |
| — | Branding kpPage | MIG-305 | **PARK** |
| — | MIG-301 extract+map | archive | **DONE** `e264ff4c` |
| — | Create КП editor + chrome + print + no-savebar | 359–367 | **DONE** на `main` (`41b00c97`+) |
| — | Desktop фон (WIP · TZD-40 · TZD-45) | `PROMPT-BACKGROUND-DESKTOP` | **DONE** |
| — | Навигация return + gutters | WAVE-NAV-RETURN 316→317 | **DONE** |
| — | Печать без гейта фирмы | TZ-SALES-368 | **DONE** |
| **После PASS + VPN off** | Warm deploy (+ desktop tauri publish versioned) | `deploy.ps1` + canon audit desktop-download | слово «деплой» |
| — | Авто-PDF на lifecycle (Принято/Оплачено) | successor после 368 | PARK идея |
| — | Просмотр готового КП | идея | PARK |
| — | 320 пачка бланков | `_park` | PARK |
| **НАПОМИНАНИЕ** | **Паспорта изделий** в Сделках (после Заказов): аудит Google Sheets → таблица на сайте → импорт + связь с Product | `sales/WAVE-PRODUCT-PASSPORTS.md` | **PARK** до ссылки PO на таблицу |

**Канон:** idle — **TZD-46** (PO боль «скачал 0.5 / нет версии в zip»), иначе MIG-301, иначе 369.  
На вопрос «что осталось / завтра» — не забывать **паспорта изделий** (`WAVE-PRODUCT-PASSPORTS`).  
Wipe запрещён без русского подтверждения. Deploy — только по слову PO **и** VPN off.

## Не брать

- `_archive/` / `_park/` без команды PO  
- Параллель на `proposal-create*` / `app-layout` без claim Team Room  
- wipe / auto-deploy / `ruvector.db`
