# Аудит: Create КП — витрина товаров (overlay)

**Дата:** 2026-08-09  
**Route:** `/proposals/create` · left tool «Товары»  
**Скрин PO:** текстовый список без фото/фильтров; узкий flyout; ожидание shop-витрины.

---

## 1. Сейчас (facts)

| Что | Evidence | Проблема |
|-----|----------|----------|
| Список | `proposal-product-rail.component.ts` — name+sku+«Добавить», без фото | Не витрина |
| Ширина | `proposal-create.page.ts` `--kp-flyout-w: min(20rem, …)` (~320px) | PO: почти ×2 |
| Данные | `ProductsService.list({ limit: 30, search })` — page/category API уже есть, UI нет | Нет пагинации/фильтров |
| Карточки | `shared/ui/card/pi-showcase-card.component.ts` **sm/md/lg уже есть** (PRODUCTS-305) | В Create KP **не подключены** |
| Каталог `/products` | grid = sm + фото через `photoListUrl` | Эталон есть, rail не reuse |
| Click-outside | `onDocumentPointerDown` + Escape | Spec требует; PO: «вне поля не закрывает» надёжно — клик по **iframe** A4 часто не всплывает на `document` |
| Edit/Create | нет в rail | Каталог: QuickCreate + ProductFormDialog — reuse |
| SALES-318 | в WAVE как «cascade», **файла TZ нет** | Поглощается 328 |

## 2. Цель PO (смысл)

Менеджер собирает КП быстрее: широкая красивая витрина с фото, равные карточки, фильтры/пагинация, «Добавить» + «Редактировать» + «Создать» изделие — не уходя с экрана. Клик вне flyout (и правых параметров) закрывает панель.

## 3. Решения (канон)

| Вопрос | Решение |
|--------|---------|
| Новые 3 карточки с нуля? | **Нет** — hardening `PiShowcaseCard` sm/md/lg; Create KP = **md** |
| Ширина | Только **products** flyout ≈ **36–40rem** (~×2); template flyout может остаться ~20rem |
| A4 / rails 317 | **FROZEN** — overlay шире, лист не сжимается |
| Click-outside | Backdrop поверх center **или** эквивалент, чтобы клик по превью/iframe закрывал L+R |
| Фильтры MVP | search + categoryId + pager (API уже есть) |
| Create / Edit | QuickCreate `entity:'product'` / ProductFormDialog — один write-path |
| Когда claim | **После DONE 323** (shared `proposal-create.page.ts`); 327 (kit) можно ∥ раньше |

## 4. Split

| ID | Суть |
|----|------|
| **TZ-SALES-326** | Шире products-flyout + надёжный dismiss L/R |
| **TZ-SALES-327** | md-карточка: равная высота, фото, line-clamp (kit) |
| **TZ-SALES-328** | Rail → shop-витрина (grid md + фильтры + pager + Add/Edit/Create) |

**OUT:** 322/320 · Builder · deploy · cascade L1/L2 дерево (можно chips категорий) · docked 3-колонки.

## 5. Paths

- `tasks/_backlog/kp-vitrine/TZ-SALES-326-products-flyout-wide-dismiss.md`
- `tasks/_backlog/kp-vitrine/TZ-SALES-327-showcase-card-md-equal-height.md`
- `tasks/_backlog/kp-vitrine/TZ-SALES-328-create-kp-shop-vitrine.md`
- `tasks/_backlog/kp-vitrine/PROMPT-SALES-VITRINE.md`
