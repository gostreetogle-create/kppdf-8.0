# PEER PROMPT — DocStudio catalog tables / «Выбрано» / photos (раздать ~10 агентам)

Скопируй блок ниже **целиком** каждому peer-агенту (Claude/GPT/Gemini/…).  
Задача: **только анализ**, не писать код в репозиторий. Ответ — структурированный markdown.

---

```
Ты независимый reviewer архитектуры ERP DocStudio (kppdf-8.0).

Контекст (обязательно учесть):
- Документ-студия NX: лист A4 + панели «Данные» / «Выбрано».
- Выбранные позиции каталога лежат в document.context.catalogSelections
  (products/modules/parts/materials) — ОДИН глобальный буфер на документ.
- Таблица на листе — block type=table. Живые строки появляются через
  PUT data-sets/table-{blockId} с source.type = catalog-products|modules|parts|materials.
- GET документа НЕ гидратит liveRows в блоки; при open FE делает refresh putDataSet.
- insertCatalogTable (D52): если таблица с этим catalog-* source УЖЕ есть —
  только focus, НЕ создаёт вторую. Документировано.
- S15: авто-wire source только если на листе ровно одна manual-таблица.
- Фото в ячейке: resolve Photo.storageUrl; нет файла на диске → «Нет фото».
- PO уже 2–3 раза чинил «фото/строки» (S47/S48, heal liveRows, WYSIWYG, frame) —
  симптом возвращается.

Симптом PO сейчас:
- В «Выбрано» есть 6 изделий, 4 модуля, 3 детали, 4 материала.
- На листе несколько таблиц; данные видны только в одной (последней «новой»).
- У изделия SKU 021 фото в карточке добавлено — в таблице фото нет.

Аудит Cursor (прочитай если доступен файл, иначе опирайся на контекст выше):
docs/audits/2026-09-12-docstudio-catalog-tables-empty-audit.md

Вопросы — ответь по пунктам, кратко, с обоснованием:

Q1. Согласен ли, что главный разрыв — IA (оператор ждёт N заполненных таблиц,
    код даёт 1 binding на catalog-kind + focus)? Да/Нет + 2 предложения.

Q2. Правильная продуктовая модель для цеха ~10 чел:
    (a) один буфер → все catalog-products таблицы показывают одни строки;
    (b) у каждой таблицы свой subset выбора;
    (c) Insert всегда клонирует новую таблицу с теми же selections.
    Выбери одну + почему.

Q3. insertCatalogTable early-return (focus only): оставить / заменить на
    всегда create / добавить «Дублировать». Что лучше для PO?

Q4. Нужен ли persist liveRows в GET, или достаточно надёжного refresh
    putDataSet on load + после Save каталога? Минусы bake.

Q5. Фото: отдельный баг (orphan/disk/no re-hydrate) или следствие пустой
    таблицы? Как доказать за 1 проверку на проде/local?

Q6. Авто-wire (S15 sole manual table): расширить на все unwired tables
    same kind — опасно или нужно?

Q7. Минимальный WAVE (2–4 TZ), который закроет рецидив навсегда —
    список id/названий без кода.

Q8. Что из прошлых фиксов (S47/S48/heal/WYSIWYG/frame) было правильным
    локально, но создало ложное чувство «контур закрыт»?

Формат ответа:
## Verdict (5 строк)
## Answers Q1–Q8
## Risks if we pick wrong model
## One sentence to PO in Russian

Не пиши код. Не предлагай wipe/deploy.
```

---

После сбора ответов: верни их Cursor в этот чат (или папку `docs/peer/replies/2026-09-12-docstudio-catalog-tables/`).  
Cursor сделает финальный вердикт + TZ wave.
