# PROMPT: дизайн «Быстрый заказ» (Supply) — compact inline-first

> **Статус:** ✅ **SIGN-OFF 2026-08-24** → `docs/audits/2026-08-24-supply-431-design-signoff.md`  
> **Исполнение:** `tasks/TZ-SUPPLY-431-supply-quick-order-ux-redesign.md` (design gate снят)

> **Для:** внешний AI-дизайнер (Figma / HTML mock / wireframe)  
> **Не кодить.** Выдать: wireframe развёрнутой строки + свёрнутой + 3 паттерна inline-create.  
> **Стек UI:** Paper & Ink (`docs/ui-density-canon.md`), Angular ERP, русский язык.

---

## 1. Север (одной фразой)

**«Быстрый заказ»** — блокнот снабженца: за утро набить 10–20 позиций «что · у кого · сколько · срочно» **на одной странице**, без прыжков в Справочники. Реестр (`view=registry`) — отдельный режим; этот промпт только про **быстрый заказ**.

---

## 2. Что уже есть в продукте (не выдумывать заново)

| Элемент | Реализация |
|---------|------------|
| URL | `/supply` или `/supply?view=quick` |
| Список | Вертикальные плитки, **одна** развёрнута |
| Поля | Expand → 3 смысловых зоны: **Позиция** · **Поставщик** · **Детали/статус** |
| Категория | `Category` type=material из `/categories` (RU name) |
| Материал | Catalog picker + `+` copy pencil |
| Поставщик | `Organization` type=supplier; сайт/email → PATCH в карточку org |
| Контакт | Person linked to org; телефон/email менеджера |
| Inline `+` | Зелёный квадрат 2.4rem (`PiSelectAddRow`) — паттерн как в КП/заказе |
| Persist | Blur/debounce save в карточку поставщика/контакта |

**Боль PO (2026-08-24):** слишком много строк, непонятный порядок, поля не автозаполняются при выборе org, нет «взять существующую организацию и сделать поставщиком», layout «разбросан».

---

## 3. Принципы (обязательны)

1. **Single-page:** все create/edit/copy — inline panel или drawer **на `/supply`**, без navigate на `/organizations`.
2. **Autofill cascade:** выбрал поставщика → сайт, email, контакты из карточки; выбрал контакт → телефон, email.
3. **Порядок заполнения сверху вниз:** Категория → Материал → (артикул/цвет/qty) → Поставщик → Контакт → Статус/примечание.
4. **Compact:** поля по ширине содержимого; 2–3 колонки на desktop flyout/wide; touch min 44px только где палец.
5. **Paper & Ink:** hairline borders, `--color-paper`, без SaaS-карточек с тенями; зелёный `+` — `--color-sunrise-soft`.
6. **Copy actions:** «скопировать строку», «скопировать материал с прошлой позиции» — иконка, не текстовая простыня.

---

## 4. Развёрнутая строка — целевая IA (перерисовать)

### Блок A — «Позиция» (что заказываем)

| Поле | UI | Inline + |
|------|-----|----------|
| Категория | overflow-select | новая категория → POST `/categories` type=material |
| Материал | overflow-select | новый материал / копия / карандаш edit |
| Ссылка на товар | URL input | — |
| Артикул · Цвет | одна строка 2 col | + цвет если нужен справочник |
| Кол-во · Ед. | qty number + unit select | — |

### Блок B — «Поставщик» (откуда)

| Поле | UI | Inline + |
|------|-----|----------|
| Организация | overflow-select + зелёный + | **три действия в + menu:** (1) новый поставщик, (2) **из существующих org → пометить supplier**, (3) открыть карточку read-only |
| Сайт · Почта org | 2 col, autofill | editable → save в org |
| Контакт | overflow-select + + | новый менеджер inline |
| Тел · Email менеджера | 2 col, autofill | save в Person |

**Visual:** org + контакт — **одна визуальная группа** «Поставщик», не 6 отдельных островов.

### Блок C — «Детали» (когда/статус)

| Поле | UI |
|------|-----|
| Статус · Приоритет | 2 col |
| Нужно к · Наша компания | 2 col |
| Примечание | 1–2 строки |

**Collapsible «Ещё»:** цена, дата заказа у поставщика, ответственный.

---

## 5. Свёрнутая строка (summary)

Одна строка, truncate:

`▸ 22.08 · Комплектующие · 01 · 5 шт · Заказано · ○ · ООО «КомплектСнаб»`

---

## 6. Desktop layout (reference width 900px content)

```
┌─ Toolbar: search · status · priority · + Создать ─────────────┐
├─ Summary row (collapsed) ────────────────────────────────────┤
├─ EXPANDED ───────────────────────────────────────────────────┤
│  ┌─ Позиция ──────────┬─ Поставщик ─────────┬─ Детали ──────┐ │
│  │ cat + mat + url    │ org + site email   │ status prio   │ │
│  │ art color | qty u  │ contact + phone    │ note          │ │
│  └────────────────────┴────────────────────┴───────────────┘ │
│  [ Скопировать строку ]  [ Удалить ]                         │
└──────────────────────────────────────────────────────────────┘
```

На **&lt;640px** — стек A → B → C, но **внутри** B org+contact не разрывать.

---

## 7. Существующая org → поставщик (новая фича, заложить в макет)

Flow в UI:

1. `+` у поставщика → «Новый поставщик» | **«Из наших организаций»**
2. Второй пункт → search picker всех Organization (не только type=supplier)
3. Выбор → confirm «Сделать поставщиком?» → PATCH `type` includes supplier → появляется в списке

---

## 8. Deliverables дизайнера

1. Figma/wire: collapsed + expanded (desktop + mobile)
2. Spec зелёного `+` row (select + button alignment)
3. Autofill states: empty / filled / saving / error
4. Inline panel: новый поставщик (3 поля max)
5. Annotated reading order (1→9 для оператора)

---

## 9. Референсы в репо

- Канon IA: `docs/audits/2026-08-19-supply-quick-order-design-canon.md`
- Page doc: `docs/pages/supply.page.md`
- Код (read-only): `frontend/src/app/pages/supply/supply-quick-order.component.ts`
- Паттерн +: `frontend/src/app/shared/ui/select-add-row/`
- PO принцип: `docs/PO-CANON.md` — «одна страница — один контекст»

---

## 10. Out of scope дизайна

- Реестр SupplyTask (таблица)
- Backend API redesign
- Фото upload (stub)

После макета → исполнение: `tasks/TZ-SUPPLY-431-supply-quick-order-ux-redesign.md`
