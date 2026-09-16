# Аудит: «Вид таблицы» vs Insert / источник строк (2026-09-13)

> PO: откуда выпадающий список, как добавлять, нет ли хардкода/дублей, зачем вид если уже вставили «таблицу изделий».  
> Промпты в чат не выдавать — только TZ в `tasks/_ready/2026-09-13-studio-ops/`.

### Preflight
- **Context read:** `studio-table-properties.component.ts` (Вид + Источник строк); `studio-editor.page.ts` `insertCatalogTable`/`createTableBlock`/`setBlockCatalogSource`; `studio-table-defaults.ts` `STUDIO_DEFAULT_*` / `buildTableSettingsFromTemplate`; `table-template.schema.ts` (`category`, `dataSource`); `document-studio.page.md` §TABLE-KINDS-DISCOVER; audit `2026-09-11-docstudio-table-props-po.md`
- **Deliverable:** ясная модель + TZ на usable IA (не «накиданный» UI)

---

## 1. Две разные ручки (путаница PO)

| Контрол в Свойствах | Что это | Откуда список | На что влияет |
|---------------------|---------|---------------|---------------|
| **Источник строк** | Откуда берутся **данные строк** | Фикс. enum в UI (manual / КП / заказ / 4 catalog-*) | `block.settings.dataSource` → `putDataSet` → `liveRows` |
| **Вид таблицы** | **Пресет колонок** (заголовки, key, порядок, sample) | Mongo `TableTemplate` через `GET /table-templates` — **не** хардкод имён в коде | Snapshot на блок: `tableTemplateId/Name/Columns/SampleRows` |

**Insert «Вставить таблицу изделий»** выставляет только **источник** `catalog-products` (+ hydrate строк).  
Колонки при create = **хардкод** `STUDIO_DEFAULT_TABLE_COLUMNS` (Наименование / Кол-во / Цена — 3 шт.), **без** выбора вида «Продукты» из реестра.

Итог для оператора: «я уже вставил изделия» ≠ «выбран вид Продукты с фото/артикулом». Вид и Insert живут в разных контурах → ощущение дубля и «мёртвого» select.

---

## 2. Откуда виды и как править (факт)

- SoT: реестр **Реестры → Документы → Виды таблиц** (`/registries/table-templates`).
- CRUD там; в студии — ссылка «Реестры → Виды таблиц» + «Сохранить как вид таблицы» (копия структуры блока → новый template).
- В схеме template есть `category`, `dataSource` (для привязки к типу данных) — **пикер в студии сейчас грузит весь list()**, без фильтра по `dataSource` текущего блока.
- Дубли «Продукты» уже чистили миграцией KINDS-DISCOVER (активный один; старые inactive). Не хардкод — данные БД.

---

## 3. Что НЕ должно казаться «магией»

| Ожидание PO | Сейчас | Нужно |
|-------------|--------|-------|
| Всё редактируемо | Виды — да (реестр); дефолт Insert — 3 колонки в коде | Insert → применить канон. вид из реестра по `dataSource` |
| Понятно, зачем select | Подпись «Вид» без объяснения vs Источник | RU copy: «Макет колонок (пресет)» + одна строка зависимости |
| Нет мёртвого UI | Width % не рендерится (отдельный TZ); вид не авто после Insert | Связать Insert↔вид; width — pack #3 |

---

## 4. Вердикт

Не «лишний функционал на выброс» — **пресеты колонок нужны** (разные комплекты для изделий/модулей/КП).  
Сломан **контракт для оператора**: Insert не применяет пресет; подписи не разделяют «строки» vs «колонки»; список видов не сужается под источник.

---

## 5. TZ (этот pack)

1. `TZ-NX-DOCSTUDIO-TABLE-KIND-IA` — copy + порядок полей + hint.  
2. `TZ-NX-DOCSTUDIO-INSERT-APPLY-KIND` — Insert/смена catalog source → auto-apply matching TableTemplate (`dataSource` / fallback имя); иначе честный toast «выберите вид».
