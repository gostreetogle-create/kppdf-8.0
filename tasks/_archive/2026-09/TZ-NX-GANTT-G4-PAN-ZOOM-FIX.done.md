# TZ-NX-GANTT-G4-PAN-ZOOM-FIX: масштаб + пан/scroll после drag

**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** production
**DEPENDENCIES:** G3
**CONFLICT KEYS:** `frontend-nx/.../production/blocks/gantt-bars.component.ts`; `…/production-scale-controls.component.ts`; `…/production-cockpit.page.ts` (today/fit); IMPLICIT `nx build kppdf-web`

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-04T23:20:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight Check Output

- **Context read:** TZ + `docs/pages/production-cockpit.page.md` (zoom-таблица, QA-445E) + audit 2026-08-15.
- **Key Constraints:** write API не менять; today не silent no-op.
- **Planned Deliverable:** scroll `bar` target + refit range + specs → gates.
- **Validation Path:** FIC §A + Build integrity.

## Что сделано

- `scrollRequest.target='bar'` + `scrollToBar()`/`scrollToBarId()` — viewport re-anchor на moved row.
- `refitRangeAfterShift()` на странице: earlier-date → расширение диапазона + fit Месяц; in-range → re-anchor. G5 вызывает после optimistic-коммитов.
- Спеки: density parity (36/12), shifted-bar render, scroll no-throw.

## Gates

- tsc PASS; jest production PASS 4/65; `nx build kppdf-web` PASS (LAST).

## Archive

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-04
closed_by: freebuff (Buffy)
