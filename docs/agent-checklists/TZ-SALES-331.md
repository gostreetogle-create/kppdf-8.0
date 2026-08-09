# TZ-SALES-331 checklist

> Status: **RESERVED**
> Marker: `tasks/_active/TZ-SALES-331.md` (создать при CLAIM)
> Source: `tasks/_backlog/kp-vitrine/TZ-SALES-331-kp-deal-price-vat-footer.md`
> Commit/push: **NO** unless PO says so

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: _(пусто до CLAIM)_
- claimed_at: _
- workspace: D:\kppdf-8.0
- team_room_claim: _

## Preflight

- [ ] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [ ] 330 DONE или keys свободны; нет чужого CLAIM на proposal-create / document-template.service
- [ ] Канон: наценка фоном; НДС только подвал; нет колонки скидки
- [ ] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [ ] `tasks/_active/TZ-SALES-331.md` на месте

## Acceptance

- [ ] Наценка → previewLines.unitPrice; Product DB не меняется
- [ ] dealVatPercent → footer Итого + «в т.ч. НДС» (режим с НДС)
- [ ] vat 0 → только Итого; admin preview без deal footer
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
