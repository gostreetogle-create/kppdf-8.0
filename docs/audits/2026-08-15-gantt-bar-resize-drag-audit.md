# Audit — Gantt bar handles (resize / move) · 2026-08-15

**Scope:** цветные полосы «Nд» на `/production` — боковые ручки, смена длительности, сдвиг цепочки.  
**Mode:** audit only (no product code).  
**PO intent:** поведение как у «нормальных» Гантов; без хаоса и жалоб в работе.

## Verdict

| Вопрос | Ответ |
|--------|--------|
| Насколько сложно? | **Средне–высоко** как **волна** (данные + UI), не как «добавить две кнопки» |
| Можно ли сделать грамотно? | **Да**, если идти через **order-level days** → потом handles |
| Можно ли «быстро сам» сейчас? | **Нет** — это не hotfix; текущий write-path опасен |
| Блокер | `TZ-PRODUCTION-309` (parked): без override resize = правка **справочника** на все заказы |

**Оценка трудоёмкости (один исполнитель, focused gates):**

| Этап | Содержание | Effort |
|------|------------|--------|
| **P0 · 309** | Capability `production:write` + **order-level** duration override + честный UI | ~2–4 дня |
| **P1 · drag-resize** | Ручки L/R, snap к дню, preview, persist override, cascade recompute | ~3–5 дней |
| **P2 · move** (опционально) | Move всей цепочки заказа = `plannedDate` (уже есть в inspector) | +1–2 дня UI |
| **Не сейчас** | Fact schedule / ProductionOrder / cross-order deps | отдельный север |

Итого до «привычного» resize без стыда: **~1–1.5 недели**, не вечер.

## Что полосы есть сейчас

- Это **план-оценка**, не факт цеха (`docs/ux/production-gantt-studio-spec.md`).
- Длительность = **`WorkType.days`** (каталог), не часы.
- Старт заказа = `plannedDate ?? date ?? сегодня`.
- Внутри заказа полосы **уже последовательно пакуются** (`buildGanttBars` cursor по `sortOrder`): удлинил «Сварку» → «Покраска» и дальше **сдвигаются при пересчёте**. Это и есть «зависимые по дате» **внутри одного заказа**.
- Между заказами зависимостей **нет**.
- Правка дней сегодня: inspector → `confirm` → `PATCH /work-types/:id` → **глобально для всех заказов** с этим видом.

Поэтому «ручки на полосе» без новой модели = красивый способ **сломать каталог**.

## Что PO, скорее всего, хочет (разложить на жесты)

| Жест | Смысл | Где жить SoT | Сейчас |
|------|--------|--------------|--------|
| **Resize правый край** | ± дни этой работы | order-line / composition override days | нет override → нельзя |
| **Resize левый край** | сдвиг старта **этой** полосы + обычно ± дни | то же + возможно offset; сложнее | нет |
| **Drag тела полосы** | сдвинуть старт без смены длительности | чаще всего `plannedDate` заказа **или** offset всей цепочки | `plannedDate` уже в inspector, не на полосе |
| **Cascade** | последующие виды в том же заказе едут | уже в `buildGanttBars` | да, при смене days |

Рекомендация продукта: **v1 = только правый resize (длительность) + пересчёт цепочки**; левый/move — v1.1. Так меньше «органных» сюрпризов (двухсмысленный левый край).

## Почему нельзя «просто нарисовать ручки»

1. **Write-path:** один PATCH каталога меняет все DEMO/боевые заказы с «Сварка».
2. **Нет SoT полосы:** `GanttBar` — derived view; id составной; нет сущности «задача на календаре».
3. **ACL:** FE уже намекает `production:write`, BE WorkType всё ещё Roles — дыра до 309.
4. **UX ловушка:** optimistic drag без persist → F5 откатывает; persist в каталог → соседний заказ «поехал» без объяснения.
5. **Multi-order режим «Все активные»:** одинаковый workType на двух заказах — один resize = два расписания меняются, если пишем в каталог.

Это ровно причина, по которой design 2026-08-06 выбрал **inspector-first**, а drag отложил до order-level days.

## Грамотная архитектура (если делать)

```
[Pointer on bar edge]
        ↓ snap to day grid (GANTT_PX_PER_DAY)
        ↓ local preview (не писать на каждый mousemove)
        ↓ commit → PATCH order-level days override (не WorkType catalog)
        ↓ rebuild bars via buildGanttBars (cascade внутри заказа)
        ↓ toast / undo optional
```

**Инварианты:**

- Resize **не** трогает `WorkType.days` справочника (кроме явного admin-пути в `/work-types`).
- Read-only статусы (shipped/delivered/cancelled) — без ручек.
- `noTerm` (нет days) — без resize или только «задать дни» через confirm.
- Keyboard: стрелки ±1 день на focused bar (a11y) в той же TZ или 310+.
- Confirm при первом commit в сессии — опционально; лучше честная подпись «только этот заказ».

**Не смешивать:** check-in, stuck, ProductionSchedule, auto-chain 304–307.

## Связь с парком

| Артефакт | Роль |
|----------|------|
| `tasks/_park/TZ-PRODUCTION-309-safe-estimate-order-days.md` | **обязательный** pre-req (override + capability) |
| Drag UI | **новый** TZ после 309 DONE (условно `TZ-PRODUCTION-311-gantt-estimate-resize`) |
| Studio chrome A–D / UX-322 | уже PASS; не блокер для 309 |
| Fact Gantt / GANT plug-ins 304–307 | другой продукт; не подменять estimate-handles |

Studio chrome **не** разблокирует drag — разблокирует только **309**.

## Риски «нареканий» и как закрыть

| Риск | Митигация |
|------|-----------|
| «Поменял полосу — у другого заказа уехала Сварка» | Только order-level write |
| «Потянул — ничего не сохранилось» | Явный commit + optimistic + rollback toast |
| «Съехала сетка / zoom week» | Snap в календарные дни, не в пиксели; week = тот же day model |
| «Левый край непонятен» | v1 только правый handle |
| «Думали что это факт цеха» | Copy на preview: «оценка · не факт» |

## Рекомендация PO

1. **Не** клеить ручки до un-park **309**.
2. Un-park **309** → executor → затем отдельная TZ на **правый resize + cascade** (P1).
3. Move цепочки через `plannedDate` можно усилить UI позже (P2) или оставить в inspector.
4. Визуальный polish полос (толщина ручек, hover) — только вместе с P1, не отдельно «пустышки».

**STOP до явного «un-park 309» / «делай resize-wave».**
