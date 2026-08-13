# Checklist TZ-SALES-370 — Настройки вида строки КП

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-SALES-370.md`
> Commit/push: isolated branch `feature/TZ-SALES-370` only; no main/deploy
> Stop: **не** archive до Cursor/PO visual PASS

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-307a1d65ca (isolated executor TZ-SALES-370)
- claimed_at: 2026-08-13T18:40:00Z
- workspace: D:\kppdf-8.0\.worktrees\TZ-SALES-370 (branch feature/TZ-SALES-370)
- team_room_claim: no — orchestration limitation: `Unknown task: TZ-SALES-370; sync tasks first` (номер не подменял)

## Preflight

- [x] Get-Location + git rev-parse → worktree `D:\kppdf-8.0\.worktrees\TZ-SALES-370`, branch `feature/TZ-SALES-370`
- [x] `_active-map.md` + main `_active/`: AUTH-303 на main; conflict keys SALES-370 не пересекаются с AUTH
- [x] TZ / checklist скопированы в worktree
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS → READY FOR REVIEW
- [x] `tasks/_active/TZ-SALES-370.md` на месте
- [x] Team Room join/inbox/status OK; claim failed (task not registered)

## Product contract

- [x] Chevron + aria/title + единый размер правых icon buttons
- [x] Одна detail-row одновременно
- [x] Только density/accent/separator/page-break/description/photo fit
- [x] Коммерческие данные в основной строке
- [x] Width в header caret
- [x] Non-default индикатор при закрытом drawer

## Vertical integrity

- [x] `rowPresentation` FE + DTO + schema
- [x] Backward defaults
- [x] Save/hydrate/edit/duplicate
- [x] Browser preview/print + server PDF (HTML path via table-template + output forward; live A4 browser smoke limited — empty templates in worktree DB)
- [x] Нет raw CSS/class/HTML из payload

## Focused tests

- [x] Toggle / keyboard / aria
- [x] Reorder/remove
- [x] Persistence / hydrate
- [x] Read-only
- [x] Шесть настроек
- [x] Discount/optional/price visible
- [x] Legacy regression

## Browser evidence

- [x] Light / dark / narrow (+ DOM): `docs/agent-checklists/evidence/TZ-SALES-370/`
- [x] A4 live sheet: blocked in this DB (templates picker empty); PDF/print HTML covered by `table-template.service.spec`
- [ ] PO/Cursor review: **pending visual PASS**

## Gates

- [x] frontend tsc — PASS
- [x] frontend jest proposal-create.page — **42/42 PASS**
- [x] backend tsc — PASS
- [x] quotation **35** / table-template **4** / quotation-output **3** jest — PASS
- [x] architecture:check — PASS
- [x] git diff --check — PASS

## Integrity slot (до READY / archive)

- [x] Тип: page (proposals-create) + module (quotation item snapshot)
- [x] FIC: self-check OK (commerce stays inline; width in header; no TableTemplate write; enums only)
- [x] page.md update: `docs/pages/proposals-create.page.md` (+370 note)
- [x] Чужой AUTH WIP не в коммите

## Review handoff

- [x] READY FOR REVIEW после gates + browser evidence
- [x] **Не** archive до Cursor/PO visual PASS

## Closeout (после PASS)

- [ ] archive + lock + progress
- closed_at: _
