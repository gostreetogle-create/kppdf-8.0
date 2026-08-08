# TZ-UX-307 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-UX-307-nav-shorter-labels-compact-height.done.md`
> Commit/push: **YES** (PO CLAIM; ID was spoken as 306 → canon **307**)

## Claim slot

- agent_id: agent-3e757640b7 (cursor-composer)
- claimed_at: 2026-08-08T08:39:03Z
- closed_at: 2026-08-08T08:42:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; announce sent)
- note: ID **307** — do not confuse with archived people `TZ-UX-306`

## Preflight

- [x] Conflict: layout free; admin/dialogs/deploy not touched
- [x] Claim before code (PO «306» → renumbered 307)
- [x] `tasks/_active/TZ-UX-307.md` claimed then archived

## Acceptance

- [x] Nav visually lower (header h-14; buttons h-10)
- [x] shortLabel per TZ table; full RU in title/aria
- [x] Equal width from longest short label
- [x] jest nav-order + tsc PASS; archive; push

## Gates (факт)

- `pnpm exec jest src/app/layout/app-layout.nav-order.spec.ts` → PASS 2/2
- `pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS

## Executor report

- shortLabel + compact height on app-layout + pi-nav-dropdown
- Deploy: NO

## Closeout

- [x] archive + lock + progress + remove `_active`
- Status: DONE
- closed_at: 2026-08-08T08:42:00Z
