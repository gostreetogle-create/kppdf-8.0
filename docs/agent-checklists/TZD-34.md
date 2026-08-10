# TZD-34 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZD-34.md` (создать при CLAIM)
> Commit/push: yes after DONE

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(fill on claim)_
- claimed_at: _(ISO)_
- workspace: D:\kppdf-8.0
- team_room_claim: _(yes|no|unavailable)_

## Preflight

- [ ] TZD-33 DONE in archive
- [ ] Прочитал `tasks/TZD-34-stock-movement-mcp.md` + audit note storage-items 404
- [ ] Claim + `_active/TZD-34.md`

## Acceptance

- [ ] kppdf_list_stock_movements + kppdf_stock_movement_create
- [ ] exactly one of materialId|productId; transfer needs toWarehouseId
- [ ] MCP.md stock via movements
- [ ] desktop/mcp test+tsc PASS

## Integrity slot

- [ ] Тип: MCP
- [ ] N/A pages
- [ ] Conflict keys only

## Gates (факт)

- _(fill)_

## Executor report (auto)

- _(≤15 lines)_

## Closeout

- [ ] archive + lock + progress; commit+push; deploy NO
- [ ] WAVE-MCP-GAP #1–#4 DONE → checkpoint idle / propose deploy
- closed_at: _(ISO)_
