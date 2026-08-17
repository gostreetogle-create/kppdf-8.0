# WAVE — Freebuff 4–5ч: gates + тесты COMBINE/GANTT (без деплоя)

Цель: пока PO нет — качественно закрыть хвосты и усилить тесты вокруг свежего Комбайна и Ганта «По рабочим».

Порядок **строго** (один TZ за раз → archive → следующий):

| # | TZ | Часы (оценка) | Суть |
|---|-----|---------------|------|
| 1 | TZ-OPS-GANTT-401-CLOSE | 0.5 | Archive/lock/_NOW для уже залитого GANTT-401 (`036b5fd5`); checklist DONE |
| 2 | TZ-TEST-COMBINE-410 | 1.0 | BE: controller/e2e-style spec на `PATCH .../lines/:lineId/lane` + reject shipped |
| 3 | TZ-TEST-COMBINE-411 | 0.75 | FE: `orders.service` spec на `patchLane` (URL/body/error) |
| 4 | TZ-TEST-COMBINE-412 | 1.0 | FE: доп. кейсы dashboard (multi-order filter, ship gate N=2, design↔prep) |
| 5 | TZ-TEST-GANTT-402 | 0.75 | FE: deepen specs toggle «По рабочим» / Не назначен / read-only |
| 6 | TZ-TEST-OPS-413 | 0.5 | Docs smoke: PAGE-TZ-INDEX + COUPLING §2b ссылки не битые; `_NOW` sync |
| 7 | TZ-TEST-REGRESS-414 | 0.5 | Регресс-пакет: `order.service` + `dashboard.page` + `production-cockpit` jest sample зелёный одной командой |

Стоп после #7 или через ~5ч — финальный отчёт PO.

## НЕ во всей волне

- Deploy / wipe / seed  
- COMBINE-406/407/408 (модули)  
- Новые product-фичи UI  
- photos/** чужой WIP  
- `data/**`  
