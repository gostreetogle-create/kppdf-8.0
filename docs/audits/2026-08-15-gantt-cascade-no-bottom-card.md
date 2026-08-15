# Audit: Gantt cascade — убрать нижнюю Карточку

**PO:** 2026-08-15 — нижняя панель мешает; состав уже раскрывается ▸ на Ганте; клик по виду работ (Столярка / Покраска) должен открывать **ещё один уровень вниз** с полями «люди / дни / override / каталог», которые сейчас в sheet.

**Verdict:** 2-level tree (summary → work) + bottom sheet для meta+composition → заменить на **3-level cascade** на левой колонке Ганта; sheet и chrome «Карточка» убрать. Новых estimate API не нужно.

---

## Сейчас (факты)

| Уровень | Где | Поведение |
|---------|-----|-----------|
| 1 Summary | `buildGanttTreeBars` + ▸ | одна сводная полоса; expand → children |
| 2 Work | child rows | resize days, body-drag start; **label click = no-op** |
| Sheet | `rightTool==='card'` + `order-inspector` | priority, plannedDate, composition product→module→WT days |

PATCH уже есть: `orders/:id`, `…/estimate-days`, `…/estimate-start`, `work-types/:id`.

---

## Целевой IA (заморозка)

```
▸ Заказ (summary)
   ├─ клик номера → order-meta strip (приоритет, план.дата, сохранить, ссылка /orders)
   └─ ▸ / клик «Демо · Столярка»
         └─ detail strip: люди, дни (override), подсказка, «в справочнике», цвет = вид работ
```

| Зона | Действие |
|------|----------|
| ▸ summary | только дерево состава (work rows) |
| Номер заказа | select + toggle **order-meta** под summary (не sheet) |
| Child work label / ▸ | toggle **work-detail** под этой строкой |
| Полоса timeline | без изменений (311/312/316) |
| Empty / Esc | свернуть detail + meta + деревья |
| Chrome «Карточка» | **удалить** |

**Не тащить** на Гант product→module дерево из inspector (Gantt уже flat по work type). Ссылки на карточку изделия/модуля — known_limitation / backlog. **322 DONE:** meta strip + sheet/chrome card removed.

---

## Split исполнения

| TZ | Scope |
|----|--------|
| **321** | DONE 2026-08-15 — work-detail row; days + catalog; `gantt-work-detail-open` |
| **322** | DONE 2026-08-15 — order-meta under summary; kill sheet + chrome card; retarget label/select |
| **323** | DONE 2026-08-15 — one meta under summary; full-width cascade panels |

Wave: `tasks/_backlog/WAVE-PRODUCTION-GANTT-CASCADE.md`

---

## Hot files

`gantt-bars.component.ts`, `gantt-bar.model.ts`, `production-cockpit.{page,context}.ts`, `order-inspector.component.ts` (extract → delete host), page docs + specs.
