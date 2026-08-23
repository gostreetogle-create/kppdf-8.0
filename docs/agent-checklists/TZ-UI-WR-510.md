# TZ-UI-WR-510 checklist — KP catalog-review formal exception + minimal harden

> Status: **DONE** (архив `tasks/_archive/2026-08/TZ-UI-WR-510.done.md`)
> Marker: удалён после archive
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff-wr-a (Buffy, Freebuff UI-WR Agent A)
- claimed_at: 2026-08-23T10:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Freebuff CLI)

## Preflight

- [x] Git root `D:\kppdf-8.0`; HEAD `a235b3ee` (WR-509 code pushed)
- [x] `tasks/_active/` — чужих CLAIM на proposal-create keys нет
- [x] TZ прочитан; DEP: WR-501 (z-токены, ui-dialog-canon contract)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-WR-510.md` на месте (был)

## Acceptance (из TZ)

- [x] Exception KP-CATALOG-REVIEW-NO-ESC в ui-dialog-canon.md + war-room
- [x] Harden: CDK trap + return-focus; Esc не закрывает; z=`var(--z-dialog)`
- [x] Spec: Esc не закрывает; Cancel закрывает + focus restore
- [x] FE tsc + jest proposal-create.page + lint

## Proof of adoption (в .done.md)

- consumer: proposal-create catalog-review (routed)
- test: Esc-B + Cancel/focus-restore
- docs: ui-dialog-canon + war-room
- migration: новый fullscreen review без exception ID — запрещён
- legacy leftover: table-editor KP overlays → перечислены в .done.md

## Integrity slot

- [x] Тип: page component a11y + docs exception — FIC §A N/A
- [x] page.md: ui-dialog-canon.md (exception) + war-room SoT
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите (war-room-program.md несёт pre-staged секцию ROI Cursor — зафиксировано в коммите)
- [x] Coupling map: N/A
- [x] Канон: DOCS-INTEGRITY

## Gates (факт)

- tsc PASS (0); jest proposal-create.page.spec 47/47; eslint своих файлов PASS (0 err, 1 pre-existing warning OnInit)

## Executor report

- См. `tasks/_archive/2026-08/TZ-UI-WR-510.done.md`

## Closeout

- [x] archive + lock + удалён `_active`; Status = DONE
- closed_at: 2026-08-23T10:40:00+03:00
