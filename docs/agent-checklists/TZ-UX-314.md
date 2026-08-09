# TZ-UX-314 checklist

> Status: **DONE**  
> Source: `tasks/TZ-UX-314-list-page-size-10.md`  
> closed_at: 2026-08-09T01:40:00Z  
> agent: Cursor (PO asked quick layer now)

## Acceptance

- [x] Рабочие list PAGE_SIZE / pageSize = 10
- [x] Server list limit=10 где был PAGE_SIZE
- [x] Counterparties: pager + limit=10
- [x] Пикеры limit:200 / A4 / forms не тронуты
- [x] Specs обновлены; page specs PASS (57)

## Gates

- `pnpm test -- products|materials|counterparties|users-admin|roles-admin page specs` → 57 passed
