# TZ-NX-HUB-01-counterparties: hub expand + icon actions — `/counterparties`

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude  
**ЗАВИСИМОСТИ:** нет (первая стадия волны)  
**LAYER:** 3 · **SIZE:** L  
**PAGES:** `/counterparties`  
**PAGE_DOCS:** `counterparties.page.md`  

**CONFLICT KEYS:**  
`frontend-nx/apps/kppdf-web/src/app/pages/counterparties/**` ;  
`frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts` ;  
`frontend-nx/libs/data-access/src/lib/sales/pi-quotations.service.ts` ;  
`docs/pages/counterparties.page.md` ;  
`docs/agent-checklists/WAVE-NX-HUB-TABLE-PARITY.md` ;  
`docs/agent-checklists/HUB-TABLE-CONTINUOUS-CHECKLIST.md`

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-10-nx-hub-table-parity-canon.md`; `counterparties-list.page.ts`; `order-hub-tray.component.ts` (hub precedent); `pi-row-actions.component.ts`; BE `order.controller.ts` / `quotation.controller.ts` (counterpartyId query)
- **Key Constraints:** Mode A уже написал TZ. Hub = сводка+ссылки. Не порт legacy FullEditor. Не ObjectId в UI.
- **Planned Deliverable:** denser table + ▸ expand hub + `app-pi-row-actions`
- **Validation Path:** focused specs + `nx build kppdf-web` last

---

## ИСХОДНОЕ СОСТОЯНИЕ

1. `counterparties-list.page.ts` — flat list; **нет** expand; row actions = широкие «Изменить»/«Удалить» (`app-pi-button secondary`).
2. Прошлый UX #13 только subtitle полного имени — канон H1–H3 FAIL.
3. API уже умеет: Sites by cp, Contracts by cp, Orders/Quotations by `counterpartyId` (BE). NX `PiOrdersService.list()` / `PiQuotationsService.list()` **без** query — добавить params.

Проверено: Counterparty ≠ Organization; 1 клиент → N заказов/КП/договоров.

## ЧТО ДЕЛАТЬ

1. **Data-access:** `PiOrdersService.list(params?: { counterpartyId?: string })`, `PiQuotationsService.list(params?: { counterpartyId?: string })` + unit specs (HttpParams).
2. **Список:** denser `pi-table-surface`; колонка ▸; `cursor-pointer`; hover `bg-paper-2`; `aria-expanded`; Enter/Space; single-expand.
3. **Actions:** заменить текстовые кнопки на `app-pi-row-actions` (edit + delete; copy — **нет**, нет clone API → не рисовать). `stopPropagation` на actions. Delete → `AlertDialog` как сейчас.
4. **Hub expand** (новый компонент рядом, напр. `counterparty-hub-tray.component.ts`), блоки:
   - **Реквизиты** — name, ИНН, телефон, email (read-only).
   - **Объекты** — `PiSitesService.list(id)` · до 5 строк · empty честно.
   - **Заказы** — `PiOrdersService.list({ counterpartyId })` · номер+статус+ссылка `/orders/:id` · chip «Все заказы» → `/orders` (без обязательного query, если нет UI-фильтра — достаточно списка в hub).
   - **КП** — quotations by cp · ссылка `/proposals` или `/proposals/:id` если route есть · empty честно.
   - **Договоры** — `PiContractsService.list({ counterpartyId })` · ссылка `/contracts` · empty честно.
5. Lazy load блоков при expand (не грузить весь мир на init страницы). Бюджет: ≤5 HTTP на один expand.
6. Specs: expand/collapse; actions не тоглают expand; hub показывает мок-данные по блокам; data-access query params.
7. `counterparties.page.md` — NX note; WAVE row 01 DONE; continuous checklist DONE+SHA.

## НЕ ИЗМЕНЯТЬ

- Legacy FullEditor / roles UI / bank fields
- BE schema
- `/production`, DocStudio
- Другие pages (кроме data-access list params)

## КРИТЕРИИ ПРИЁМКИ

1. Нет широких «Изменить»/«Удалить» на строке — только icon actions + aria-label RU.
2. Клик по строке → hub с ≥4 категорийными блоками; повторный клик сворачивает.
3. Нет сырых ObjectId в UI.
4. Destructive delete с confirm.
5. Gates:

```text
cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=counterparties|pi-orders.service|pi-quotations.service
cd frontend-nx && pnpm exec nx build kppdf-web
```

## BUILD INTEGRITY

IMPLICIT CONFLICT: frontend-nx/apps/kppdf-web — nx build kppdf-web  
Baseline до CLAIM + build **последним** перед archive.  
Параллель: STOP если другой `_active` на `kppdf-web/src/**`.

## Archive

`tasks/_archive/2026-09/` + Executor report (auto) ≤15 lines · full SHA.
