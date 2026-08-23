# WAVE — Перенос данных КП3 → КП8

> Цель PO: забрать с сервера **КП версии 3** продукты, сформированные КП и контрагентов (+ фото),
> локально упаковать, сопоставить поля с КП8, затем залить в SoT **через MCP** (проверка связки).
> Обновлено: 2026-08-12.

## Север

1. **Сначала выгрузка + аудит маппинга** (никаких массовых write в прод Synology).
2. Поля: синонимы → положить в наши колонки; дыры без замены → **стоп на заливе**, отчёт «нужны поля».
3. Залив: **MCP first** (`user-kppdf` / Desktop MCP). Нет tool / MCP down → агент **останавливается и просит PO подключить MCP**, не обходит «тихим» REST без явного OK.
4. Фото: целые файлы + связь product↔path; upload-tool в MCP сейчас **нет** → пакет локально + gap в отчёте (successor или REST после OK PO).

## Факты источника (проверено SSH 2026-08-12)

| | |
|--|--|
| Host | `130.49.129.240` (`go.tiit`) |
| SSH | `root` + ключ `%USERPROFILE%\.ssh\kppdf8-kp3-data-copy` |
| App | `/opt/kppdf` |
| Mongo DB | `kp-app` |
| Counts | products **699**, kps **28**, counterparties **23**, media files **~690** (~82 MB) |
| Фото | `/opt/kppdf/media/products` (+ `kp`, `specs`) |
| Канон доступа | `docs/ops/kp3-data-copy-access.md` |

Loose wording PO → код:

| PO сказал | Канон КП8 |
|-----------|-----------|
| контрагенты | `Counterparty` (не Organization) |
| продукты | `Product` (`sku` ← КП3 `code`) |
| сформированные КП | `Quotation` (коллекция `quotations`; UI «КП») |
| наша фирма в КП3 (`isOurCompany`) | **не** Counterparty-client; отдельная строка в mapping (Organization candidate) |

## Очередь TZ

| # | TZ | Суть | Статус |
|---|-----|------|--------|
| 1 | MIG-301 extract+map | dump + audit | **DONE** `e264ff4c` |
| 2 | TZ-MIG-302 | MCP/REST load scoped | **DONE** `833c12c5` (load 2026-08-12) |
| 2b | TZ-MIG-306 | category filter `$in` ObjectId\|string | **DONE** `bceb1762` (live GET BLOCKED) |
| 3 | TZD-47 | MCP photo upload HITL | **DONE** `d158c112` |
| 4 | TZ-MIG-303 | bulk attach photos | **DONE** `5895e552` (661/661 already on prod; 0 uploads) |
| 5 | TZ-MIG-304 | `Counterparty.email` schema+UI | **PARTIAL** `da01f1e5` |
| 5b | TZ-MIG-307 | долить 9 почт prod REST | **BLOCKED** `266c1cd6` — ждёт «кати» |
| — | TZ-MIG-305 | branding | **PARK** |

Spent prompts: `tasks/_archive/2026-08/prompts-spent/PROMPT-KP3-*`

## Staging

Локально: `data/from-kp3/` (дампы gitignored; README в git).

## Не делать в этой волне

- wipe / truncate КП8
- auto-deploy / `deploy.ps1`
- прямая заливка в Mongo Synology в обход MCP
- миграция materials/modules/composition BOM (в КП3 composition как в v8 не доказана — только products/kps/CP + photos)
- выдумывать новые schema fields без отчёта и отдельной successor-TZ
