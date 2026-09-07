═══════════════════════════════════════════════════════════════
TZ-NX-SUPPLY-S3-REQUEST-JOURNAL: журнал заявок как Google Sheets
═══════════════════════════════════════════════════════════════

SIZE: L
РОЛЬ АГЕНТА: Executor frontend-nx (agent_id: claude)
ЗАВИСИМОСТИ: желательно после TZ-SUPPLY-BE-INVOICE-DELIVERY (иначе FE без invoice/paid)
LAYER: 3
PAGES: `/supply` и/или registries supply-requests — **один** операторский журнал (не два конкурирующих UI)
PAGE_DOCS: docs/pages/supply.page.md

CONFLICT KEYS: frontend-nx/apps/kppdf-web/src/app/pages/supply/** ; frontend-nx/.../registries/**/supply* (если трогаешь); frontend-nx/.../app.routes.ts (только supply routes); docs/pages/supply.page.md

IMPLICIT CONFLICT: nx build kppdf-web

---

### Preflight
- **Context read:** audit §1–6; `supply.page.ts` = SupplyTask list; registries supply-requests form урезана; PO: журнал строк как Sheets
- **Key Constraints:** Order dropdown XOR orderLabel; supplier=Organization; createdBy read-only; paid toggle; не писать stock здесь
- **Deliverable:** журнал SupplyRequest (колонки Sheets-like) + create/edit drawer/dialog полных полей
- **Validation:** jest page + nx build

## Domain preflight
Клиент сделки ≠ Organization. «Заказчик» в Sheets → Order|orderLabel. Поставщик → Organization supplier.

## ЧТО ДЕЛАТЬ
1. Определить SoT UI: расширить `/supply` **или** registries list — один вход из nav «Снабжение/Закупки». Второй экран не плодить без redirect.
2. Таблица/список: title/material, qty, supplier, status, paid, invoiceNo, order#, createdBy, dates.
3. Форма: material typeahead, supplier picker, qty, unit, neededBy, status, notes, invoiceNo, deliveryNote, paid, order select + «нет в списке»→orderLabel.
4. Фильтры: status, paid, search.
5. page.md = код.

## НЕ
StockMovement; Material create (S5); Desktop Excel; Chrome C*; dropDatabase.

## AC
- [ ] Журнал показывает заявки; create/edit сохраняет новые BE-поля
- [ ] orderId XOR orderLabel в UI
- [ ] nx build green; archive

CLAIM: agent_id claude.
