# TZD-31 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZD-31.md` (создать при CLAIM)
> Commit/push: yes after DONE (wave policy)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(fill on claim)_
- claimed_at: _(ISO)_
- workspace: D:\kppdf-8.0
- team_room_claim: _(yes|no|unavailable)_

## Preflight

- [ ] Get-Location + git rev-parse → D:\kppdf-8.0
- [ ] `_active-map` + `tasks/_active/` — нет чужого CLAIM на CONFLICT KEYS
- [ ] Прочитал `tasks/TZD-31-mcp-runtime-sync.md` + audit 2026-08-10
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZD-31.md` на месте

## Acceptance

- [ ] healthz: toolCount + toolsSample includes list_categories + propose_product_create
- [ ] KPPDF_MCP_HOST_DIR documented + implemented
- [ ] Wrong package.json name → clear error
- [ ] desktop/mcp tests + tsc PASS
- [ ] MCP.md / INSTALL.md updated
- [ ] No mcp-runtime commit

## Integrity slot

- [ ] Тип: MCP
- [ ] FIC: N/A MCP host (no new web page) — one line
- [ ] page.md / PAGE-TZ-INDEX: N/A
- [ ] SECTION-READINESS: N/A
- [ ] Conflict keys only
- [ ] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- _(fill)_

## Executor report (auto)

- _(≤15 lines on close)_

## Closeout

- [ ] archive `tasks/_archive/2026-08/TZD-31.done.md` + lock
- [ ] progress.md; `_active` removed; Status DONE
- [ ] commit+push; deploy NO
- closed_at: _(ISO)_
