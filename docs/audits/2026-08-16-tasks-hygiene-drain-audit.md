# Audit: гигиена `tasks/` — 2026-08-16

**Цель PO:** в живых папках не висят «мёртвые» TZ; очередь тонкая; остальное в `_archive` / `_park`.

## Вердикт

Большая куча в корне и `_backlog` — **уже DONE**, но specs/PROMPT/WAVE не убрали после archive.  
Это не «несделанная работа», а **мусор гигиены**.

Cursor (этот сеанс) уже перенёс DONE-дубли в:
- `tasks/_archive/2026-08/specs-dup-root/`
- `tasks/_archive/2026-08/prompts-spent/`
- `tasks/_archive/2026-08/waves-done/`
и PARK-темы → `tasks/_park/`.

## После гигиены (живой остаток)

### Корень `tasks/` (пересмотр 2026-08-17)

| Файл | Статус |
|------|--------|
| `README.md`, `PROMPT-RESUME-ANY.md`, `PROMPT-UNIVERSAL-CONTINUOUS.md` | канон |
| spent one-shot PROMPT-* | `prompts-spent/` |

### `_backlog/` (только это, 2026-08-17)

| ID | Суть | Класс |
|----|------|-------|
| **TZ-MIG-304** | `Counterparty.email` + 10 КП3 | LIVE |
| **TZ-MIG-303** | photos attach | LIVE |
| `WAVE-KP3-DATA-MIGRATE` | волна до закрытия 303/304 | |

### `_park/` (не брать без PO)

AUTH-307 cutover cleanup, SALES-377, DATA-UTF8, passports, production-300s, z-series, TZD-49, …

### Не «опустошить» `_park`

Парк — это **намеренно отложенное**. Пустой `_park` = потерять память.  
«Пустая папка тасков» в смысле PO = **пустой корень + тонкий `_backlog`**, не удаление парка.

## Очередь для Freebuff

См. `tasks/PROMPT-FREEBUFF-TASKS-DRAIN.md` — строгий порядок + STOP на park/deploy/wipe.
