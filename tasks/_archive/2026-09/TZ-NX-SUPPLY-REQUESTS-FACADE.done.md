# TZ-NX-SUPPLY-REQUESTS-FACADE: /supply-requests → SupplyRequestsFacade

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (2/2)
  - typecheck: PASS
  - tests: PASS (3 AC specs 26/26; kppdf-web supply|warehouse pattern 110/110 suites, 756/763, 7 skipped, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-SUPPLY-REQUESTS-FACADE.md
  - commit: 4533da8b
  - status synchronization: PASS (tracker updated)

## Root cause

`supply-requests.page.ts` (~475 LOC) owned lookups, the filtered list, and
all CRUD/receive/delete orchestration directly on the component.

## Fix

Mechanical extract, no behavior change: created `supply-requests.facade.ts`
(`@Injectable()`, component-scoped) holding every signal, computed, and
method verbatim. Unlike S1, every filter field here was already a Signal
with one-way binding (no `[(ngModel)]`), so every alias is a live
signal/computed reference and the template required zero changes. Spec
needed no changes either — fully DOM-driven, no direct instance-field
access.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/supply-requests/supply-requests.page.ts` (475 → 313 LOC, thin host)
- `frontend-nx/apps/kppdf-web/src/app/pages/supply-requests/supply-requests.facade.ts` (new, 249 LOC)
- `docs/agent-checklists/TZ-NX-SUPPLY-REQUESTS-FACADE.md` (new)

## Successor

`TZ-NX-SUPPLY-TO-FEATURES` (S3, final Stream S TZ).
