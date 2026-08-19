# Order hub tray — визуальная IA (desk + hub)

**Дата:** 2026-08-18  
**PO pain:** expand под заказом «раскидано», глаза разбегаются, нет категорий/карт.  
**Компонент:** `app-order-hub-tray` (`order-hub-tray.component.ts`) — shared `/orders` + `/desk`.  
**Не путать с:** page chrome (406), flyout (402) — только **тело tray**.

---

## 1. Диагноз (почему плохо сейчас)

| Симптом | Причина в разметке |
|---------|-------------------|
| Вертикальная «простыня» | `space-y-8` + 4–5 секций друг под другом |
| Дубли заголовков | eyebrow «Снабжение» + ссылка «Снабжение» в одной строке |
| Слабая иерархия | Все блоки одинаковый `border-b hairline` + eyebrow |
| CTA теряется | Чёрная кнопка между текстом и placeholder «подключатся в следующей волне» |
| Комбайн оторван | Отдельная секция ниже grid «Исполнение» |
| Hub regression risk | HUB-302/303/304 data-test — **не ломать** |

---

## 2. Цель PO

- **За 2 секунды** понять: кто клиент, статус, что делать дальше, где состав.
- Блоки как **карточки** в стиле ERP (Paper & Ink, hairline, gold accent уже есть).
- **Desk** (`mode=desk`) — плотнее и action-first; **hub** (`mode=hub`) — чуть легче, те же карточки.

---

## 3. Макет desk (≥1024px)

```
┌─ gold rail ─────────────────────────────────────────────────────────┐
│ SUMMARY BAR (one row, bg-paper, hairline-b)                          │
│  [Статус pill]  Клиент: ООО …     ·········     [ Primary CTA ]      │
├──────────────────────────────────┬──────────────────────────────────┤
│ CARD: Состав заказа (flex-1)     │ CARD: Исполнение                 │
│  toggle или default open desk    │  combine lane chips (horizontal) │
│  composition-tree surface        │  readiness 2/2 compact           │
│                                  ├──────────────────────────────────┤
│                                  │ CARD: Снабжение + Производство   │
│                                  │  counters one line · link chips  │
│                                  ├──────────────────────────────────┤
│                                  │ CARD: Логистика · Документы      │
│                                  │  icon link rows (not underline spam)│
└──────────────────────────────────┴──────────────────────────────────┘
```

**Mobile (<1024):** summary bar → состав card → stack остальных cards (order сохраняется).

---

## 4. Правила визуала (канон проекта)

| Элемент | Класс / паттерн |
|---------|-----------------|
| Карточка блока | `hairline rounded-sm bg-paper p-3` или `pi-table-surface` inner |
| Заголовок карточки | `text-sm font-medium text-ink` + optional `text-xs text-muted-foreground` subtitle **одна строка**, не eyebrow+link duplicate |
| Summary bar | `flex flex-wrap items-center gap-3`; status = existing status pill pattern from orders |
| Primary CTA | `app-pi-button variant="default"` или текущий ink button — **правый край** summary bar |
| Secondary actions | `text-xs` link-chips внутри карточки, `data-test` сохранить |
| Состав | tree в `bg-paper` inset; **desk:** composition **open by default** on first expand |
| Комбайн | **horizontal** lane chips per line (`prep|design|shop|…`), не vertical list under отдельным H2 |
| Placeholder copy | Убрать «Действия подключатся в следующей волне» — disabled CTA + RU title если нет wire |
| Gold rail | Оставить `w-1 bg-gold` слева на всём tray |

**Запрещено:** новые цвета; второй gold rail; Excel-таблицы; копипаста tray для desk.

---

## 5. Hub mode (`mode=hub`)

- Те же **card** surfaces — визуальная унификация с desk.
- **Не менять** `data-test="order-*"` selectors (HUB-302/303/304).
- Hub-only links («Открыть карточку заказа») остаются внутри card «Состав».

---

## 6. Acceptance (PO eyeball)

- [ ] Expand на `/desk`: summary bar + 2 колонки (wide) — не простыня из 5 H2.
- [ ] Нет дубля «Снабжение» eyebrow + link в одной строке.
- [ ] Состав визуально **главный** (левая колонка шире).
- [ ] Dark/light: карточки читаемы, gold rail на месте.
- [ ] `/orders` expand — те же cards, characterization tests PASS.

---

## 7. Реализация

**TZ:** `TZ-DESK-413` — **после** `TZ-DESK-403` archive (403 добавляет tree/supply в тот же файл).  
**Conflict key:** только `order-hub-tray.component.ts` + spec.  
**Не блокирует:** 410/411 (manager-desk.page.ts) — но **порядок волны:** 403 → **413** → 410… чтобы PO видел финальный tray до фильтров.

---

_Связано: `2026-08-18-manager-desk-design.md` § tray-first; `ui-composition-tree.md`._
