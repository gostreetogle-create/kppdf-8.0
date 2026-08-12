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
| 2 | [`TZ-MIG-302`](./TZ-MIG-302-kp3-mcp-load.md) | MCP/REST load scoped (no photo/email/brand) | **LOADED** prod LAN — report `2026-08-12-kp3-mcp-load-report.md` |
| 2b | [`TZ-MIG-306`](./TZ-MIG-306-fix-category-filter.md) | category filter API/UI (данные уже привязаны) | **NEXT** |
| 3 | [`TZD-47`](../desktop/TZD-47-mcp-photo-upload.md) | MCP photo upload tool | после 306 |
| 4 | [`TZ-MIG-303`](./TZ-MIG-303-attach-kp3-photos.md) | bulk attach photos | после TZD-47 |
| 5 | [`TZ-MIG-304`](./TZ-MIG-304-cp-email-via-person.md) | email → Person | после 302 |
| — | [`TZ-MIG-305`](./TZ-MIG-305-kp3-branding-park.md) | branding | **PARK** |

Промпт (категории+фото): [`PROMPT-KP3-CAT-FILTER-AND-PHOTOS.md`](./PROMPT-KP3-CAT-FILTER-AND-PHOTOS.md)  
Промпт load: [`PROMPT-KP3-MIG-302.md`](./PROMPT-KP3-MIG-302.md)

## Staging

Локально: `data/from-kp3/` (дампы gitignored; README в git).

## Не делать в этой волне

- wipe / truncate КП8
- auto-deploy / `deploy.ps1`
- прямая заливка в Mongo Synology в обход MCP
- миграция materials/modules/composition BOM (в КП3 composition как в v8 не доказана — только products/kps/CP + photos)
- выдумывать новые schema fields без отчёта и отдельной successor-TZ
