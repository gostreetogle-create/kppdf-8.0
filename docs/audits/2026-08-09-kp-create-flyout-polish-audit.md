# Аудит: Create КП — flyout «Параметры/Таблица» + клип витрины

**Дата:** 2026-08-09  
**Route:** `/proposals/create`  
**Скриншоты PO:** правая панель с «Таблица» + витрина товаров, урезанная справа  
**Статус:** FAIL visual / UX pride — не «мелочь», а demo-shame  
**Successor:** **TZ-SALES-332**

---

## 1. VERDICT (30 сек)

| # | Симптом | Root cause | Severity |
|---|---------|------------|----------|
| A | «Показать/Скрыто» на листе ничего не меняет | Панель крутит **DEFAULT_KP** keys (№/Кол-во/Цена…), лист рисует **columns реального TableTemplate** (Рисунок/Артикул/Описание…). Keys не совпадают → `resolvePreviewColumns` не находит колонки → fallback на полный thead | **P0 bug** |
| B | ↑↓ вместо ←→ | Копипаста list-UI; для колонок таблицы нужна горизонтальная семантика | P1 UX |
| C | «Пресет в Документах» | Жаргон + голая underline-ссылка, не `PiButton` | P1 copy/chrome |
| D | Панель «слиплась» к краям / student look | Малый padding, hairline boxes без воздуха, raw `<button>` вместо kit | P0 pride |
| E | Витрина товаров обрезана справа | Products flyout 58rem + одновременно открытый right overlay; нет взаимоисключения / max-width под правую панель | P0 layout |
| F | Таблица свалена в Параметры | PO: отдельная иконка **Таблица** на правом rail (как слева Шаблон/Товары) | P1 IA — **разморозка** spec §0 «Right = только Параметры» |

---

## 2. Evidence (код)

```39:46:frontend/.../proposal-create.page.ts
DEFAULT_KP_TABLE_LAYOUT = №, productName, quantity, unit, unitPrice, sum
```

При выборе шаблона layout **всегда** сбрасывается на DEFAULT, а не на columns target-table:

```466:468:frontend/.../proposal-create.page.ts
this.kpTableLayout.set(DEFAULT_KP_TABLE_LAYOUT.map(...))
```

BE при layout, где ни один key не нашелся в template:

```211:215:backend/.../table-template.service.ts
selected = layout ∩ template.columns
return selected.length > 0 ? selected : columns  // ← молчаливый fallback = «кнопка не работает»
```

Скрин PO: лист = Рисунок · Наименование · Артикул · Описание; панель = № · Наименование · Кол-во · Ед. · Цена · Сумма.

---

## 3. Целевой UX (после 332)

### Правый rail

```
[⚙ Параметры]   → фирма / наценка / НДС / оценка / клиент
[▦ Таблица]     → только раскладка колонок экземпляра
```

Взаимно исключают друг друга (как left tools).

### Панель «Таблица»

- Список колонок = **фактические** columns line-items table шаблона (после выбора шаблона / GET table-template).
- Кнопки **← →** (aria: «левее»/«правее»), не ↑↓.
- Toggle видимости: подпись **«Видна» / «Скрыта»** (состояние) или switch kit; клик → rebuild; на листе колонка реально пропадает/появляется.
- Если layout keys не матчятся — **не** fallback silently; показать RU hint «колонки бланка не совпали с пресетом».
- CTA: `PiButton` ghost/secondary **«Открыть шаблон таблицы»** (не «Пресет»).
- Padding flyout ≥ 12–16px; секции с воздухом; без double-hairline «карточка в карточке» без смысла; кнопки через shared button styles / `PiButton` size sm.

### Витрина товаров

- Пока открыт right flyout — **либо** закрывать right при open Товары, **либо** `max-width` products = `100% - rails - rightFlyoutW`.
- Карточки не клипаются; 3 колонки md читаемы.

### Компактная высота + лёгкая прозрачность (PO)

- Flyout **не** на всю высоту экрана: высота по блокам внутри; max-height + внутренний scroll для длинных (витрина).
- Фон панели слегка прозрачный (~0.92–0.96), лист читается сквозь; контролы контрастные.

### Left flyouts (Шаблон / Товары)

- Тот же padding/воздух, что и правые; не «прилипло к бордеру».

---

## 4. НЕ делать в 332

- Save / Counterparty (отдельная TZ)
- Менять FROZEN A4 center scale / overlay≠dock
- PATCH shared TableTemplate из Create
- Полный redesign Paper & Ink kit
- Deploy

---

## 5. Acceptance глазами PO

1. Выбрал шаблон → в «Таблица» те же названия столбцов, что на листе.  
2. «Скрыта» на «Артикул» → колонка пропала с A4.  
3. ← → двигает колонку влево/вправо на листе.  
4. Отдельная иконка Таблица на правом rail.  
5. Витрина не обрезана при открытых панелях.  
6. Нет голой ссылки «Пресет»; панель не стыдно показать коллеге.
