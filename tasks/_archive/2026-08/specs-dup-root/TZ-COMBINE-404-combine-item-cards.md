# TZ-COMBINE-404: FE колонки + карточки изделий + фильтр заказа

РОЛЬ АГЕНТА: Frontend Комбайн

ЗАВИСИМОСТИ: TZ-COMBINE-403 DONE (API lane)

LAYER: 3

CONFLICT KEYS: `frontend/src/app/pages/dashboard/dashboard.page.ts` ; `frontend/src/app/pages/dashboard/dashboard.page.spec.ts` ; `frontend/src/app/pages/orders/orders.service.ts` ; `docs/pages/design-combine.page.md`

CHECKLIST: `docs/agent-checklists/TZ-COMBINE-404.md`

---

## ЧТО ДЕЛАТЬ

1. Колонки RU: Комплектация / Проектирование / В цехе / К отгрузке / Отгружены + 1 строка helper под заголовком  
2. Карточки = OrderItem (flat list из всех заказов); бейдж `№{order.number}`  
3. Фильтр select по orderId (список из загруженных orders)  
4. Клик по бейджу/заголовку → открыть заказ (существующий dialog/route)  
5. Колонка grouping по `boardLane` (fallback derive from status если lane нет у legacy)  
6. Specs обновить  

## НЕ

- DnD (→ 405)  
- Module expand DnD  
- Deploy  

## AC

- [ ] tsc + dashboard.page specs PASS  
- [ ] push  
