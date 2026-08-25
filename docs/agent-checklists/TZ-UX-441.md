# TZ-UX-441 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-UX-441.md`
> Commit/push: after gates and review, per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: `freebuff`
- claimed_at: `2026-08-25T21:45:23+03:00`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable (local executor)

## Preflight

- [x] `Get-Location` + `git rev-parse --show-toplevel` -> `D:\kppdf-8.0`
- [x] `_NOW.md` and `tasks/_active/` checked; no claim on `form-field`
- [x] TZ, UX rules, form canon, executor and Git policy read
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UX-441.md` created

## Acceptance

- [x] `app-pi-form-field` always renders a one-line reserved footer slot
- [x] Error takes precedence, uses `role="alert"` and `text-destructive`
- [x] Existing hint tone/shadow behavior remains green
- [x] Spec proves footer stability while error is set/cleared/set
- [x] `docs/UX-FORM-CANON.md` contains the TZ-UX-441 reserved-footer proof

## Integrity slot

- [x] Тип изменения: shared UI primitive
- [x] FIC §A-E: N/A for shared primitive; no page route or permission change
- [x] PAGE-TZ-INDEX / page docs: N/A (no route)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (no coupling/status change)
- [x] Канон: `docs/DOCS-INTEGRITY.md`

## Gates

- PASS: `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- PASS: `cd frontend && pnpm test -- form-field.component.spec` (7/7)
- PASS: `cd frontend && pnpm lint` (0 errors; 17 pre-existing warnings)
- FAIL (pre-existing, outside conflict keys): `pnpm architecture:check` reports materials/products page-cross-component imports

## Executor report

- reserved one-line footer keeps error transitions stable without API changes
- conflict disclosure: unrelated dirty desktop/docs/data WIP remains untouched and will not be staged
- known limit: full-dialog visual smoke not run; architecture baseline has two unrelated violations

## Review handoff

- [x] READY FOR REVIEW after gates; acceptance verified locally
- [x] Archive after gates (no separate Cursor verdict required by this TZ)

## Closeout

- [x] archive + lock + progress + remove `_active`
- [x] Status = DONE
- closed_at: `2026-08-25T21:47:00+03:00`
