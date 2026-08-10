# Аудит справочников + выпадающих списков (демо PO 2026-08-10)

**Источник:** устная диктовка PO после просмотра демо.  
**Цель:** полочки → executable TZ; не чинить «всё сразу» одним монолитом.

---

## 1. Вердикт (коротко)

| # | Боль PO | Факт в коде | Решение |
|---|---------|-------------|---------|
| A | «В справочниках не все справочники» | Hub `/dictionaries` снят (DICT-311) → redirect на Измерения; редактируемые enum’ы (Вид изделия/материала) **не** в справочниках | WAVE: виды → справочник; nav/TOC; Phase-2 остальное |
| B | Единицы: не добавить / не редактировать | Add есть, но **POST/PATCH/DELETE = admin only**; ✎ мёртвый (`editLabel` «Не применимо», нет `(edit)`); PATCH API есть | **DICT-317** |
| C | RAL: вбивать только цифры | Name — свободный текст; префикса `RAL ` нет | **DICT-318** |
| D | Артикул обязателен, название нет; без дублей | Product: name required, sku optional; Material/Module article optional; unique только у Product.sku (sparse) | **CATALOG-338** |
| E | Поставщик в материале «не подключён» | API wired (`Organizations type=supplier`); нет empty/error UI | **MATERIALS-312** |
| F | Габариты на всю ширину | Секция вне 2-col grid → full body; PO хочет ~½ | **MATERIALS-312** |
| G | Состав: qty при добавлении из каталога | Picker без qty; write path `quantity: 1` | **UX-DIALOG-306** |
| H | Save & continue + hotkey без мерцания | Add&continue только у пикеров; FullEditor create закрывает; hotkey нет | **UX-DIALOG-307** |
| I | Снабжение «создать из заказа» | Wire есть (SUPPLY-302); 0 задач / тупые title — smell | **SUPPLY-303 park** (PO: «бог с ним» пока) |
| J | Каталог: нельзя редактировать изделие; `Cannot read properties of undefined (reading 'ɵcmp')` | Цикл ESM: `product-form-dialog` ↔ `product-bom-panel` (PRODUCTS-309). Create=QuickCreate ок; edit=FullEditor падает | **PRODUCTS-310 P0** |

---

## 2. Что уже в справочниках (ок)

- Категории, Единицы (list), Цвета RAL, Категории шаблонов/текстов, Профили быстрых форм  
- Материал: единица из `/units/active`  
- Изделие: категория, RAL  
- Контрагент: роли API  
- Модуль/Люди: виды работ API  

**Виды работ** — намеренно в **Цех**, не в Справочники (канон меню).

---

## 3. Хардкод → кандидаты в справочники

### Phase 1 (сейчас — DICT-319/320)

| Enum | Где | Зачем PO |
|------|-----|----------|
| `ProductKind` (`good`/`service`/`work`) | product-form, QuickCreate, rails | Переименовать «Услуга» и т.п. |
| `MaterialKind` | material-form, filters | То же |

Канон: **ключ стабильный**, **label editable** в справочнике. Не EAV «поля из воздуха».

### Phase 2 (park — не в этой волне)

- Типы габаритов (Длина/Ширина/…)  
- mm/cm/m у изделий (частично → units)  
- Product unit free-text → units API (как материал)  
- Org types / legal type  
- Category entity type  
- Table-template category slugs  

**Не трогать как «справочник админа»:** status FSM заказа/КП/контракта (workflow).

---

## 4. Артикул / название (уточнение dictation)

Loose wording PO → код:

| UI | Код | После CATALOG-338 |
|----|-----|-------------------|
| Изделие «Артикул» | `Product.sku` | **required** + unique (org/global как сейчас) |
| Изделие «Название» | `Product.name` | **optional** (пусто → показывать sku в списках) |
| Модуль «Артикул» | `Module.article` | **required** + unique в рамках области |
| Материал «Артикул» | `Material.article` | **required** + unique; `sku` внутренний код — как сейчас (prefix) |
| «Документы» | строки/каталог в доках | Не отдельная сущность: те же артикулы каталога; колонка `sku` в table-template уже unique-по-ключу колонок |

---

## 5. Hotkey (канон для UX-DIALOG-307)

| Клавиша | Действие |
|---------|----------|
| **Ctrl+Enter** (Win) / **⌘+Enter** (Mac) | Сохранить и остаться: create → reset формы; edit → toast, диалог открыт |
| Обычный «Сохранить» | Как сейчас (create закрывает) |
| Подсказка | В футере диалога: `Ctrl+Enter — сохранить и создать ещё` |

Не путать с Add&continue пикеров (UX-DIALOG-303 уже сделан).

---

## 6. Очередь TZ (строго)

0. **PRODUCTS-310** — P0 circular ɵcmp (edit изделие)
1. **DICT-317** — единицы: edit + права + мёртвый ✎
2. **DICT-318** — RAL prefix / цифры
3. **MATERIALS-312** — поставщик empty + габариты ½
4. **CATALOG-338** — артикул required+unique; name optional у изделия
5. **DICT-319** — BE справочник labels (kinds)
6. **DICT-320** — FE wire + nav/TOC
7. **UX-DIALOG-306** — qty в composition picker
8. **UX-DIALOG-307** — Ctrl+Enter save & continue
9. **SUPPLY-303** — park

Промпт волны: `tasks/_backlog/dictionaries/PROMPT-DICT-DEMO-WAVE.md`

---

## 7. Проверено

`app.routes.ts`; `measurements-group.page.ts`; `unit.controller.ts`; `color-reference-form-dialog.component.ts`; `material-form-dialog.component.ts`; `product-form-dialog.component.ts`; `product-composition-picker-dialog.component.ts`; `product-bom-panel.component.ts`; `supply.page.ts` + `supply-task.service.ts`; `docs/pages/ui-add-and-continue.md`; archives DICT-311/316, SUPPLY-302, UX-DIALOG-303.
