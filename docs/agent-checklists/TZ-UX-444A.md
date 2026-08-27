# TZ-UX-444A checklist

> Status: **DONE** · archived at `tasks/_archive/2026-08/TZ-UX-444A.done.md`
> Marker: removed after archive; commit/push: not performed (no user request).

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-08-26T19:52:30+03:00
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable — Team Room tool недоступен; claim зафиксирован in marker/checklist

## Preflight

- [x] `Get-Location`/`pwd` + `git rev-parse --show-toplevel` → `D:\\kppdf-8.0`.
- [x] Branch/worktrees checked: `main`; shared checkout confirmed.
- [x] `_NOW.md`, `_active-map.md`, and `tasks/_active/` checked before claim; no overlapping foreign key.
- [x] TZ and required UI/audit context read.
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS before product code.
- [x] `tasks/_active/TZ-UX-444A.md` created before implementation.

### Preflight Check Output

- **Context read:** `tasks/TZ-UX-444A-status-banner.md`, audit §5.3/§8, `docs/ui-rules.md`, `docs/AI-UI-CONTRACT.md`, `docs/paper-and-ink.md`, `frontend/src/styles.css`, order-detail and ErrorBanner sources.
- **Key constraints:** lifecycle status is persistent page content, not ErrorBanner/Toast/Dialog; Paper & Ink semantic tokens only; no product-detail, DOC-443, `styles.css`, backend, deploy, or wipe changes.
- **Planned deliverable:** shared standalone `app-pi-status-banner`, order-detail adoption, focused regressions, and kit/docs adoption.
- **Validation path:** FIC/SECTION-READINESS N/A; order docs + PAGE-TZ-INDEX; scoped Jest/tsc/lint/Prettier/diff-check/build; architecture baseline disclosure.

## Acceptance

- [x] Standalone OnPush `app-pi-status-banner` in shared UI: four tones, message, optional action, `role="status"`, and `data-test="pi-status-banner"`.
- [x] Order detail: warning for draft, destructive for cancelled, info for confirmed/in-production/ready, and no banner for shipped/delivered.
- [x] Focused unit and order-detail regression tests cover tones, message, optional action, and lifecycle visibility.
- [x] `docs/AI-UI-CONTRACT.md` and `docs/ui-rules.md` distinguish StatusBanner, ErrorBanner, Toast, and Dialog.

## Integrity slot (до READY / archive)

- [x] Тип изменения: page + shared UI primitive.
- [x] FIC N/A — no new route, permission, module, capability, or API; existing `Order.status` is read only.
- [x] `docs/pages/orders.page.md` and `docs/pages/PAGE-TZ-INDEX.md` updated with lifecycle/banner contract.
- [x] SECTION-READINESS N/A — existing order and kit surfaces changed presentation only; no section readiness state changed.
- [x] Foreign WIP excluded; `product-detail`, module/material detail, DOC-443, and unrelated staged/dirty files were not edited.
- [x] `docs/COUPLING-MAP.md` N/A — no shared field/write/filter contract changed; existing `Order.status` row remains authoritative.
- [x] `docs/DOCS-INTEGRITY.md` checked; UI SoT checked: `docs/ui-rules.md`, `docs/AI-UI-CONTRACT.md`, `docs/paper-and-ink.md`, and `frontend/src/styles.css`.

## Gates (fact)

- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → **PASS** (exit 0).
- [x] `cd frontend && pnpm exec jest src/app/shared/ui/status-banner src/app/pages/orders/order-detail.page.spec.ts --no-coverage --runInBand` → **PASS**, 2 suites / 23 tests (exit 0).
- [x] Changed-file ESLint → **PASS** (exit 0); owned Prettier check → **PASS** (exit 0); `git diff --check` → **PASS** (exit 0).
- [x] `cd frontend && pnpm run build:dev` → **PASS** (exit 0).
- [ ] Full `cd frontend && pnpm lint` → baseline residual only: **FAIL** (exit 1), 208 errors + 17 warnings outside owned files; UI token checker reports 35 existing proposal/block-renderer CSS violations.
- [ ] `pnpm architecture:check` → baseline residual only: **FAIL** (exit 1), 2 existing `fe-page-cross-component` imports in materials/products; no UX-444A violation.
- [ ] Full `cd frontend && pnpm test --no-coverage --runInBand` → baseline residual only: **FAIL** (exit 1), 7 existing failures in materials/orders/workspace; scoped suites pass.
- [x] Browser smoke partial: dev server `127.0.0.1:4204` served `/kit/overview` and guard redirected to `/login`; demo-login reached backend HTTP 500 because local backend was unavailable. Build and unit DOM verification passed.

## Executor report

- Added `frontend/src/app/shared/ui/status-banner/` (`status-banner.component.ts`, `.spec.ts`, `index.ts`) and adopted it in order-detail plus `/kit/overview`.
- Updated order lifecycle docs, UI primitive contracts, and PAGE-TZ-INDEX.
- Normalized the stale order-detail BOM click expectation to the current router navigation contract; no product-detail code changed.
- Conflict disclosure: shared checkout contains pre-existing DOC-443 changes and 444B product/module work; these remain outside this TZ and uncommitted.
- Known limits: full baseline lint/test/architecture remain red as recorded above; browser authenticated smoke requires a running backend.

## Review handoff

- [x] READY FOR REVIEW: scoped diff reviewed in-session; this Layer-2 TZ has no separate Cursor verdict requirement.
- [x] Archive permitted after scoped acceptance gates; baseline residuals are explicitly recorded.

## Closeout

- [x] Archive marker written to `tasks/_archive/2026-08/TZ-UX-444A.done.md`.
- [x] Lock created at `.mimocode/locks/TZ-UX-444A-status-banner.lock`.
- [x] `_NOW.md` and `tasks/QUEUE-LIVE.md` synchronized; A+B prompt archived.
- [x] Active marker removed after archive verification.
- [x] Status = DONE.
- closed_at: 2026-08-26T20:44:27+03:00
