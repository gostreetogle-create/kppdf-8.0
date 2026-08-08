# TZ-SUPPLY-301 — Procurement tasks skeleton

**Outcome:** DONE  
**Date:** 2026-08-08  
**Cursor Verdict:** PASS (executor self / PO continuous — no separate review gate in TZ)

## Delivered

- **SupplyTask** module: schema `draft|confirmed|ordered|received`; `confirmedBy` + `confirmedAt` (D18)
- API `GET/POST/PATCH/DELETE /supply-tasks` + `POST :id/confirm|ordered|received` (auth+roles)
- FE `/supply`: table (not stub), filter, manual create, Подтвердить / Заказано / Получено
- Tests: BE supply-task.service.spec 6/6; FE pi-supply.service.spec 2/2
- Page doc `docs/pages/supply.page.md`

## НЕ

- BOM auto-explode (known_limitation → SUPPLY-302)
- MRP / tender / Gantt hard block
- ORDERS detail tree; desktop; deploy; dictionaries

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08T07:55:00Z
closed_by: agent-3e757640b7
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (BE+FE tsc)
  - tests: PASS (BE 6; FE 2 zone)
  - lint: PASS (BE supply eslint)
  - checklist: UPDATED
  - progress.md: UPDATED
cursor_verdict: PASS
agent_id: agent-3e757640b7
known_limitation: автосоздание задач из BOM → TZ-SUPPLY-302
