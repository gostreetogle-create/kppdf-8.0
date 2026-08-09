# TZ-SALES-330 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-SALES-330.md` (создать при CLAIM)
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-330-kp-table-layout-instance.md`
> Commit/push: **NO** unless PO says so

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(пусто до CLAIM)_
- claimed_at: _
- workspace: D:\kppdf-8.0
- team_room_claim: _

## Preflight

- [ ] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [ ] `_active-map` + keys — нет конфликта с DOC-343 / DOC-TABLES-307 active
- [ ] Канон kp-table-config + TZ-SALES-325 поведение известны
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZ-SALES-330.md` на месте

## Acceptance

- [ ] `kpTableLayout` copy-on-write; не PATCH TableTemplate
- [ ] Панель «Таблица»: ↑↓ + show/hide → rebuild
- [ ] build уважает tableLayout; index alias
- [ ] Hint «только это КП»
- [ ] Gates TZ PASS; visual PO
- [ ] proposals-create.page.md

## Integrity slot (до READY / archive)

- [ ] Тип: page (proposals/create)
- [ ] FIC §A–E или N/A
- [ ] page.md / PAGE-TZ-INDEX
- [ ] Чужой WIP не в коммите
- [ ] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

_(заполнит исполнитель)_

## Executor report (auto)

_(≤15 lines; перед archive)_

## Review handoff

- [ ] READY FOR REVIEW
- [ ] Не archive до Cursor/PO visual PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _
