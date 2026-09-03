# TZ-NX-KP-FAMILY-S43-EXPAND

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-03
closed_by: Claude executor
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (tsc -p apps/kppdf-web/tsconfig.app.json)
  - tests: PASS (proposals-list spec: 10 tests incl. 5 new S43; 57/58 suites — registries.catalog pre-existing, unrelated)
  - lint: PASS (scoped eslint, 0 warnings)
  - kppdf-web build: PASS (exit 0, last command)
  - checklist: ADDED and completed
  - status synchronization: PASS

## Delivered

- `proposals-list.page.ts` (NX `/proposals`): per-row «Семья» expand (`proposal-family-expand`) on solo/master → `PiQuotationsService.getFamily(row._id)`.
- Panel (`proposal-family-list`): variant rows (`proposal-family-member`) with org display name (lazy `PiOrganizationsService.list({limit:100})`, cached `orgNames`), `member.number`, `orgMarkupPercent ?? 0`% and status label; solo without variants → «Нет вариантов фирм».
- Loading (`familyLoadingId`) and error states — error renders status-banner with «Повторить» (`reloadFamily`).
- Stale-guard: after each await, result is discarded if `expandedFamilyId` changed/closed; family cached per row (`familyByRow`) so re-expand does not refetch.
- Spec: 5 red-green tests (expand loads variants incl. org/markup/number/status; collapse + cached reopen single GET; solo empty state; error banner + retry; stale result ignored when closed mid-flight).
- Docs: proposals.page.md NX S43 bullet; PAGE-TZ-INDEX `/proposals` row updated.

## Gates

- Red: methods/selectors absent (compile fail on first attempt is not applicable — page template referencing new state failed ts-jest; resolved in same cycle).
- Green: `nx test kppdf-web --testPathPattern=proposals-list` PASS (324 passed total; proposals suite green).
- Closing `cd frontend-nx && pnpm exec nx build kppdf-web` exit 0 (last command).
- Pre-existing boundary: `registries.catalog.spec.ts` failure on main (unrelated).

## Integrity

FIC checked: existing `/proposals` route, no permission change. No backend edits. Foreign WIP not in commit.
