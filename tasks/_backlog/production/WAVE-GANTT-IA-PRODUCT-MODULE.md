# WAVE — Gantt IA: изделие / модуль (не плоский вид работ)

**Статус:** DONE (342+343+344+345; deploy deferred)  
**Дата:** 2026-08-16  
**Аудит:** `docs/audits/2026-08-16-gantt-ia-order-product-module.md`  
**Инвариант:** UX expand / cascade / frames / drag-shell **не ломать** — меняем уровни данных в дереве.

## Север

Гант отвечает: (1) сроки заказа→изделия→модуля; (2) чем занят рабочий (модуль + контекст).  
Виды работ — **лист** под модулем, не первый уровень раскрытия.

## Порядок TZ

| # | ID | Суть | Параллель |
|---|-----|------|-----------|
| 1 | **TZ-PRODUCTION-342** | `buildGanttTreeBars`: Order→Product→Module→WT + expand keys; summary spans | solo (model+bars) |
| 2 | **TZ-PRODUCTION-343** | Лейблы RU, toggle copy, frames на product/module groups | after 342 — **DONE** |
| 3 | **TZ-PRODUCTION-344** | «По рабочим»: ▸ + дети = модули с контекстом заказа/изделия | after 342 — **DONE** |
| 4 | **TZ-PRODUCTION-345** | Изделие без модулей = одна «целая» строка уровня модуля | after 342 — **DONE** |

## DoD волны

- [x] Под заказом ▸ видно **изделия**, не «Резка металла» *(342)*
- [x] Под изделием ▸ **модули**; под модулем ▸ виды работ + cascade *(342)*
- [x] По рабочим: модуль отвечает «чем занят»; WT внутри *(344)*
- [x] Drag/resize/estimate PATCH не регрессируют на WT *(342 gates)*
- [x] RU labels + nested frames product/module *(343)*
- [x] Изделие без модулей / целиком = одна module-строка «… · целиком» *(345)*; empty → skip 336 intact
- [ ] Deploy — только по «кати»

## Park

- Спец-сущность «Сборка» / статус «изделие собрано» — каталог WT + later TZ
- Batch BE estimate API — не в этой волне
