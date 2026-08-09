# TZ-DOC-TABLES-307 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-DOC-TABLES-307.md` (создать при CLAIM)
> Source: `tasks/_backlog/doc-tables/TZ-DOC-TABLES-307-kp-category-preset.md`
> Commit/push: **NO** unless PO says so

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(пусто до CLAIM)_
- claimed_at: _
- workspace: D:\kppdf-8.0
- team_room_claim: _

## Preflight

- [ ] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [ ] `_active-map` + `tasks/_active/` — нет чужого CLAIM на table-template keys
- [ ] Канон `docs/audits/2026-08-09-kp-table-config-canon.md` прочитан
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZ-DOC-TABLES-307.md` на месте

## Acceptance

- [ ] Category `kp` / UI «КП»
- [ ] Seed «КП — позиции» с 6 канон keys
- [ ] Apply-preset в диалоге (confirm если непусто)
- [ ] Gates TZ PASS
- [ ] `tables.page.md` + PAGE-TZ-INDEX

## Integrity slot (до READY / archive)

- [ ] Тип: page (tables) + module (table-template)
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
- [ ] Не archive до Cursor/PO PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _
