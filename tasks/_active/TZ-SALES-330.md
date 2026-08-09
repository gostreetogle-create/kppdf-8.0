# TZ-SALES-330 — Create КП table layout instance

> Status: **CLAIMED / IN PROGRESS**
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-330-kp-table-layout-instance.md`
> Marker: active until visual PASS and closeout

## Claim slot

- agent_id: `agent-6c3d05b80e`
- claimed_at: `2026-08-09T14:43:46Z`
- workspace: `D:\kppdf-8.0`
- team_room_claim: unavailable — Team Room reports `Unknown task: TZ-SALES-330; sync tasks first`

## Conflict scan

- `_active/`: no active marker for 305, 307, 308, 328, DOC-343, or another 330.
- Foreign dirty scope preserved and excluded: `backend/src/modules/document-template/document-template.service.ts`, `docs/agent-checklists/TZ-DOC-343.md`, and untracked DOC-343 archive/backlog files.
- 330 keys are reserved for this claim: build DTO, document-template/table-template services, proposal Create page/spec/inspector, document-template FE service, and Create page docs.
- No changes to FROZEN shell 317, shared TableTemplate from Create, quotation persistence, discount column, 320/322, or deploy.

## Plan

- Add request-only `tableLayout` to build DTO.
- Render order/visibility only for the selected live line-items table; preserve snapshot tables and default behavior.
- Keep `kpTableLayout` in Create session memory and expose the right-flyout «Таблица» controls with ↑/↓ and show/hide.
- Add focused backend/frontend tests and page documentation.

## Executor report

- Pending implementation and gates.
