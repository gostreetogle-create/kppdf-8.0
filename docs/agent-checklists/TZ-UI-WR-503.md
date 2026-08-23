# TZ-UI-WR-503 checklist — Builder flyout Escape + outside + z

> Status: **CLAIMED / IN PROGRESS**
> Marker: `tasks/_active/TZ-UI-WR-503.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff-wr-a (Buffy, Freebuff UI-WR Agent A)
- claimed_at: 2026-08-23T08:30:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Freebuff CLI)

## Preflight

- [x] Git root `D:\kppdf-8.0`; HEAD `a3532a34` (WR-501 pushed)
- [x] `tasks/_active/` — чужих CLAIM на builder keys нет
- [x] TZ прочитан; DEP: WR-501 (z-token `--z-popover` уже в styles.css)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-UI-WR-503.md` на месте

## Acceptance (из TZ)

- [ ] Escape закрывает flyout (stopPropagation только если open)
- [ ] Click-outside (pointerdown вне flyout/rail) закрывает
- [ ] `aria-modal="true"` + `z-index: var(--z-popover)` + return-focus на rail-кнопку
- [ ] Jest: Escape → closed; outside click → closed; inside click → stays open
- [ ] FE tsc + jest builder-tool-pane + lint

## Integrity slot

- [ ] Тип: page component a11y (builder) — FIC §A N/A (нет новых страниц)
- [ ] page.md: builder.page.md — упомянуть flyout contract (короткая строка)
- [ ] SECTION-READINESS: N/A
- [ ] Чужой WIP не в коммите (PO-DIARY/TZ-AUTHORING/QUEUE-LIVE/README/_NOW — чужие/board)
- [ ] Coupling map: N/A
- [ ] Канон: DOCS-INTEGRITY

## Gates (факт)

- команды + PASS/FAIL (в Executor report)

## Executor report

- См. `tasks/_archive/2026-08/TZ-UI-WR-503.done.md`

## Closeout

- [ ] archive + lock + удалить `_active`; Status = DONE
- closed_at: _(ISO)_
