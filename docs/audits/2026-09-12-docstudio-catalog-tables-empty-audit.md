# Audit — DocStudio: почему «Выбрано»/таблицы/фото снова пустые (2026-09-12)

**Автор:** Cursor Mode A  
**Триггер:** PO — сохранённый документ; в «Выбрано» 6 изделий / 4 модуля / …; на листе несколько таблиц; данные только в последней «новой»; фото SKU 021 не видно. «Уже 2–3 раза чинили».  
**Peer prompt:** `docs/peer/PROMPT-PEER-DOCSTUDIO-CATALOG-TABLES-2026-09-12.md`

---

### Preflight Check Output
- **Context read:** `studio-editor.page.ts` `insertCatalogTable` L1059–1079, `setBlockCatalogSource`, `commitCatalogSelectionChange` L1834–1886, `refreshLiveDataSetsOnLoad` L1583–1610; `document-studio.page.md` §D52/S15; `studio-data-resolver` photo resolve; PO-CANON one-context
- **Key Constraints:** Mode A audit only; не патч продукта в этом шаге
- **Planned Deliverable:** root-cause ranked + peer grill prompt
- **Validation Path:** peer answers → Cursor synthesis → TZ wave

---

## 1. Что видит оператор (факт со скрина)

| Наблюдение | Интерпретация |
|------------|---------------|
| «Выбрано»: 6 изд / 4 мод / 3 дет / 4 мат | `context.catalogSelections` заполнен |
| CTA «Вставить таблицу …» все четыре | UI D52 на месте |
| 5 таблиц на A4; данные только в одной (широкая с Артикул/Фото/…) | Остальные без live rows или без `dataSource: catalog-*` |
| Колонка Фото пустая / «Нет фото» даже у 021 | URL не попал в live row **или** orphan на диске **или** рассинхрон после Save фото без re-putDataSet |

---

## 2. Архитектура «как задумано» (и почему это бьёт PO)

```
context.catalogSelections  ──глобально на документ──┐
                                                    ├─→ putDataSet(table-{blockId}) → liveRows на БЛОКЕ
block.settings.dataSource.type = catalog-products  ─┘
```

1. **Один буфер выбора на весь документ**, не на таблицу. Все таблицы с `catalog-products` должны показывать **один и тот же** набор изделий.
2. **Строки живут только после `putDataSet`** (hydrate на BE). GET документа **не** кладёт liveRows в блоки — на open FE делает `refreshLiveDataSetsOnLoad` (серия putDataSet).
3. **D52 `insertCatalogTable`:** если уже есть таблица с этим `catalog-*` source → **только activateLayer**, **новую не создаёт**. Документировано в page.md. Оператор жмёт «Вставить» снова → думает «ещё одна заполненная», код говорит «уже есть — фокус».
4. **S15:** если на листе ровно одна **manual** таблица, add в витрину авто-проставляет ей source. Несколько manual таблиц → **не** авто-wire → остаются пустыми.
5. Таблицы с другим видом колонок (Наименование/Кол-во/Цена/Фото без sku) могут быть **другими блоками** без `dataSource` или со stale liveRows после heal.

**Вывод:** «Данные только в новой» чаще всего = **только у неё выставлен `dataSource: catalog-products` и успел putDataSet**. Остальные — manual/пустой source, не баг «пропали selections».

---

## 3. Root causes (ранжировано)

### R1 — P0 UX/IA mismatch (почти наверняка на скрине)
**D52 reuse-first:** второй+ клик «Вставить таблицу изделия» не создаёт вторую живую таблицу.  
Доп. таблицы с листа («+ Таблица» / старые) остаются без catalog source → пустые.  
**Evidence:** `insertCatalogTable` L1068–1073.

### R2 — P0 hydration gap on reopen
Live rows не в GET; зависимость от `refreshLiveDataSetsOnLoad`. При revision race / early abort / таблица без `dataSource` в settings — блок остаётся пустым после reopen «уже сохранённого».  
**Evidence:** comment L1583–1586; loop L1592–1609.

### R3 — P1 sole-table auto-wire (S15)
Авто-привязка только при **одной** manual таблице. При 2+ пустых — тишина.  
**Evidence:** page.md §3.3; `commitCatalogSelectionChange` soleTable L1857–1862.

### R4 — P1 photo empty (отдельный контур)
Пайплайн S48/orphan: нет файла на диске → честное «Нет фото».  
Плюс: Save фото в карточке **не** триггерит автоматически putDataSet всех catalog tables → reopen/refresh нужен.  
PO-SWEEP #05 frame не чинит отсутствие URL.  
**Evidence:** prior audits PHOTO-SMOKE; `resolveCatalogPhotoUrls`.

### R5 — P2 column/template drift
Пустые Описание/Ед/Кол-во на «полной» таблице при наличии name/price → частичный map или qty override 0/empty display, не обязательно «нет данных». Фото-колонка пустая при живом name — сильнее указывает на R4, не на полный fail resolve.

### R6 — Architectural smell (почему «снова»)
Чинили **рендер ячейки / orphan / heal колонок / WYSIWYG CSS**, не **операторский контракт**:
- «N таблиц одного kind = N копий одних selections» vs  
- «1 source kind → 1 logical binding, insert = focus».

Каждый фикс cells без смены IA → рецидив жалобы.

---

## 4. Что НЕ является корнем (часто путают)

| Гипотеза | Почему слабо |
|----------|--------------|
| «catalogSelections потерялись» | Badge «Выбрано» показывает числа — буфер жив |
| «BE не умеет несколько dataSets» | Ключ `table-{blockId}` — multi ok |
| «Только последняя таблица в Mongo» | Скорее только она hydrated / wired |

---

## 5. Варианты фикса (для peer + потом TZ)

| Opt | Суть | Риск |
|-----|------|------|
| **A** | IA: при Insert всегда **создавать** новую таблицу + wire source (убрать early-return focus) | Дубли одних строк на листе — может быть то, что PO хочет |
| **B** | IA: Insert = focus + toast «уже на листе»; кнопка «Дублировать таблицу с данными» | Честнее текущего молчаливого focus |
| **C** | При Add в витрине: wire **все** manual tables of matching kind или все tables without source | Может залить не те таблицы |
| **D** | После Save фото/passport: invalidate + re-putDataSet всех `catalog-*` tables | Чинит фото без reopen |
| **E** | Persist liveRows snapshot на GET (bake soft) | Дубли SoT, сложнее sync |
| **F** | Per-table selection subset (не глобальный буфер) | Крупная смена модели |

Рекомендация Cursor (до peer): **A или B** (явный контракт Insert) + **D** (фото refresh) + операторский copy в UI. Не E/F без peer consensus.

---

## 6. Связь с открытым TZ VITRINA-EDIT

Кнопка «Изменить» в витрине поможет **добавить фото**, но **не** заполнит пустые таблицы без wire/hydrate. Делать **после** или **параллельно** с IA-фиксом Insert/hydrate — иначе PO снова «фото есть, на листе нет».

---

## 7. Next

1. PO раздаёт `docs/peer/PROMPT-PEER-DOCSTUDIO-CATALOG-TABLES-2026-09-12.md` ~10 агентам.  
2. Cursor читает ответы → финальный вердикт + WAVE TZ.  
3. Пока: **не** выдавать Claude «ещё раз починить фото в таблице» без IA-решения.
