# TZ-UX-FORM-307 checklist

> Status: **DONE** · Wave: SHOP-NORTH-B
> Source: `tasks/_backlog/shop-north-b/TZ-UX-FORM-307-form-wave-b-batch1.md`
> Marker: archived from `tasks/_active/TZ-UX-FORM-307.md`
> Commit/push: required on closeout

## Claim slot

- agent_id: `agent-e51db87918`
- claimed_at: `2026-08-08T17:59:25Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room task registry does not contain this backlog TZ

## Preflight

- [x] Read queue, wave order, active map, and all current active markers
- [x] Read TZ, dialog-layout audit, and form-sections canon
- [x] Confirmed no existing FORM-307 archive or lock
- [x] Claim slot filled before product-code changes
- [x] Active marker created at `tasks/_active/TZ-UX-FORM-307.md`
- [x] No live claim shared these target files
- [x] Source TZ names `organization-form-dialog.component.ts`, but that file does not exist on main; the existing `organization-full-editor-dialog.component.ts` already uses the shared sections from the preceding Party wave and passed its regression spec, so it was intentionally left unchanged

## Acceptance

- [x] Contract dialog now uses shared `app-pi-form-section` wrappers for «Основные данные», «Позиции», and «Дополнительно»
- [x] Work-type dialog now uses shared `app-pi-form-section` wrappers for «Основные данные» and «Дополнительно»
- [x] Organization FullEditor already uses shared sections and kind-C 1120 shell; regression covered without a duplicate wrapper or new business logic
- [x] Dialog sizes remain the existing canon: contract `lg`, work type `md`, organization kind-C `1120px` max width
- [x] Submit DTOs, FormControl names, and business logic are unchanged; only imports and projected section wrappers changed
- [x] Create/edit payload behavior covered by the existing organization/material/order/dialog test suite; no payload diff in the two modified dialogs

## Gates (fact)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- [x] `cd frontend && pnpm exec ng build --configuration=production` — PASS; existing Angular budget warnings only
- [x] `cd frontend && pnpm exec eslint src/app/pages/contracts/contract-form-dialog.component.ts src/app/pages/work-types/work-type-form-dialog.component.ts` — PASS
- [x] `cd frontend && pnpm exec jest --config jest.config.js --runInBand` — PASS, 132 suites / 1247 tests
- [x] `git diff --check` — PASS
- [x] Review diff for forbidden scope and payload/control-name drift — PASS

## Closeout

- [x] `progress.md` updated
- [x] `STATUS.md` updated
- [x] `.mimocode/locks/TZ-UX-FORM-307-form-sections.lock` created
- [x] Archive with `ARCHIVE_MARKER` created at `tasks/_archive/2026-08/TZ-UX-FORM-307.done.md`
- [x] `tasks/_active/TZ-UX-FORM-307.md` removed after archive
- [x] `_active-map.md` checkpoint updated
- [x] Commit created and pushed to `origin/main`

## Known limitation

- `bash OrchestratorKit/verify-status.sh` retains the repository's pre-existing 72 legacy kit-era task drift; no OrchestratorKit files were in this frontend TZ's scope.
