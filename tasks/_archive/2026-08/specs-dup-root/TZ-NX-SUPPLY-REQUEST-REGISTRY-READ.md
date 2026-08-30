# TZ-NX-SUPPLY-REQUEST-REGISTRY-READ

Implement the first real supply registry: read-only SupplyRequest data in the existing `/registries` master table.

Use the verified matrix and audit:
- `tasks/_archive/2026-08/TZ-NX-REGISTRIES-SUPPLY-PASSPORT-MATRIX.done.md`
- `tasks/_archive/2026-08/TZ-NX-SUPPLY-PASSPORT-READINESS-REVIEW.done.md`
- `tasks/_archive/2026-08/TZ-NX-REGISTRY-READINESS-MARATHON.done.md`

Scope: existing backend `SupplyRequest` GET contract only; NX data-access types/service, adapter, registry row and tests. Preserve honest API limitations. Do not import XLSX, add write actions, add invoice fields, invent status/category mappings, or create supplier entities. No legacy frontend changes, no new UI primitives, no backend changes. Add route/menu only if existing registry conventions require it and do not overlap another active navigation task.
