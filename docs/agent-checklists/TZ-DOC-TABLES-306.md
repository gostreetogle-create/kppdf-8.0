# TZ-DOC-TABLES-306 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-DOC-TABLES-306.md` (создать при CLAIM)
> Source: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-306-from-data-stays-in-documents.md`

## Claim slot

- agent_id:
- claimed_at:
- workspace: D:\kppdf-8.0
- team_room_claim: yes | no | unavailable

## Preflight

- [ ] Canonical `D:\kppdf-8.0`
- [ ] Если `_active/TZ-DOC-TABLES-305.md` ещё есть и keys пересекаются (`tables.page.md`) → STOP/DEFERRED **или** сначала closeout 305 после PO visual
- [ ] Claim slot + `_active` marker

## Acceptance

- [ ] Chips path + queryParams; no `?` inside routerLink string
- [ ] «Из данных» stays on tables + opens from-registry
- [ ] Not redirected to `/materials`
- [ ] Tests + tsc PASS

## Integrity slot

- [ ] page | tables.page.md updated
- [ ] FIC §A if route behavior documented
- [ ] Чужой WIP excluded

## Executor report (auto)

_(≤15 строк)_

## Closeout

- [ ] archive + lock + DONE
- closed_at:
