# TZ-SALES-332 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-SALES-332.md` (создать при CLAIM)
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-332-kp-flyout-table-rail-polish.md`
> Commit/push: **NO** until Cursor/PO visual PASS

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(пусто до CLAIM)_
- claimed_at: _
- workspace: D:\kppdf-8.0
- team_room_claim: _

## Preflight

- [ ] Get-Location + git rev-parse → `D:\kppdf-8.0`
- [ ] 331 не держит те же keys / archive 331 first if still `_active`
- [ ] Аудит `docs/audits/2026-08-09-kp-create-flyout-polish-audit.md` прочитан
- [ ] Claim slot заполнен; Status = CLAIMED
- [ ] `tasks/_active/TZ-SALES-332.md` на месте

## Acceptance

- [ ] Layout sync с columns реального table-template
- [ ] Видна/Скрыта + ←→ реально меняют A4
- [ ] Правый rail: Параметры + Таблица
- [ ] CTA «Открыть шаблон таблицы» = PiButton
- [ ] Витрина не клипается; flyout padding pride PASS
- [ ] Gates + visual PO

## Integrity slot

- [ ] Type: page (`/proposals/create`)
- [ ] page.md + studio spec §0 updated
- [ ] Чужой WIP не в коммите
- [ ] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

_(исполнитель)_

## Executor report (auto)

_(≤15 lines; перед archive)_

## Review handoff

- [ ] READY FOR REVIEW
- [ ] Не archive до Cursor/PO visual PASS

## Closeout (после PASS)

- [ ] archive + lock + progress + удалить `_active`
- [ ] Status = DONE
- closed_at: _
