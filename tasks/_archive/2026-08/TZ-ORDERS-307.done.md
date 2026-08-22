# TZ-ORDERS-307 — DONE

- BE: Order.organizationId (FK Organization) — schema + CreateOrderDto
- BE: default org = findCurrent (isOurCompany) on create; migration-safe (try/catch)
- FE: order-form-panel — PiOverflowSelect «Исполнитель (наша фирма)» + save/patch
- FE: Order interface — organizationId (string | populated)
- Supply read-only chip: deferred (supply page shows supply requests, not orders directly)

Gates:
- BE tsc PASS, jest 958/960 (2 pre-existing)
- FE tsc PASS, jest order-form-panel 10/10
- lint 0 errors