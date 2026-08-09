# TZ-SALES-319 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-SALES-319.md` (создать при claim; **не** пока SALES-317 в `_active`)
> Commit/push: после Cursor/PO PASS (visual) + archive
> TZ: `tasks/_backlog/kp-vitrine/TZ-SALES-319-create-kp-template-build-preview.md`
> Аудит: `docs/audits/2026-08-09-kp-create-template-insert-fidelity-audit.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(заполнить)_
- claimed_at: _(ISO)_
- workspace: D:\kppdf-8.0
- team_room_claim: yes | no | unavailable

## Preflight

- [ ] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [ ] `_active-map` + `tasks/_active/` — **нет** TZ-SALES-317 / чужого CLAIM на proposal-create*
- [ ] Прочитаны TZ-319 + audit + `kp-create-studio-spec.md` §0 FROZEN (shell не ломать)
- [ ] Claim slot; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZ-SALES-319.md` на месте

## Acceptance

- [ ] Нет chrome имени/«упрощённое»/draftLines на листе
- [ ] `build()` вызывается; iframe/srcdoc с HTML
- [ ] Фон/позиции/таблица из build видны (visual или mock HTML)
- [ ] Смена шаблона → rebuild; empty CTA ок
- [ ] Shell 317 без регресса
- [ ] Gates FE tsc + proposal-create tests PASS
- [ ] Docs page + spec обновлены

## Gates (факт)

- _(заполнить)_

## Executor report

- _(заполнить)_

## Review handoff

- [ ] READY FOR REVIEW
- [ ] Visual PO: шаблон с фоном + текстами/таблицами как в конструкторе

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- closed_at: _(ISO)_
