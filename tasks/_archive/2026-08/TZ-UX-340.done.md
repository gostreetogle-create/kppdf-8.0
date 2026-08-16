# TZ-UX-340.done — PiPagination канон + встройка в pi-table

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T12:30:00+03:00
closed_by: cursor-composer (TZ-UX-340 frontend executor)
TZ: TZ-UX-340
WAVE: WAVE-UX-PAGINATION-UNIFY (#1)
DEP: none
Cursor_verdict: PASS

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (pi-pagination|pi-table — 4 suites, 42 tests)
  - lint: N/A (focused tsc + jest; owned files)
  - checklist: UPDATED DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN

COMMIT: a36120d4
CLOSEOUT_COMMIT: (this closeout)

## Spec (body)

# TZ-UX-340: PiPagination канон + встройка в pi-table

> Аудит: `docs/audits/2026-08-16-pagination-unification-audit.md`
> Волна: `WAVE-UX-PAGINATION-UNIFY` #1

РОЛЬ АГЕНТА: Frontend (shared UI)

ЗАВИСИМОСТИ: нет

LAYER: 2

CONFLICT KEYS: `frontend/src/app/shared/ui/pi-pagination.component.ts` ; `frontend/src/app/shared/ui/pi-pagination.component.spec.ts` ; `frontend/src/app/shared/ui/pi-table.component.ts` ; `frontend/src/app/shared/ui/pi-table.component.spec.ts` ; `frontend/src/app/shared/ui/pi-pagination.constants.ts`

PAGES: N/A (shared)
PAGE_DOCS: `docs/pages/page-chrome.md` + `docs/pages/PAGE-TZ-INDEX.md`

CHECKLIST: `docs/agent-checklists/TZ-UX-340.md`
REVIEW: required — Cursor Verdict PASS

## Outcome

- Расширен `app-pi-pagination`: range `N–M из T`, ‹›, numbers/gaps, select 10/25/50, `pageSizeChange`, hide when ≤1 page, default 10.
- `pi-table` footer → embedded `<app-pi-pagination>`; output `pageSizeChange` проброшен.
- Константа `PI_DEFAULT_PAGE_SIZE = 10`.
- Specs: `pi-pagination.component.spec.ts`; обновлён pager block в `pi-table.component.spec.ts`.
- Docs: pagination note в `page-chrome.md`; PAGE-TZ-INDEX shell → UX-340 DONE.

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` jest `--testPathPattern="pi-pagination|pi-table"`: PASS 42 tests
- deploy: NOT RUN (PO: closeout only; deploy/wipe forbidden)

## Files

- `frontend/src/app/shared/ui/pi-pagination.component.ts`
- `frontend/src/app/shared/ui/pi-pagination.component.spec.ts`
- `frontend/src/app/shared/ui/pi-pagination.constants.ts`
- `frontend/src/app/shared/ui/pi-table.component.ts`
- `frontend/src/app/shared/ui/pi-table.component.spec.ts`
- `docs/pages/page-chrome.md`
- `docs/pages/PAGE-TZ-INDEX.md`
- `docs/agent-checklists/TZ-UX-340.md`
- `docs/audits/2026-08-16-pagination-unification-audit.md`

## known_limitation

- Pages/grid/KP rail migration = TZ-UX-341 / TZ-UX-342 (не стартованы в этой TZ).
- Consumers ещё могут передавать свой pageSize (часто уже 10).
