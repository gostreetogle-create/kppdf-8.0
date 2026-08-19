# TZ-ORDERS-307: Заказ — какая наша контора исполняет (Organization)

PAGES: /orders ; /desk ; /supply
DEP: none

## Intent (PO)

2–3 наших юрлица; заказ должен нести **какая Organization выполняет**. Снабжение видит контору при заказе материалов.

## Scope

1. `Order.organizationId` (FK Organization, isOurCompany) — BE schema + DTO + PATCH.
2. FE order-form-panel + desk create/edit: dropdown «Исполнитель (наша фирма)» default = current/default org.
3. Supply list/create: показывать org заказа (read-only chip).
4. Migration-safe: existing orders → default org seed.

## НЕ

- Counterparty (это клиент)
