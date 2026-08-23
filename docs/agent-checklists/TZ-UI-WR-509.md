# TZ-UI-WR-509 checklist — Desk flyout a11y harden (workspace sheet)

> Status: **DONE** (архив `tasks/_archive/2026-08/TZ-UI-WR-509.done.md`)
> Marker: удалён после archive
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff-wr-a (Buffy, Freebuff UI-WR Agent A)
- claimed_at: 2026-08-23T09:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Freebuff CLI)

## Preflight

- [x] Git root `D:\kppdf-8.0`; HEAD `ee115111` (WR-503 pushed)
- [x] `tasks/_active/` — чужих CLAIM на desk keys нет
- [x] TZ прочитан; DEP: WR-501 (z-токены)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-WR-509.md` на месте (был)

## Acceptance (из TZ)

- [x] Путь B: trap + return-focus + block scroll + `--z-sheet` (путь A отклонён: wide panels вне size-шкалы PiSheet)
- [x] aria-labelledby на видимый h2
- [x] Spec: open → focus inside; close → focus returns to trigger
- [x] Нет magic z-index:50; не center PiDialog
- [x] FE tsc + jest manager-desk.page + lint

## Integrity slot

- [x] Тип: page component a11y — FIC §A N/A
- [x] page.md: manager-desk.page.md — bullet 509
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите
- [x] Coupling map: N/A
- [x] Канон: DOCS-INTEGRITY

## Gates (факт)

- tsc PASS (0); jest manager-desk.page.spec 29/29; eslint своих файлов PASS (0); global lint — 1 error чужой WIP (menu/pi-dropdown-menu, агент C)

## Executor report

- См. `tasks/_archive/2026-08/TZ-UI-WR-509.done.md`

## Closeout

- [x] archive + lock + удалён `_active`; Status = DONE
- closed_at: 2026-08-23T09:50:00+03:00
