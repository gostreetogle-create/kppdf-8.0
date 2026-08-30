# NX Registry READ orchestrator — status matrix (2026-08-29)

| Task | Registry key | Pagination | Write actions | Outcome | Archive |
|------|--------------|------------|---------------|---------|---------|
| TZ-NX-SUPPLY-REQUEST-REGISTRY-READ | `supply-requests` | **client** (API cap 500) | none | **DONE** | `tasks/_archive/2026-08/TZ-NX-SUPPLY-REQUEST-REGISTRY-READ.done.md` |
| TZ-NX-ORGANIZATION-REGISTRY-READ | `organizations` | **server** | none | **DONE** | `tasks/_archive/2026-08/TZ-NX-ORGANIZATION-REGISTRY-READ.done.md` |
| TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ | `product-passports` | **client** | none | **DONE** | `tasks/_archive/2026-08/TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ.done.md` |

## Catalog order (9 registries)

`units` → `materials` → `details` → `modules` → `products` → **`supply-requests`** → **`organizations`** → **`product-passports`** → `departments` (fixture)

## Gates (shared batch)

| Gate | Result |
|------|--------|
| `nx build kppdf-web` | PASS |
| `nx test kppdf-web` | PASS — 265 tests |
| `nx test data-access` | PASS — 41 tests |
| `nx run-many -t lint --all` | PASS — 0 errors |
| `architecture:check:nx` | PASS |
| `ui:tokens:nx` | PASS |

## Checklists (Integrity slot filled)

- `docs/agent-checklists/TZ-NX-SUPPLY-REQUEST-REGISTRY-READ.md`
- `docs/agent-checklists/TZ-NX-ORGANIZATION-REGISTRY-READ.md`
- `docs/agent-checklists/TZ-NX-PRODUCT-PASSPORT-REGISTRY-READ.md`

## Still deferred (out of scope)

| Entity | Status |
|--------|--------|
| SupplyRequest import / write | blocked on PO |
| Organization import / CRUD | blocked on PO |
| ProductPassport XLSX import | blocked on productId matching |
| StorageItem registry | MISSING |
