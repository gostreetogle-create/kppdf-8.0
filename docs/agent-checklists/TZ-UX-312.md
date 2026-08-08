# TZ-UX-312 checklist

> Status: **DONE**
> Marker: `tasks/_archive/2026-08/TZ-UX-312.done.md`

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-08T09:43:31Z
- closed_at: 2026-08-08T09:46:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Acceptance

- [x] Thumb ≥36px (`w-9 h-9`)
- [x] Tighter padding; taller min-h-11
- [x] line-clamp-2 preserved
- [x] jest 8/8 + tsc PASS; archive; push; deploy нет

## Gates

```
jest composition-tree.component.spec.ts → 8/8 PASS
tsc -p tsconfig.app.json --noEmit → PASS
```
