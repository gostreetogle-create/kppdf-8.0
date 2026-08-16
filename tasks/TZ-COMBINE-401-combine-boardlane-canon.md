# TZ-COMBINE-401: Канон Комбайна — boardLane изделий

> Opus-ревизия WAVE Combine 2026-08-16. Docs only.

РОЛЬ АГЕНТА: Docs / integrity

ЗАВИСИМОСТИ: TZ-NAV-303 DONE; TZ-SWEEP-401 canon

LAYER: 1

CONFLICT KEYS: `docs/COUPLING-MAP.md` ; `docs/pages/design-combine.page.md` ; `docs/pages/PAGE-TZ-INDEX.md` ; `docs/agent-checklists/_NOW.md`

PAGES: `/design/combine`  
CHECKLIST: `docs/agent-checklists/TZ-COMBINE-401.md`

STATUS: READY

---

## Domain preflight

| Говорят | Канон |
|---------|--------|
| Доска / колонка | `OrderItem.boardLane` (не create/delete boards) |
| Карточка | Изделие = `OrderItem` (+ `lineId`) |
| Статус заказа | `Order.status` — **rollup** из lanes; ship/cancel write-path без изменений |
| Статус изделия | `OrderItem.status` — **дериват** lane |
| readyForWork | Не трогать; не колонка Комбайна |

## ЧТО ДЕЛАТЬ

1. Обновить `COUPLING-MAP.md` §2–3:
   - Колонки Комбайна = `boardLane`: prep→Комплектация, design→Проектирование, shop→В цехе, to_ship→К отгрузке, shipped→Отгружены
   - Деривация: prep|design→pending; shop→in_production; to_ship→ready; shipped→shipped
   - Rollup таблица (все prep→draft; первая из prep→confirmed; any shop→in_production; all to_ship→ready; all shipped только через POST ship)
   - Отгрузка целым заказом; частичная — PARK
   - Материалы не карточки; модули — TZ-COMBINE-406+
2. Переписать `design-combine.page.md`: карточки изделий, фильтр orderId, freeze-модалка при первом shop, колонка Отгружены read-only drop→ship dialog
3. PAGE-TZ-INDEX строка COMBINE-401…405
4. `_NOW.md` ACTIVE волна

## НЕ

- Product code  
- Менять SWEEP-401 ship/cancel  
- Module DnD в этом TZ  

## AC

- [ ] COUPLING + page.md согласованы с решениями Opus  
- [ ] Нет противоречия «колонки = Order.status» (старое)  
- [ ] Commit docs + push  
