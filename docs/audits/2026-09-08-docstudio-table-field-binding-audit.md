# Audit: DocStudio table field binding / column map (2026-09-08)

### Preflight Check Output
- **Context read:** PO screenshot (Артикул|Фото|Наименование|Описание|Ед.Изм.|Цена); `studio-data-resolver.ts` L48–105; `studio-table-defaults.ts` L12–16; `studio-blocks-canvas.component.ts` L127–141, L322–325; `studio-editor.page.ts` putDataSet / `patchTableSettingsForBlock`; `studio-table-properties.component.ts` `onTemplateSelect` L677–682; `proposal-table-layout.util.ts` (legacy Create КП aliases); S45/S46 archives
- **Key Constraints:** S45/S46 UX OK (click→Properties, liveRows survive drag); mapping ≠ UX; Mode A → TZ only
- **Planned Deliverable:** этот аудит + WAVE S47/S48 + PROMPT с обязательным re-audit Claude до кода
- **Validation Path:** Jest resolver 6-col cases; nx build; visual smoke vitrina→table

## Симптом (оператор)

| Колонка | Видно | Ожидание |
|---------|--------|----------|
| Артикул | имена («Мангал…», «СМОК…») / иногда sku | SKU / article |
| Фото | цифра `1` | миниатюра или «Нет фото» |
| Наименование | `0` / `49000` | название изделия |
| Описание / Ед.Изм. / Цена | пусто | описание / ед. / цена |

**Не баг S45/S46:** клик, свойства, строки после drag — уже ок.

## Корневые причины (код)

### BUG-1 PRIMARY — 3 ячейки под 6 заголовками (позиционный рендер)

1. Новая таблица / insert: `STUDIO_DEFAULT_TABLE_COLUMNS` = `name|qty|price` (`studio-table-defaults.ts` L12–16).
2. Hydrate: `mapLineItemsToRows(items, columns)` → ряд ширины = число колонок **на момент putDataSet** (`studio-data-resolver.ts` L98–104).
3. Смена «Вид таблицы» → только `settingsChange` / `patchTableSettingsForBlock` — **без** повторного `putDataSet` (`studio-table-properties.component.ts` L677–682; `studio-editor.page.ts` ~1549).
4. Canvas рисует `{{ cell }}` **по индексу строки**, не по `column.key` (`studio-blocks-canvas.component.ts` L137–140, L322–325).

Итог: `[имя, qty=1, цена]` ложится под `[Артикул, Фото, Наименование, …]` → ровно скрин PO.

### BUG-2 — Неполный alias map NX studio

`COLUMN_ALIASES` в `studio-data-resolver.ts` L48–55: name/qty/price/sum/unit/sku.  
**Нет:** `photo`, `description`, `article` (латиница), `productName`/`unitPrice` как ключи без алиаса.  
Эталон Create КП: `proposal-table-layout.util.ts` + `document-template.service.ts` `previewLineValue`.

### BUG-3 — Тонкий LineItem из каталога

Catalog path собирает name/sku/qty=1/price — без `description` / photo URL (`studio-data-resolver.ts` ~404–410). Product schema поля есть, в LineItem не прокидываются.

### BUG-4 — Фото = plain text

Canvas и studio PDF table HTML — только текст; thumbnails есть в legacy `table-template.service.ts` `formatCell`, не подключены к NX canvas.

### BUG-5 — liveRows игнорируют hide-column filter

Manual rows фильтруются; liveRows — сырой массив (canvas `tableRows`).

## Целевой канон (зафиксировано скрином PO)

Шаблон колонок КП: **Артикул | Фото | Наименование | Описание | Ед.Изм. | Цена**  
Ключи (alias-parity с Create КП): `productSku`/`article`/`sku` · `photo` · `productName`/`name` · `description` · `unit` · `unitPrice`/`price`.

Seed «КП — позиции» (№|Наименование|Кол-во|…) — другой пресет; оба должны мапиться по **ключу**, не по позиции.

## WAVE

| # | SIZE | TZ | Что |
|---|------|-----|-----|
| 0 | S | `TZ-NX-DOCSTUDIO-S47-AUDIT-RECHECK` | Claude **только** повторный аудит → файл confirm; код запрещён |
| 1 | L | `TZ-NX-DOCSTUDIO-S47-COLUMN-MAP-PARITY` | alias + LineItem + re-hydrate on template/structure change + tests |
| 2 | L | `TZ-NX-DOCSTUDIO-S48-TABLE-PHOTO-CELLS` | thumbnail в ячейке Фото + PDF path |

**Промпт:** `tasks/PROMPT-CLAUDE-DOCSTUDIO-S47-S48-FIELD-MAP.md`
