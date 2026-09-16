# WAVE — DocStudio TABLE SURFACE: necessity cleanup (не «smoke что костыль зелёный»)

> **Канон проверки для PO:** не «контрол отвечает на клик», а **нужен ли он в финальном продукте**.  
> Легаси-попытки / дубли / хардкоды → DELETE или MERGE, даже если «работают».  
> Аудиты-основания: `2026-09-13-studio-table-kind-vs-source.md`, `2026-09-13-studio-table-source-select.md`.

## Один happy path (оставить)

```
Данные / Выбрано → отметить изделия|модули|… 
  → «Вставить таблицу …»
  → на листе ОДНА живая таблица этого kind
  → колонки = канон. вид из Реестры→Виды таблиц (не STUDIO_DEFAULT 3 кол.)
  → правки карточки → строки обновляются
  → Просмотр/PDF = то же
```

Всё остальное в Свойствах таблицы — либо обслуживает этот путь, либо **лишнее**.

---

## NECESSITY MATRIX (жёстко)

| Элемент | Вердикт | Почему |
|---------|---------|--------|
| Insert «Вставить таблицу {kind}» + 1 table / kind | **KEEP** | Главный операторский вход (D52) |
| Буфер Выбрано / catalogSelections | **KEEP** | SoT состава строк |
| putDataSet + live hydrate | **KEEP** | Единственный write-path строк |
| Реестр «Виды таблиц» CRUD | **KEEP** | SoT макета колонок (не FE-константы) |
| Свойства: структура колонок (порядок/hide/add) на **блоке** | **KEEP** | Override экземпляра без правки реестра |
| Свойства: «Вид таблицы» select для Insert-таблицы | **MERGE** | Не второй мозг: после Insert вид **уже применён**; select = «сменить макет» / редкий case, не главный UI |
| `STUDIO_DEFAULT_TABLE_COLUMNS` (3 кол.) как результат Insert | **DELETE as product outcome** | Хардкод-легаси; Insert обязан брать registry template (`dataSource`) |
| Свойства: «Источник строк» полный enum всегда виден | **MERGE→status** | Для Insert-catalog: badge «Строки: Изделия», не дубль Insert. Полный select — только +Таблица / КП / заказ / смена с confirm |
| Round-trip источника (manual↔catalog) без строк | **FIX-THEN-KEEP** | Баг (liveRows `[]`, dataSource не persist) — чинить, не «оставить как есть» |
| Поле width % без эффекта на render | **FIX-THEN-KEEP или hide** | Либо % реально на th/td, либо убрать из UI до фикса (мёртвый control = вред) |
| «Сохранить как вид таблицы» | **KEEP** | Write-through в реестр |
| Ссылка Реестры→Виды таблиц | **KEEP** | Discoverability |
| Несколько одинаковых «Продукты» active | **DELETE data** | Уже чистили; при checkout — assert ≤1 active per canon name/`dataSource` |
| Второй write-path строк (ручной live edit catalog cells кроме qty) | **DELETE if appears** | Строки каталога = read + qty override only |
| TZ-пачка «подписать hint» без схлопывания дублей | **STOP as strategy** | Не плодить S-фиксы copy; сначала WAVE necessity, потом один IA-diff |

---

## Что перестать делать

- Отдельные TZ вида «добавить hint что вид ≠ источник» **без** смены IA (status vs select).  
- Smoke «select меняет ngModel» как критерий готовности модуля Документы.  
- Оставлять хардкод «временно», если Insert уже в проде.

---

## Целевая поверхность Свойств (после cleanup)

1. **Строки:** статус «Из Выбрано: Изделия (N)» · [Обновить] · [Сменить…] (drawer/confirm → manual|КП|заказ|другой catalog).  
2. **Макет колонок:** имя текущего вида · [Сменить макет] · [Открыть реестр] · [Сохранить как вид] · редактор колонок.  
3. **Прочее:** прозрачный фон, фото в ячейке — только если колонка photo есть.

Insert не открывает «выберите источник» — источник уже выбран кнопкой Insert.

---

## Перепись pack `2026-09-13-studio-ops`

| Было (реактивные S) | Станет |
|---------------------|--------|
| #4 KIND-IA (hints) | Поглотить в **WAVE-DOCSTUDIO-TABLE-NECESSITY** этап A (status/labels) |
| #5 SOURCE-FIX | Этап A+B: badge + round-trip fix (обязательный FIX) |
| #6 INSERT-APPLY-KIND | Этап B: Insert→registry template; убить default-3 как outcome |
| #3 COL-WIDTH | Этап C: apply % **или** убрать поле из UI до apply |
| #2 PHOTO-BROKEN | Отдельно P0 display (нужно) — не IA-дубль |
| #1 CATEGORY+ | Вне table surface — оставить |

Новый TZ-мастер: `TZ-NX-DOCSTUDIO-TABLE-NECESSITY-CLEANUP.md` (L, этапы A→B→C).

---

## Критерий «модуль Документы / таблицы — готово»

Не: «все клики что-то делают».  
Да: оператор без обучения проходит happy path; в Свойствах нет контрола, который дублирует Insert или врёт; нет хардкод-макета Insert; нет мёртвых цифр; нет «сменил источник — строки умерли».
