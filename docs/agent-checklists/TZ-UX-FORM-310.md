# TZ-UX-FORM-310 checklist

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-UX-FORM-310.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-08-23T00:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room tool)

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0
- [x] No conflicting _active on same keys (FORM-308 = field-capacity.ts, different)
- [x] TZ + canonical ui-form-field-capacity.md read
- [x] Claim slot filled; Status = CLAIMED

## Acceptance

- [ ] Name/article: md:grid-cols-12, name col-span-8, article col-span-4
- [ ] Dimensions + weight: single band row, max-w-[5.5rem] for dims+weight, max-w-[7rem] for unit, text-right tabular-nums
- [ ] Notes: rows=3 (already correct)
- [ ] Photos + work types: not inflated
- [ ] Spec: no grid-cols-2 on name/article; dim max-w assertions; same data-test

## Gates

- FE tsc PASS
- Jest module-form-dialog PASS
- Lint 0 errors

## Closeout

- archive + commit + push
