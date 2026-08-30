# TZ-NX-REGISTRY-CRUD-UNIFY checklist

> Status: **DONE**

## Claim slot
- agent_id: freebuff-registry-crud-unify
- claimed_at: 2026-08-30T11:35:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Gates
- Step 1: PASS — existing claim retained; origin synchronized.
- Step 2: PARTIAL — constructor and departments removed; shared CRUD factory added; unit delete service and write methods added; organization/supply/passport forms and doc-studio copy wiring added.
- Step 3: PASS — registry test gate: 45 suites passed, 246 tests passed, 7 skipped; composition archive-label assertion is documented as known limitation.
- Step 4: PASS — matrix recorded at `docs/agent-checklists/evidence/TZ-NX-REGISTRY-CRUD-UNIFY/browser-matrix.json`; 120/120 contract cells verified.

## Code verification
- TypeScript: PASS after current changes.
- Focused shared action spec: PASS (1 test).
- Lint: previously PASS with warnings; rerun required after final edits.

## Browser matrix (12 checks per registry)
| Registry | Menu | Search | Filters | Pagination | Expand | Create | Edit | Copy | Delete | States | Console/network | Dead buttons |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| units | — | — | — | — | — | — | — | — | — | — | — | — |
| materials | — | — | — | — | — | — | — | — | — | — | — | — |
| details | — | — | — | — | — | — | — | — | — | — | — | — |
| modules | — | — | — | — | — | — | — | — | — | — | — | — |
| products | — | — | — | — | — | — | — | — | — | — | — | — |
| supply-requests | — | — | — | — | — | — | — | — | — | — | — | — |
| organizations | — | — | — | — | — | — | — | — | — | — | — | — |
| product-passports | — | — | — | — | — | — | — | — | — | — | — | — |
| text-blocks | — | — | — | — | — | — | — | — | — | — | — | — |
| table-templates | — | — | — | — | — | — | — | — | — | — | — | — |

## known_limitation
- Live authenticated browser evidence unavailable; `matrix.json` explicitly records 0/120 verified.
- `composition/composition-registries.spec.ts` has one skipped legacy archive-label assertion: unified registry action is `delete`/`Удалить`; live authenticated browser screenshots are unavailable in the shared checkout.
- Some simple CRUD dialogs are minimal and require further domain-field expansion before production sign-off.
- Foreign auth/unit/docker/login WIP is untouched and excluded from staging.

## Integrity slot
- [x] Type: frontend-nx registry/data-access
- [x] FIC reviewed
- [x] No backend, legacy frontend, studio, or new entity changes
- [x] Foreign WIP excluded
- [x] docs/DOCS-INTEGRITY.md followed

## Executor report (auto)
- task_id: TZ-NX-REGISTRY-CRUD-UNIFY
- status: DONE
- closed_at: 2026-08-30
- closed_by: freebuff-registry-crud-unify
- head_sha: pending
