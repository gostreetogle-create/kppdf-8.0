# Аудит: «Источник строк» в Свойствах таблицы (2026-09-13)

> PO: зачем select, если Insert уже задал источник; смена туда-обратно → данные не возвращаются. Убрать дубль или починить сценарий.

### Preflight
- **Context read:** `onTableSourceChange` / `setBlockCatalogSource` (`studio-editor.page.ts`); canvas `tableRows`; `putDataSet` + `hydrateLiveDataSetRows`; `studio-table-properties` «Источник строк»; audit вида `2026-09-13-studio-table-kind-vs-source.md`
- **Deliverable:** вердикт keep/fix vs remove + TZ

---

## 1. Зачем контрол задумывался (не полный дубль Insert)

| Сценарий | Insert из «Выбрано» | Select «Источник строк» |
|----------|---------------------|-------------------------|
| «Вставить таблицу изделий» | Задаёт `catalog-products` | Показывает то же — **выглядит дублем** |
| «+ Таблица» / Elements без Insert | Не вызывается | **Единственный** способ привязать catalog/КП/заказ |
| Сменить изделия → модули на том же блоке | Нет | Да (редко) |
| Вручную править ячейки | Нет | `manual` |
| Строки из КП / заказа | Нет (другие CTA) | Да |

**Вердикт:** контрол **нужен** для manual/+Таблица/КП/заказ. Для уже вставленной catalog-таблицы — сейчас выглядит как бессмысленный дубль + **сломан** round-trip.

---

## 2. Почему «вернул Изделия — данных нет» (баги, не «так задумано»)

### B1 — `liveRows: []` навечно на холсте
Canvas `tableRows()`: если `settings.liveRows` — **массив** (даже пустой), берёт его и **не** откатывается к sample.  
`onTableSourceChange` → `applyLiveRowsFromDataSet(..., rows)` всегда пишет массив.  
Уход в `manual` → hydrate не наполняет → `liveRows = []` → пустая таблица.  
Возврат на `catalog-products` должен перезаписать liveRows из hydrate; если hydrate пустой/фейл — снова `[]`.

### B2 — `dataSource` на блоке не всегда уезжает на сервер
`onTableSourceChange` пишет `dataSource` только в локальный `blocks` signal + `putDataSet` (document.dataSets).  
`blocksService.update({ settings })` **не** вызывается (в отличие от `patchTableSettingsForBlock`).  
После F5 источник на блоке и dataSet могут разъехаться; heal/UI читают block.

### B3 — пустой «Выбрано»
Hydrate catalog читает `doc.context.catalogSelections`. Если буфер пуст — rows = []. Toast сейчас: «Источник строк: витрина» — **врёт**, что всё ок.

### B4 — fallback на клиентский `dataSet` с `rows: []`
`applyLiveRowsFromDataSet(..., find(key) ?? dataSet)` — если entry не найден, заливает пустые rows.

---

## 3. Продуктовое решение (не выкидывать слепо)

1. **Починить** B1–B4 (обязательно).  
2. **IA:**  
   - если таблица уже `catalog-*` и совпадает с Insert — показывать **статус** «Строки из Выбрано: Изделия» + кнопка «Обновить строки», а не голый дублирующий select;  
   - полный select — для `manual` / смены типа / КП / заказ, с confirm при смене с потерей live rows.  
3. Связать с TZ KIND-IA / INSERT-APPLY-KIND (один язык: источник = строки, вид = колонки).

Удалять select целиком — **нет** (ломает +Таблица и КП/заказ). Убирать видимый дубль для Insert-кейса — **да**.

---

## 4. TZ

`TZ-NX-DOCSTUDIO-TABLE-SOURCE-FIX` в pack `2026-09-13-studio-ops`.
