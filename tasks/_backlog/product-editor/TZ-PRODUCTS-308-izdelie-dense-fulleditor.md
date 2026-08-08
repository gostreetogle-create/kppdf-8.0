═══════════════════════════════════════════════════════════════
TZ-PRODUCTS-308: Изделие — densify FullEditor layout + RU rename
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-PRODUCT-EDITOR #1
DEPENDS ON: нет
LAYER: 3
PAGES: /products ; /products/:id
PAGE_DOCS: products.page.md
CHECKLIST: docs/agent-checklists/TZ-PRODUCTS-308.md

РОЛЬ: Frontend (Angular dialog / form layout)

CONFLICT KEYS:
frontend/src/app/pages/products/product-form-dialog.component.ts;
frontend/src/app/pages/products/product-form-dialog.component.spec.ts;
docs/pages/products.page.md;
docs/agent-checklists/TZ-PRODUCTS-308.md;

Проверено: `product-form-dialog.component.ts` (title «Редактировать продукт»,
секция «Состав» = hint DEDUP-301); PO diary §2 kind C 1120 + ёмкость полей;
`docs/product-vision-lite.md` — в цехе говорят «изделие».

---

## ИСХОДНОЕ

1. FullEditor `ProductFormDialogComponent` — длинная вертикаль секций, широкие
   поля на вес/ДШВ/цвет; заголовок «продукт».
2. PO путается: продукт vs изделие; хочет плотную сетку 2–3 колонки.
3. Состав в этом TZ **ещё не** возвращаем (→ 309); hint про «профиль L» **убрать**
   или заменить одной короткой русской фразой без жаргона
   («Состав — на следующем шаге / после сохранения» только для create;
   в edit — секция-заглушка «Состав появится в TZ-309» **не** показывать PO —
   лучше убрать блок Состав целиком до 309).

---

## ЧТО ДЕЛАТЬ

1. **Rename UI → Изделие** (только строки пользователя):
   - title: «Редактировать изделие» / «Новое изделие»;
   - toasts success/error про изделие;
   - KIND_OPTIONS: `good` → лейбл «Изделие» (было «Товар»);
   - тесты/data-test ids **не** ломать без нужды; тексты assertion обновить.
2. **Плотная компоновка** (kind C ширина как сейчас ~1120 ок):
   - Desktop (≥ lg): **три колонки** в одном `pi-form-section` или 2–3 секции в ряд:
     - Кол.1 «Основные»: name, sku, kind, status, isActive;
     - Кол.2 «Цена и учёт»: listPrice, category, subcategory;
     - Кол.3 «Габариты и цвет»: Д/Ш/В + ед. + вес + RAL — поля **узкие**,
       в одном-двух рядах (канон PO: цифры узко).
   - Mobile: колонки стеком.
   - Ниже на всю ширину: Описание / Заметки; Изображения.
3. **Убрать** секцию «Состав» с текстом про профиль L (временно до 309).
4. Сохранить create/update payload-контракт (включая null clear category/ral,
   coerce listPrice) — регрессии из недавних фиксов не ломать.
5. Обновить `docs/pages/products.page.md` § Dialogs: UI-имя «Изделие».

---

## НЕ

- Не встраивать BomPanel (это 309).
- Не менять backend Product schema / routes.
- Не трогать module/material FullEditors (кроме если общий string — не надо).
- Не deploy.

---

## AC

1. Заголовок edit/create содержит «изделие», не «продукт».
2. На viewport ≥1100px основные блоки видны **в ряд** (не одна простыня).
3. Поля Д/Ш/В/вес/ед. визуально уже listPrice-name (ёмкость).
4. Нет фразы «профиль L» / «быстром создании» в диалоге.
5. `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit`
6. `pnpm --dir frontend exec jest src/app/pages/products/product-form-dialog.component.spec.ts`
7. Archive + checklist + commit+push + Checkpoint NEXT=309.

ARCHIVE: `tasks/_archive/2026-08/TZ-PRODUCTS-308.done.md`
