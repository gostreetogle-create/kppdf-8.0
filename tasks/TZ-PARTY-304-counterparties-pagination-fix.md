# TZ-PARTY-304: Заказчики — починить server-side пагинацию

PAGES: /counterparties
PAGE_DOCS: counterparties.page.md

РОЛЬ: fullstack
LAYER: 3
CONFLICT KEYS: backend/src/modules/counterparty/counterparty.service.ts; backend/src/modules/counterparty/counterparty.controller.ts; frontend/src/app/pages/counterparties/counterparties.page.ts; frontend/src/app/pages/counterparties/counterparties.page.spec.ts

Проверено: FE шлёт `page/limit=50`; BE clamp `Math.min(100, …)`; pager pi-table скрыт если `total <= pageSize`. PO: «50 поставил — показывает другое кол-во, не всех видно».

## ЧТО ДЕЛАТЬ

1. BE: default limit 50; max 200 (как FE service fallback).
2. BE: проверить `findAll` filter при `organizationId` tenant + `search` — `$or` не должен ломать count/total.
3. FE: в toolbar показать «Показано X–Y из Z» (X=(page-1)*limit+1, Y=min(page*limit,total)).
4. FE spec: page 2 запрашивает `page=2`, total сохраняется.
5. Gates: FE tsc + jest counterparties; BE tsc + jest counterparty.

## НЕ

- contactPerson UI (TZ-PARTY-305)
