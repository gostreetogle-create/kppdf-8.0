# Docs hygiene (параллельно ORDERS-302 / NAV-301)

**Дата:** 2026-08-08  
**Scope:** только markdown вне conflict keys агентов (`orders/**`, composition-tree, `app-layout`, `app.routes`, stubs pages, `_active-map`, `PAGE-TZ-INDEX`).

---

## 1. Вердикт

Документация потока **в целом живая**, но есть **устаревшие статусы** (RESERVED/PARK на уже DONE) и **дыры спек** (SALES-303, SUPPLY API). Поправил статусы в канонах ниже; добавил executable TZ в backlog.

---

## 2. Найдено → сделано

| Проблема | Действие |
|----------|----------|
| `sales-to-shop-flow-canon` шапка: «код не писать пока Q5» | Q5 закрыты → шапка обновлена |
| `business-logic-rails-check`: ORDERS-302 PARK, COST-305 RESERVED | Пометки sync (302 in flight / 305 DONE) |
| `catalog-cost-pricing-hierarchy`: COST-305 RESERVED | → DONE |
| `agent-handoff-2026-08-09-morning.md` устарел | Banner SUPERSEDED → смотреть flow canon + map |
| Нет executable **SALES-303** (мульти-КП Organization) | Создан backlog TZ |
| Нет **SUPPLY-301** API (после stub NAV) | Создан thin backlog TZ |
| `PAGE-TZ-INDEX` / `_active-map` устарели местами | **Не трогал** — keys у NAV/ORDERS агентов |

---

## 3. Канон имён (повтор для агентов)

| Говорят | Писать в TZ |
|---------|-------------|
| Заказчик / клиент | **Counterparty** |
| Наша фирма / «поставщик» в смысле юрлица на бланке КП | **Organization** |
| Площадка / объект | **Site** (ORDERS-303) |
| Снабжение | `/supply` + SUPPLY-* |

---

## 4. Очередь спек (не CLAIM сейчас)

1. ORDERS-302 / NAV-301 — in flight  
2. ORDERS-303 — after 302  
3. DICT-315 — after dictionaries WIP  
4. SALES-303 — multi-org KP (после стабилизации КП UI ok)  
5. SUPPLY-301 — API после NAV stub  

Deploy — только по команде PO.
