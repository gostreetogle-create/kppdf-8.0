# TZ-NX-ORGANIZATION-REGISTRY-READ

Implement read-only Organization/Supplier data-access and registry coverage in NX, using the existing Organization backend contract.

Use `tasks/_archive/2026-08/TZ-NX-REGISTRIES-SUPPLY-PASSPORT-MATRIX.done.md` and `TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.done.md`. Supplier is an Organization with a supplier type; do not create a Supplier collection.

Scope: list/get and honest search/type/pagination mapping, registry definition and tests. No import, create/edit/delete, normalization writes, new permissions, new backend fields/endpoints, legacy frontend changes or new UI primitives. Avoid simultaneous changes to shared navigation/routes; coordinate via conflict keys.
