# TZ-NX-SHELL-rail-layout-fix checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-SHELL-rail-layout-fix.done.md`

## Claim slot
- agent_id: cursor-executor-shell-rails
- claimed_at: 2026-08-29T14:20:00+03:00
- workspace: D:\kppdf-8.0

## Acceptance
- [x] Header full-width: brand / nav chips / notifications+theme+user+logout.
- [x] Left + right tool rails (not sidebar).
- [x] Back only left rail; forward only right rail.
- [x] Grid workspace; outlet between rails; no absolute overlay.
- [x] Tool rail definitions typed; demo placeholders disabled.
- [x] Kit isolation preserved (`/kit/*` separate layout).
- [x] Tests: rails, history, header active, kit isolation, mobile rail CSS.
- [x] Gates PASS.

## Integrity slot
- [x] Тип: app shell layout (frontend-nx only).
- [x] FIC: N/A — no new backend permissions.
- [x] page.md: N/A.
- [x] SECTION-READINESS: N/A.
- [x] Conflict keys: `layout/**` only (+ gate unblock in untracked registries WIP).
- [x] Coupling map: N/A.
- [x] Канон: legacy `app-layout.component.ts` chrome rails + header.

## Gates
- `pnpm exec nx build kppdf-web`: PASS
- `pnpm exec nx test kppdf-web`: PASS (33)
- `pnpm exec nx run-many -t lint --all`: PASS (0 errors)
- `pnpm run architecture:check:nx`: PASS
- `pnpm run ui:tokens:nx`: PASS

## Executor report
Replaced erroneous sidebar with dual tool rails matching legacy screenshot structure. Header holds route navigation; rails hold history + context tools only. **Outcome: PASS.**

## Closeout
- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T14:22:00+03:00
