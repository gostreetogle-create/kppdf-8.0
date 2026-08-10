# TZD-33 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZD-33.md` (создать при CLAIM)
> Commit/push: yes after DONE

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(fill on claim)_
- claimed_at: _(ISO)_
- workspace: D:\kppdf-8.0
- team_room_claim: _(yes|no|unavailable)_

## Preflight

- [ ] TZD-31 + TZD-32 DONE in archive
- [ ] Canonical names: Quotation=КП, Counterparty=клиент
- [ ] Прочитал `tasks/TZD-33-commercial-mcp-hitl.md`
- [ ] Claim + `_active/TZD-33.md`

## Acceptance

- [ ] All read tools registered
- [ ] Draft quotation/order force status=draft
- [ ] ship/convert/set_status require userOk:true
- [ ] counterparty_create + site_create work (mocked tests)
- [ ] MCP.md Commercial HITL section
- [ ] desktop/mcp test+tsc PASS
- [ ] No FE studio redesign; no new journal kinds

## Integrity slot

- [ ] Тип: MCP
- [ ] PAGE-TZ-INDEX optional one-liner or N/A
- [ ] Conflict keys only

## Gates (факт)

- _(fill)_

## Executor report (auto)

- _(≤15 lines; list tool names)_

## Closeout

- [ ] archive + lock + progress; commit+push; deploy NO
- closed_at: _(ISO)_
