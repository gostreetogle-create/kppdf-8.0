# TZ-NX-PASSPORT-SUPPLY-DECISIONS

## Verified state

- `data/Снабжение.xlsx` maps primarily to `SupplyRequest`, not `SupplyTask`.
- `data/Pasports.xlsx` maps to `ProductPassport`, but every row requires a reviewed Product match first.
- No new supply collection is required for MVP.
- Passport photos are a separate migration step.
- Do not create parallel supplier, material or passport-product tables.

## Decisions required from PO before import

1. Meaning and destination of `Подал заявку`, `Заказчик`, `responsible`, `requestedBy`.
2. Mapping of spreadsheet statuses, especially `Оплачено`.
3. Whether six spreadsheet category buckets become existing Category records or remain informal.
4. Confirm import target is `SupplyRequest`, not fabricated `SupplyTask` rows.
5. Handling of invoice number: new additive field vs notes.
6. Passport row-to-Product matching policy for unmatched products.

No import, schema migration or new UI should start until these decisions are recorded.

## Sources

- `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-AUDIT.done.md`
- `tasks/_archive/2026-08/TZ-NX-PASSPORT-DISCOVERY-IMPLEMENTATION.done.md`
- `data/Снабжение.xlsx`
- `data/Pasports.xlsx`
