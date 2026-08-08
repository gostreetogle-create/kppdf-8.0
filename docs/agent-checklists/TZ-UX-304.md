# TZ-UX-304 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-UX-304.done.md`
> Commit/push: **YES** (PO)

## Claim slot

- agent_id: agent-3e757640b7 (cursor-composer)
- claimed_at: 2026-08-08T08:25:11Z
- closed_at: 2026-08-08T08:28:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; announce sent)

## Preflight

- [x] Conflict: ADMIN-301 = admin/** only — layout free
- [x] Claim before code

## Acceptance

- [x] Nav items = icon top + small caption bottom in slightly wider rect
- [x] Order: Catalog…Docs → Dictionaries → Admin
- [x] No overflow design (~1280; scroll-x fallback kept)
- [x] jest nav-order PASS; FE tsc PASS; archive; push

## Gates (факт)

- `pnpm exec jest src/app/layout/app-layout.nav-order.spec.ts` → PASS 1/1
- `pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS

## Executor report

- Reordered `NAV_CATEGORIES`; shortLabel for long RU; header h-16; dropdown compact caption.
- NOT touching admin/**.
- Deploy: NO

## Closeout

- [x] archive + lock + progress + remove `_active`
- Status: DONE
