═══════════════════════════════════════════════════════════════
TZ-SALES-303: Несколько КП на те же позиции для разных Organization
═══════════════════════════════════════════════════════════════

> READY (RESERVED) · канон D21: `docs/audits/2026-08-08-sales-to-shop-flow-canon.md`  
> Не CLAIM пока ORDERS-302/303 и NAV-301 не стабилизируют очередь (или явный PO)

STATUS: READY (RESERVED)

РОЛЬ АГЕНТА: Backend + Frontend (proposals)

ЗАВИСИМОСТИ: SALES-301 DONE; Organization + doc templates per org существуютшаблон привязан)

LAYER: 3

PAGES: `/proposals`
PAGE_DOCS: proposals page doc if any; flow canon D21

CONFLICT KEYS:
backend/src/modules/quotation/**;
backend/src/modules/proposal/**;
frontend/src/app/pages/commercial/proposals/**;
docs/agent-checklists/TZ-SALES-303.md;
docs/agent-checklists/_active-map.md;

---

## Domain preflight

| Слово PO | Код |
|----------|-----|
| Фирма / «поставщик» на бланке | **Organization** (наша), не Counterparty |
| Скопировать КП | clone lines (productId, qty) + new organizationId |
| Наценка фирмы | Organization default markup (поле найти или thin `defaultMarkupPercent?`) |
| Шаблон | template категории КП для Organization |

1 source КП → N clones; Counterparty/заказчик **тот же** (или по PO — тот же); цены пересчёт = list/base × markup org − скидки линии.

---

## ЧТО ДЕЛАТЬ

1. API: `POST /proposals/:id/clone-for-organizations` `{ organizationIds: string[] }` → создаёт N КП, копирует items qty/product, подставляет org + template + markup.  
2. UI: на КП действие «Скопировать для фирм…» / «Распечатать несколько» → multi-select Organization (только с шаблоном КП) → результат список ссылок.  
3. Одна фирма по умолчанию при обычной печати — без регрессии.  
4. Tests: clone preserves qty; different org → different totals if markup differs; reject empty orgs.  
5. Docs RU short.

## НЕ

- Менять Order convert; split order  
- Counterparty ≠ Organization  
- NAV / supply / orders tree  
- Deploy  

## AC

- [ ] Из одного КП → N КП тем же составом, разными Organization  
- [ ] Шаблон/наценка org применяются  
- [ ] FE multi-select + gates tsc/jest зоны  
- [ ] Archive  

known_limitation: версии КП (D17) могут быть отдельной SALES-302 — не смешивать в этот TZ если раздует >7 шагов.
