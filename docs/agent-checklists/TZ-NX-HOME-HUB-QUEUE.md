# TZ-NX-HOME-HUB-QUEUE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-HOME-HUB-QUEUE.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T15:25:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI exposed)

## Preflight

- [x] `_NOW.md` and `tasks/_active/` checked; no conflicting active claim
- [x] TZ, page doc, orders page, related-display canon, and shared order-hub source read
- [x] Dependency route-shell committed as `33e06c08`
- [x] Claim slot filled before product code

### Preflight Check Output
- **Context read:** `docs/pages/home.page.md`, `docs/pages/orders.page.md`, `docs/PO-CANON.md`, `docs/audits/2026-09-15-ui-related-display-peer-verdict.md`, `tasks/_ready/2026-09-15-nx-home/TZ-NX-HOME-HUB-QUEUE.md`, `frontend-nx/apps/kppdf-web/src/app/pages/orders/orders-list.page.ts`, `frontend-nx/libs/features/src/lib/order-hub/ui/order-hub-tray.component.ts`, `frontend-nx/libs/features/src/lib/order-hub/order-hub.facade.ts`
- **Key Constraints:** reuse `OrderHubTrayComponent`; live `PiOrdersService`; no fork/mock/second write path; single-expand; Paper & Ink dense registry rhythm; stop factor only from factual counters.
- **Planned Deliverable:** replace placeholder with live order list; add search/status filter; preserve single-expand and card deep-link; expose factual stop-factor only when expanded hub reports a short/deficit signal; add focused specs and update page docs.
- **Validation Path:** FIC route already covered by TZ-1; focused Home specs + tsc/lint/build; Integrity slot.

## Acceptance

- [x] Live orders from `PiOrdersService.list()`; no mock rows.
- [x] Search and all/active status filtering work with honest loading/error/empty states.
- [x] Expanded row reuses `OrderHubTrayComponent`, single-expand, gold left accent, and full order deep-link.
- [x] No fake green “all OK”; stop-factor is omitted until a factual shared-tray short signal is available.

## Integrity slot

- [x] Type: existing page behavior / shared hub reuse
- [x] FIC N/A for new route (route added in TZ-1); page docs updated
- [x] `docs/pages/home.page.md` updated
- [x] `docs/DOMAIN-MAP.md`: N/A (same route/domain from TZ-1)
- [x] `docs/SECTION-READINESS.md`: N/A
- [x] No чужой WIP staged; conflict keys respected
- [x] `docs/COUPLING-MAP.md`: N/A (reuses existing Order fields)

## Build integrity

- [x] Closing `cd frontend-nx && pnpm exec nx build kppdf-web` is the last gate — PASS (exit 0)

## Gates

- `pnpm exec nx test kppdf-web apps/kppdf-web/src/app/pages/home/home.page.spec.ts` — PASS (5/5)
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — FAIL baseline plus one fixed Home error: missing pre-existing `apps/kppdf-web/src/app/pages/registries/model/*` files causes the registry cascade; no remaining Home-specific tsc error
- `pnpm exec nx lint kppdf-web` — baseline FAIL (same pre-existing repository-wide boundary/accessibility errors)
- `pnpm exec nx build kppdf-web` — pending final gate

## Executor report

- Home now owns a live, dense day queue with number search, all/active filter, honest states, shared OrderHubTray reuse, single-expand, and order deep-links.
- Stop-factor is not fabricated: current shared facade exposes counters but no canonical short/deficit signal to the host; docs record the omission for a follow-up.
- Conflict disclosure: pre-existing registry model files are absent in the checkout; unrelated dirty files were not staged.

## Closeout

- [x] archive + remove `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T15:45:00+03:00
