# TZ-CATALOG-311 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-CATALOG-311.md`
> Commit/push: **NO** unless PO explicitly requests it

## Claim slot

- agent_id: `agent-796e2f8bba` / Buffy `openai/gpt-5.6-luna`
- claimed_at: `2026-08-06T16:51:25Z`
- workspace: `D:\kppdf-8.0` (rebased onto canonical `origin/main` `407b0de`)
- team_room_claim: unavailable — local Team Room task index does not expose TZ-CATALOG-311

## Preflight

- [x] Worktree rebased onto `origin/main` `407b0de`; clean before claim.
- [x] Read `TZ-CATALOG-311.md`, `TZ-CATALOG-300.md`, `_active-map.md`, and existing active markers.
- [x] Confirmed TZ-CATALOG-320 is DONE on canonical main and no parallel product/module owner is claimed.
- [x] Claim slot filled before code; status = CLAIMED / IN PROGRESS.
- [x] `tasks/_active/TZ-CATALOG-311.md` created.

## Conflict keys

- `frontend/src/app/shared/ui/composition/**` (new)
- `frontend/src/app/shared/services/pi-product-modules.service.ts`
- `frontend/src/app/shared/services/pi-product-modules.service.spec.ts`
- `frontend/src/app/pages/products/product-detail.page.ts`
- `frontend/src/app/pages/modules/module-detail.page.ts`
- `frontend/src/app/pages/modules/module-materials-form-dialog.component.ts`
- `frontend/src/app/pages/products/product-form-dialog.component.ts`
- `docs/pages/product-detail.page.md`
- `docs/pages/module-detail.page.md`
- closeout: this checklist, `_active-map.md`, `progress.md`, archive, lock

## Acceptance

- [x] Tree service methods and HTTP tests.
- [x] Shared nested CompositionTree with depth-refetch expansion, RU labels, materialKind, and empty state.
- [x] Shared CompositionEditor with allowed line types, quantity edit, remove, add, and existing composition API writes.
- [x] Depth >5 warning; depth/cycle/self-reference API errors are surfaced as RU messages.
- [x] Product root derives and displays `Комплекс` for product children.
- [x] Product/module detail integration without a second visible write editor; legacy flat controls remain hidden quick-edit compatibility.
- [x] Focused Jest coverage and page docs.

## Gates (fact)

- [ ] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — blocked by pre-existing inventory/materials errors; no TZ-311 files in the error list.
- [x] `cd frontend && pnpm test -- --testPathPattern="composition|product-detail|module-detail|pi-product-modules"` — focused composition/product/module suites pass; latest targeted run 6 suites / 57 tests.
- [x] Scoped ESLint / Prettier.
- [ ] Browser/DOM smoke — not run; no server started.

## Executor report

- Rebase completed onto `origin/main` `407b0de`.
- TZ-CATALOG-320 remains untouched and already closed on canonical main.
- No parallel product/module conflict claim detected.

## Review handoff

- [x] READY FOR REVIEW after focused gates and scoped Angular build validation.
- [ ] Cursor/PO PASS before archive if required.

## Closeout

- [ ] Archive + ARCHIVE_MARKER.
- [ ] Lock.
- [ ] Progress and active map.
- [ ] Remove active marker.
- [ ] Status = DONE.
