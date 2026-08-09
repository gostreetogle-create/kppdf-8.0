# Создать КП — layout spec (WAVE-KP-VITRINE)

**Route:** `/proposals/create`
**Chrome:** `PiGroupWorkspace` — Сделки TOC **КП** + жёлтые **Создать КП** | **Все КП** (из SALES-310)
**Канон потока:** D13 / D21 в [`sales-to-shop-flow-canon.md`](../audits/2026-08-08-sales-to-shop-flow-canon.md)
**Обновлено:** 2026-08-09 · **TZ-SALES-311**
**Утверждение:** этот файл — вход для shell **TZ-SALES-312** (логика зон — 314/315/316)

---

## 1. Цель (30 сек)

Один экран **студии** сборки КП — не тонкий диалог. Менеджер видит:

1. **слева** — товары из каталога (витрина),
2. **в центре** — превью листа A4 / шаблон документа,
3. **справа** — бланк Organization, наценка, прочие параметры сделки.

Содержание одно; **бланк = Organization**; **клиент = Counterparty**. Скидки/наценка живут в КП, каталог не портят. Сумма на экране = **подсказка** («оценка»), не жёсткий контракт печати.

---

## 2. Словарь UI ↔ код

| UI (RU)            | Код / API                                           |
| ------------------ | --------------------------------------------------- |
| Создать КП         | route `/proposals/create`                           |
| Все КП             | route `/proposals`                                  |
| КП / Quotation     | сущность `Quotation` (не переименовывать коллекцию) |
| Наша фирма / бланк | `Organization`                                      |
| Клиент             | `Counterparty`                                      |
| Изделие            | `Product` (лейбл «Изделие»)                         |

---

## 3. Desktop ≥1280px — три колонки

```
┌─ sticky PiGroupWorkspace (TOC + yellow chips) ──────────────┐
│  КП | Договоры | Заказы     [Создать КП] [Все КП]           │
├────────────┬──────────────────────────────┬─────────────────┤
│ LEFT       │ CENTER                       │ RIGHT           │
│ 280–320px  │ flex:1  min-width 480px      │ 300–340px       │
│ scroll     │ A4 sheet max-w ~794px        │ scroll          │
│ Product    │ Preview / template           │ Inspector       │
│ rail       │                              │ org / % / lists │
└────────────┴──────────────────────────────┴─────────────────┘
```

| Зона                    | Ширина (явная)                    | Содержание (скелет)                                                                    |
| ----------------------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| **Left — Product rail** | **280–320px**, `overflow-y: auto` | Поиск + список изделий/модулей; Add → строки draft КП                                  |
| **Center — Preview A4** | **flex: 1**, `min-width: 480px`   | «Лист» A4-ish (`max-width: ~794px`, центрирован), шаблон + таблица позиций             |
| **Right — Inspector**   | **300–340px**, `overflow-y: auto` | Organization (бланк), % наценки, **оценка суммы** (подпись «оценка»), dropdowns сделки |

- Gap между колонками: **12–16px**.
- Высота тела: под sticky group-chrome → `min-height: calc(100vh - <chromeHeight>)`.
- Sticky chrome **Сделок не перекрывается** панелями, drawers и sticky footer кнопок.
- Desktop: все три колонки **всегда видны** (без collapse по умолчанию).

---

## 4. Tablet 768–1279px

- **Center** на всю ширину workspace body.
- Left / Right — toggles **«Товары»** / **«Параметры»** → panel или side sheet.
- Одновременно открыта **≤1** боковая панель.
- Toggle: `aria-expanded`; **Escape** закрывает panel.

---

## 5. Mobile <768px

- Center first (превью / шаблон).
- Bottom sheets для товаров и параметров (те же зоны Left / Right).
- Не перекрывать TOC/chips; sheets ниже chrome.

---

## 6. Зоны ↔ слои волны (кто наполняет)

| Зона              | Skeleton (312)             | Наполнение                           |
| ----------------- | -------------------------- | ------------------------------------ |
| Left Product rail | пустой каркас + empty copy | **314**                              |
| Center Preview A4 | пустой «лист» + empty copy | **316** (шаблон); позиции после rail |
| Right Inspector   | пустой каркас + empty copy | **315**                              |

**312** только shell: три колонки / responsive open-close / empty states. Без API write, без печати, без реального picker.

---

## 7. Пустые состояния (RU, одна фраза)

| Зона   | Текст                                           |
| ------ | ----------------------------------------------- |
| Left   | «Выберите изделие — оно попадёт в КП»           |
| Center | «Выберите шаблон КП или добавьте позиции слева» |
| Right  | «Укажите нашу фирму (бланк) и наценку»          |

Пустой текст отвечает на _куда кликнуть_, не «палитра выше».

---

## 8. Цены и сумма

- Пересчёт на экране = **подсказка** / «оценка».
- Сохранённый total с наценкой — **не** обязанность 312–315.
- Печать пачкой — **TZ-SALES-320 PARKED** до PO.

---

## 9. A11y / Paper & Ink

- Focus ring `pi-focus-ring`; без `box-shadow` «карточек ради карточек».
- Токены type scale: label 13 info, body 14, chrome micro 11.
- Контраст светлой и тёмной темы.
- Клавиатура: Tab по колонкам/controls; Escape закрывает drawer/sheet.

---

## 10. Вне scope этого spec

- Печать / batch print (320).
- Встроенный document builder как редактор блоков.
- Вторая витрина каталога вне Left rail.
- Schema rewrite семьи / convert variant.
- ModuleMaterials / второй write-path состава.
- Angular-логика зон 314–316 (только размеры и поведение chrome здесь).

---

## 11. Checklist для исполнителя 312

- [ ] Body под sticky chrome; колонки не заезжают на TOC/chips.
- [ ] Desktop ширины в диапазонах §3.
- [ ] Tablet/mobile open-close по §4–§5.
- [ ] Три empty-фразы из §7 на месте.
- [ ] Без quotation write / print / family schema.
