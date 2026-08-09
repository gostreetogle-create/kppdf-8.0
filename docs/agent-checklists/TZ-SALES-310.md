# TZ-SALES-310 checklist

> Status: **DONE** · Wave: KP-VITRINE #1
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-310-deals-kp-subchips.md`
> Commit/push: **pending closeout commit**

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-09T01:57:53Z
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable — Team Room registry reports Unknown task `TZ-SALES-310`

## Acceptance

- [x] `/proposals` shows dark Deals TOC with КП active and yellow `Создать КП` / `Все КП` subchips; `Все КП` is active.
- [x] `/proposals/create` lazy route shows the same dark TOC, proposal subchips, and `Создать КП` stub heading.
- [x] `Создать КП` navigates to `/proposals/create`; full three-zone editor remains explicitly deferred to TZ-SALES-312+.
- [x] `/contracts` and `/orders` show the shared TOC with the correct active item and an empty yellow row, so no false proposal CTA appears.
- [x] Solo `/proposals` list still loads the existing `/quotations` flat array; quotation API and business logic are unchanged.
- [x] Frontend tsc PASS.
- [x] Focused chips/page Jest PASS: 2 suites, 18 tests.
- [x] Angular development build PASS.
- [x] Prettier and `git diff --check` PASS.
- [x] Page docs and PAGE-TZ-INDEX updated.

## Implementation

- `DEALS_TOC_CHIPS` owns the dark lifecycle TOC; `KP_SECTION_CHIPS` owns proposal-only yellow actions.
- Existing `PiGroupWorkspaceComponent` TOC/chips API is reused; no new navigation shell was introduced.
- Create route is guarded like `/proposals` and is a presentational stub only.
- No quotation API changes, family expand, schema rewrite, ModuleMaterials, or deploy.

## Closeout

- Archive: `tasks/_archive/2026-08/TZ-SALES-310.done.md`
- Lock: `.mimocode/locks/TZ-SALES-310-deals-kp-subchips.lock`
