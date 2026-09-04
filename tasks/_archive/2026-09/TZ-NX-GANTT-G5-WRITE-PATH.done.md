# TZ-NX-GANTT-G5-WRITE-PATH: plannedDate + estimate days/start

**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** production
**DEPENDENCIES:** G4
**CONFLICT KEYS:** `frontend-nx/.../production/production-cockpit.page.ts`; `…/gantt-bars.component.ts`; `frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts`; IMPLICIT `nx build kppdf-web`

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T23:45:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight Check Output

- **Context read:** TZ + write matrix + legacy persist/optimistic код.
- **Key Constraints:** catalog confirm-gated; revert при сбое; hard-frozen read-only.
- **Planned Deliverable:** 5 commit-хендлеров + refit + write spec → gates.
- **Validation Path:** FIC §A + Build integrity.

## Что сделано

- Полный optimistic write-path на странице (meta / estimate-days / plannedDate / start-offset), silent PATCH, revert+toast при сбое, in-flight guard.
- `PiWorkTypesService.update` (PATCH /work-types/:id) — вызывается только после confirm «для ВСЕХ заказов».
- `refitRangeAfterShift` вызывается после plannedDate/startOffset сдвигов (G4-фикс).
- Write spec: 6 кейсов (API shape, revert, confirm gate, caps gate).

## Gates

- tsc PASS; jest production PASS 5/71; `nx build kppdf-web` PASS (LAST).

## Archive

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: freebuff (Buffy)
