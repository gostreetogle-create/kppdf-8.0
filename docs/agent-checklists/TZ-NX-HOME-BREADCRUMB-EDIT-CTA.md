# TZ-NX-HOME-BREADCRUMB-EDIT-CTA checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-09/TZ-NX-HOME-BREADCRUMB-EDIT-CTA.done.md`
> Commit/push: committed locally; no deploy.

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-15T19:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this executor)

## Preflight

- [x] Startup instructions read: `docs/how-to-connect-ai.md`, `GEMINI.md`, `.agents/skills/kppdf-executor-loop/SKILL.md`.
- [x] Context read: `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`, `docs/CONTEXT.md`, `docs/pages/home.page.md`, `docs/pages/orders.page.md`.
- [x] Code context read: Home page/spec and OrderHub tray/spec.
- [x] `_NOW.md` + `tasks/_active/` checked; no conflicting active TZ before claim.
- [x] Claim slot filled before product-code edits.
- [x] Preflight artifact recorded.

### Preflight Check Output

- **Context read:** `docs/PO-CANON.md`, `docs/pages/home.page.md`, `docs/pages/orders.page.md`, `frontend-nx/apps/kppdf-web/src/app/pages/home/home.page.ts`, `home.page.spec.ts`, `frontend-nx/libs/features/src/lib/order-hub/ui/order-hub-tray.component.ts`, `order-hub-tray.component.spec.ts`.
- **Key Constraints:** exact conflict keys; Paper & Ink existing tray pattern; no `order-detail.page.ts` expansion; no second write path; final `nx build kppdf-web` last.
- **Planned Deliverable:** replace Home eyebrow; add expanded-tray edit CTA; unify composition/readiness/row-link copy and aria; add focused assertions; update Home page docs.
- **Validation Path:** focused Home and order-hub specs; frontend typecheck/lint; final `nx build kppdf-web`.

## Acceptance

- [x] Home eyebrow is «Главная», not «Рабочий день».
- [x] Expanded tray immediately shows `order-hub-edit-cta` without composition disclosure.
- [x] CTA and all edit links target `/orders/:id` for the current order.
- [x] Composition, readiness, and Home row link use «Редактировать заказ».
- [x] Focused tests cover visibility and labels.
- [x] `docs/pages/home.page.md` documents the new breadcrumb/CTA.

## Integrity slot

- [x] Тип изменения: existing page/UI copy and navigation CTA.
- [x] FIC §A–E: N/A beyond existing route; no new route, permission, module, or MCP.
- [x] `docs/pages/home.page.md` updated; PAGE-TZ-INDEX unchanged because route is existing.
- [x] `docs/DOMAIN-MAP.md` unchanged: no route/domain contour change.
- [x] `docs/SECTION-READINESS.md` unchanged: no readiness contour change.
- [x] Foreign WIP not staged; conflict keys limited to this TZ.
- [x] `docs/COUPLING-MAP.md` unchanged: no shared status/filter/FK semantics changed.
- [x] `docs/DOCS-INTEGRITY.md` protocol followed.

## Build integrity

- [x] Baseline attempted before code; first run was blocked by concurrent/unrelated missing `libs/features/src/lib/order-workspace/order-status.ts`.
- [x] Closing `nx build kppdf-web` was the last gate and passed (exit 0).

## Gates (fact)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS, exit 0.
- `cd frontend-nx && pnpm exec jest --config apps/kppdf-web/jest.config.ts apps/kppdf-web/src/app/pages/home/home.page.spec.ts --runInBand` — PASS, 7/7, exit 0.
- `cd frontend-nx && pnpm exec jest --config libs/features/jest.config.ts libs/features/src/lib/order-hub/ui/order-hub-tray.component.spec.ts --runInBand` — PASS, 32/32, exit 0.
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=home.page.spec --skip-nx-cache` — Home 7/7 PASS; command suite also exposed unrelated baseline AppShell expectation failures, exit 1.
- `cd frontend-nx && pnpm exec nx test features --testPathPattern=order-hub-tray --skip-nx-cache` — PASS, exit 0.
- `cd frontend-nx && pnpm exec nx lint kppdf-web` — baseline FAIL, exit 1; existing lazy-boundary/a11y errors, no new errors in owned files.
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; last gate.

## Executor report

Implemented the Home breadcrumb copy and unified order-edit CTA without changing order-detail, APIs, or write paths. Foreign dirty/WIP files were not staged. Known baseline failures are documented above.

## Closeout

- [x] Integrity slot filled.
- [x] Archive with `ARCHIVE_MARKER` created before removing `_active` marker.
- [x] `_NOW.md` updated.
- [x] Only owned files staged for commit.
- [x] Status DONE.
- closed_at: 2026-09-15T19:55:00+03:00
