# TZ-UX-315 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-UX-315.done.md`
> Source: `tasks/_backlog/TZ-UX-315-drop-pathlabel-dense-chrome.md`
> Commit/push: **YES**

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-09T02:11:58Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task: TZ-UX-315)
- closed_at: 2026-08-09T02:13:01Z

## Preflight

- [x] Root `D:\kppdf-8.0`; pull ff-only clean
- [x] No foreign CLAIM on `pi-group-workspace*`
- [x] Left `proposals.page.ts` / family alone (peer SALES WIP; SALES-314 claimed create rail)
- [x] Claim before code

## Acceptance

- [x] pathLabel не виден (`group-path-label` absent even if input set)
- [x] chrome плотнее под топ-меню (toc/chips `pt-0`)
- [x] FE tsc + jest pi-group-workspace 5/5
- [x] Archive + push; NEXT KP-VITRINE (314) not overwritten as blocked

## Gates (факт)

- `pnpm --dir frontend exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm --dir frontend exec jest src/app/shared/page/pi-group-workspace.component.spec.ts` → PASS (5/5)

## Executor report

- Hidden pathLabel template; deprecated input retained.
- Stripped `pathLabel=` from 16 pages; left proposals + proposal-create dead attrs.
- Updated page-chrome / ui-page-chrome notes.
- Did not stage peer SALES-314 / proposals WIP.

## Closeout

- [x] archive + lock + progress + remove `_active/TZ-UX-315.md`
- [x] Status = DONE
- closed_at: 2026-08-09T02:13:01Z
