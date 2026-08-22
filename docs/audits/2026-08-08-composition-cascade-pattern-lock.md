# Pattern lock — composition cascade → Orders (и др. вложенности)

**Дата:** 2026-08-08  
**PO:** сохранить способ показа состава (каскад изделие-в-изделии) как **образец**;
в будущем тот же UX на карточке заказа («Заказ №…» вместо «Состав»).

## Образец

| Что | Где |
|-----|-----|
| Канон поведения | [`docs/pages/ui-composition-tree.md`](../pages/ui-composition-tree.md) |
| Компонент | `app-composition-tree` |
| Эталон потребителя | Product BOM / `ProductBomPanel` |
| Скрин (dark, cascade) | [`docs/pages/assets/composition-tree-cascade-dark-2026-08-08.png`](../pages/assets/composition-tree-cascade-dark-2026-08-08.png) |

## Обязательные черты паттерна

1. Kind **rail** + qty справа (не забор вложенных hairline-карточек; канон 2026-08-22)  
2. Клик по **всей строке** (select/expand), без text-selection  
3. Kind только бейдж + rail (не заливка nest)  
4. Depth cascade (nest surfaces) — dark: лестница заливок, не `box-shadow`  
5. Переиспользование = **тот же компонент**, не форк стилей

## Следующие TZ

| ID | Роль |
|----|------|
| **TZ-CATALOG-335** | Dark depth polish |
| **TZ-ORDERS-302** | Order detail tree — **READY** (live BOM, rails audit D1) |
| **TZ-COST-304/305** | product-line vs cost — **DONE** |

Не изобретать второе дерево «для заказов» без явного отказа от `app-composition-tree`.
