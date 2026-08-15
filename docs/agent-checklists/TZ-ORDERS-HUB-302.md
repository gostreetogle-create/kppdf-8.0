# TZ-ORDERS-HUB-302 checklist

> Status: **DONE**
> Marker: removed (`tasks/_archive/2026-08/TZ-ORDERS-HUB-302.done.md`)
> Deploy: НЕ

## Claim slot

- agent_id: Buffy (Cursor Product Executor, FreeBuffy unavailable)
- claimed_at: 2026-08-15T12:00:00Z
- closed_at: 2026-08-15T11:30:00Z
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

- [x] OrdersPage Jest — 11/11 PASS
- [x] frontend typecheck — PASS (Buffy prior + product AC confirmed)
- [x] Prettier / lint-staged on commit — PASS

## Quality score

- self_score: 98
- reviewer_score: 98 (Cursor architect functional PASS 98/100; PO authorized formal archive)

## Review handoff

- [x] READY FOR REVIEW
- [x] Cursor/PO PASS — functional 98/100; formal PASS after commit + executor report
- [x] archive after formal PASS

## Executor report (auto)

- status: DONE
- commits: 71446d6bfb37434913450449678ce4b78e26be37 (feat) ; f8b96d4e9b386802c42b002b60edfb619ce709d6
- gates: jest orders.page 11/11 PASS; AC confirmed in code; foreign layout/CATALOG/AUTH WIP excluded
- quality: self_score=98 reviewer_score=98
- known: HUB-303/304 blocks deferred; rebase onto origin/main merged UX-320/321 PAGE-TZ-INDEX lines
- ask: —

## Closeout

- [x] archive + lock + remove `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T11:30:00Z
