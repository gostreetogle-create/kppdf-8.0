# TZ-SUPPLY-306 — Быстрый заказ: компактная вёрстка expand

**Status:** READY — UX polish после PO review 304; mock only, без API.

```
PAGES: /supply?view=quick
PAGE_DOCS: supply.page.md
DEPENDS ON: TZ-SUPPLY-304 DONE
DESIGN CANON: docs/audits/2026-08-19-supply-quick-order-design-canon.md + §12 compact (this TZ)
ROLE: frontend executor
LAYER: frontend CSS/template only
CONFLICT KEYS: frontend/src/app/pages/supply/supply-quick-order.component.ts ;
  frontend/src/app/pages/supply/supply-quick-order.component.spec.ts
```

## PO feedback (2026-08-19)

- Логика верна (плитки, dropdown, фильтры) — **дизайн expand слишком рыхлый**
- Поля qty / ед.изм. / короткие select — **огромные**, пугают
- 4 блока — **слишком много вертикали**, приходится скроллить одну заявку
- Нужно: **компактно**, в ~**4 ряда** на широком экране; что можно — **в одну строку**
- Блоки «Что / Откуда / Контекст / Статус» — **лёгкое цветовое различие** (Paper & Ink tint, не SaaS-cards)
- Выравнивание: label слева компактно, поля по смыслу ширины (short vs long)

## ЧТО ДЕЛАТЬ

### ШАГ 1 — Compact grid (expanded tile)

Заменить 4 отдельных `pi-dashed-panel p-4 gap-3 mb-3` на **одну** expand-область с **4 горизонтальными полосами-рядами**:

| Ряд | Блок | Tint (CSS var / subtle bg) | Поля в одну строку (lg+) |
|-----|------|----------------------------|---------------------------|
| 1 | Что заказать | `--color-paper-2` или warm `#faf8f5` | Категория `~9rem` · Наименование `1fr` · Артикул `7rem` · Цвет `6rem` · Фото compact `4.5rem` · Кол-во `4.5rem` · Ед `5rem` |
| 2 | Откуда купить | cool tint `#f5f7fa` | Поставщик `1fr` + «+ Новый» · Ссылка `1.2fr` |
| 3 | Контекст | neutral `#f8f8f6` | Наша компания · Кто просил · Связь с заказом · Нужно к `9rem` |
| 4 | Статус | hairline top | Статус `10rem` · Приоритет `8rem` · Примечание `1fr` (1 строка input, не textarea 3 rows) |

- **Padding row:** `py-2 px-3` (не p-4)
- **Gap:** `gap-2` (не gap-3)
- **Label:** `text-[10px] uppercase tracking-wide text-muted-foreground` — одна строка над полем
- **Block title:** inline chip слева в полосе (`Что заказать`) — `w-[7.5rem] shrink-0 text-[10px] font-medium`, не отдельный h3 на всю ширину
- **Delete:** перенести в summary row справа (не отдельная строка над формой)

### ШАГ 2 — Field width discipline

- `input[type=number]` qty: `max-width: 4.5rem`, `text-align: right`
- unit select: `max-width: 5rem`
- date: `max-width: 9rem`
- status/priority select: фикс ширина как в таблице
- Наименование / ссылка / примечание: `min-width: 0; flex: 1`
- Inline panels (+ Новый / + Новая): compact `p-2`, horizontal layout где можно

### ШАГ 3 — Block color (light + dark)

```css
.supply-quick-order__strip--what { background: var(--supply-strip-what, …); }
.supply-quick-order__strip--where { … }
.supply-quick-order__strip--ctx { … }
.supply-quick-order__strip--status { … }
```

Dark mode: tint через `color-mix` или `@media (prefers-color-scheme)` — читаемость сохранить.

### ШАГ 4 — «Ещё»

- Оставить collapsible; внутри — одна строка 4 поля (цена · сумма · дата · ответственный)

### ШАГ 5 — Acceptance visual

На 1440px ширина: **развёрнутая одна плитка без вертикального scroll** в viewport (при открытом «Ещё» — допустим 1 scroll).

### ШАГ 6 — Tests

- Spec не ломать; data-test hooks сохранить
- Gates: tsc + `pnpm test -- supply-quick-order`

## НЕ ИЗМЕНЯТЬ

- Mock data / signals / business logic
- Toolbar, summary collapsed row, filters
- Registry view
- backend

## КРИТЕРИИ ПРИЁМКИ

1. Expanded tile ≈ 4 compact rows + optional «Ещё»
2. qty/unit — узкие поля, не на пол-экрана
3. 4 блока визуально различимы (subtle tint + strip label)
4. Delete в summary row
5. Примечание — 1 строка (можно `rows=1` или input; multiline только по focus optional)
6. Light/dark читаемы
7. tsc + supply tests PASS

## known_limitation

Still mock; 305 unchanged.
