# TZD-32 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZD-32.md` (создать при CLAIM)
> Commit/push: yes after DONE

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(fill on claim)_
- claimed_at: _(ISO)_
- workspace: D:\kppdf-8.0
- team_room_claim: _(yes|no|unavailable)_

## Preflight

- [ ] Get-Location + git rev-parse → D:\kppdf-8.0
- [ ] TZD-31 в `_archive/2026-08/TZD-31.done.md`
- [ ] Нет чужого CLAIM на journal/write-tools keys
- [ ] Прочитал `tasks/TZD-32-material-propose-fields.md`
- [ ] Claim slot + `tasks/_active/TZD-32.md`

## Acceptance

- [ ] ProposeMaterialCreateDto whitelist: pricePerUnit, materialKind, description, dimensions
- [ ] confirm → MaterialService.create сохраняет поля
- [ ] MCP zod + MCP.md updated
- [ ] Tests: price round-trip; invalid kind 400
- [ ] BE tsc + mutation-journal tests; desktop/mcp test+tsc

## Integrity slot

- [ ] Тип: MCP + backend module
- [ ] FIC N/A or thin note
- [ ] page.md N/A
- [ ] Conflict keys only

## Gates (факт)

- _(fill)_

## Executor report (auto)

- _(≤15 lines)_

## Closeout

- [ ] archive + lock + progress; deploy NO; commit+push
- closed_at: _(ISO)_
