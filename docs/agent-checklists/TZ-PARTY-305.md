# TZ-PARTY-305 checklist

> Status: **CLAIMED / IN PROGRESS**

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-08-22T18:28:45+03:00
- workspace: D:\kppdf-8.0

## Preflight

- [x] git branch main, clean except claude worktrees
- [x] _NOW.md прочитан — конфликтов нет (TZD-59 в _active, не пересекается)
- [x] TZ прочитан
- [x] Claim slot заполнен

## Acceptance

- [ ] FE: Counterparty FullEditor — PiOverflowSelect Person (list `/persons?search=`)
- [ ] BE: PATCH counterparty `contactPersonId` (уже в DTO, проверить populate)
- [ ] Person: `lastName` optional в schema + DTO
- [ ] Person: unique sparse index на `phone` (normalized)
- [ ] People/Person create form: lastName не required

## Gates

- [ ] BE tsc + jest person + counterparty
- [ ] FE tsc + jest counterparty-full-editor + people-form
- [ ] lint

## Closeout

- [ ] archive + lock + commit + push