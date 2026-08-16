# WAVE — Комбайн: изделие-ряд (accordion mini-kanban)

**Статус:** READY  
**Дата:** 2026-08-16  
**Аудит:** `docs/audits/2026-08-16-combine-product-row-ia.md`  
**Route:** `/design/combine`  
**Инвариант:** `boardLane` / `moduleLanes` / ship-целый-заказ **не менять смысл**; меняем только IA UI.

## Север

Список изделий на всю ширину → клик раскрывает мини-комбайн стадий → модули drag внутри изделия.  
Глобальный колоночный канбан уходит.

## Порядок

| # | ID | Суть |
|---|-----|------|
| 1 | **TZ-COMBINE-409** | Shell: product rows + sticky stage header + expand + indicators + modules in cells + DnD внутри ряда |
| 2 | **TZ-COMBINE-410** | Без модулей «целиком»; polish collapse; a11y; KPI sync if needed |

## DoD волны

- [ ] Нет глобального скролл-канбана колонок как SoT UI
- [ ] Раскрыл изделие → 5 стадий на ширину экрана, модули drag
- [ ] Свёрнуто → индикаторы стадий
- [ ] Write-path lane/ship без регресса
- [ ] Deploy — по «кати»
