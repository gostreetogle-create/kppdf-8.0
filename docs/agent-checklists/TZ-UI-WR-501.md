# TZ-UI-WR-501 checklist — Overlay platform: return-focus + scroll-lock + --z-*

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-UI-WR-501.md` (должен существовать, пока не archive)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff-wr-a (Buffy, Freebuff UI-WR Agent A)
- claimed_at: 2026-08-23T07:20:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Freebuff CLI, нет Team Room CLI)

## Preflight

- [x] Git root `D:\kppdf-8.0`; HEAD `e21b4696` (после WR-500 push); sync с main
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на overlay keys (в _active только UX-FORM-310/311/313, DONE)
- [x] TZ / deps прочитаны (WR-501; WR-502 влит — один коммит)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-WR-501.md` на месте

## Acceptance (из TZ)

- [ ] Return-focus: Dialog/Drawer/Sheet сохраняют activeElement → restore в close
- [ ] Drawer scrollStrategies.block() как Dialog/Sheet
- [ ] --z-* токены в styles.css :root + применены к dialog/drawer/sheet/popover/tooltip/menu/toast/bell
- [ ] Docs: paper-and-ink z-table + ui-dialog-canon return-focus/scroll
- [ ] Jest return-focus (+drawer/sheet); FE tsc; lint

## Proof of adoption (в .done.md)

- consumer: ≥1 routed PiDialogService caller
- test: return-focus specs
- docs: paper-and-ink + ui-dialog-canon
- migration: close без restore focus / magic z на shared overlays — запрещены
- leftover: desk/builder/KP/filter page z → 503/507/509

## Integrity slot

- [ ] Тип изменения: shared UI primitives (не page) — FIC §A N/A (нет новых страниц), docs обновляются
- [ ] page.md / PAGE-TZ-INDEX: N/A для UI-страниц; docs/paper-and-ink.md + ui-dialog-canon.md обновляются
- [ ] SECTION-READINESS: N/A
- [ ] Чужой WIP не в коммите (PO-DIARY/TZ-AUTHORING/QUEUE-LIVE/README — не трогать)
- [ ] Coupling map: N/A
- [ ] Канон: DOCS-INTEGRITY

## Gates (факт)

- команды + PASS/FAIL (в Executor report)

## Executor report

- См. `tasks/_archive/2026-08/TZ-UI-WR-501.done.md`

## Closeout

- [ ] archive + lock + удалить `_active`; Status = DONE
- closed_at: _(ISO)_
