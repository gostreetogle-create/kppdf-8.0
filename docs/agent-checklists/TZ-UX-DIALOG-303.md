# TZ-UX-DIALOG-303 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-UX-DIALOG-303.done.md`
> Source: `tasks/TZ-UX-DIALOG-303-add-and-continue-pickers.md`

## Claim slot

- agent_id: agent-3e757640b7 (cursor-composer-dialog303)
- claimed_at: 2026-08-08T11:19:51Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI: Unknown task — checklist slot SoT)
- closed_at: 2026-08-08T11:22:19Z

## Preflight

- [x] Get-Location + git → `D:\kppdf-8.0` main
- [x] FACT-303 peer on orders only — no key clash
- [x] Claim before code

## Acceptance

- [x] Add N items without reopening; Закрыть dismisses
- [x] Primary does not close on success
- [x] Session list after add
- [x] product-line price cleared for next pick
- [x] FE tsc + specs PASS (15/15)
- [x] Doc pattern Add & continue

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `jest …composition-picker… …bom-panel… --runInBand` — PASS 15/15
- ESLint targeted — PASS
- Prettier check — PASS

## Executor report

- Implemented from zero: `onAdded` + session chips + BomPanel `applyCompositionLine`
- Ban honored: FACT-303 / orders / desktop / supply untouched
- Peer bom-panel inspector polish was pre-dirty in CONFLICT KEY file — left intact alongside wire

## Closeout

- [x] archive + lock + progress + `_active` removed
- [x] Status = DONE
