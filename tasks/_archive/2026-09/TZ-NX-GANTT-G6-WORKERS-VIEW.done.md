# TZ-NX-GANTT-G6-WORKERS-VIEW: режим «По рабочим»

**РОЛЬ:** Executor (frontend-nx)
**LAYER:** 3
**PAGES:** production
**DEPENDENCIES:** G5
**CONFLICT KEYS:** `frontend-nx/.../production/blocks/gantt-bars.component.ts`; `…/production-scale-controls.component.ts`; `…/gantt-bar.model.ts` (если нужно); IMPLICIT `nx build kppdf-web`

## Claim slot

- agent_id: freebuff (Buffy)
- claimed_at: 2026-09-05T00:05:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight Check Output

- **Context read:** TZ + TZ-GANTT-401/344 + порт workers-ветки (G2/G3).
- **Key Constraints:** read-only; «Не назначен» последняя; без PATCH assignment.
- **Planned Deliverable:** spec режима → gates.
- **Validation Path:** FIC §A + Build integrity.

## Что сделано

- Переключатель и workers-дерево уже в 1:1 порте (G2/G3). Добавлен `gantt-workers-view.spec.ts` (4 кейса): группировка, «Не назначен» последняя, ключ группы, read-only цель.

## Gates

- tsc PASS; jest production PASS 6/75; `nx build kppdf-web` PASS (LAST).

## Archive

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff (Buffy)
