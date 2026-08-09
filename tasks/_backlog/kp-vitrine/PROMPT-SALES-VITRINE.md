# Промпт: витрина Create КП (326 → 327∥ → 328)

## По-человечески

Агент сделает широкую красивую витрину товаров в Create КП: равные карточки с фото, фильтры и страницы, кнопки Добавить / Редактировать / Создать; клик вне панели закрывает меню. Эталон карточек — уже существующий `PiShowcaseCard` (md), не новая система.

## Когда давать

**После** DONE TZ-SALES-323 (лучше после всей wave-2 323–325).  
**Сейчас** можно отдать только **327** (kit, без create-page).

## Копипаст исполнителю

```text
Ты — исполнитель kppdf-8.0 на D:\kppdf-8.0 / main.

Очередь витрины Create КП:
1) TZ-SALES-327 — PiShowcaseCard md equal-height + фото (можно первым, keys ≠ create page)
2) TZ-SALES-326 — шире products-flyout (~36–40rem) + dismiss вне панели/iframe (после DONE 323; не∥ 323–325 на proposal-create.page.ts)
3) TZ-SALES-328 — rail → shop-витрина md grid + search/category/pager + Добавить/Редактировать/Создать (после 326+327)

SoT:
- docs/audits/2026-08-09-kp-create-product-vitrine.md
- tasks/_backlog/kp-vitrine/TZ-SALES-326-products-flyout-wide-dismiss.md
- tasks/_backlog/kp-vitrine/TZ-SALES-327-showcase-card-md-equal-height.md
- tasks/_backlog/kp-vitrine/TZ-SALES-328-create-kp-shop-vitrine.md
- Spec LOCK: docs/ux/kp-create-studio-spec.md §0 — A4 не сжимать
- GEMINI.md + docs/AI-AGENT-GUIDE.md + docs/PO-DIARY.md §1–§4

CLAIM до кода; конфликт keys = STOP.
Reuse: PiShowcaseCard (не invent card), QuickCreate product, ProductFormDialog, ProductsService.list page/category.
BAN: 322/320, deploy, docked 3-col, глубокий cascade-дерево, второй write-path Product.
326/328 archive после visual PASS.
```
