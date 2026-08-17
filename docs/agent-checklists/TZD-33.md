# TZD-33 checklist

> Status: **DONE** (archive TZD-33.done.md; stale CLAIM cleared 2026-08-17)
> Marker: `tasks/_active/TZD-33.md` (создан при CLAIM)
> Commit/push: yes after DONE

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: `buffy`
- claimed_at: `2026-08-10T21:15:00Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: `unavailable`

## Preflight

- [x] TZD-31 + TZD-32 DONE in archive
- [x] Canonical names: Quotation=КП, Counterparty=клиент
- [x] Прочитал `tasks/TZD-33-commercial-mcp-hitl.md`
- [x] Claim + `_active/TZD-33.md`

## Acceptance

- [x] All read tools registered
- [x] Draft quotation/order force status=draft
- [x] ship/convert/set_status require userOk:true
- [x] counterparty_create + site_create work (mocked tests)
- [x] MCP.md Commercial HITL section
- [x] desktop/mcp test+tsc PASS
- [x] No FE studio redesign; no new journal kinds

## Integrity slot

- [x] Тип: MCP
- [x] PAGE-TZ-INDEX: N/A (tools only; web routes уже существуют)
- [x] Conflict keys only

## Gates (факт)

- desktop/mcp `pnpm test`: 86/86 PASS (7 новых commercial tests)
- desktop/mcp `pnpm exec tsc --noEmit`: PASS
- Live smoke: `GET /healthz` → `toolCount: 68` (51 + 17 commercial), startup log `tools 68 registered`
- Deploy: NO

## Executor report (auto)

- NEW `desktop/mcp/src/commercial-tools.ts` + register в `tools.ts` + `COMMERCIAL_TOOL_NAMES` в реестре (toolCount 51 → 68).
- Reads (9): kppdf_list/get_counterparty, kppdf_list_persons, kppdf_list_sites, kppdf_list/get_quotations, kppdf_list/get_orders, kppdf_list_contracts — slim-ответы без HTML snapshot.
- Draft writes (4): kppdf_counterparty_create (SoT сразу, whitelist), kppdf_site_create, kppdf_quotation_create_draft / kppdf_order_create_draft (builders ПРИНУДИТЕЛЬНО status draft; input status не принимается).
- Gated (4): kppdf_quotation_set_status (draft|sent|accepted|rejected), convert_to_order/contract, kppdf_order_ship — все `userOk:true`; gate-функция проверяется до запроса (0 backend call при false).
- Поля сверены с реальными DTO: QuotationItemDto (productId/quantity/unitPrice), OrderItemDto (unitPrice optional — TZ-ORDERS-301), CreateCounterpartyDto (inn/roles required), CreateSiteDto, ship {recipient/address/warehouseId/driverInfo}.
- MCP.md раздел «Tools — commercial (TZD-33)» + HITL protocol. journal kinds не добавлялись; FE studio не трогали; deploy NO.
- Commit: `e788553acb989ed3f4cbb3c7b4240a849d732e13`

## Closeout

- [ ] archive + lock + progress; commit+push; deploy NO
- closed_at: _(ISO)_
