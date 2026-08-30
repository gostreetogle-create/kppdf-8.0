# TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ

Implement read-only ProductPassport data-access and registry coverage in NX, distinct from the existing computed product passport preview.

Use the verified matrix and audit archives. Map only real ProductPassport endpoints and fields. Clearly distinguish live Product data from denormalized passport snapshot fields. Do not import `data/Pasports.xlsx`, perform Product matching, migrate photos, or add schema fields in this task.

Scope: NX data-access read service, adapter, registry row, honest filters/pagination, tests, docs. No backend changes, no legacy frontend changes, no new permissions/endpoints/UI primitives, no fake passport rows and no duplicated Product entity.
