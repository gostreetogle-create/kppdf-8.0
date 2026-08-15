# TZ-ORDERS-HUB-302 checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-ORDERS-HUB-302.md`
> Deploy: НЕ

## Claim slot

- agent_id: Buffy
- claimed_at: 2026-08-15T12:00:00Z
- workspace: D:\\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] Current root and branch checked
- [x] TZ-ORDERS-HUB-301 and HUB-302 read
- [x] Conflict keys checked; existing active work is disjoint
- [x] Product scope limited to orders page/detail route fix

## Acceptance

- [x] Target columns without `total`: Номер, Дата, Заказчик, Объект, Статус, Приоритет, Позиций, КП, Готовность
- [x] Read-only expandable row follows products/UX-319
- [x] X/Y readiness and empty Y state
- [x] Deal and Composition summary blocks with links
- [x] Row links/actions do not toggle expansion
- [x] Keyboard and aria behavior
- [x] `/proposals` route in order detail
- [x] No supply/production/shipping/backend writes

## Integrity

- [x] page docs updated
- [x] PAGE-TZ-INDEX updated
- [x] foreign WIP excluded

## Gates

- [x] frontend tsc — PASS
- [x] OrdersPage Jest — 11/11 PASS
- [x] OrderDetailPage Jest — 7/7 PASS
- [x] frontend typecheck — PASS
- [x] frontend build — PASS (existing bundle/style budget warnings only)
- [x] changed-file diff-check — PASS
- [x] Prettier check — PASS

## Quality score

- self_score: 98
- reviewer_score: 98 (AC/gates OK; formal archive BLOCKED — no commit SHA / no `## Executor report (auto)`)

## Review handoff

- [x] READY FOR REVIEW
- [ ] Cursor/PO PASS — **functional PASS 98/100**; **formal PASS blocked** until commit + executor report
- [ ] archive after formal PASS
