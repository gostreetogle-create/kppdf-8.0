# TZ-UX-301 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-UX-301.done.md`
> Commit/push: **YES** (PO)

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-08T08:19:13Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; inbox send done)

## Preflight

- [x] root + claim slot + `_active/TZ-UX-301.md`
- [x] no peer CLAIM on layout keys
- [x] admin roles / production / deploy skipped

## Acceptance

- [x] ~1280px: icon-only nav + compact right chrome (no long «Десктоп»/«Выйти» labels)
- [x] Hover/focus: `title` + `aria-label` (RU) на категориях и правых кнопках
- [x] Active: `bg-sunrise-warm` + `border-sunrise-warm` + `text-paper`
- [x] FE tsc + nav-order jest PASS
- [x] archive; commit+push (без peer WIP)

## Gates (факт)

| Gate | Result |
|------|--------|
| `pnpm exec tsc -p tsconfig.app.json --noEmit` | PASS (exit 0) |
| `pnpm test -- --testPathPattern=app-layout.nav-order` | PASS 1/1 |
| peer files (admin/production/desktop) | not staged |

## Executor report

- Icon-first top nav in `app-layout.component.ts`; compact right chrome
- `PiNavDropdownComponent.compact` for icon triggers; kit default unchanged
- Conflict disclosure: large peer WIP in worktree — **not** committed
- known_limitation: mobile hamburger out of P0

## Closeout

- [x] archive + lock + progress + remove `_active` + remove backlog copy
- [x] Status = DONE
- closed_at: 2026-08-08T08:22:00Z
